// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.

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
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');

    grunt.registerTask('default', [
        'getGitInfo',
        'jshint',
        'requirejs',
        'copy',
        'concat',
        'uglify',
        'clean'
    ]);

    grunt.registerTask('test', ['jshint', 'karma']);
    grunt.registerTask('dev', ['grizzly', 'watch']);
    grunt.registerTask('doc', ['yuidoc']);
    grunt.registerTask('validate', ['jshint']);
};

