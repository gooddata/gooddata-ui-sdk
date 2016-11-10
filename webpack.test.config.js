// separate file so we can refer to it from webpack.config.js and karma.conf.js
var webpack = require('webpack');
var path = require('path');

module.exports = {
    devtool: 'cheap-inline-source-map',
    resolve: {
        root: __dirname,
        modulesDirectories: ['src', 'node_modules']
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules|lib|ci|docs|examples|pages|tools/
            }
        ],
        postLoaders: [{
            test: /src\/.*\.(js$|jsx$)/,
            exclude: /(test|node_modules)\//,
            loader: 'istanbul-instrumenter'
        }]
    }
};
