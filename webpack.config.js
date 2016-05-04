var webpack = require("webpack");


module.exports = {
  entry: {
      main: [
          './src/hello.js',
          './src/goodbye.js'
      ]
  },

  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
  }
}