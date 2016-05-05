var webpack = require("webpack");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');


module.exports = {
    entry: {
        main: [
            './src/greetings.js',
            './src/onload.js'
        ],
        second : [
            './src/calc.js'
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
        new webpack.optimize.CommonsChunkPlugin('commons.js')
    ]
};