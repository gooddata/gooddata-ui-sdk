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
        require('karma-phantomjs-launcher'),
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
        outputFile: 'ci/results/test-results.xml'
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


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
