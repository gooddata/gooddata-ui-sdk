// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        gitInfo: '',

        licence: grunt.file.read('tools/licence.tmpl'),

        uglify: {
            options: {
                banner: '<%= licence %>',
                mangle: {
                    except: ['window'] // because of _start.js uses it to bind on window
                }
            },
            dist: {
                src: 'dist/gooddata.js',
                dest: 'dist/gooddata.min.js'
            }
        },
        jshint: {
            all: ['Gruntfile.js', '*.js', 'src/*.js', 'test/*.js', '!src/_start.js', '!src/_end.js']
        },
        copy: {
            examples: {
                src: 'dist/gooddata.js',
                dest: 'examples/gooddata.js'
            }
        },
        karma: {
            unit: {
                configFile: 'tools/karma.conf.js'
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
                tasks: ['requirejs:compile', 'copy:examples'],
                nospawn: true
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: 'src',
                    name: 'sdk',
                    out: 'dist/gooddata-tmp.js',
                    paths: {
                        loader: '../lib/tildeio/loader'
                    },
                    wrap: {
                        startFile: 'src/_start.js',
                        endFile: 'src/_end.js'
                    },
                    include: ['gooddata'],
                    deps: ['loader'],
                    optimize: 'none', // do not uglify
                    preserveLicenseComments: true
                }
            }
        },
        concat: {
            js: {
                options: {
                    separator: "\n\n",
                    banner: '<%= licence %>'
                },
                src:  'dist/gooddata-tmp.js',
                dest: 'dist/gooddata.js'
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
                push: false // TODO push
            }
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

    grunt.registerTask('clean', 'Clean dist', function() {
        grunt.file['delete']('dist/gooddata-tmp.js');
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-grizzly');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');

    grunt.registerTask('default', ['dist']);
    grunt.registerTask('dist', [
        'getGitInfo',
        'jshint',
        'requirejs',
        'copy',
        'concat',
        'uglify',
        'clean'
    ]);

    grunt.registerTask('release-bower-component', 'Tag, commit and push dist files to bower component repo.', function() {
        var exec = require('child_process').exec,
            done = this.async();
        exec('cd dist && git init && '+
             'git remote add bower git@github.com:gooddata/bower-gooddata-js.git && '+
             'git fetch bower && git add .', function(err, stdout, stderr) {
            if(err) {
                grunt.fatal('could not init bower repository');
                grunt.log.errorlns(stderr);
            }
            grunt.log.writeln("Inited bower repository in ./dist");
            var version = grunt.config.get('pkg.version'),
                commitMsg = grunt.config.get('bump.options.commitMessage').replace("%VERSION%", version),
                tagName = grunt.config.get('bump.options.tagName').replace("%VERSION%", version);

            exec('cd dist && git commit -m "' + commitMsg + '"', function(err, stdout, stderr) {
                if(err) {
                    grunt.fatal('Could not commit');
                    grunt.log.errorlns(stderr);
                }

                grunt.log.writeln('Commiting bower release ' + version);
                exec('cd dist && git tag "' + tagName + '"', function(err, stdout, stderr) {
                    if(err) {
                        grunt.fatal('Could not tag');
                        grunt.log.errorlns(stderr);
                    }

                    grunt.log.writeln('Tagging bower release ' + version);
                    // TODO push

                    exec('cd dist && rm -rf .git', function(err, stdout, stderr) {
                        if(err) {
                            grunt.fatal('Could not remove dist/.git files');
                            grunt.log.errorlns(stderr);
                        }
                        done();
                    });
                });
            });
        });
    });

    grunt.registerTask('release', [
        'test',
        'bump',
        'build',
        'release-bower-component'
    ]);

    grunt.registerTask('test', ['jshint', 'karma']);
    grunt.registerTask('dev', ['grizzly', 'watch']);
    grunt.registerTask('doc', ['yuidoc']);
    grunt.registerTask('validate', ['jshint']);
};

