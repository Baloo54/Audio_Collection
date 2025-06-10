#!/bin/bash

# =============================================================================
# Script d'installation et configuration de Docker et OpenSSL
# =============================================================================

set -e  # Arrêt en cas d'erreur

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DOCKER_COMPOSE_VERSION="2.24.5"
USER_NAME=$(whoami)

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

print_warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "Ce script ne doit pas être exécuté en tant que root"
        print_info "Exécutez-le avec votre utilisateur normal, sudo sera demandé si nécessaire"
        exit 1
    fi
}

detect_os() {
    print_step "Détection du système d'exploitation..."
    
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
        print_info "OS détecté : $PRETTY_NAME"
    else
        print_error "Impossible de détecter le système d'exploitation"
    fi
    
    case $OS in
        ubuntu|debian)
            PACKAGE_MANAGER="apt"
            ;;
        centos|rhel|fedora)
            PACKAGE_MANAGER="yum"
            if command -v dnf >/dev/null 2>&1; then
                PACKAGE_MANAGER="dnf"
            fi
            ;;
        arch)
            PACKAGE_MANAGER="pacman"
            ;;
        *)
            print_error "Système d'exploitation non supporté : $OS"
            ;;
    esac
    
    print_success "Système supporté : $OS avec $PACKAGE_MANAGER"
}

# =============================================================================
# Installation d'OpenSSL
# =============================================================================

install_openssl() {
    print_step "Installation d'OpenSSL..."
    
    if command -v openssl >/dev/null 2>&1; then
        local openssl_version=$(openssl version 2>/dev/null | cut -d' ' -f2)
        print_info "OpenSSL est déjà installé (version: $openssl_version)"
        return
    fi
    
    print_info "Installation d'OpenSSL..."
    
    case $PACKAGE_MANAGER in
        apt)
            sudo apt update
            sudo apt install -y openssl
            ;;
        yum|dnf)
            sudo $PACKAGE_MANAGER install -y openssl
            ;;
        pacman)
            sudo pacman -S --noconfirm openssl
            ;;
    esac
    
    if command -v openssl >/dev/null 2>&1; then
        local openssl_version=$(openssl version | cut -d' ' -f2)
        print_success "OpenSSL installé avec succès (version: $openssl_version)"
    else
        print_error "Échec de l'installation d'OpenSSL"
    fi
}

# =============================================================================
# Installation de Docker
# =============================================================================

install_docker_dependencies() {
    print_step "Installation des dépendances Docker..."
    
    case $PACKAGE_MANAGER in
        apt)
            sudo apt update
            sudo apt install -y \
                ca-certificates \
                curl \
                gnupg \
                lsb-release \
                apt-transport-https \
                software-properties-common
            ;;
        yum|dnf)
            sudo $PACKAGE_MANAGER install -y \
                ca-certificates \
                curl \
                gnupg \
                yum-utils
            ;;
        pacman)
            sudo pacman -S --noconfirm \
                ca-certificates \
                curl \
                gnupg
            ;;
    esac
    
    print_success "Dépendances installées"
}

add_docker_repository() {
    print_step "Ajout du dépôt officiel Docker..."
    
    case $PACKAGE_MANAGER in
        apt)
            # Ajout de la clé GPG Docker
            sudo mkdir -p /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/$OS/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            
            # Ajout du dépôt
            echo \
                "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS \
                $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            sudo apt update
            ;;
        yum|dnf)
            sudo $PACKAGE_MANAGER-config-manager \
                --add-repo \
                https://download.docker.com/linux/$OS/docker-ce.repo
            ;;
        pacman)
            print_info "Arch Linux utilise les dépôts officiels"
            ;;
    esac
    
    print_success "Dépôt Docker ajouté"
}

install_docker_engine() {
    print_step "Installation de Docker Engine..."
    
    if command -v docker >/dev/null 2>&1; then
        local docker_version=$(docker --version 2>/dev/null | cut -d' ' -f3 | cut -d',' -f1)
        print_info "Docker est déjà installé (version: $docker_version)"
        return
    fi
    
    case $PACKAGE_MANAGER in
        apt)
            sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;
        yum|dnf)
            sudo $PACKAGE_MANAGER install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;
        pacman)
            sudo pacman -S --noconfirm docker docker-compose
            ;;
    esac
    
    print_success "Docker Engine installé"
}

configure_docker() {
    print_step "Configuration de Docker..."
    
    # Démarrage et activation du service Docker
    print_info "Démarrage du service Docker..."
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Ajout de l'utilisateur au groupe docker
    print_info "Ajout de l'utilisateur '$USER_NAME' au groupe docker..."
    sudo usermod -aG docker $USER_NAME
    
    # Configuration du daemon Docker pour de meilleures performances
    print_info "Configuration du daemon Docker..."
    
    sudo mkdir -p /etc/docker
    
    cat << EOF | sudo tee /etc/docker/daemon.json > /dev/null
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2",
    "dns": ["8.8.8.8", "8.8.4.4"],
    "default-address-pools": [
        {
            "base": "172.17.0.0/12",
            "size": 20
        },
        {
            "base": "192.168.0.0/16",
            "size": 24
        }
    ]
}
EOF
    
    # Redémarrage pour appliquer la configuration
    sudo systemctl restart docker
    
    print_success "Docker configuré"
}

# =============================================================================
# Installation de Docker Compose (version standalone si nécessaire)
# =============================================================================

