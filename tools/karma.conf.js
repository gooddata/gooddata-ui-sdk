// Karma configuration
// Generated on Tue Jan 14 2014 14:55:10 GMT+0100 (CET)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '../',


    // frameworks to use
    frameworks: ['mocha', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [
      'lib/jquery/jquery.js',
      'test/lib/expect.js',
      'test/lib/sinon-1.7.3.js',
      { pattern: 'src/*.js', included: false, served: true },
      // Tests
      { pattern: 'test/*_test.js', included: false, served: true },
      // Test config
      'test/test-main.js'
    ],


    // list of files to exclude
    exclude: [
      'src/_start.js',
      'src/_end.js'
    ],

    preprocessors: {
        'src/*.js': ['coverage']
    },

    coverageReporter: {
        type: 'cobertura',
        dir: 'coverage/'
    },

    junitReporter: {
        suite: 'GoodData-js Unit',
        outputFile: 'test/test-results.xml'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress', 'junit', 'coverage'],


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
    singleRun: true
  });
};
