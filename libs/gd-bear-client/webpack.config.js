// Copyright (C) 2007-2015, GoodData(R) Corporation. All rights reserved.
const webpack = require('webpack');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './src/gooddata-browser.ts',
    output: {
        filename: 'gooddata.js',
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
        rules: [
            {
                test: /\.ts$/,
                use: 'awesome-typescript-loader?transpileOnly=true',
                include: [
                    path.join(__dirname, 'src')
                ],
                exclude: /(node_modules)/,
            }
        ],
    },
    resolve: {
        // Allow to omit extensions when requiring these files
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.styl', '.scss', '.json'],
    },
    plugins: [
        new webpack.IgnorePlugin(/\/iconv-loader$/),
        new LodashModuleReplacementPlugin(),
        //new webpack.BannerPlugin({ banner: '<%= license %>', raw: true })
    ]
};
