var webpack = require("webpack"),
  path = require("path"),
  fileSystem = require("fs"),
  // env = require("./utils/env"),
  CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin,
  CopyPlugin = require("copy-webpack-plugin"),
  HtmlWebpackPlugin = require("html-webpack-plugin"),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  // WriteFilePlugin = require("write-file-webpack-plugin");
  { VueLoaderPlugin } = require('vue-loader');

var fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2", "css"];

var options = {
  resolve: {
    modules: ['node_modules'],
    extensions: [".ts", ".js"],
    alias: {
      'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
    }
  },
  mode: "development",
  watch: true,
  entry: {
    // popup: path.join(__dirname, "src", "js", "popup.js"),
    popup: path.join(__dirname, "src", "js", "popup.js"),
    settings: path.join(__dirname, "src", "js", "settings.js"),
    background: path.join(__dirname, "src", "js", "background.js"),
    stats: path.join(__dirname, "src", "js", "stats.js")

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
      },
      // ... other rules
      {
        test: /\.vue$/,
        loader: 'vue-loader'
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
    // Copy manifest icons
    new CopyPlugin({
      patterns: [
        { from: "src/images/", to: "." },
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
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "html", "stats.html"),
      filename: "stats.html",
      chunks: ["stats"]
    }),
    new MiniCssExtractPlugin({
      filename: 'css/style.css'
    }),
    new VueLoaderPlugin()
  ]
};

module.exports = options;
