# AudioCollection

Une application de gestion de collection audio déployée avec Docker Swarm.

## 🚀 Installation et démarrage

### Prérequis

Assurez-vous d'avoir **Docker** et **OpenSSL** installés sur votre système.

Si vous n'avez pas Docker ou OpenSSL, exécutez d'abord le script d'installation :

```bash
chmod +x installationDockerOpenssl.sh
./installationDockerOpenssl.sh
```

### Configuration initiale

1. **Rendez le script de configuration exécutable :**
   ```bash
   chmod +x setup.sh
   ```

2. **Lancez la configuration :**
   ```bash
   ./setup.sh
   ```

   ⚠️ **IMPORTANT** : Ce script générera une clé de sécurité. **Conservez précieusement cette clé** car elle est nécessaire pour le bon fonctionnement de l'application.

### Déploiement de l'application

Une fois la configuration terminée, déployez l'application avec Docker Stack :

```bash
docker stack deploy -c docker-stack.yaml audiocollection
```

## 📋 Résumé des étapes

1. Installer Docker et OpenSSL (si nécessaire)
2. Rendre les scripts exécutables avec `chmod +x`
3. Exécuter `./setup.sh` et **sauvegarder la clé générée**
4. Déployer avec `docker stack deploy -c docker-stack.yaml audiocollection`

### Accéder à l'application

Une fois le déploiement terminé, ouvrez votre navigateur et allez à :

```
https://localhost
```

## 🔧 Gestion du déploiement

- **Vérifier le statut :** `docker stack ls`
- **Voir les services :** `docker stack services audiocollection`
- **Supprimer le stack :** `docker stack rm audiocollection`

## ⚠️ Notes importantes

- **Conservez la clé de sécurité** générée lors de l'installation
- Assurez-vous que Docker Swarm est initialisé (le script `setup.sh` s'en charge automatiquement)
- Vérifiez que tous les ports nécessaires sont disponibles

---

Pour plus d'informations ou en cas de problème, consultez les logs avec :
```bash
docker service logs audiocollection_[nom-du-service]
```
