module.exports = {
  mode: "development",
  entry: {
    "main": "./js"
  },
  devtool: 'inline-source-map',  
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};