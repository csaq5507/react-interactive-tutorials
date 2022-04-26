let path = require('path');
let NodeExternals = require('webpack-node-externals');

module.exports = {
    context: __dirname, // to automatically find tsconfig.json
    entry: './src/init',
    target: "web",
    output: {
        path: __dirname + '/dist',
        filename: 'react-interactive-tutorials.js',
        library: 'interactive_tutorials',
        libraryTarget: "umd",
        umdNamedDefine: true
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
