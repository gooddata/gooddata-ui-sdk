// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

module.exports = (grunt) => {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        gitInfo: '',

        license: grunt.file.read('tools/license.tmpl'),

        copy: {
            examples: {
                src: 'dist/gooddata.js',
                dest: 'examples/gooddata.js'
            }
        },
        run: {
            validate: {
                cmd: 'yarn',
                args: [
                    'validate'
                ]
            },
            test: {
                cmd: 'yarn',
                args: [
                    'test-single-run'
                ]
            }
        },
        grizzly: {
            options: {
                root: 'examples/'
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
                    extension: '.ts',
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
        'gh-pages': {
            options: {
                base: 'pages',
                message: 'DOC: Updated gh-pages',
                repo: 'git@github.com:gooddata/gooddata-js.git'
            },
            src: '**/*'
        }
    });

    grunt.registerTask('getGitInfo', 'Get latest commit hash', () => {
        const currentTask = grunt.task.current;
        const done = currentTask.async();

        const child = grunt.util.spawn({
            cmd: 'git',
            args: ['log', '-1', '--format="%h"']
        }, (err, result, code) => {
            if (err) {
                grunt.fail.fatal(err);
            }
            grunt.config.set('gitInfo', result.stdout);
            done(!code);
        });

        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
    });

    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-grizzly');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-run');

    grunt.registerTask('default', ['dist']);
    grunt.registerTask('dist', [
        'getGitInfo',
        'run:validate',
        'webpack:build-dev',
        'webpack:build',
        'copy'
    ]);

    grunt.registerTask('bump-gh-pages', ['yuidoc:gh_pages', 'gh-pages-clean', 'gh-pages']);

    grunt.registerTask('dev', ['grizzly', 'watch:js']);
    grunt.registerTask('doc', ['yuidoc']);
};
