// separate file so we can refer to it from webpack.config.js and karma.conf.js

module.exports = {
    resolve: {
        root: __dirname,

        alias: {
            'jquery': 'lib/jquery/dist/jquery'
        },

        modulesDirectories: ['src']
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
