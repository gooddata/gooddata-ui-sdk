// Karma configuration

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // frameworks to use
    frameworks: ['mocha', 'expect', 'sinon'],

    preprocessors: {
        'karma.unit.js': ['webpack', 'sourcemap']
    },

    webpack: require('../webpack.test.config.js'),

    webpackMiddleware: {
        noInfo: true
    },

    plugins: [
        require('karma-webpack'),
        require('karma-mocha'),
        require('karma-mocha-reporter'),
        require('karma-junit-reporter'),
        require('karma-coverage'),
        require('karma-chrome-launcher'),
        require('karma-expect'),
        require('karma-sinon'),
        require('karma-sourcemap-loader')
    ],

    // list of files / patterns to load in the browser
    files: [
        'karma.unit.js'
    ],

    coverageReporter: {
        reporters: [
            { type: 'cobertura', dir: 'ci/results/coverage', file: 'coverage.xml' },
            { type: 'lcov', dir: 'ci/results/coverage/unit' },
            { type: 'text-summary' }
        ]
    },

    junitReporter: {
        suite: 'GoodData-js Unit',
        useBrowserName: false,
        outputDir: 'ci/results',
        outputFile: 'test-results.xml'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['mocha', 'junit', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['Chrome'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000
  });
};
