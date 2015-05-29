// separate file so we can refer to it from webpack.config.js and karma.conf.js
module.exports = {
    root: __dirname,
    alias: {
        'jquery': 'lib/jquery/dist/jquery',
    },
    modulesDirectories: ['src']
};
