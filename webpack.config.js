const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");
const NpmInstallPlugin = require('webpack-plugin-install-deps');
const commonConfig = {
  devtool: "source-map",
  plugins: [
    new NpmInstallPlugin(),
    new CompressionPlugin(),
    new OptimizeCssAssetsPlugin(),
  ],
  node: {
    fs: "empty"
  },
  target: "web",
  optimization: {
    minimizer: [new TerserPlugin()]
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
        compact: true
      }
    }, {
      test: /\.(css)$/,
      use: [{
          loader: "style-loader/useable"
        },
        {
          loader: "css-loader"
        },
      ]
    }, {
      test: /\.(jpg|png|svg|mp4|m4a|woff|woff2|eot|ttf)$/,
      loader: 'url-loader'
    }]
  }
}
module.exports = [{
  entry: ["@babel/polyfill/noConflict", "./src/loader.js"],
  output: {
    filename: "./loader.min.js"
  },
  ...commonConfig
}, {
  entry: ["@babel/polyfill/noConflict", "./src/loader-CodePenVersion.js"],
  output: {
    filename: "./loader-CodePenVersion.min.js"
  },
  ...commonConfig
}]