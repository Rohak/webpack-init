const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');

const parts = require('./webpack.parts');

const PATHS = {
  src: path.join(__dirname, 'src'),
  build: path.join(__dirname, 'build')
};

const common = merge(
  {
    entry: {
      app: path.join(PATHS.src,'index')
    },
    output: {
      path: PATHS.build,
      filename: '[name].js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Webpack demo'
      })
    ]
  }
);

module.exports = function(env) {
  // *************  PRODUCTION  *************
  if (env === 'production') {
    return merge(
      common,
      parts.compressWithGzip(),
      parts.setFreeVariable('process.env.NODE_ENV','production'),
      parts.loadJavaScript(PATHS.src),
      // parts.minifyJavaScript(), // UglifyJsPlugin breaks source-map generation
      parts.extractBundles(),
      parts.clean(PATHS.build),
      parts.generateSourcemaps('source-map'),
      parts.extractCSS(),
      parts.purifyCSS(PATHS.src)
    );
  }

  // *************  DEVELOPMENT  *************
  return merge(
    common,
    {
      // Disable performance hints during development
      performance: {
        hints: false
      },
      plugins: [
        new webpack.NamedModulesPlugin()
      ]
    },
    parts.loadJavaScript(PATHS.src),

    // parts.generateSourcemaps('eval-source-map'),
    parts.loadCSS(),
    parts.devServer({
      // Customize host/port here if needed
      host: process.env.HOST,
      port: process.env.PORT
    })
  );
};