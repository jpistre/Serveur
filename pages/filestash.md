[order]:       # (7)
[name]:        # (Filestash)
[description]: # (Installation et configurer de Filestash)

Pour pouvoir installer Filestash il vous faudra d'abord installer docker,docker-compose et curl sur votre serveur Linux:
```bash
sudo apt install docker
sudo apt install docker-compose
sudo apt install curl
```
Une fois que ces installations sont faites vous devrez utiliser les commandes suivantes:
```bash
mkdir filestash && cd filestash
curl -O https://downloads.filestash.app/latest/docker-compose.yml
sudo docker-compose up -d
```
Après cela vous pouvez accèder à filestash en saisissant l'URL suivante: http://adresseIPserveur:8334 vous serez alors sur la page suivante:

![MDP admin](https://raw.githubusercontent.com/mickael-kerjean/filestash_images/master/screenshots/setup_password.png)

Saisissez votre mot de passe administrateur et vous aurez ensuite accès à la partie administrateur de votre serveur filestash dans laquelle vous pourrez configurer votre serveur comme bon vous semble.

![AdminPage](/static/adminFilestash.png)

Pour avoir de nouveau accès à la partie administrateur à tout moment saisissez l'URL : http://adresseIPserveur:8334/admin

Pour avoir accès à la partie utilisateur saisissez l'URL:http://adresseIPserveur:8334 et vous serez alors sur une page de ce type selon les configurations que vous avez sélectionné dans la partie administrateur:

![login](/static/loginFilestash.png)

Ici Hostname est l'adresse IP de votre serveur Linux,username est le login de votre serveur et Password est le mot de passe du serveur.
