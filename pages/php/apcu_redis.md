[order]:       # (4)
[name]:        # (APCu et Redis)
[description]: # (Comment configurer PHP APCu et Redis)

## PHP APCu

APCu est un cache type clé-valeur pour PHP, il permet de stocker n’importe quelle variable. C’est un outil très répandu qui peut être facilement mis en place au sein d’un framework :

- Installer APCu avec `sudo apt install php<version>-apcu` ;
- L'activer en ajoutant la ligne `apc.enabled=1` à un `php.ini` ;

<br>
Les paramètres suivants sont intéressants à modifier en fonction des besoins :

| Nom du paramètre   | Description                                                                                        |
| :----------------- | :------------------------------------------------------------------------------------------------- |
| `apc.entries_hint` | La quantité de mémoire à pré-allouer, c’est uniquement une indication, pas une limite stricte.     |
| `apc.shm_size`     | La taille maximale de mémoire dédiée à APCu.                                                       |
| `apc.ttl`          | La durée maximale d’une valeur en cache.                                                           |
| `apc.slam_defense` | Éviter ou non que les processus essaient de mettre en cache la même valeur.                        |
| `serializer`       | Permet d’utiliser un serializer tiers, utile pour en utiliser un plus performant que celui de PHP. |

## Redis

Redis permet de faire la même chose qu’APCu mais est beaucoup plus flexible et scalable :

| Nom du paramètre   | Description                                                                                                                    |
| :----------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `timeout`          | Durée maximale (en secondes) pendant laquelle une connexion reste ouverte sans activité avant d’être automatiquement fermée.   |
| `databases`        | Nombre d’espaces de noms distincts disponibles au sein de l’instance Redis pour l’organisation des données.                    |
| `maxmemory`        | Limite maximale de mémoire dédiée à Redis.                                                                                     |
| `maxmemory_policy` | Comportement de Redis lorsque la limite maxmemory est atteinte, à modifier absolument sinon le site peut devenir inaccessible. |

<br>
En fonction des besoins, il y a trois stratégies d’éviction :

- `allkeys-lru` : Supprimer les clés les moins récemment utilisées ;
- `allkeys-lfu` : Supprimer les clés les moins fréquemment utilisées ;
- `allkeys-random` : Supprimer des clés au hasard.
