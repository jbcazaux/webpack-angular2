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
        extensions: ['', '.js', '.ts', '.tsx']
    },

    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: 'ts'
            }
        ]
    },

    // noParse: [/node_modules\//,/.+zone\.js/,/dist\/.+/],

    plugins: [
        new HtmlWebpackPlugin({
            //chunks: ['main'],
            template: './src/index.html',
            inject: 'body'
        })
    ]
};