[order]:       # (2)
[name]:        # (OpenSSH)
[description]: # (Mettre en place un accès à distance SSH et le configurer)

[SSH](https://fr.wikipedia.org/wiki/Secure_Shell) (Secure SHell) est un protocole qui permet de prendre le contrôle à distance d’une machine.
Il nous servira ici à accéder à notre serveur sans avoir besoin d'y accéder physiquement et de travailler dessus à plusieurs.

<br>

D’abord, il faut installer [OpenSSH](https://www.openssh.org/), une suite d’outils permettant de créer des serveurs et des clients SSH :
```bash
# Pas nécessaire si OpenSSH a été installé en même temps qu'Ubuntu Server
$ sudo apt install openssh-server
$ sudo systemctl enable --now ssh
```

Toute la configuration du serveur SSH se trouve dans `/etc/ssh/sshd_config`, si il est nécessaire de la modifier, il est conseillé de garder une copie originale d’avant les modifications :
```bash
$ sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.original
$ sudo chmod a-w /etc/ssh/sshd_config.original
```

Similairement, avant de relancer le serveur après une modification de la configuration, il vaut mieux la valider avec :
```bash
$ sudo sshd -t -f /etc/ssh/sshd_config
# S’il n’y a aucun problèmes on redémarre notre serveur SSH
$ sudo systemctl restart ssh
```

Il est maintenant possible d’accéder à notre serveur Ubuntu. Prenons l’exemple d’une machine avec l’IP `192.168.1.10` dont l’hôte s’apelle `monhote` :
```bash
$ ssh monhote@192.168.1.10
monhote@192.168.1.10’s password:
monhote@serveur:~$ echo "I'm in"
```

<br>

## Configurer la connexion par clé

Par défaut les connexions se font par mot de passe (celui de l’hôte qu’on essaye d’accéder).
Pour sécuriser l’accès à notre hôte, on met en place l’authentification par clé et on désactiver celle par mot de passe.

On commence par générer une paire de clé (une publique et une privée).
Il existe plusieurs algorithmes pour ça, on utilise ici `ed25519` :
```bash
$ ssh-keygen -t ed25519
> Enter a file in which to save the key (/home/YOU/.ssh/id_ALGORITHM): <laisser vide>
> Enter passphrase (empty for no passphrase): <créer un mot de passe pour la clé>
> Enter same passphrase again: <confirmer ce mot de passe>
```

Pour que `ssh` utilise automatiquement cette clé, on l'ajoute manuellement :    
```bash
$ eval "$(ssh-agent -s)"
$ ssh-add ~/.ssh/id_ed25519
```

Chaque personne qui veut accéder au serveur doit générer et garder sa clé privée tandis que la clé publique est transférée au serveur avec :
```bash
$ ssh-copy-id monhote@192.168.1.10
```

Si tout est bon, on passe maintenant côté serveur pour n’accepter que la connexion par clé  en ajoutant/modifiant ces lignes à `/etc/ssh/sshd_config` :
```apacheconf
PermitRootLogin no
StrictModes yes
PubkeyAuthentication yes
PasswordAuthentication no
ChallengeResponseAuthentication no
```

> [!WARNING]
> Avant de désactiver la connexion par mot de passe, vérifiez bien qu'aucun mot de passe soit demandé après avoir suivi cette démarche
> (simplement en faisant `ssh monhote@192.168.1.10`).

> [!NOTE]
> Il existe des robots qui scanne les ports par défaut de milliers de machines pour détecter des potentielles vulnérabilités.
> Celui d'SSH est 22, il est possible de le changer en modifiant la ligne `Port`.
> La commande pour vous connecter devient alors `ssh -p 4267 monhote@192.168.1.10`.

<br>

## Configurer le X11 Forwarding

Par défaut SSH permet uniquement d'ouvrir un terminal à distance ou de transférer des fichiers.
Cepandant, OpenSSH a une fonctionnalité appelée X11 forwarding qui permet d'ouvrir des applications graphiques à distance.

Du côté du serveur, il faut :
- Ajouter (ou modifier) ces lignes à `/etc/ssh/sshd_config` ;
  ```apacheconf
  X11Forwarding yes
  X11DisplayOffset 10
  X11UseLocalhost no
  ```
- Installer `xdg-utils` et redémarrer le service `ssh` :
  ```bash
  sudo apt install xdg-utils
  sudo systemctl restart ssh
  ```

Côté client, il suffit de démarrer une session SSH avec `-Y` et de démarrer une application en fond avec `&` :
```bash
$ ssh -Y monhote@192.168.1.10
monhote@serveur:~$ firefox &
```

Pour les environnements compatibles, une fenêtre Firefox devrait apparaître côté client (si l’application est installée sur le serveur).