install_docker_compose_standalone() {
    print_step "Vérification de Docker Compose..."
    
    if docker compose version >/dev/null 2>&1; then
        local compose_version=$(docker compose version --short 2>/dev/null)
        print_info "Docker Compose (plugin) est déjà disponible (version: $compose_version)"
        return
    fi
    
    if command -v docker-compose >/dev/null 2>&1; then
        local compose_version=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
        print_info "Docker Compose (standalone) est déjà installé (version: $compose_version)"
        return
    fi
    
    print_info "Installation de Docker Compose standalone..."
    
    # Installation de la version standalone
    sudo curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Création d'un lien symbolique pour la compatibilité
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    print_success "Docker Compose standalone installé"
}

# =============================================================================
# Tests et vérifications
# =============================================================================

test_installations() {
    print_step "Test des installations..."
    
    # Test OpenSSL
    print_info "Test d'OpenSSL..."
    if openssl version >/dev/null 2>&1; then
        local openssl_version=$(openssl version)
        print_success "OpenSSL fonctionne : $openssl_version"
    else
        print_error "OpenSSL ne fonctionne pas correctement"
    fi
    
    # Test Docker
    print_info "Test de Docker..."
    if docker --version >/dev/null 2>&1; then
        local docker_version=$(docker --version)
        print_success "Docker fonctionne : $docker_version"
    else
        print_error "Docker ne fonctionne pas correctement"
    fi
    
    # Test Docker Compose
    print_info "Test de Docker Compose..."
    if docker compose version >/dev/null 2>&1; then
        local compose_version=$(docker compose version)
        print_success "Docker Compose (plugin) fonctionne : $compose_version"
    elif command -v docker-compose >/dev/null 2>&1; then
        local compose_version=$(docker-compose --version)
        print_success "Docker Compose (standalone) fonctionne : $compose_version"
    else
        print_warning "Docker Compose n'est pas disponible"
    fi
    
    # Test du daemon Docker (nécessite les permissions de groupe)
    print_info "Test de connexion au daemon Docker..."
    if sudo docker info >/dev/null 2>&1; then
        print_success "Connexion au daemon Docker réussie"
    else
        print_warning "Impossible de se connecter au daemon Docker"
    fi
}

# =============================================================================
# Nettoyage et optimisation
# =============================================================================

optimize_system() {
    print_step "Optimisation du système..."
    
    # Nettoyage des paquets inutiles
    case $PACKAGE_MANAGER in
        apt)
            sudo apt autoremove -y
            sudo apt autoclean
            ;;
        yum|dnf)
            sudo $PACKAGE_MANAGER autoremove -y
            sudo $PACKAGE_MANAGER clean all
            ;;
        pacman)
            sudo pacman -Sc --noconfirm
            ;;
    esac
    
    print_success "Système optimisé"
}

# =============================================================================
# Affichage du résumé
# =============================================================================

show_summary() {
    print_header "RÉSUMÉ DE L'INSTALLATION"
    
    echo -e "${GREEN}✓${NC} OpenSSL : $(openssl version 2>/dev/null | cut -d' ' -f1-2)"
    echo -e "${GREEN}✓${NC} Docker : $(docker --version 2>/dev/null | cut -d' ' -f1-3)"
    
    if docker compose version >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Docker Compose : $(docker compose version --short 2>/dev/null) (plugin)"
    elif command -v docker-compose >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Docker Compose : $(docker-compose --version 2>/dev/null | cut -d' ' -f1-3) (standalone)"
    fi
    
    echo -e "${GREEN}✓${NC} Service Docker : Démarré et activé"
    echo -e "${GREEN}✓${NC} Utilisateur '$USER_NAME' ajouté au groupe docker"
    
    echo -e "\n${YELLOW}IMPORTANT :${NC}"
    echo -e "${RED}⚠️  Vous devez vous déconnecter et vous reconnecter${NC}"
    echo -e "${RED}   (ou redémarrer) pour que les permissions du groupe docker${NC}"
    echo -e "${RED}   prennent effet.${NC}"
    
    echo -e "\n${CYAN}Commandes de test après reconnexion :${NC}"
    echo -e "  ${BLUE}docker --version${NC}"
    echo -e "  ${BLUE}docker run hello-world${NC}"
    echo -e "  ${BLUE}openssl version${NC}"
    
    echo -e "\n${PURPLE}Fichiers de configuration créés :${NC}"
    echo -e "  - /etc/docker/daemon.json"
    
    echo -e "\n${CYAN}Services configurés :${NC}"
    echo -e "  - docker.service (activé au démarrage)"
}

# =============================================================================
# Fonction principale
# =============================================================================

main() {
    print_header "INSTALLATION ET CONFIGURATION DOCKER + OPENSSL"
    
    check_root
    detect_os
    
    # Installation d'OpenSSL
    install_openssl
    
    # Installation de Docker
    install_docker_dependencies
    add_docker_repository
    install_docker_engine
    configure_docker
    install_docker_compose_standalone
    
    # Tests et finalisation
    test_installations
    optimize_system
    show_summary
    
    echo -e "\n${GREEN}🎉 Installation terminée avec succès !${NC}"
    echo -e "${YELLOW}👤 N'oubliez pas de vous reconnecter pour utiliser Docker sans sudo${NC}\n"
}

# =============================================================================
# Gestion des arguments
# =============================================================================

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Affiche cette aide"
    echo "  --test-only    Effectue seulement les tests (sans installation)"
    echo ""
    echo "Ce script installe et configure :"
    echo "  - OpenSSL"
    echo "  - Docker Engine"
    echo "  - Docker Compose"
    echo "  - Configuration optimisée du daemon Docker"
}

# =============================================================================
# Point d'entrée
# =============================================================================

case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    --test-only)
        print_header "MODE TEST UNIQUEMENT"
        test_installations
        exit 0
        ;;
    "")
        main "$@"
        ;;
    *)
        echo "Option inconnue: $1"
        show_help
        exit 1
        ;;
esac