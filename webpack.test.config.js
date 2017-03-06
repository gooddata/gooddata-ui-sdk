const webpack = require('webpack');

// separate file so we can refer to it from webpack.config.js and karma.conf.js
module.exports = {
    devtool: 'cheap-inline-source-map',
    resolve: {
        root: __dirname,
        modulesDirectories: ['src', 'node_modules']
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
                loader: 'json-loader'
            },
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
    },
    plugins: [
        new webpack.IgnorePlugin(/\/iconv-loader$/)
    ]
};
