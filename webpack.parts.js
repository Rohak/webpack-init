const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

exports.devServer = function(options) {
  return {
    devServer: {
      // Enable history API fallback so HTML5 History API based
      // routing works. This is a good default that will come
      // in handy in more complicated setups.
      historyApiFallback: true,

      // Unlike the cli flag, this doesn't set
      // HotModuleReplacementPlugin!
      hot: true,

      // Don't refresh if hot loading fails. If you want
      // refresh behavior, set inline: true instead.
      // hotOnly: true,
      inline: true,

      // Display only errors to reduce the amount of output.
      stats: 'errors-only',

      // Parse host and port from env to allow customization.
      //
      // If you use Vagrant or Cloud9, set
      // host: options.host || '0.0.0.0';
      //
      // 0.0.0.0 is available to all network devices
      // unlike default `localhost`.
      host: options.host, // Defaults to `localhost`
      port: options.port // Defaults to 8080
    },
    plugins: [
      // Enable multi-pass compilation for enhanced performance
      // in larger projects. Good default.
      new webpack.HotModuleReplacementPlugin({
        // Disabled as this won't work with html-webpack-template yet
        //multiStep: true
      })
    ]
  };
};

exports.loadCSS = function(paths) {
  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          // Restrict extraction process to the given
          // paths.
          include: paths,

          use: ['style-loader', 'css-loader']
        }
      ]
    }
  };
};

exports.extractCSS = function(paths) {
  return {
    module: {
      rules: [
        // Extract CSS during build
        {
          test: /\.css$/,
          // Restrict extraction process to the given
          // paths.
          include: paths,

          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: 'css-loader'
          })
        }
      ]
    },
    plugins: [
      // Output extracted CSS to a file
      new ExtractTextPlugin('[name].css')
    ]
  };
};

exports.purifyCSS = function(paths) {
  paths = Array.isArray(paths) ? paths : [paths];

  return {
    plugins: [
      new PurifyCSSPlugin({
        // Our paths are absolute so Purify needs patching
        // against that to work.
        basePath: '/',

        // `paths` is used to point PurifyCSS to files not
        // visible to Webpack. This expects glob patterns so
        // we adapt here.
        paths: paths.map(path => `${path}/*`)

        // Walk through only html files within node_modules. It
        // picks up .js files by default!
        // !!! Juho Vepsäläinen is mistaken in this point:
        // resolveExtensions: ['.html']
        // if resolveExtensions stays, than PurifyCSS will eliminate 
        // even the 'h1' and 'pure-button' styles used in Hello.js
      })
    ]
  };
};

exports.generateSourcemaps = function(type) {
  return {
    devtool: type
  };
};

// this version of extractBundles determines vendor modules automatically:
exports.extractBundles = function() {
  return {
    plugins: [
      // Extract bundles.
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: (module, count) => {
          const userRequest = module.userRequest;

          // Modul je externi pokud ma v ceste /node_modules/
          // Jenomze to by nefungovalo pri pouziti loaders,
          // protoze cesta k loaderu je soucasti module.userRequest
          // (a loader je pravdepodobne taky v node_modules),
          // proto ten workaround se split('!').pop()
          return typeof userRequest === 'string' 
            && !!userRequest.split('!').pop().match(/(node_modules)/);
        }
      })
    ]
  };
};

exports.loadJavaScript = function(paths) {
  return {
    module: {
      rules: [
        {
          test: /\.js$/,
          include: paths,

          loader: 'babel-loader',
          options: {
            // Enable caching for improved performance during
            // development.
            // It uses default OS directory by default. If you need
            // something more custom, pass a path to it.
            // I.e., { cacheDirectory: '<path>' }
            cacheDirectory: true
          }
        }
      ]
    }
  };
};

exports.clean = function(path) {
  return {
    plugins: [
      new CleanWebpackPlugin([path])
    ]
  };
};