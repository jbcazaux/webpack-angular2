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
Bon cette approche est un peu "old school" et c'est précisemment ce que nous cherchons à éviter avec l'utilisation de webpack.
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

## Optimisations

Jusque là rien d'extraordinaire. 
Cependant webpack permet de faire beaucoup mieux. 
Plutôt que de charger tous les fichiers JS d'une page dès le début (ce qui peut être long dans le cas d'une single page app), il serait intéressant de ne charger que le strict minimum pour avoir un premier rendu le plus rapidement possible, puis ne charger que les autres scripts JS quand il y en a réellement besoin.
Imaginons que la page A ait besoin des modules m1 et m2 pour s'afficher, mais que le module m3 ne serve qu'à afficher une fonctionnalité accessible via un clic et dont seulement 10% des utilisateurs se servent. Ne serait-ce pas mieux que ne charger m3 à la demande ? Ainsi 100% des utilisateurs verront leur page A s'afficher plus vite, et 10% attendront un petit peu avant de voir la fonctionnalité de m3 arriver sur leur écran (le temps de charger m3).

Mais si plusieurs pages (ou vues) de l'application utilisent des librairies communes (comme jquery), c'est idiot d'inclure jquery dans tous les fichiers (*chunks*) où il y en a besoin. Cela ferait grossir les fichiers et télécharger plusieurs fois jquery (une fois par point d'entrée de l'application). La solution est donc de créer des *chunks* regroupant le code commun à plusieurs pages. Ainsi on aura par exemple dans notre `index.html` l'import du *chunk* contenant *jquery* et *underscore*, puis l'import du *chunk* contenant les scripts JS pour notre point d'entrée *main*. 

Webpack va nous aider à déterminer quel est le code commun entre plusieurs points d'entrée (ou pages). Par exemple si la page A a besoin des modules m1, m2, m3 et la page B des modules m1, m2 et m4. Alors le code commun entre les 2 pages sera m1 et m2. Il peut donc être intéressant de créer un *chunk* contenant m1 et m2, de charger ce *chunk* dans pageA.html et pageB.html.Ainsi, si l'utilisateur commence par naviguer sur la page A il va télécharger le *chunk* avec m1 et m2, et un *chunk* avec m3. Puis quand il passe sur la page B, il aura déjà en cache le *chunk* avec m1 et m2, et il n'aura plus qu'à télécharger le *chunk* avec m4. Simple non ?

Encore un peu de bon sens ? Imaginons maintenant que m1 et m2 soient des modules ridiculement petits en taille de code. Est il vraiment optimisé de charger, par exemple pour la page A, le *chunk* avec m1 et m2 ? Qu'en est il de la latence réseau ? Du nombre maximum de fichiers (jss, css, ...) que le navigateur peur charger en même temps ? Parfois il sera préférable de mettre m1,m2 et m3 dans le même *chunk*, puis de créer un 2ème *chunk* pour la page B contenant m1,m2, m4.

Cette fois ci c'est la dernière: Imaginons que nous ayons une dizaine de pages, Toutes les pages ont les modules m1 et m2 en commun, mais seules les pages A et F ont le module m3 en commun. Est il vraiment optimisé de créer un *chunk* avec ce module m3 ? Comme pour le point précédent, il faut se poser la question du coût de télécharher un fichier supplémentaire (latence, maximum de téléchargements concurents, ...).

Les différentes optimisations que webpack propose consistent donc en:
- Charger d'un coup (dans un seul et même fichier) tous les scripts qui sont nécessaires à une vue (ou à une page, si le site n'est pas une single page app).
- Extraire dans un fichier du code commun entre plusieurs pages (ou vues)
- Charger à la demande (et donc pas dès le chargement de la page) un module (en fait le *chunk* contenant le code du module).
- Décider automatiquement suivant la taille du fichier (*chunk*) ou le nombre de pages dans lesquelles il (le *chunk*) est utilisé, si cela vaut le coût de créer ce *chunk*.


### Mettre tous les scripts JS dans un seul *chunk*

C'est ce que nous avons vu avant, il suffit de déclarer tous les fichiers JS devant être regroupés, dans un entry. Par exemple si on met ceci dans le fichier de config *webpack*
```javascript
entry: {
        main: [
            './src/module1.js',
            './src/module2.js'
            './src/module3.js'
        ], ...
```
webpack en fera un fichier main.js qui contiendra tous les fichiers déclarés. Le main.js sera ajouté dans l'index.html toujours grâce au plugin *HtmlWebpackPlugin*.

