[order]:       # (9)
[name]:        # (Installation et configuration Wireguard)
[description]: # (Guide d'installation et de configuration de Wireguard)

Pour utiliser Wireguard sur votre serveur Linux il faut commencer par l’installer grâce aux commandes suivantes :
```bash
sudo apt update
sudo apt install wireguard –y
```

Une fois Wireguard installé il faudra générer des clés privées et publiques qu’on utilisera plus tard pour configurer le VPN :
```bash
sudo mkdir -p /etc/wireguard
sudo sh -c "umask 077 && wg genkey | tee /etc/wireguard/server_private.key | wg pubkey > /etc/wireguard/server_public.key"
```

Vous pouvez afficher les clés avec les commandes suivantes :
```bash
sudo cat /etc/wireguard/server_private.key
sudo cat /etc/wireguard/server_public.key
```

Veuillez conserver les clés afin de les utiliser plus tard.

Après cela vous allez devoir créer le fichier de configuration du serveur Wireguard en utilisant la commande suivant :
```bash
sudo nano /etc/wireguard/wg0.conf
```

 Vous pouvez y copier ce qui suit :
 ```bash
[Interface]
Address = 10.8.0.1/24
ListenPort = 51820
PrivateKey = <clé_privée_du_serveur>
# Active le NAT
PostUp = ufw route allow in on wg0 out on <interface réseau publique>
PostUp = iptables -t nat -A POSTROUTING -o <interface réseau publique> -j MASQUERADE
PostDown = iptables -t nat -D POSTROUTING -o <interface réseau publique> -j MASQUERADE
SaveConfig = true
```

Vous pouvez trouver l’interface réseau publique avec la commande:
```bash
ip a
```

Après cela vous devrez configurer le pare-feu avec les commandes suivantes :
```bash
sudo ufw allow 51820/udp
sudo ufw enable
sudo ufw status
```

Ensuite activez le routage ip en décommentant la ligne « net.ipv4.ip_forward=1 » dans le fichier :
```bash
sudo nano /etc/sysctl.conf
```

Appliquez ensuite le changement en rentrant la commande suivante :
```bash
sudo sysctl –p
```

Il est temps maintenant de créer un client sur Wireguard sur votre machine personnelle en configurant de la manière suivante :
```bash
[Interface]
PrivateKey = <clé_privée_du_client>
Address = 10.8.0.2/24
DNS = 1.1.1.1

[Peer]
PublicKey = <clé_publique_du_serveur>
Endpoint = <IP_publique_du_serveur>:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
```

Vous pouvez maintenant ajouter le client dans le fichier de configuration serveur toujours avec la commande suivante :
```bash
sudo nano /etc/wireguard/wg0.conf
```

Ajoutez-y ce qui suit :
```bash
[Peer]
PublicKey = <clé_publique_du_client>
AllowedIPs = 10.8.0.2/32
```

Vous pourrez ensuite démarrer Wireguard avec les commandes suivantes :
```bash
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0
sudo systemctl status wg-quick@wg0
```
Activez votre client Wireguard sur votre machine et vous pourrez vérifier que le client est bien connecté au serveur Wireguard avec la commande suivante à rentrer côté serveur :
```bash
sudo wg show
```
Si le serveur est connecté à une box ou à un routeur domestique il reste une dernière étape :

Il va être nécessaire de redirigé le port UDP dans la box : -Protocole = UDP
-Port externe = 51820

-Adresse IP locale du serveur = 194.214.171.22

-Port interne = 51820

Redémarrez ensuite Wireguard côté serveur:
```bash
sudo systemctl restart wg-quick@wg0
```
Désactivez puis réactivez le tunnel côté client

Re-testez depuis le client avec la commande suivante (windows dans le powershell):
```bash
Test-NetConnection -ComputerName 194.214.171.22 -Port 51820 -InformationLevel Detailed
```
Puis vérifiez sur le serveur:
```bash
sudo wg show
```
