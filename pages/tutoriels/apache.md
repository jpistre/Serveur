[order]:       # (4)
[name]:        # (Apache)
[description]: # (Installation et configurer des serveurs Apache)

Apache est un outil très modulaire qui permet de créer des serveurs web :
```bash
$ sudo apt install apache2
```

Voici quelques modules importants qu'on aura l'occasion de voir en détail :

| Nom            | Description                 |
| :------------- | :-------------------------- |
| `mod_ssl`      | HTTPS / TLS                 |
| `mod_rewrite`  | Réécriture d’URL            |
| `mod_headers`  | Gestion des en-têtes HTTP   |
| `mod_security` | Sécurité applicative (WAF)  |
| `mod_proxy`    | Proxy et reverse proxy      |
| `mod_status`   | Statistiques de performance |

Il est possible de gérer ces modules :

- Activer un module avec `sudo a2enmod <nom>` ;
- Désactiver un module avec `sudo a2dismod <nom>` ;
- Redémarrer apache pour appliquer les modifications avec `sudo systemctl restart apache2`.

Apache permet d'héberger plusieurs applications web sur la même machine, on parle de d'hôte virtuel.
Chaque hôte (= application) est un fichier dans `/etc/apache2/sites-available/`. Par exemple, on peut y créer `monsite.conf` :
```apacheconf
<VirtualHost *:80>
  ServerName monsite.local
  DocumentRoot /var/www/monsite

  <Directory /var/www/monsite>
    Options -Indexes +FollowSymLinks
    AllowOverride All
    Require all granted
  </Directory>

  ErrorLog ${APACHE_LOG_DIR}/monsite_error.log
  CustomLog ${APACHE_LOG_DIR}/monsite_access.log combined
</VirtualHost>
```

On vient de créer un serveur web qui :

- Est accessible à partir de l'URL `monsite.local` ;
- Sert tous les fichiers contenus dans `/var/www/monsite` ;
- Liste toutes les erreurs dans `/var/log/apache2/monsite_error.log` ;
- Liste toutes les IPs qui accèdent au serveur dans `/var/log/apache2/monsite_access.log` ;

Pour que notre site soit accessible on l'active et on redémarre Apache :
```bash
sudo a2ensite mon_site.conf
sudo systemctl reload apache2
```

Ensuite, pour que notre site soit accessible via HTTPS :

- Activer le module SSL avec `sudo a2enmod ssl` ;
- Créer un certificat SSL avec `certbot` ;
  ```bash
  sudo apt install certbot python3-certbot-apache
  sudo certbot --apache
  ```
- Modifier `monsite.conf` en y ajoutant un virtual host pour le port 443 ;
  ```apacheconf
  <VirtualHost *:443>
      ServerName monsite.com
      DocumentRoot /var/www/monsite

      SSLEngine on
      SSLCertificateFile /etc/letsencrypt/live/monsite.com/fullchain.pem
      SSLCertificateKeyFile /etc/letsencrypt/live/monsite.com/privkey.pem

      <Directory /var/www/monsite>
          AllowOverride All
      </Directory>
  </VirtualHost>
  ```
- Forcer la redirection d'HTTP vers HTTPS dans le virtual host pour le port 80.
  ```apacheconf
  # Au même niveau que ServerName monsite.com dans <VirtualHost *:80>
  RewriteEngine On
  RewriteCond %{HTTPS} !=on
  RewriteRule ^/?(.*) https://%{SERVER_NAME}/$1 [R=301,L]
  ```

## Quelques mesures de sécurité

Un fichier `.htaccess` permet de configurer Apache pour chaque répertoire d'une application web.
Toutes les configurations qu'on va voir peuvent se mettre dans ce fichier ou dans un bloc VirtualHost.

On commence par masquer la version d'Apachee utilisée et désactiver le listing des fichiers :
```apacheconf
Options -Indexes
ServerTokens Prod
ServerSignature Off
```

Si un dossier doit uniquement être accessible par une IP :
```apacheconf
<RequireAll>
  Require all denied
  Require ip 10.252.46.165
</RequireAll>
```

Ensuite, pour se protéger en partie contre les failles XSS et le clickjacking :
```apacheconf
<IfModule mod_headers.c>
  Header always set X-Frame-Options "DENY"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</IfModule>
```

