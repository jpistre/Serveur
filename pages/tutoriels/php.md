[order]:       # (5)
[name]:        # (PHP)
[description]: # (Installation, configuration et optimisation d'applications PHP)

PHP lui-même est seulement un langage de programmation adapté au développement web côté serveur. Pour que les utilisateurs aient accès à nos applications il est nécessaire d’installer un serveur web capable de s’interfacer avec PHP.

> [!TIP]
> Pour apprendre une bonne partie de la syntaxe et des fonctionnalités du langage :
> [PHP Introduction - GeeksforGeeks](https://www.geeksforgeeks.org/php/php-introduction/)

Dans notre cas, on utilisera Apache, voilà la commande nécessaire pour tout installer sur un serveur basé sur Debian/Ubuntu :
```bash
$ sudo apt install php-common libapache2-mod-php php-cli
```

Voici quelques frameworks qui facilitent la création de sites webs :
- WordPress.org — Initialement créé pour gérer des blogs mais assez extensible pour couvrir beaucoup d’usages. Les plugins les plus puissants sont souvent onéreux et peuvent très lourdement affecter les performances du site ;
- Laravel — Approche dogmatique du développement PHP avec de nombreux modules déjà prêts à programmer ;
- Symfony — Très orienté DX et composants, laisse beaucoup de liberté aux développeurs.

Une fois installé, il est important de savoir comment configurer PHP et surtout dans quel ordre PHP charge les fichiers php.ini :

1. Celui du SAPI (Server API)
    - `/etc/php/<version>/apache2/php.ini` pour Apache ;
    - `/etc/php/<version>/fpm/php.ini` pour PHP FPM ;
    - `/etc/php/<version>/cli/php.ini` pour PHP CLI.
2. Celui spécifié par la variable `PHPRC` si cette-dernière existe ;
3. Celui à la racine de chaque serveur web (à configurer, différent selon le SAPI utilisé).

Pour être sûr du chemin, il y a deux vérifications à faire :

- `php --ini | grep php.ini` pour PHP CLI ;
- Créer un serveur web qui sert le fichier suivant et y accéder via un navigateur.
  ```php
  <?php phpinfo(); ?>
  ```

Les paramètres suivants peuvent être modifiés pour gagner en performances :

| Nom du paramètre           | Description                                                                                                        |
| :------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| `auto_globals_jit`         | Créer les variables globales quand elles sont utilisées pour la première fois ou non.                              |
| `child_terminate`          | Autoriser les scripts PHP à terminer le processus qui traite la requête en cours une fois cette-dernière terminée. |
| `implicit_flush`           | Forcer ou non PHP à vider sa sortie à chaque echo/print et à chaque bloc HTML.                                     |
| `output_buffering`         | Activer ou non la mise en mémoire de la sortie, évite d’envoyer les données en plusieurs fois.                     |
| `realpath_cache_size`      | La taille de la mémoire allouée pour mettre en cache les chemins réels des fichiers.                               |
| `realpath_cache_ttl`       | La durée maximale de la mise en cache de ces chemins.                                                              |
| `session.gc_maxlifetime`   | La durée (en secondes) avec qu’une donnée soit considérée comme inutile (puis libérée).                            |
| `max_execution_time`       | Le temps (en secondes) maximum avant d’arrêter l’exécution d’un script.                                            |
| `enable_post_data_reading` | Populer automatiquement ou non les variables `$POST` et `$INPUT`.                                                  |

Pour ce qui est de la sécurité :

| Nom du paramètre                            | Description                                                                                                            |
| :------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| `display_errors` et `display_startup_error` | Afficher ou non les erreurs PHP côté front, peut inclure des informations sensibles.                                   |
| `doc_root`                                  | La racine de PHP, presque tous les documents sous la racine seront accessibles.                                        |
| `engine`                                    | À configurer au niveau d’un sous-dossier, permet d’activer ou non le parsing de fichiers PHP.                          |
| `expose_php`                                | Afficher ou non la version de PHP dans les headers HTTP.                                                               |
| `file_uploads`                              | Activé par défaut, autorise ou non le téléversement de fichiers.                                                       |
| `memory_limit`                              | La quantité maximale de mémoire qu’un script peut allouer, évite qu’un script ne prenne 100% de la mémoire disponible. |
| `mysql.allow_local_infile `                 | Activé par défaut, autorise ou non les directives `LOAD_DATA`.                                                         |

Quelques options pour faciliter le debug :

| Nom du paramètre                                | Description                                                         |
| :---------------------------------------------- | :------------------------------------------------------------------ |
| `error_prepend_string` et `error_append_string` | Les chaînes à ajouter avant et après chaque erreur.                 |
| `error_log`                                     | Le nom du fichier où écrire toutes les erreurs (stderr par défaut). |
| `mysql.trace_mode`                              | Désactivé par défaut, affiche les erreurs et warnings SQL.          |