### Code commun (*chunk*) entre plusieurs plusieurs pages

Nous allons utiliser le plugin CommonsChunkPlugin pour faire ceci. C'est plutôt simple, il suffit d'indiquer les différents 'entries' dont il faut extraire le code en commun.
Pour cet exemple, nous devons rajouter un peu de code. Dans `./src`, nous avons toujours le point d'entrée *main* qui charge les fichiers `onload.js` et `greetings.js`. Nous allons rajouter le fichier `greetings-calc.js`, qui est un module qui se base lui même sur le module `greetings`.

greetings.js:
```javascript
module.exports = {

    hello: function (name) {
        return "hello " + name;
    }
};
```
onload.js:
```javascript
var greetings = require("greetings.js");
window.onload = function () {
    document.write(greetings.hello("world !!"))
};
```
greetings-calc.js:
```javascript
var g = require('greetings.js');
module.exports = {
    add: function(a, b) {
        return a + b;
    },
    niceAdd: function (a, b, name) {
        return g.hello(name) + ', the result of ' + a + ' + ' + b + ' is ' + add(a, b);
    }  
};
```
Avec la configuration suivante:
```javascript
entry: {
        main: [
            './src/greetings.js',
            './src/onload.js'
        ],
        calc: [
            './src/greetings-calc.js'
        ]
    },

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },

    resolve: {
        root: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'node_modules')],
        extensions: ['', '.js']
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'body'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'commons',
            filename: 'commons.js',
            chunks: ['main', 'calc']
        })
    ]
```
Nous nous attendons à avoir de généré: 
- un fichier main.js avec seulement la méthode `onload` de définie.
- un fichier calc.js avec les méthodes `add` et `niceAdd`
- un fichier commons.js, avec la méthode `hello`

En effet le code commun entre les *chunks* *main* et *calc* est simplement le module greetings avec sa méthode `hello`. 

### Charger un module à la demande

Comme nous l'avons vu, afin d'accélérer l'affichage de la page, il peut être intéressant de ne charger que les modules immédiatement nécessaires. Les autres étant chargés à la demande, lorsque l'application en a besoin.
Pour faire ceci, il suffit de rajouter la ligne `require.ensure(['module1', 'module2', ...]), callback)` dans les fichiers JS, à l'endroit où les modules doivent être téléchargés dans le navigateur. Il faudra ensuite faire un `require('m1.js')` pour pouvoir les utiliser dans le code.

Transformons simplement le fichier `onload.js` pour ne charger le module greetings que lorsque nous allons nous en servir.
onload.js:
```javascript
require.ensure(['greetings.js'], function (require) {
    var greetings = require('greetings.js');
    window.onload = function () {
        document.write(greetings.hello("world !!"))
    };
});
```
En fait ici nous voyons bien que le module `greetings.js` sera chargé dès que le script sera lu, peu importe. Nous aurions aussi pu déclencher ce code lors du clic sur un bouton.
Il va également falloir modifier le fichier de configuration de webpack. Pour démontrer le fonctionnement, il faudra faire 2 choses:
1. Ne pas mettre les modules `greetings.js` et `onload.js` dans le même *chunk*.
2. Ne pas charger le fichier contenant le module `greetings.js` dans le `index.html`

webpack.config.js:
```javascript
var webpack = require("webpack");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
    entry: {
        main: [
            './src/onload.js',
        ],
        greetings: [
            './src/greetings.js'
        ]
    },

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },

    resolve: {
        root: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'node_modules')],
        extensions: ['', '.js']
    },

    plugins: [
        new HtmlWebpackPlugin({
            chunks: ['main'],
            template: './src/index.html',
            inject: 'body'
        })
    ]
};
```
Pour faciliter les choses, les fichiers `onload.js` et `greetings.js` sont dans 2 points d'entrée différents, et du coup 2 *chunks* différents. Ensuite pour n'inclure que le fichier `onload.js` dans le `index.html` nous rajoutons la ligne `chunks: ['main']`.
Dans le debugger JS du navigateur (après avoir lancé `webpack-dev-server` et un navigateur sur localhost:8080) on peut voir qu'au chargement de la page, seul le script main.js est chargé, puis si on déroule jusqu'après la ligne ` var greetings = __webpack_require__(1);`, on se rend compte qu'un nouveau fichier JS est chargé, avec dedans le code de `greetings.js`

