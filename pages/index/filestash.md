[order]:       # (4)
[name]:        # (Filestash)
[description]: # (Mettre en place un client web FTP/SFTP avec Filestash)

Jusque là on a vu comment se connecter à distance à notre serveur via un terminal.
Dans cette partie, on va voir comment déployer Filestash pour accéder aux fichiers de notre serveur via une interface web.

> [!NOTE]
> Filestash nécessite que Docker soit installé, la démarche est décrite [ici](/tutoriels/docker/).

<br>

Filestash se déploie entièrement via un simple fichier `docker-compose.yml` :
```bash
# Créer un dossier où stocker ce fichier
$ mkdir ~/.filestash && cd ~/.filestash

# Télécharger le fichier
$ curl -O https://downloads.filestash.app/latest/docker-compose.yml

# Démarrer Filestash
$ sudo docker-compose up -d
```

<br>

L'interface est alors accessible à l'URL `http://<ip server publique>:8334` :
![Création du mot de passe admin](https://raw.githubusercontent.com/mickael-kerjean/filestash_images/master/screenshots/setup_password.png)

<br>

Une fois le mot de passe admin créé, vous serez redirigé vers l'interface admin, plus précisemment au choix des options de stockage. Ici on se contentera d'activer FTP et SFTP :
![Accueil interface d'administration](/assets/images/adminFilestash.png)

<br>

Filestash permet de se connecter à n'importe quel serveur qui expose publiquement les protocols configurés dans l'interface admin.
Ici, on se contente de se connecter à notre propre serveur :
- `Hostname` est l'IP du serveur auquel se connecter ;
- `Username` est l'utilisateur auquel se connecter ;
- `Password` est le mot de passe de cet utilisateur.
![Page de connexion utilisateur](/assets/images/loginFilestash.png)

<br>

Il est alors possible d'explorer, télécharger et modifier n'importe quel fichier sur l'hôte à distance :
![Modification d'un fichier](/assets/images/fileFilestash.png)
