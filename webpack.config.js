const path = require('path')
module.exports = {
  entry: {
    test: path.resolve(__dirname, 'src', 'index.test.ts')
  },
  output: {
    path: path.resolve(__dirname, 'browser'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'ts-loader'
    }]
  }
}