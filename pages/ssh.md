[order]:       # (3)
[name]:        # (OpenSSH)
[description]: # (Comment mettre en place OpenSHH sur un serveur et s'y connecter)

## Description et mise en place

SSH (Secure SHell) est un protocole qui permet de prendre le contrôle à distance d’une machine sur un réseau et de transférer des fichiers. D’abord, il faut installer OpenSSH, une suite d’outils permettant de créer des serveurs et des clients SSH :
```bash
$ sudo apt install openssh-server
$ sudo systemctl start ssh.service
```

Pour s’assurer que le serveur SSH démarre avec chaque démarrage de notre machine, il faut activer son service avec `sudo systemctl enable ssh.service`. Toute la configuration du serveur SSH se trouve dans `/etc/ssh/sshd_config`, si il est nécessaire de la modifier, il est conseillé de garder une copie originale d’avant les modifications :
```bash
$ sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.original
$ sudo chmod a-w /etc/ssh/sshd_config.original
```

Similairement, avant de relancer le serveur après une modification de la configuration, il vaut mieux la valider avec :
```bash
$ sudo sshd -t -f /etc/ssh/sshd_config
# S’il n’y a aucun problèmes on redémarre notre serveur SSH
$ sudo systemctl restart ssh.service
```

Il est maintenant possible d’accéder à notre serveur Ubuntu. Prenons l’exemple d’une machine avec l’IP 192.168.1.10 dont l’hôte s’apelle monhote :
```bash
$ ssh monhote@192.168.1.10
monhote@192.168.1.10’s password:
```

Si besoin, il est aussi possible de lancer des applications graphiques à partir d’une session SSH :

- Côté serveur, ajouter ces lignes à `/etc/ssh/sshd_config` ;
```
X11Forwarding yes
X11DisplayOffset 10
X11UseLocalhost no
```
- Installer `xdg-utils` et redémarrer le serveur OpenSSH :
```bash
sudo apt install xdg-utils
sudo systemctl restart ssh
```
- Côté client, démarrer une session SSH avec le flag `-X`.
```
$ ssh -Y monhote@192.168.1.10
$ firefox &
```

Pour les environnements compatibles, une fenêtre Firefox devrait apparaître côté client (si l’application est installée sur le serveur).

## Connexion par clé

Par défaut les connexions se font par mot de passe (celui de l’hôte qu’on essaye d’accéder).
Pour sécuriser l’accès à notre hôte, on met en place l’authentification par clé.

Tout d’abord côté client (celui qui veut accéder au serveur) :

- Générer une clé avec l’algorithme ed25519 (rapide et sécurisé) ;
    - Laisser l’emplacement par défaut en appuyant sur `Enter` ;
    - Entrer un mot de passe pour la clé deux fois (ou appuyer sur Enter pour skip).
```bash
$ ssh-keygen -t ed25519
> Enter a file in which to save the key (/home/YOU/.ssh/id_ALGORITHM):
> Enter passphrase (empty for no passphrase):
> Enter same passphrase again:
```
- Ajouter cette clé au client SSH pour qu’elle soit automatiquement utilisée ;
```bash
$ eval "$(ssh-agent -s)"
$ ssh-add ~/.ssh/id_ed25519
```
- Le client garde la clé privée tandis que la clé publique est transférée au serveur avec :
```bash
$ ssh-copy-id monhote@192.168.1.10
```

Avant de désactiver la connexion par mot de passe, s’assurer que votre clé est bien reconnu en vous connectant au serveur (il ne devrait pas y avoir de prompt pour le mot de passe) :
```bash
$ ssh monhote@192.168.1.10
```

Si tout est bon, on passe maintenant côté serveur pour n’accepter que la connexion par clé  en ajoutant ces lignes à `/etc/ssh/sshd_config`
```env
PermitRootLogin no
StrictModes yes
PubkeyAuthentication yes
PasswordAuthentication no
ChallengeResponseAuthentication no
```

Le port par défaut de SSH est 22, fait souvent utilisé par les crawlers qui analysent les ports ouverts d’un serveur pour détecter des vulnérabilités. Pour déjouer les crawlers les plus basiques on change le port dans `/etc/ssh/sshd_config` :
```env
Port 4267
```

Redémarrer le serveur SSH et s’assurer que la modification a été prise en compte :
```bash
$ ssh -p 4267 monhote@192.168.1.10
```
