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
