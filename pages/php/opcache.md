[order]:       # (3)
[name]:        # (OPcache)
[description]: # (Comment installer et configurer PHP OPcache)

De base, PHP charge et analyse chaque fichier PHP demandé. OPCache permet de stocker en mémoire vive le bytecode généré après chaque analyse pour que les requêtes suivantes soient traitées plus rapidement. Pour l’installer :

- `sudo apt install php-opcache` ;
- Mettre `opcache.enable=1` dans un `php.ini` ;
- Redémarrer Apache avec `sudo systemctl restart apache2`.

<br>
Les paramètres suivants peuvent être modifiés pour gagner en performances, ils se placent dans un `php.ini` :

| Nom du paramètre                  | Description                                                                                                       |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| `opcache.enable_cli`              | Activer la mise en cache pour les scripts en ligne de commande.                                                   |
| `opcache.interned_strings_buffer` | La taille de la mémoire allouée pour stocker les chaînes de caractères.                                           |
| `opcache.jit`                     | La stratégie de compilation en temps réel (JIT) qui est plus rapide que la compilation en avance (Ahead of Time). |
| `opcache.jit_buffer_size`         | La taille de la mémoire allouée pour le code compilé en temps réel.                                               |
| `opcache.max_accelerated_files`   | Le nombre maximum de fichiers pris en charge par OPCache.                                                         |
| `opcache.memory_consumption`      | Taille totale de la mémoire allouée à OPCache.                                                                    |
| `opcache.revalidate_path`         | S’il faut systématiquement vérifier ou non si le fichier PHP en cache a été modifié.                              |
| `opcache.save_comments`           | S’il faut mettre en cache ou non les commentaires présents dans les différents fichiers PHP.                      |
| `opcache.validate_root`           | S’il faut vérifier uniquement les fichiers se trouvant dans le chroot de l’application ou non.                    |
| `opcache.validate_timestamps`     | Vérifier à intervalle régulier (revalidate_freq) si les fichiers ont été modifiés ou non.                         |
| `opcache.revalidate_freq`         | La fréquence (en secondes) à laquelle OPCache vérifie quels fichiers ont été modifiés.                            |

<br>
Quelques bonnes pratiques/conseils :

- Activer `jit` en mode `tracing` et ajuster `jit_buffer_size` à 5% de la RAM disponible ;
- Augmenter `memory_consumption` si le cache est souvent complet ;
- Augmenter `interned_strings_buffer` à 32MB ou 64MB si l’application effectue beaucoup d'opérations sur les chaînes de caractères ;
- Exécuter `find . -iname "*.php" | wc -l` à la racine du site pour savoir combien il y a de fichiers et pour ajuster `max_accelerated_files` ;
- Désactiver `validate_timestamps` ou augmenter `revalidate_freq` en production pour éviter de revalider le cache pour rien.
