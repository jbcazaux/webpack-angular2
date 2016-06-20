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

    // noParse: [/node_modules\//,/.+zone\.js/,/dist\/.+/],

    plugins: [
        new HtmlWebpackPlugin({
            //chunks: ['main'],
            template: './src/index.html',
            inject: 'body'
        })
    ]
};