### Ne créer un *chunk* de code commun que si nécessaire

Nous allons créer 3 entry points et donc 3 *chunks*: `main`, `second` et `third`. Dans chacun de ces chunks, nous aurons un fichier JS qui fera un `require('calc.js')`. Si l'on suit notre logique d'optimisation, il serait préférable de charger le code de `calc.js` une fois, plutot que de le retrouver dupliqué dans chacun des chunks. Nous avions vu comment faire cela avec le plugin **CommonsChunkPlugin**.
Nous avons également vu que suivant la taille du code en commun, il était peut être dommage de devoir télécharger un fichier supplémentaire dès le chargement de la page, si ce fichier n'est pas très gros (on perd en temps de réponse à cause de la latence réseau). La solution est donc d'utiliser l'option minChunks du plugin.

calc.js:
```javascript
module.exports = {
    add: function (a, b) {
        return a + b;
    }
};
```

greetings-calc.js:
```javascript
var greetings = require('greetings.js');
var calc = require('calc.js');

module.exports = {
    add: function (a, b, name) {
        return greetings.hello(name) + ' ' + calc.add(a, b);
    }
};
```

et webpack.config.js:
```javascript
var webpack = require("webpack");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
    entry: {
        main: [
            './src/onload.js',
            './src/greetings.js',
            './src/calc.js'
        ],
        second: [
            './src/greetings-calc.js'
        ],
        third: [
            './src/super-calc.js'
        ]
    },

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },

    resolve: {
        root: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'node_modules')],
        extensions: ['', '.js']
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'body'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name:'commons-calc',
            filename: 'commons-calc.js',
            chunks: ['main', 'second', 'third'],
            minChunks: 3
        })
    ]
};
```
En lançant la commande `webpack`, on a bien dans le répertoire `dist` un fichier commons-calc.js avec dedans la méthode `add` (le code qui était dans le module `calc.js`).
Si maintenant on change le `minChunks` à 4, il ne va plus y avoir dans le fichier `commons-calc.js`, parceque seuls 3 *chunks* ont ce code en commun (et donc pas 4).

## Création des chunks

Pour créer des *chunks*, nous avons vus 2 possibilités:
1. Créer des points d'entrée
2. Créer des *chunks* de code communs entre plusieurs *chunks*.

Il existe une 3ème possibilité. C'est en passant un 3ème paramètre à la méthode `require.ensure(['dependances'], callback, 'chunkname')`. Tous les morceaux de codes présents dans les callbacks des `require.ensure()`, et dont le chunkname est le même, seront déplacés dans un même fichier (*chunk*).

Comme ces chunks ont un nom, il est possible d'utiliser le plugin *CommonsChunkPlugin* pour extraire le code commun entre plusieurs de ces *chunks*.
Cette approche a l'avantages de pouvoir déclarer des chunks qui ne sont pas des points d'entrée. Ce qui est la majorité des cas dans les applications single page. Cependant, il est difficil d'un seul coup de d'oeil de pouvoir visualiser quels sont les morceaux de code qui seront placés dans le même chunk.
C'est pour cette raison, que je préfère utiliser les entry points pour déclarer des chunks, mais il faut alors configurer le plugin *HtmlWebpackPlugin* pour qu'il n'inclut dans le index.html que les chunks qui doivent réellement être chargés au démarrage, et pas ceux qui doivent être téléchargés à la demande, lorsqu'une des fonctionalités des l'application le requiert.

## Les loaders 

Les *loaders* permettent d'effectuer des traitements sur nos fichiers sources. Les cas les plus répandus sont par exemple la transpilation des fichiers typescript en JS, ou la transformation des fichiers scss en css. 
Comme nous utiliserons Angular2 avec Typescript, nous allons partir de cet exemple.

### ts-loader

