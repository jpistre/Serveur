[order]:       # (6)
[name]:        # (Docker)
[description]: # (Déployer des applications Docker)

Docker est outil de virtualisation qui permet de déployer des applications de manière reproductible quelque soit l'OS :
```bash
# Ajouter la clé GPG de Docker
$ sudo apt update
$ sudo apt install ca-certificates curl
$ sudo install -m 0755 -d /etc/apt/keyrings
$ sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
$ sudo chmod a+r /etc/apt/keyrings/docker.asc

# Ajouter le repository de Docker
$ sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

# Installer Docker CLI
$ sudo apt update
$ sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Vérifier que Docker a bien été installé
$ sudo docker run hello-world

# Exécuter des commandes Docker sans sudo
$ sudo usermod -aG docker $USER
```

> [!WARNING]
> Attention à bien redémarrer votre session sinon vous devrez toujours utiliser `sudo`

## Rapide tutoriel

Dans ce rapide tutoriel, on va prendre l'exemple du déploiement d'une application Flask très simple :
```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

On commence par créer un fichier appelé `Dockerfile`. Il permet de créer une **image**, elle contient tout ce qu'il faut pour pouvoir démarrer notre application :
```docker
FROM python:3.14-slim

WORKDIR /app
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py app.py
CMD ["python", "-u", "app.py"]
```

Ici :
- On part d'une image python pré-installée ;
- On se place arbitrairement dans le dossier `/app` de l'image ;
- On installe Flask grâce à `pip` ;
- On copie le fichier `app.py` de notre ordinateur dans `/app/app.py` ;
- On définit la commande à exécuter à `python -u main.py`.

Dans la première étape, on construit notre image, chaque étape est mise en cache pour éviter de la reconstruire de zéro à chaque modification de l'application :
```bash
$ docker build -t mon-app-flask .
```

Enfin, une fois l'image construite, on l'exécute dans un containeur (ajouter `-d` pour la démarrer en fond) :
```bash
$ docker run -p 5000:5000 mon-app-flask
```

> [!WARNING]
> Les images et les containeurs sont totalement dissociés. Il faut reconstruire l'image après chaque modification puis l'exécuter dans un containeur.
> Similairement, par défaut, il n'y a aucune persistance des données.

> [!TIP]
> Pour nettoyer toutes les images, containeurs, cache de build etc... :
> `docker system prune -a`

## Avoir une persistance des données

À partir d'ici on va utiliser `docker compose` par dessus `docker`. Compose permet de plus facilement gérer plusieurs containers et de les inter-connecter.

Pour ça, on crée un fichier `docker-compose.yml` et partir du principe qu'on veut une base de données pour notre application Flask :
```yaml
services:
  database:
    image: mysql
    environment:
      MYSQL_ROOT_PASSWORD: myRootPassword
      MYSQL_DATABASE: myDb
      MYSQL_USER: myUser
      MYSQL_PASSWORD: myPassword
    volumes:
      - "flask_db:/var/lib/mysql"

  app:
    build: .
    container_name: flask-app
    depends_on:
      - "db"

networks:
  default:
    driver: bridge

volumes:
  flask_db:
```

Ici :
- On crée un container basé sur l'image `mysql` (créée par les développeurs de mysql) ;
- Chaque table et transaction est stockée quelque part dans `/var/lib/mysql` et disparait une fois le container arrêté ;
- On crée donc un volume `flask_db` qui stocke de son côté chaque modification à `/var/lib/mysql` du service mysql ;
- On crée un containeur qui utilise le Dockerfile écrit précédemment (`build: .`) ;
- Pour que le containeur python ait accès au containeur mysql, on crée un réseau par défaut avec le driver `bridge`.

On obtient donc cette arborescence pour notre projet :
```
.
├── app.py
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

Et on peut accéder à notre base de données mysql dans `app.py` :
```python
import pymysql
from flask import Flask, jsonify
from contextlib import contextmanager


@contextmanager
def get_conn():
    conn = pymysql.connect(
        host="databse",
        port=3306,
        user="myUser",
        password="myPassword",
        database="myDb",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )
    try:
        yield conn
    finally:
        conn.close()


app = Flask(__name__)

@app.route("/")
def index():
    return jsonify({"message": "Hello from Flask + MySQL!"})

@app.route("/users", methods=["GET"])
def list_users():
    # Exemple uniquement, ici la table est jamais créée

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, name, email FROM users")
            rows = cur.fetchall()

    return jsonify(rows)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
```

Enfin, on peut démarrer notre application avec :
```bash
$ cd chemin/vers/docker-compose.yml
$ docker compose up --build -d
```

## Les templates disponibles

Pour Gradle (Java), NodeJS et Python, les trois templates suivent la même logique :
- Le contenu de `src` est copié dans `/app` ;
- Le script `build.sh` est modifiable et doit exporter tous les fichiers nécessaires au lancement de l'application dans `/dist` :
    - Gradle cherche à exécuter `/dist/app.jar` ;
    - Python cherche à exécuter `/dist/main.py` ;
    - NodeJS cherche à exécuter `/dist/index.js` ou un projet `npm` (avec `npm start`).
- Une fois tout configuré, il suffit de faire `docker compose up --build -d`.

Pour PHP les outils utilisés sont plus variés donc :
- `dependencies.sh` sert à installer les dépendances supplémentaires avec [`apk`](https://pkgs.alpinelinux.org/packages) ;
- `build.sh` sert à build l'application php (si besoin) ;
- `entrypoint.sh` sert à préparer l'application et à démarrer [PHP FPM](./php/fpm.md) ;
- `apache.conf` contient toute la configuration apache et la redirection vers PHP FPM.

> [!WARNING]
> `entrypoint.sh` ne doit pas démarrer de serveur web, seulement PHP FPM qui lui sert le dossier `/app/public`.
