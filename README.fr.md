# GETTING STARTED

MeloMelon est un bot pour twitch dans une extention du navigateur Chrome pour envoyer à votre chat la musique actuellement jouée sur Youtube.

## Installation

Build(?) le code source directement en utilisant un webpack et npm

Commande d'installation :

git clone git@framagit.org:adfaure/melomelon.git
npm install
npx webpack-cli -c webpack.config.js

## Téléchargement :

Téléchargez l'extension [wip].

## Installation de l'extension chrome

Pour le moment, l'extension n'est pas disponible dans l'extension store (et je ne compte pas le mettre). Les étapes sont décrites ici.

1. Téléchargez ou build(?) le projet
  * Si le projet est archivé (.zip, .tar), extrayez le à l'endroit voulu.
2. Allez à chrome://extensions.
3. Activez le mode développeur (en haut à droite).
4. Cliquez sur Load Unpacked (en haut à gauche de la page).
  * Cela devrait ouvrir un popup, allez dans le dossier où l'extension est située. (Je ne comprends pas cette étape, aller dans le dossier pour quoi faire ?)
5. Fini !

# Comment l'utiliser

Première utilisation :

Pour démarrer le bot, ouvrez le popup extension dans chrome. C'est le panneau de contrôle principal du bot, ce panneau de contrôle a TROIS couches (comme les oignons) (tu peux remplacer le mot couche par le mot "entrée" ou "option" ou "fenêtre" ou "lien" ou ...) :

* La première couche doit être utilisée pour ouvrir Youtube.
* La seconde couche donne des informations concernant le bot Twitch.
* La dernière couche donne accès aux paramètres et statistiques.

Tout d'abord, vous devez configurer le bot Twitch. Ouvrez la page de paramètres et entrez les données nécessaires afin de connecter le bot à Twitch. Pour obtenir un jeton d'accès, suivez ce lien.

* Le nom d'utilisateur du bot.
* Le jeton d'accès (doit rester privé, ne le communiquez pas).
* La chaîne sur laquelle le connecter (à priori votre chaîne Twitch).

## Streaming

Le bot n'espionne pas vos onglets. Il récupère seulement les informations des onglets qu'il a lui même ouvert (la fenêtre Youtube ouverte via la première couche). Chaque fois qu'un viewer utilise une commande (!song par exemple), le bot récupère les informations via cet onglet seulement.
En d'autre termes VOUS DEVEZ OUVRIR YOUTUBE VIA L'EXTENSION CHROME.

Une fois que vous avez un onglet ouvert, vous pouvez retourner sur le popup de l'extension et connecter l'extension à Twitch (Bouton "Start bot").

Du fait des possibilités limitées des extensions Chrome, vous ne devez pas fermer l'onglet Youtube, auquel cas l'extension déconnectera le bot Twitch quelque temps après.