Enfin, voilà un bloc qui permet de bloquer plusieurs vecteurs d'attaque :
```apacheconf
<IfModule mod_rewrite.c>
  RewriteEngine On

  # Désactiver le hot linking (un autre serveur qui utilise directement nos fichiers)
  # BIEN MODIFIER mon-site.com À VOTRE CAS
  RewriteCond %{HTTP_REFERER} !^$
  RewriteCond %{HTTP_REFERER} !^http://(www\.)?mon-site.com/.*$ [NC]
  RewriteCond %{HTTP_REFERER} !^https://(www\.)?mon-site.com/.*$ [NC]
  RewriteRule \.(gif|jpg|jpeg|mp3|png|pdf|zip|webp|mp4)$ - [F]

  # Quelques requêtes malveillantes
  RewriteCond %{REQUEST_URI} \.(suspected|eval|base64) [NC,OR]
  RewriteCond %{HTTP_USER_AGENT} ^$
  RewriteRule .* - [F,L]

  # Bloquer certains user agents et requêtes suspects
  RewriteCond %{HTTP_USER_AGENT} (libwww-perl|wget|python|nikto|curl|scan|java|winhttp|clshttp|loader) [NC,OR]
  RewriteCond %{HTTP_USER_AGENT} (<|>|'|%0A|%0D|%27|%3C|%3E|%00) [NC,OR]
  RewriteCond %{HTTP_USER_AGENT} (;|<|>|'|"|\)|\(|%0A|%0D|%22|%27|%28|%3C|%3E|%00).*(libwww-perl|wget|python|nikto|curl|scan|java|winhttp|HTTrack|clshttp|archiver|loader|email|harvest|extract|grab|miner) [NC,OR]
  RewriteCond %{THE_REQUEST} \?\ HTTP/ [NC,OR]
  RewriteCond %{THE_REQUEST} \/\*\ HTTP/ [NC,OR]
  RewriteCond %{THE_REQUEST} etc/passwd [NC,OR]
  RewriteCond %{THE_REQUEST} cgi-bin [NC,OR]
  RewriteCond %{THE_REQUEST} (%0A|%0D) [NC,OR]

  # Bloquer plusieurs vecteurs d'attaque (SQL injections, RFI, base64, ...)
  RewriteCond %{QUERY_STRING} [a-zA-Z0-9_]=http:// [OR]
  RewriteCond %{QUERY_STRING} [a-zA-Z0-9_]=(\.\.//?)+ [OR]
  RewriteCond %{QUERY_STRING} [a-zA-Z0-9_]=/([a-z0-9_.]//?)+ [NC,OR]
  RewriteCond %{QUERY_STRING} \=PHP[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12} [NC,OR]
  RewriteCond %{QUERY_STRING} (\.\./|\.\.) [OR]
  RewriteCond %{QUERY_STRING} ftp\: [NC,OR]
  RewriteCond %{QUERY_STRING} http\: [NC,OR]
  RewriteCond %{QUERY_STRING} https\: [NC,OR]
  RewriteCond %{QUERY_STRING} \=\|w\| [NC,OR]
  RewriteCond %{QUERY_STRING} ^(.*)/self/(.*)$ [NC,OR]
  RewriteCond %{QUERY_STRING} ^(.*)cPath=http://(.*)$ [NC,OR]
  RewriteCond %{QUERY_STRING} (\<|%3C).*script.*(\>|%3E) [NC,OR]
  RewriteCond %{QUERY_STRING} (<|%3C)([^s]*s)+cript.*(>|%3E) [NC,OR]
  RewriteCond %{QUERY_STRING} (\<|%3C).*iframe.*(\>|%3E) [NC,OR]
  RewriteCond %{QUERY_STRING} (<|%3C)([^i]*i)+frame.*(>|%3E) [NC,OR]
  RewriteCond %{QUERY_STRING} base64_encode.*\(.*\) [NC,OR]
  RewriteCond %{QUERY_STRING} base64_(en|de)code[^(]*\([^)]*\) [NC,OR]
  RewriteCond %{QUERY_STRING} GLOBALS(=|\[|\%[0-9A-Z]{0,2}) [OR]
  RewriteCond %{QUERY_STRING} _REQUEST(=|\[|\%[0-9A-Z]{0,2}) [OR]
  RewriteCond %{QUERY_STRING} ^.*(\[|\]|\(|\)|<|>).* [NC,OR]
  RewriteCond %{QUERY_STRING} (NULL|OUTFILE|LOAD_FILE) [NC,OR]
  RewriteCond %{QUERY_STRING} (\./|\../|\.../)+(motd|etc|bin) [NC,OR]
  RewriteCond %{QUERY_STRING} (localhost|loopback|127\.0\.0\.1) [NC,OR]
  RewriteCond %{QUERY_STRING} (<|>|'|%0A|%0D|%27|%3C|%3E|%00) [NC,OR]
  RewriteCond %{QUERY_STRING} concat[^\(]*\( [NC,OR]
  RewriteCond %{QUERY_STRING} union([^s]*s)+elect [NC,OR]
  RewriteCond %{QUERY_STRING} union([^a]*a)+ll([^s]*s)+elect [NC,OR]
  RewriteCond %{QUERY_STRING} (;|<|>|'|"|\)|%0A|%0D|%22|%27|%3C|%3E|%00).*(/\*|union|select|insert|drop|delete|update|cast|create|char|convert|alter|declare|order|script|set|md5|benchmark|encode) [NC,OR]
  RewriteCond %{QUERY_STRING} (sp_executesql) [NC]
  RewriteRule ^(.*)$ - [F,L]
</IfModule>
```

> [!WARNING]
> Ce bloc est loin d'être une protection parfaite et peut parfois rentrer en conflit avec une application web.
