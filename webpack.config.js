let path = require('path');
let NodeExternals = require('webpack-node-externals');

module.exports = {
  context: __dirname, // to automatically find tsconfig.json
  entry: './src/init',
  output: {
    path: __dirname + '/dist',
    filename: 'react-interactive-tutorials.ts',
    library: 'interactive_tutorials',
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".css"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          // disable type checker - we will use it in fork plugin
          transpileOnly: true
        }
      },
    ],
  },
  externals: NodeExternals(),
};
