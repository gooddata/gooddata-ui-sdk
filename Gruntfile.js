// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

module.exports = (grunt) => {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        gitInfo: '',

        license: grunt.file.read('tools/license.tmpl'),

        eslint: {
            options: {
                config: '.eslintrc'
            },
            all: {
                src: [
                    './*.js',
                    '@(src|test|tools)/**/*.js',
                    '!tools/yuidoc/**/*'
                ]
            }
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
                singleRun: false,
                autoWatch: true,
                background: false
            },
            ci: {
                configFile: 'tools/karma.conf.js',
                singleRun: true,
                autoWatch: false
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    quiet: false,
                    require: [
                        'babel-register',
                        'isomorphic-fetch',
                        () => {
                            global.expect = require('expect.js');
                        },
                        () => {
                            global.sinon = require('sinon');
                        }
                    ]
                },
                src: ['test/*_test.js']
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
            },
            tests: {
                files: ['src/*.js', 'test/*_test.js'],
                tasks: ['mochaTest:test', 'karma:unit:run'],
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
                pushTo: 'upstream'
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
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('gruntify-eslint');

    grunt.registerTask('default', ['dist']);
    grunt.registerTask('dist', [
        'getGitInfo',
        'eslint',
        'webpack:build-dev',
        'webpack:build',
        'copy'
    ]);

    grunt.registerTask('bump-gh-pages', ['yuidoc:gh_pages', 'gh-pages-clean', 'gh-pages']);

    grunt.registerTask('init-bower-repo', 'Initializes repository in ./dist', () => {
        const exec = require('child_process').exec;

        const gitUri = grunt.file.readJSON('bower.json').repository.url;
        const currentTask = grunt.task.current;
        const done = currentTask.async();
        exec(`${'mkdir -p dist && cd dist && rm -rf ./* && git init && ' +
            'git remote add bower '}${gitUri} && ` +
            'git pull bower master', (err, stdout, stderr) => {
            if (err) {
                grunt.fatal('could not init bower repository');
                grunt.log.errorlns(stderr);
            }
            grunt.log.writeln('Inited bower repository in ./dist');
            done();
        });
    });

    grunt.registerTask('release-bower-component', 'Tag, commit and push dist files to bower component repo.', () => {
        const exec = require('child_process').exec;
        const async = require('async');

        const currentTask = grunt.task.current;
        const done = currentTask.async();
        const version = grunt.config.get('pkg.version');

        const copyPackageDescriptionStep = (callback) => {
            exec('cp bower.json LICENSE.txt dist', (err, stdout, stderr) => {
                if (err) {
                    callback(`Could not copy bower.json or LICENSE.txt to dist${stderr}`);
                }
                grunt.log.writeln('Copied bower.json and LICENSE.txt to dist');
                callback(null);
            });
        };
        const commitBowerReleaseStep = (callback) => {
            const commitMsg = grunt.config.get('bump.options.commitMessage').replace('%VERSION%', version);

            exec(`cd dist && git add . && git commit -m "${commitMsg}"`, (err, stdout, stderr) => {
                if (err) {
                    callback(`Could not commit${stderr}`);
                }
                grunt.log.writeln(`Commiting bower release ${version}`);
                callback(null);
            });
        };
        const tagBowerReleaseStep = (callback) => {
            const tagName = grunt.config.get('bump.options.tagName').replace('%VERSION%', version);
            exec(`cd dist && git tag "${tagName}"`, (err, stdout, stderr) => {
                if (err) {
                    callback(`Could not tag${stderr}`);
                }
                grunt.log.writeln(`Tagging bower release ${version}`);
                callback(null);
            });
        };
        const pushBowerComponentStep = (callback) => {
            exec('cd dist && git push -u bower master && git push bower --tags', (err, stdout, stderr) => {
                if (err) {
                    callback(`Could not push bower commit and tag${stderr}`);
                }
                grunt.log.writeln(`Pushed ${version} commit and tag`);
                callback(null);
            });
        };
        const cleanupDistStep = (callback) => {
            exec('cd dist && rm -rf .git', (err, stdout, stderr) => {
                if (err) {
                    callback(`Could not remove dist/.git files\n${stderr}`);
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
        ], (err) => {
            if (err) {
                grunt.fatal(err);
            }
            done();
        });
    });

    grunt.registerTask('release', (target) => {
        grunt.task.run(
            'test-ci',
            `bump:${target}`,
            'init-bower-repo',
            'dist',
            'release-bower-component'
        );
    });

    grunt.registerTask('test', ['eslint', 'karma:unit:start', 'watch:tests']);
    grunt.registerTask('test-ci', ['eslint', 'karma:ci', 'mochaTest']);
    grunt.registerTask('dev', ['grizzly', 'watch:js']);
    grunt.registerTask('doc', ['yuidoc']);
    grunt.registerTask('validate', ['eslint']);
};