Tout d'abord il faudra rajouter un fichier de configuration, à la racine du projet, pour indiquer comment transpiler en JS, c'est le fichier tsconfig.json:
```json
{
  "compilerOptions": {
    "target": "es5",
    "sourceMap": true,
    "outDir": "tmp"
  },
  "exclude": [
    "node_modules"
  ]
}
```
Rien d'extraordinaire. On indique simplement que le format de sortie doit être du JS es5, que l'on veut générer les sourcesMap et enfin que les fichiers générés .js et .js.map soient créés dans un répertoire tmp plutot qu'au même niveau que les fichiers .ts. C'est surtout plus agréable dans l'IDE.

Ensuite on va indiquer 2 nouvelles dépendances dans le package.json: 
(on peut aussi lancer `npm install ts-loader --save-dev` et `npm install typescript --save`)
```json
{
  "name": "webpack-fun",
  "version": "0.0.1",
  "description": "test of webpack",
  "author": "jbcazaux",
  "devDependencies": {
    "html-webpack-plugin": "^2.16.1",
    "ts-loader": "^0.8.2",
    "typescript": "^1.8.10",
    "webpack": "^1.13.0",
    "webpack-dev-server": "^1.14.1"
  }
}

```


webpack.config.js:
```javascript
var webpack = require("webpack");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
    entry: {
        main: [
            './src/greetings.ts'
        ]
    },

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },

    resolve: {
        root: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'node_modules')],
        extensions: ['', '.js', '.ts']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts'
            }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'body'
        })
    ]
};
```

Et enfin le fichier `greetings.js`:

```typescript
class Greetings {
    constructor(public name: string) { }
    hello() {
        return "hello " + this.name;
    }
};

var g = new Greetings("world");

document.body.innerHTML = g.hello();
```

Rien de sorcier: les fichiers .ts seront passés dans la moulinette du ts-loader. On est pas obligé d'indiquer le `-loader` dans le nom du loader.
Un petit coup de `webpack-dev-server` pour constater que l'on a toujours notre page index.html qui charge un main.js, qui contient le code JS généré à partir de notre cote Typescript.

### typings

TODO: explications...
`npm install typings --save-dev`
`typings install dt~require --save --global`

```json
{
  "name": "webpack-fun",
  "version": "0.0.1",
  "description": "test of webpack",
  "author": "jbcazaux",
  "devDependencies": {
    "html-webpack-plugin": "^2.16.1",
    "ts-loader": "^0.8.2",
    "typescript": "^1.8.10",
    "typings": "^1.3.0",
    "webpack": "^1.13.0",
    "webpack-dev-server": "^1.14.1"
  },
}
```

### file-loader

Un moment ou à un autre, il va falloir rendre notre application un peu plus sexy, pour cela passons par les images !
Pour charger les images, il suffit de faire un `require()` dessus, ou bien de les référencer dans une page html, qui elle-même sera chargée par un `require()`. Cela aura plus de sens quand on verra les exemples avec angular2, avec lequel on peut faire un `require()` des templates html depuis les fichiers `.ts`.
Voyons tout de même un exemple simple: un fichier `.ts` qui référence une image. 

Nous aurons besoin du *file-loader* qui permet de copier les fichiers référencés dans le répertoire de destination, tout en changeant leur nom (pratique pour mettre un cache très long sur les images par exemple).
(on peut aussi lancer `npm install file-loader --save-dev`)
```json
{
  "name": "webpack-fun",
  "version": "0.0.1",
  "description": "test of webpack",
  "author": "jbcazaux",
  "devDependencies": {
    "file-loader": "^0.8.5",
    "ts-loader": "^0.8.2",
    "html-webpack-plugin": "^2.16.1",
    "typescript": "^1.8.10",
    "webpack": "^1.13.0",
    "webpack-dev-server": "^1.14.1"
  }
}
```
Un fichier typescript dans lequel on fait un require de l'image (attention d'avoir bien installé le typing de require):
```typescript
class MyImage {
    greenImageUrl = require("./green.png");
    displayUrl() {
        document.body.innerHTML = this.greenImageUrl;
    }
};

new MyImage().displayUrl();
```
Et enfin le fichier webpack pour configurer le file-loader (ajouter un hash au nom du fichier), et l'*entry point* pour charger le fichier `image.ts`
```javascript
var webpack = require("webpack");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
    entry: {
        main: [
            './src/image.ts'
        ]
    },

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },

    resolve: {
        root: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'node_modules')],
        extensions: ['', '.js', '.ts']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts'
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                loader: 'file?name=[name].[hash].[ext]'
            }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'body'
        })
    ]
};
```