# webpack-angular2 tutorial
 
L'idée est de comprendre le fonctionnement de base de webpack avec ses plugins les plus classiques; puis de commencer un simple projet angular2 avec type script.

## Installation

Il y aura besoin de npm. Le plus simple pour installer npm est d'installer node. Et le plus simple pour installer node et d'installer nvm ;)

* curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
* nvm install node

Ensuite il faut créer un répertoire et mettre de dans un fichier package.json pour déclarer les dépendances dont nous aurons besoin.

```json
{
  "name": "webpack-angular2",
  "version": "0.0.1",
  "description": "some fun with webpack",
  "author": "jbcazaux",
  "devDependencies": {
    "webpack": "^1.13.0",
    "webpack-dev-server": "^1.14.1"
  }
}
```

## Projet de base

L'idée est de partir sur un projet en html/javascript vraiment très très simple, sans librairie externe et sans angular dans un premier temps.
Nous allons commencer par afficher un message hello world dans la page html. 

### Structure du projet
```
.
|-- ./README.md
|-- ./dist
|-- ./node_modules
|-- ./webpack.config.js
|-- ./src
|   |-- ./src/onload.js
|   |-- ./src/greetings.js
|   `-- ./src/index.html
`-- ./package.json
```
Le répertoire src contiendra nos fichiers JS et HTML. 'dist' contient les fichiers générés et à la racine on trouve le fichier package.json et webpack.config.js que l'on va tout de suite créer.
Dans un premier temps nous allons afficher un message hello world dans la page html. 

### Fichiers JS & Html
Pour ce hello world, 2 modules et un index.html:
* un qui contient la méthode helloworld
* un qui va appeler le helloworld au chargement de la page

src/greetings.js:
```javascript
module.exports = {
    hello: function (name) {
        return "hello " + name;
    }
};
```

src/onload.js:
```javascript
var greetings = require('greetings.js');
window.onload = function () {
    document.write(greetings.hello("world !!"))
};
```

src/index.html
```html
<html>
<head>
    <title>My webpack-angular2 tutorial</title>
</head>
<body>
</body>
</html>
```

### Fichier de configuration de webpack
En l'état pas grand chose ne va fonctionner. Le fichier html ne charge aucun des fichiers JS.
On a plusieurs solutions pour faire fonctionner le tout. Déjà on aurait pu ne pas utiliser les modules (sans `module.exports` ni `require`) et déclarer la méthode `hello` dans le scope de `window`, puis charger à la main les 2 fichiers JS.
Bon cette approche est un peu old school et c'est précisemment ce que nous cherchons à éviter avec l'utilisation de webpack.
La solution viable est donc de laisser à webpack le soin d'ajouter les fichiers JS nécessaires.

webpack.config.js:

```javascript
var webpack = require("webpack");
var HtmlWebpackPlugin = require('html-webpack-plugin'); //le plugin qui permet de compléter la page index.html
var path = require('path'); // plugin qui permet de construire des paths en concaténant le nom des répertoires

module.exports = {
    entry: {    //(1)
        main: [ // (2)
            './src/onload.js', //(3) 
            './src/greetings.js'
        ]
    },

    output: {
        path: path.resolve(__dirname, 'dist') // (4)
        filename: '[name].js', // (5)
    },

    resolve: { // (6)
        root: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'node_modules')],
        extensions: ['', '.js']
    },

    plugins: [ 
        new HtmlWebpackPlugin({ // (7)
            template: './src/index.html',
            inject: 'body'
        })
    ]
};
```

1. Dans `entry` nous déclarons les points d'entrée dans l'application. Typiquement la homepage.
2. Ici un seul point d'entrée que nous choisirons d'appeler `main`.
3. Ce point d'entrée nécessite les fichiers JS `onload.js` et `greetings.js`
4. Les fichiers générés (les *chunks*) seront copiés dans le répertoire `dist`, que l'on construit avec le plugin path déclarés plus haut.
5. Nous avons le choix de générer qu'un seul fichier JS qui contiendrait l'ensemble des fichiers JS déclarés pour **TOUS** les points d'entrée. Pour faire ceci il faudrait mettre la ligne `filename: all.js`. Ici nous choisissons plutôt de générer un fichier pour **CHACUN** des points d'entrée. Ici nous n'en avons qu'un seul donc on ne verrait pas nécessairement la différence. Avec la ligne `filename: [name].js` nous choisissons de donner à chacun des fichiers JS générés, le nom du point d'entrée; nous aurons donc un main.js de créé, avec dedans le code de `onload.js` et `greetings.js`.
6. Comme nous avons créé un module (`onload.js`), il faut déclarer à webpack les répertoires où ces modules se trouvent. Evidemment il y a le répertoire `node_modules` et bien sûr notre répertoire `src` où sont nos modules. La ligne `extensions` permet de déclarer les extensions des fichiers contenant des modules.
7. Enfin, dans la partie `plugins` du fichier, nous allons utiliser ce fameux plugin qui va ajouter les sources JS au fichier html. Par défaut, tous les fichiers JS générés (ces fameux *chunks*), sont ajoutés au fichier html. Ici nous aurons donc un import de main.js dans notre index.html généré. La ligne `inject: body` indique simplement là où les imports js sont injectés.

