// Copyright (C) 2007-2015, GoodData(R) Corporation. All rights reserved.
const webpack = require('webpack');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

module.exports = {
    entry: './src/gooddata-browser.ts',
    output: {
        filename: './dist/gooddata.js',
        // export itself to a global var
        libraryTarget: 'umd',
        // name of the global var
        library: 'gooddata'
    },
    externals: {
        'fetch-cookie': {
            root: 'fetch-cookie',
            commonjs2: 'fetch-cookie',
            commonjs: 'fetch-cookie',
            amd: 'fetch-cookie'
        }
    },
    module: {
        loaders: [
            {
                test: /\.json$/,
                loader: 'json-loader' // needed for fetch-cookie/node-fetch deps
            },
            {
                test: /\.ts$/,
                loader: 'ts-loader?transpileOnly=true',
                exclude: /node_modules|lib|ci|docs|examples|pages|tools/,
            }
        ]
    },
    resolve: {
        // Allow to omit extensions when requiring these files
        extensions: ['', '.js', '.ts', '.jsx', '.tsx', '.styl', '.scss', '.json'],
        modulesDirectories: [
            'node_modules'
        ]
    },
    plugins: [
        new webpack.IgnorePlugin(/\/iconv-loader$/),
        new LodashModuleReplacementPlugin(),
        new webpack.BannerPlugin('<%= license %>', { raw: true })
    ]
};
