var webpack = require("webpack"),
  path = require("path"),
  fileSystem = require("fs"),
  // env = require("./utils/env"),
  CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin,
  CopyPlugin = require("copy-webpack-plugin"),
  HtmlWebpackPlugin = require("html-webpack-plugin"),
  MiniCssExtractPlugin = require('mini-css-extract-plugin')
    // WriteFilePlugin = require("write-file-webpack-plugin");
  ;

var fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2", "css"];

var options = {
  resolve: {
    modules: ['node_modules'],
  },
  mode: "development",
  watch: true,
  entry: {
    // popup: path.join(__dirname, "src", "js", "popup.js"),
    popup: path.join(__dirname, "src", "js", "popup.js"),
    settings: path.join(__dirname, "src", "js", "settings.js"),
    background: path.join(__dirname, "src", "js", "background.js")
  },
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.scss$/,
        use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader'
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                // options...
              }
            }
          ]
      }
    ],
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
       template: path.join(__dirname, "src", "html", "popup.html"),
       filename: "popup.html",
       chunks: ["popup"]
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "html", "settings.html"),
      filename: "settings.html",
      chunks: ["settings"]
    }),
    new MiniCssExtractPlugin({
      filename: 'css/style.css'
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
