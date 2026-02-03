[order]:       # (1)
[name]:        # (Ubuntu)
[description]: # (Mettre en place Ubuntu Server 24.04 LTS)

Notre serveur se base sur Linux, plus précisemment [Ubuntu Server 24.04](https://ubuntu.com/download/server). C'est actuellement un des standards pour un serveur polyvalent et énormément de ressources et tutoriels incluent une version pour Ubuntu.

<br>

Pour l'installer sur une machine :
1. Télécharger [l'image ISO](https://releases.ubuntu.com/24.04.3/ubuntu-24.04.3-live-server-amd64.iso) d'Ubuntu Server 24.04 LTS ;
2. Flasher l'image sur une clé USB ([Etcher](https://etcher.balena.io/#download-etcher) fonctionne sur tous les OS) ;
3. Démarrer la machine sur la clé USB (dépend de la marque et de la version du BIOS/UEFI) ;

Si tout s'est bien passé, appuyer sur `Enter` pour commencer l'installation d'Ubuntu :
![Séquence de démarrage](/assets/images/ubuntuGrub.png)

Une fois le démarrage terminé, le menu d'installation commence avec la sélection de la langue :
![Sélection de la langue](/assets/images/ubuntuLangue.png)

Une fois la langue choisie il vous sera demandé de choisir votre configuration de clavier :
![Sélection du layout du clavier](/assets/images/ubuntuClavier.png)

Après cela il vous sera demandé de choisir le type d'installation que vous souhaitez, choisissez Ubuntu :
![Type d'installation Ubuntu Server](/assets/images/ubuntuType.png)

Ensuite vient la configuration réseau, si la machine est déjà connecté à un port Ethernet il suffit de valider :
![Configuration réseau](/assets/images/ubuntuRéseau.png)

> [!NOTE]
> Après la configuration réseau vient la configuration du proxy qui ne nous est pas utile donc il faut laisser l'adresse vide et valider.

Maintenant que la machine a bien accès à internet, elle va effectuer des tests d'accès aux serveurs Ubuntu, patientez puis passer à la prochaine section :
![Tests des mirroirs](/assets/images/ubuntuMirroirs.png)

Puis vient la partie la plus critique, la gestion des partitions :
- Assurez vous une dernière fois qu'il n'y a rien d'important sur le disque ;
- Choisir l'option "Utiliser le disque entier"
- Décocher "Setup this disk as an LVM group" puis valider

![Gestion des partitions](/assets/images/ubuntuDisque.png)

La section suivante montre un résumé de la configuration du stockage, il suffit de valider et continuer :
![Validation configuration stockage](/assets/images/ubuntuResume.png)

Une fois que vous aurez confirmé il vous sera demandé de renseigner nom, login et un mot de passe :
![Création d'un utilisateur](/assets/images/ubuntuLogin.png)

> [!NOTE]
> La section d'après propose d'activer Ubuntu Pro, il suffit de la passer.

Juste avant de démarrer l'installation, il faut cocher "Installer le serveur OpenSSH" et continuer :
![Installation OpenSSH](/assets/images/ubuntuSSH.png)

> [!NOTE]
> Encore une fois, la section d'après permet d'installer des certaines solutions entreprise, il suffit de la passer.

Après cela l'installation commence et une fois terminée, ce message apparait :
- Appuyer sur "Redémarrer maintenant" ;
- Il vous sera proposé de retirer la clé USB et d'appuyer sur `Enter` ;
- La machine démarrera toujours sur Ubuntu Server après ça.

![Fin de l'installation](/assets/images/ubuntuFin.png)
