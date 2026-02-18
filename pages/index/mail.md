[order]:       # (5)
[name]:        # (Mailing)
[description]: # (Mettre en place du mailing avec Postfix et Dovecot)

Pour configurer du mailing, on va avoir besoin de deux outils :
- Postfix, le serveur SMTP auquel les services extérieurs (Gmail, Icloud, ...) font appel pour envoyer leurs mails ;
- Dovecot, le serveur POP3/IMAP auquel les clients mails (Outlook, Thunderbird, ...) se connectent.

> [!WARNING]
> Nous n'avions ni nom de domaine, ni IPv4 statique donc nous avons seulement pu tester l'envoit de mails en local.

<br>

## Installation de Postfix

On commence par installer Postfix avec `sudo apt install postfix`.
Quand le menu de configuration, sélectionner "Pas de configuration" :
![Invite de configuration Postfix](https://doc.ubuntu-fr.org/_media/doc/02_pasdeconfiguration.png?w=600&tok=56255b)

Ensuite, il faut correctement configurer Postfix en modifiant `/etc/postfix/main.cf` :
```
###############################
##   CONFIGURATION GENERALE  ##
###############################

# Remplacer example.com par votre nom de domaine
mydomain = example.com
myhostname = mail.example.com
myorigin = /etc/mailname
compatibility_level = 3.6
smtpd_banner = $myhostname ESMTP $mail_name (Ubuntu)

# Pas nécessaire, spécifique au mailing local
biff = no
readme_directory = no
append_dot_mydomain = no

############################
##  CONFIGURATION RESEAU  ##
############################

# On n'autorise que le trafic qui passe par IPv4
inet_interfaces = all
inet_protocols = ipv4
mynetworks = 127.0.0.0/8
mydestination = $myhostname

##########################
##  CONFIGURATION MAIL  ##
##########################
mailbox_size_limit = 0
recipient_delimiter = +
alias_maps = hash:/etc/aliases
alias_database = hash:/etc/aliases

#####################
##  RELAI POSTFIX  ##
#####################

relayhost = 
smtpd_relay_restrictions = permit_mynetworks permit_sasl_authenticated defer_unauth_destination
```

<br>

## Installation de Dovecot

Maintenant que Postfix est installé et configuré, on passé à l'installation de Dovecot :
```bash
$ sudo apt install dovecot sasl2-bin
```

Une fois installé, il faut modifier `/etc/dovecot/conf.d/10-master.conf` pour que Dovecot s'interface avec Postfix:
```
service auth {
  # Ce bloc existe déjà, ne pas le toucher
  unix_listener auth-userdb {
    #mode = 0666
    #user = 
    #group = 
  }

  # Ajouter cee bloc ici
  unix_listener /var/spool/postfix/private/auth {
    mode = 0666
    user = postfix
    group = postfix
  }
}
```

<br>

## Configuration TLS

On passe ensuite à l'activation de TLS, tout d'abord, il faut décommenter `submission` avec des paramètres bien précis dans `/etc/postfix/master.cf` :
```
submission inet n       -       y       -       -       smtpd
  -o syslog_name=postfix/submission
  -o smtpd_tls_security_level=encrypt
  -o smtpd_sasl_auth_enable=yes
  -o smtpd_tls_auth_only=yes
  -o smtpd_reject_unlisted_recipient=no
  -o smtpd_recipient_restrictions=
  -o smtpd_relay_restrictions=permit_sasl_authenticated,reject
  -o milter_macro_daemon_name=ORIGINATING
```

Puis, assurez vous que vous avez bien ces valeurs dans `/etc/dovecot/conf.d/10-ssl.conf` :
```
ssl = required
ssl_cert = </etc/ssl/certs/dovecot.pem
ssl_key  = </etc/ssl/private/dovecot.key
```

Enfin, il faut ajouter ce bloc à `/etc/postfix/main.cf` :
```
#########################
##  CONFIGURATION TLS  ##
#########################

smtpd_tls_auth_only = yes
smtpd_tls_security_level=may
smtpd_tls_cert_file=/etc/letsencrypt/live/mail.votredomaine.com/fullchain.pem
smtpd_tls_key_file=/etc/letsencrypt/live/mail.votredomaine.com/privkey.pem

smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
smtpd_sasl_auth_enable = yes

smtpd_recipient_restrictions =
    permit_sasl_authenticated,
    permit_mynetworks,
    reject_unauth_destination

smtp_tls_security_level=may
smtp_tls_CApath=/etc/ssl/certs
smtp_tls_session_cache_database = btree:${data_directory}/smtp_scache

milter_protocol = 4
milter_default_action = accept
smtpd_milters = inet:localhost:8891
non_smtpd_milters = inet:localhost:8891
```

> [!WARNING]
> Attention à bien remplacer `example.com` par votre nom de domaine.

<br>

## Gestion du DNS

Une fois Postfix et Dovecot installés et TLS correctement configuré, il faut créer plus record DNS :
| Type | Hostname           | Valeur                                                                                                | TTL  |
| :--: | :----------------- | :---------------------------------------------------------------------------------------------------- | :--: |
| A    | example.com        | IPv4 publique du serveur                                                                              | 3600 |
| A    | mail.example.com   | IPv4 publique du serveur                                                                              | 3600 |
| MX   | example.com        | mail.example.com                                                                                      | 3600 |
| TXT  | example.com        | v=spf1 ip4:IPv4 publique du serveur -all                                                              | 3600 |
| TXT  | _dmarc.example.com | v=DMARC1; p=quarantine; rua=mailto:postmaster@example.com; ruf=mailto:postmaster@example.com; pct=100 | 3600 |

Il reste un dernier record à créer qui nécessite quelques commandes supplémentaires.
Avant de continuer, assurez vous que le serveur est accessible via votre nom de domaine sur votre téléphone.
Si tout est bon, il faut ensuite installer OpenDKIM :
```bash
$ sudo apt install opendkim opendkim-tools -y
$ sudo mkdir -p /etc/opendkim/keys
```

Une fois OpenDKIM installé et les dossiers créer il faut :
- Modifier `etc/opendkim.conf` ;
  ```
  # Ajouter ces lignes
  KeyTable /etc/opendkim/KeyTable
  SigningTable /etc/opendkim/SigningTable
  TrustedHosts /etc/opendkim/TrustedHosts

  # Commenter la ligne Socker de base et décommenter/ajouter celle là
  Socket                  local:/var/spool/postfix/opendkim/opendkim.sock
  ```
- Générer une clé DKIM ;
  ```bash
  $ sudo opendkim-genkey -s mail -d example.com -D /etc/opendkim/keys/example.com
  ```
- Créer le fichier `/etc/opendkim/KeyTable` ;
  ```
  mail._domainkey.example.com    example.com:mail:/etc/opendkim/keys/example.com/mail.private
  ```
- Créer le fichier `/etc/opendkim/SigningTable` ;
  ```
  @example.com        mail._domainkey.jpistre.fr
  ```
- Créer le fichier `/etc/opendkim/TrustedHosts`.
  ```
  mail.example.com
  ```

Une fois tout cette démarche suivie, il va falloir créer le record DNS contenu dans `/etc/opendkim/keys/example.com/mail.txt`.
Attention, le fichier contient le record **entier**, pas seulement la valeur :
| Type | Hostname           | Valeur                           | TTL  |
| :--: | :----------------- | :------------------------------- | :--: |
| TXT  | mail._domainkey    | v=DKIM1; h=sha256; k=rsa; p=...  | 3600 |

> [!WARNING]
> La valeur correspond à l'entièreté du texte entre parenthèses, pensez bien à enlever les guillemets et les retours à la ligne.
> Toutes les parties de `p=` doivent être mises bout à bout sans espace.

Enfin, la dernière démarche consiste à créer un certificat signé par Let's Encrypt :
```bash
$ sudo apt install certbot
$ sudo certbot certonly --standalone -d mail.example.com
```

Vous pouvez maintenant redémarrer Postfix et Dovecot et ouvrir les bons ports :
```bash
$ sudo systemctl reload postfix
$ sudo systemctl reload dovecot

$ sudo ufw allow 22   # SSH
$ sudo ufw allow 80   # HTTP
$ sudo ufw allow 443  # HTTPS
$ sudo ufw allow 25   # SMTP
$ sudo ufw allow 587  # SMTP sécurisé
$ sudo ufw allow 465  # SMTPS
$ sudo ufw allow 143  # IMAP
$ sudo ufw allow 993  # IMAPS
$ sudo ufw allow 110  # POP3
$ sudo ufw allow 995  # POP3S
$ sudo ufw enable
```
