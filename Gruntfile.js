// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
var webpack = require("webpack");
var webpackConfig = require("./webpack.config.js");

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        gitInfo: '',

        licence: grunt.file.read('tools/licence.tmpl'),

        jshint: {
            all: ['Gruntfile.js', '*.js', 'src/*.js', 'test/*.js']
        },
        copy: {
            examples: {
                src: 'dist/gooddata.js',
                dest: 'examples/gooddata.js'
            }
        },
        karma: {
            unit: {
                configFile: 'tools/karma.conf.js',
                singleRun: grunt.option('ci')
            }
        },
        grizzly: {
            options: {
                root: "examples/"
            }
        },
        watch: {
            options: {
                interval: 500
            },
            js: {
                files: ['src/*.js', 'examples/**/*.js', 'examples/**/*.html', '!examples/gooddata.js'],
                tasks: ['webpack:build-dev', 'copy:examples'],
                nospawn: true
            }
        },
        webpack: {
            options: webpackConfig,
            'build-dev': {},
            build: {
                output: {
                    filename: './dist/gooddata.min.js'
                },
                plugins: [
                    new webpack.optimize.UglifyJsPlugin()
                ].concat(webpackConfig.plugins)
            }
        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: 'src/',
                    themedir: 'tools/yuidoc/theme/',
                    outdir: 'docs/'
                }
            },
            gh_pages: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: 'src/',
                    themedir: 'tools/yuidoc/theme-gh-pages/',
                    outdir: 'pages/api/'
                }
            }
        },
        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                updateConfigs: ['pkg'], // for a proper banner in disted file
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json', 'bower.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                push: true,
                pushTo: 'origin'
            }
        },
        'gh-pages': {
            options: {
                base: 'pages',
                message: 'DOC: Updated gh-pages'
            },
            src: '**/*'
        }
    });

    grunt.registerTask('getGitInfo', 'Get latest commit hash', function() {
        var done = this.async();

        var child = grunt.util.spawn({
            cmd: 'git',
            args: ['log', '-1', '--format="%h"']
        }, function callback(err, result, code) {
            grunt.config.set('gitInfo', result.stdout);
            done(!code);
        });

        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
    });

    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-grizzly');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-gh-pages');

    grunt.registerTask('default', ['dist']);
    grunt.registerTask('dist', [
        'getGitInfo',
        'jshint',
        'webpack:build-dev',
        'webpack:build',
        'copy',
    ]);

    grunt.registerTask('bump-gh-pages', ['yuidoc:gh_pages', 'gh-pages-clean', 'gh-pages']);

    grunt.registerTask('init-bower-repo', 'Initializes repository in ./dist', function() {
        var exec = require('child_process').exec,
            gitUri = grunt.file.readJSON('bower.json').repository.url,
            done = this.async();
        exec('mkdir -p dist && cd dist && rm -rf ./* && git init && '+
            'git remote add bower ' + gitUri + ' && '+
            'git pull bower master', function(err, stdout, stderr) {
            if(err) {
                grunt.fatal('could not init bower repository');
                grunt.log.errorlns(stderr);
            }
            grunt.log.writeln("Inited bower repository in ./dist");
            done();
        });
    });

    grunt.registerTask('release-bower-component', 'Tag, commit and push dist files to bower component repo.', function() {
        var exec = require('child_process').exec,
            async = require('async'),
            done = this.async(),
            version = grunt.config.get('pkg.version');

        var copyPackageDescriptionStep = function(callback) {
            exec('cp bower.json LICENSE.txt dist', function(err, stdout, stderr) {
                if(err) {
                    callback("Could not copy bower.json or LICENSE.txt to dist\n" + stderr);
                }
                grunt.log.writeln('Copied bower.json and LICENSE.txt to dist');
                callback(null);
            });
        };
        var commitBowerReleaseStep = function(callback) {
            var commitMsg = grunt.config.get('bump.options.commitMessage').replace("%VERSION%", version);

            exec('cd dist && git add . && git commit -m "' + commitMsg + '"', function(err, stdout, stderr) {
                if(err) {
                    callback("Could not commit\n" + stderr);
                }
                grunt.log.writeln('Commiting bower release ' + version);
                callback(null);
            });
        };
        var tagBowerReleaseStep = function(callback) {
            var tagName = grunt.config.get('bump.options.tagName').replace("%VERSION%", version);
            exec('cd dist && git tag "' + tagName + '"', function(err, stdout, stderr) {
                if(err) {
                    callback("Could not tag\n" + stderr);
                }
                grunt.log.writeln('Tagging bower release ' + version);
                callback(null);
            });
        };
        var pushBowerComponentStep = function(callback) {
            exec('cd dist && git push -u bower master && git push bower --tags', function(err, stdout, stderr) {
                if(err) {
                    callback("Could not push bower commit and tag\n" + stderr);
                }
                grunt.log.writeln('Pushed ' + version + ' commit and tag');
                callback(null);
            });
        };
        var cleanupDistStep = function(callback) {
            exec('cd dist && rm -rf .git', function(err, stdout, stderr) {
                if(err) {
                    callback("Could not remove dist/.git files\n" + stderr);
                }
                callback(null);
            });
        };

        async.series([
            copyPackageDescriptionStep,
            commitBowerReleaseStep,
            tagBowerReleaseStep,
            pushBowerComponentStep,
            cleanupDistStep
        ], function(err, results) {
            if(err) {
                grunt.fatal(err);
            }
            done();
        });
    });

    grunt.registerTask('release', [
        'test',
        'bump',
        'init-bower-repo',
        'dist',
        'release-bower-component'
    ]);

    grunt.registerTask('test', ['jshint', 'karma']);
    grunt.registerTask('dev', ['grizzly', 'watch']);
    grunt.registerTask('doc', ['yuidoc']);
    grunt.registerTask('validate', ['jshint']);
};

