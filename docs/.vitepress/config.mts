import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Serveur Linux",
  description: "Self hosting avec Linux",

  themeConfig: {
    nav: [
      {
        text: "Accueil",
        link: "/",
      },
    ],

    sidebar: [
      {
        text: "Mise en place du serveur",
        items: [
          { text: "Ubuntu", link: "/setup/ubuntu" },
          { text: "OpenSSH", link: "/setup/openssh" },
          { text: "VPN Wireguard", link: "/setup/wireguard" },
          { text: "Filestash", link: "/setup/filestash" },
          { text: "Mailing", link: "/setup/mail" },
        ],
      },
      {
        text: "Tutoriels",
        items: [
          { text: "Apache", link: "/tutoriels/apache" },
          { text: "PHP", link: "/tutoriels/php" },
          { text: "Docker", link: "/tutoriels/docker" },
        ],
      },
      {
        text: "Ressources",
        items: [
          { text: "FPM", link: "/ressources/php_fpm" },
          { text: "OPCache", link: "/ressources/opcache" },
          { text: "APCu et Redis", link: "/ressources/acpu_redis" },
          { text: "Choix d'un framework web", link: "/ressources/web" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/mrspaar/Serveur" },
    ],
  },
});
