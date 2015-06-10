// Karma configuration
// Generated on Mon Feb 09 2015 21:51:17 GMT-0500 (EST)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            {pattern: 'src/public/vendor/angular/angular.js', included: true},
            {pattern: 'src/public/vendor/angular-mocks/angular-mocks.js', included: true},
            {pattern: 'src/public/vendor/jquery/jquery.js', included: true},
            {pattern: 'src/public/vendor/cf-*/*.js', included: true},
            {pattern: 'src/public/apps/ng/*.js', included: true},
            {pattern: 'test/**/*.test.js', included: true},
            'test/test-main.js'
        ],


        // list of files to exclude
        exclude: [
           'src/vendor/cf-*/test/*.js'
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};
