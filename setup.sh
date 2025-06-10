#!/bin/bash

# =============================================================================
# Script de configuration Docker avec PostgreSQL et certificats SSL
# =============================================================================

set -e  # Arrêt en cas d'erreur

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
CERT_DIR="./nginx/certs/selfsigned"
NETWORK_NAME="my_encrypted_network"

# =============================================================================
# Fonctions utilitaires
# =============================================================================

print_header() {
    echo -e "\n${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}\n"
}

print_step() {
    echo -e "${GREEN}[ÉTAPE]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCÈS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERREUR]${NC} $1"
    exit 1
}

check_dependencies() {
    print_step "Vérification des dépendances..."
    
    command -v docker >/dev/null 2>&1 || print_error "Docker n'est pas installé"
    command -v openssl >/dev/null 2>&1 || print_error "OpenSSL n'est pas installé"
    
    print_success "Toutes les dépendances sont présentes"
}

# =============================================================================
# Configuration Docker Swarm
# =============================================================================

setup_docker_swarm() {
    print_step "Configuration de Docker Swarm..."
    
    if docker info 2>/dev/null | grep -q "Swarm: active"; then
        print_info "Docker Swarm est déjà initialisé"
    else
        print_info "Initialisation de Docker Swarm..."
        # Utiliser l'adresse IPv4 de l'interface wlp1s0
        ADVERTISE_ADDR=$(ip addr show wlp1s0 | grep 'inet ' | awk '{print $2}' | cut -d'/' -f1 | head -n1)
        
        if [ -n "$ADVERTISE_ADDR" ]; then
            docker swarm init --advertise-addr "$ADVERTISE_ADDR" || print_error "Impossible d'initialiser Docker Swarm"
            print_success "Docker Swarm initialisé"
        else
            print_error "Impossible de trouver une adresse IPv4 sur wlp1s0"
        fi
    fi
}

create_network() {
    print_step "Création du réseau chiffré..."
    
    if docker network ls | grep -q "$NETWORK_NAME"; then
        print_info "Le réseau '$NETWORK_NAME' existe déjà"
    else
        docker network create \
            --driver overlay \
            --opt encrypted \
            "$NETWORK_NAME" || print_error "Impossible de créer le réseau"
        print_success "Réseau '$NETWORK_NAME' créé"
    fi
}

# =============================================================================
# Gestion des secrets
# =============================================================================

cleanup_old_secrets() {
    print_step "Nettoyage des anciens secrets..."
    
    local secrets=("db_user" "db_password" "api_key")
    
    for secret in "${secrets[@]}"; do
        if docker secret ls | grep -q "$secret"; then
            docker secret rm "$secret" 2>/dev/null || true
            print_info "Secret '$secret' supprimé"
        fi
    done
}

create_db_secrets() {
    print_step "Création des secrets de base de données..."
    
    echo -n "Nom d'utilisateur DB : "
    read -r DB_USER
    
    while [[ -z "$DB_USER" ]]; do
        echo -e "${YELLOW}Le nom d'utilisateur ne peut pas être vide${NC}"
        echo -n "Nom d'utilisateur DB : "
        read -r DB_USER
    done
    
    echo -n "Mot de passe DB : "
    read -rs DB_PASS
    echo
    
    while [[ -z "$DB_PASS" ]]; do
        echo -e "${YELLOW}Le mot de passe ne peut pas être vide${NC}"
        echo -n "Mot de passe DB : "
        read -rs DB_PASS
        echo
    done
    
    # Création des secrets
    echo "$DB_USER" | docker secret create db_user - || print_error "Impossible de créer le secret db_user"
    echo "$DB_PASS" | docker secret create db_password - || print_error "Impossible de créer le secret db_password"
    
    print_success "Secrets de base de données créés"
}

create_api_secret() {
    print_step "Génération de la clé API..."
    
    print_info "Génération d'une clé API sécurisée (32 bytes)..."
    
    API_KEY=$(openssl rand -hex 32)
    echo -e "${PURPLE}Clé API générée :${NC} $API_KEY"
    
    echo "$API_KEY" | docker secret create api_key - >/dev/null 2>&1 || print_error "Impossible de créer le secret api_key"

    print_success "Secret API créé"
    print_info "⚠️  Sauvegardez cette clé API dans un endroit sûr !"
}

# =============================================================================
# Génération des certificats SSL
# =============================================================================

create_certificates() {
    print_step "Génération des certificats SSL auto-signés..."
    
    # Création du répertoire pour les certificats
    mkdir -p "$CERT_DIR"
    
    if [[ -f "$CERT_DIR/server.crt" && -f "$CERT_DIR/server.key" ]]; then
        echo -n "Des certificats existent déjà. Les remplacer ? (y/N) : "
        read -r REPLACE_CERTS
        
        if [[ ! "$REPLACE_CERTS" =~ ^[Yy]$ ]]; then
            print_info "Conservation des certificats existants"
            return
        fi
    fi
    
    print_info "Génération du certificat SSL pour localhost..."
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$CERT_DIR/server.key" \
        -out "$CERT_DIR/server.crt" \
        -subj "/CN=localhost" 2>/dev/null || print_error "Impossible de générer les certificats"
    
    # Sécurisation des permissions
    chmod 640 "$CERT_DIR/server.key"
    chmod 644 "$CERT_DIR/server.crt"
    
    sudo chown 1001:1001 "$CERT_DIR/server.key" || print_error "Impossible de changer le propriétaire du fichier clé"

    print_success "Certificats SSL créés dans $CERT_DIR/"
    print_info "Certificat valide pour 365 jours"
}

# =============================================================================
# Affichage du résumé
# =============================================================================

show_summary() {
    print_header "RÉSUMÉ DE LA CONFIGURATION"
    
    echo -e "${GREEN}✓${NC} Docker Swarm : Initialisé"
    echo -e "${GREEN}✓${NC} Réseau chiffré : $NETWORK_NAME"
    echo -e "${GREEN}✓${NC} Secrets Docker :"
    echo -e "  - ${BLUE}db_user${NC} : Créé"
    echo -e "  - ${BLUE}db_password${NC} : Créé"
    echo -e "  - ${BLUE}api_key${NC} : Créé"
    echo -e "${GREEN}✓${NC} Certificats SSL : $CERT_DIR/"
    
    echo -e "\n${YELLOW}Commandes utiles :${NC}"
    echo -e "  Liste des secrets : ${BLUE}docker secret ls${NC}"
    echo -e "  Liste des réseaux : ${BLUE}docker network ls${NC}"
    echo -e "  Infos Swarm : ${BLUE}docker node ls${NC}"
    
    echo -e "\n${PURPLE}Fichiers générés :${NC}"
    echo -e "  - $CERT_DIR/server.crt"
    echo -e "  - $CERT_DIR/server.key"
}

# =============================================================================
# Fonction principale
# =============================================================================

main() {
    print_header "CONFIGURATION DOCKER AVEC POSTGRESQL ET SSL"
    
    check_dependencies
    setup_docker_swarm
    create_network
    cleanup_old_secrets
    create_db_secrets
    create_api_secret
    create_certificates
    show_summary
    
    echo -e "\n${GREEN}🎉 Configuration terminée avec succès !${NC}\n"
}

# =============================================================================
# Point d'entrée
# =============================================================================

# Vérification que le script n'est pas sourcé
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
else
    echo "Ce script doit être exécuté, pas sourcé"
    exit 1
fi