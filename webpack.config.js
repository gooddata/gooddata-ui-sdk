// Copyright (C) 2007-2015, GoodData(R) Corporation. All rights reserved.
/*eslint no-var:0 */
var webpack = require('webpack');
module.exports = {
    entry: './src/gooddata.js',
    output: {
        filename: './dist/gooddata.js',
        // export itself to a global var
        libraryTarget: 'umd',
        // name of the global var
        library: 'gooddata'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules|lib|ci|docs|examples|pages|tools/
            }
        ]
    },
    resolve: {
        // Allow to omit extensions when requiring these files
        extensions: ['', '.js'],
        modulesDirectories: [
            'node_modules'
        ]
    },
    plugins: [
        new webpack.BannerPlugin('<%= license %>', {raw: true}),
        new webpack.ProvidePlugin({
            'Promise': 'imports?this=>global!exports?global.Promise!es6-promise',
            'fetch': 'imports?this=>global!exports?global.fetch!isomorphic-fetch'
        })
    ]
};