Et ceci ne va encore pas fonctionner. En effet nous utilisons des plugins (`path` et `HtmlWebpackPlugin`), mais nous ne les avons pas chargés dans les dépendances du projet. Alors ce n'est pas nécessaire pour le plugin path, qui est déjà chargé par ailleurs, mais c'est nécessaire pour l'autre. Le fichier package.json est complété par:
```json
"devDependencies": {
    "html-webpack-plugin": "^2.16.1",
    "webpack": "^1.13.0",
    "webpack-dev-server": "^1.14.1"
  }
```
Un petit coup de `npm install` puis de `webpack` et c'est parti. Dans le répertoire `dist` il devrait y avoir les fichiers 
- `main.js` avec le code de `onload.js` et `greetings.js`
- `index.html` avec l'import de `main.js`
 
Pour voir si tout cela fonctionne, on peut lancer `webpack-dev-server` et se connecter avec un navigateur sur localhost:8080

## Optimisation

Jusque là rien d'extraordinaire. 
Cependant webpack permet de faire beaucoup mieux. Plutot que de charger tous les fichiers JS d'une page dès le début (ce qui peut être long dans le cas d'une single page app), il serait intéressant de ne charger que le strict minimum pour avoir un premier rendu le plus rapidement possible, puis ne charger que les autres scripts JS quand il y en a réellement besoin.

Mais si plusieurs pages (ou vues) de l'application utilisent des librairies communes (comme jquery), c'est idiot d'inclure jquery dans tous les fichiers (*chunks*) où il y en a besoin. Cela ferait grossir les fichiers et télécharger plusieurs fois jquery (une fois par point d'entrée de l'application). La solution est donc de créer des *chunks* regroupant le code commun à plusieurs pages. Ainsi on aura par exemple dans notre `index.html` l'import du *chunk* contenant *jquery* et *underscore*, puis l'import du *chunk* contenant les scripts JS pour notre point d'entrée *main*. 

Webpack va nous aider à déterminer quel est le code commun entre plusieurs points d'entrée (ou pages). Par exemple si la page A a besoin des modules m1, m2, m3 et la page B des modules m1, m2 et m4. Alors le code commun entre les 2 pages sera m1 et m2. Il peut donc être intéressant de créer un *chunk* contenant m1 et m2, de charger ce *chunk* dans pageA.html et pageB.html.Ainsi, si l'utilisateur commence par naviguer sur la page A il va télécharger le *chunk* avec m1 et m2, et un chunk avec m3. Puis quand il passe sur la page B, il aura déjà en cache le *chunk* avec m1 et m2, et il n'aura plus qu'à télécharger le *chunk* avec m4. Simple non ?

Allez on peut encore faire mieux ! Imaginons que la page A ait besoin des modules m1 et m2 pour s'afficher, mais que le module m3 ne serve qu'à afficher une fonctionnalité accessible via un clic et dont seulement 10% des utilisateurs se servent. Ne serait-ce pas mieux que ne charger m3 à la demande ? Ainsi 100% des utilisateurs verront leur page A s'afficher plus vite, et 10% attendront un petit peu avant de voir la fonctionnalité de m3 arriver sur leur écran (le temps de charger m3).

Encore un peu de bon sens ? Imaginons maintenant que m1 et m2 soient des modules ridiculement petits en taille de code. Est il vraiment optimisé de charger, par exemple pour la page A, le *chunk* avec m1 et m2 ? Qu'en est il de la latence réseau ? Du nombre maximum de fichiers (jss, css, ...) que le navigateur peur charger en même temps ? Parfois il sera préférable de mettre m1,m2 et m3 dans le même *chunk*, puis de créer un 2ème *chunk* pour la page B contenant m1,m2, m4.

Cette fois ci c'est la dernière: Imaginonsn que nous ayons une dizaine de pages, Toutes les pages ont les modules m1 et m2 en commun, mais seules les pages A et F ont le module m3 en commun. Est il vraiment optimisé de créer un *chunk* avec ce module m3 ? Comme pour le point précédent, il faut se poser la question du coût de télécharher un fichier supplémentaire (latence, maximum de téléchargements concurents, ...).

Les différentes optimisations que webpack propose consistent donc en:
- Charger d'un coup (dans un seul et même fichier) tous les scripts qui sont nécessaires à une vue (ou à une page, si le site n'est pas une single page app).
- Extraire dans un fichier du code commun entre plusieurs pages (ou vues)
- Décider automatiquement suivant la taille du fichier (*chunk*) ou le nombre de pages dans lesquelles il (le *chunk*) est utilisé, si cela vaut le coût de créer ce *chunk*.
- Charger à la demande (et donc pas dès le chargement de la page) un module (en fait le *chunk* contenant le code du module).
