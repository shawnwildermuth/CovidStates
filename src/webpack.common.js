module.exports = {
  mode: "development",
  entry: {
    "main": "./js",
    "libs": "./js/libs",
    "css": "./js/css"
  },
  performance: {
    hints: false
  },
  devtool: 'inline-source-map',
  module: {
    rules: [{
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ],
  },
};