[order]:       # (2)
[name]:        # (FPM)
[description]: # (Comment installer et configurer PHP FPM)

FPM (FastCGI Process Manager) est un gestionnaire de processus PHP qui permet de gérer plusieurs requêtes en simultané, particulièrement utile pour les sites devant gérer une forte charge. Pour l’installer :
- `sudo  apt install php-fpm` ;
- Activer PHP FPM avec ces deux commandes ;
  ```bash
  $ sudo a2enmod proxy_fcgi setenvif
  $ sudo a2enconf php<version>-fpm
  ```
-  Redémarrer Apache et PHP FPM avec `sudo systemctl restart php-fpm apache2`.

Une fois installé il faut créer un groupe de processus et le lier à nos sites :

1. S’assurer que `/etc/php/<version>/fpm/pool.d/www.conf` contient bien ces lignes ;
    ```apacheconf
    listen = /run/php/php<version>-fpm.sock
    listen.owner = www-data
    listen.group = www-data
    listen.mode = 0660
    ```
2. Ajouter ce bloc à chaque VirtualHost Apache ;
    ```apacheconf
    <FilesMatch "\.php$">
        SetHandler "proxy:unix:/run/php/php<version>-fpm.sock|fcgi://localhost/"
    </FilesMatch>
    ```
3. Redémarrer Apache et PHP FPM avec `sudo systemctl restart php-fpm apache2`.

Les paramètres suivants peuvent être modifiés pour gagner en performances, ils se placent dans `/etc/php/<version>/fpm/php-fpm.conf` :

| Nom du paramètre  | Description                                                                                                           |
| :---------------- | :-------------------------------------------------------------------------------------------------------------------- |
| `pm`              | La stratégie de gestion des processus (`static`, `dynamic` ou `ondemand`)                                             |
| `pm.max_requests` | Le nombre de requêtes à traiter avant de redémarrer le processus, permet d’éviter les fuites de mémoire trop grosses. |

S’il y a des problèmes liés au traitement des requêtes simultanées, il faut modifier la configuration du gestionnaire de processus. La matrice suivante est un bon point de départ :

| Mémoire système (MB)                    | 4096 | 6144 | 8192 | 16384 | 32768 |
| :-------------------------------------- | :--: | :--: | :--: | :---: | :---: |
| `pm.max_children`                       |   20 |   40 |   60 |    80 |   120 |
| `pm.min_spare_servers`                  |    7 |   13 |   20 |    27 |    40 |
| `pm.max_spare_servers`                  |   20 |   40 |   60 |    80 |   120 |
| `pm.start_servers`                      |    7 |   13 |   20 |    27 |    40 |
| Estimation de la mémoire consommée (MB) | 1280 | 2562 | 3842 |  5120 |  7668 |

> [!TIP]
> Pour aller plus loin :
> [Apache2 and php fpm performance optimization — Step-by-step guide | by Sebastian Buckpesch | Medium](https://medium.com/@sbuckpesch/apache2-and-php-fpm-performance-optimization-step-by-step-guide-1bfecf161534)
