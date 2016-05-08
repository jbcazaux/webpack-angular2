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
    "html-webpack-plugin": "^2.16.1", //la nouvelle dépendance
    "webpack": "^1.13.0",
    "webpack-dev-server": "^1.14.1"
  }
```
Un petit coup de `npm install` puis de `webpack` et c'est parti. Dans le répertoire `dist` il devrait y avoir les fichiers 
- `main.js` avec le code de `onload.js` et `greetings.js`
- `index.html` avec l'import de `main.js`
 
Pour voir si tout cela fonctionne, on peut lancer `webpack-dev-server` et se connecter avec un navigateur sur localhost:8080
