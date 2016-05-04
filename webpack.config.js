var webpack = require("webpack");
var HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  entry: {
      main: [
          './src/hello.js',
          './src/onload.js'
      ]
  },

  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
  },

    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'body'
        })
    ]


};