[order]:       # (3)
[name]:        # (VPN Wireguard)
[description]: # (Mettre en place un accès VPN avec WireGuard)

Pour limiter l'accès à notre serveur, il est possible d'y déployer un VPN, le rendant accessible uniquement à ceux autorisés.
Pour commencer, on installe Wireguard avec `apt` :
```bash
sudo apt update
sudo apt install wireguard –y
```

Ensuite, pour authentifier les clients, WirGuard a besoin d'une paire de clés publiquee/privée qu'on génère comme cela :
```bash
sudo mkdir -p /etc/wireguard
sudo sh -c "umask 077 && wg genkey | tee /etc/wireguard/server_private.key | wg pubkey > /etc/wireguard/server_public.key"
```

Puis, on crée `/etc/wireguard/wg0.conf`, le fichier de configuration du serveur WireGuard :
- `Address` est la plage d'IPs données aux clients connectés au VPN ;
- `ListenPort` est le port utilisé par lees clients pour se connecter ;
- `PrivateKey` est le contenu de `/etc/wireguard/server_private.key` ;
- `PostUp` et `PostDown` sont les commandes à exécuter au démarrage et à l'arrêt de WireGuard.
```bash
[Interface]
Address = 10.8.0.1/24
ListenPort = 51820
PrivateKey = <contenu de /etc/wireguard/server_private.key>

PostUp = ufw route allow in on wg0 out on $(ip -o -f inet route show default | awk '{print $5}') ; iptables -t nat -A POSTROUTING -o $(ip -o -f inet route show default | awk '{print $5}') -j MASQUERADE
PostDown = iptables -t nat -D POSTROUTING -o $(ip -o -f inet route show default | awk '{print $5}') -j MASQUERADE
SaveConfig = true
```

> [!TIP]
> Ici, l'interface réseau utilisée est celle par défaut, si ce n'est pas la bonne il faudra la remplacer par une des interfaces visibles avec `ip a`.

Une fois le serveur WireGuard configuré, il faut :
- Autoriser notre port de connexion avec `sudo ufw allow 51820/udp` ;
- Activer le routage IP en décommentant la ligne suivante dans `/etc/sysctl.conf` ;
  ```apacheconf
  net.ipv4.ip_forward=1 
  ```
- Appliquer ces changements en exécutant ces commandes.
  ```bash
  $ sudo ufw reload
  $ sudo sysctl –p
  ```
<br>

Maintenant, il est temps d'autoriser un client à se connecter à notre serveur.
On commence par générer une paire de clés que le **client** doit garder :
```bash
$ mkdir -p ~/.wireguard
$ umask 077 && wg genkey | tee ~/.wireguard/client_private.key | wg pubkey > ~/.wireguard/client_public.key
```

> [!WARNING]
> Il faut exécuter ces commandes côté client et donc installer `wg` (WireGuard) côté client.

Une fois toutes les informations en notre possession, on crée `/etc/wireguard/wg0.conf` **côté client** :
```bash
[Interface]
PrivateKey = <contenu de ~/.wireguard/client_private.key>
Address = 10.8.0.2/24
DNS = 9.9.9.9

[Peer]
PublicKey = <contenu de /etc/wireguard/server_public.key>
Endpoint = <ip publique du serveur>:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
```

Maintenant, **côté serveur**, on autorise notre client en ajoutant ces lignes à `/etc/wireguard/wg0.conf` :
```bash
[Peer]
PublicKey = <contenu de ~/.wireguard/client_public.key>
AllowedIPs = 10.8.0.2/32
```

Enfin, toujours **coté serveur**, on active notre service WireGuard :
```bash
sudo systemctl enable --now wg-quick@wg0
```
<br>

Maintenant que tout est configuré, on peut se connecter à notre serveur :
```bash
$ sudo wg-quick up wg0    # Se connecter
$ sudo wg                 # Vérifier la connexion
$ sudo wg-quick down wg0  # Se déconnecter
```

> [!WARNING]
> Si le serveur est connecté à une box, il sera nécessaire de rediriger le port 51820 de la box vers le port 51280 du serveur.
