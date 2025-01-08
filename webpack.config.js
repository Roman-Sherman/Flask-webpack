var path = require('path');
var ManifestPlugin = require('webpack-manifest-plugin');

module.exports = {
  entry: {
    main: ['./src/js/index.js', './src/js/prompt.js', './src/js/tts.js']
  },
  output: {
    path: path.resolve(__dirname, 'static'),
    filename: '[name].bundle.js',
    publicPath: '/static/'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'] // For processing CSS
      }
    ]
  },
  plugins: [
    // Ensure the manifest plugin is included
    new (require('webpack-manifest-plugin').WebpackManifestPlugin)({
      fileName: 'manifest.json',
      publicPath: '/static/'
    })
  ]
};
