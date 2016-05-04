var webpack = require("webpack")

module.exports = {
  entry: {
    main: "./src/main.js"
  },

  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
  }
}