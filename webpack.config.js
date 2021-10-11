var webpack = require("webpack"),
  path = require("path"),
  fileSystem = require("fs"),
  // env = require("./utils/env"),
  CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin,
  CopyPlugin = require("copy-webpack-plugin"),
  HtmlWebpackPlugin = require("html-webpack-plugin")
  // WriteFilePlugin = require("write-file-webpack-plugin");
  ;

var fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2"];

var options = {
  resolve: {
    modules: ['node_modules'],
  },
  mode: "development",
  watch: true,
  entry: {
    // popup: path.join(__dirname, "src", "js", "popup.js"),
    interface: path.join(__dirname, "src", "js", "interface.js"),
    background: path.join(__dirname, "src", "js", "background.js")
  },
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].bundle.js"
  },
  devtool: 'cheap-module-source-map',
  plugins: [
    // expose and write the allowed env vars on the compiled bundle
    // clean the build folder
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false
    }),
    new CopyPlugin({

      patterns: [
        { from: "src/manifest.json", to: "." },
      ],
    }),
    new HtmlWebpackPlugin({
       template: path.join(__dirname, "src", "html", "interface.html"),
       filename: "interface.html",
       chunks: ["interface"]
    }),
    // new HtmlWebpackPlugin({
    //   template: path.join(__dirname, "src", "options.html"),
    //   filename: "options.html",
    //   chunks: ["options"]
    // }),
    // new HtmlWebpackPlugin({
    //   template: path.join(__dirname, "src", "background.html"),
    //   filename: "background.html",
    //   chunks: ["background"]
    // }),
    // new WriteFilePlugin()
  ]
};

module.exports = options;
