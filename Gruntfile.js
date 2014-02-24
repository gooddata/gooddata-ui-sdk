// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                mangle: {
                    except: ['window'] // because of _start.js uses it to bind on window
                }
            },
            dist: {
                src: 'dist/gooddata.js',
                dest: 'dist/gooddata.min.js'
            }
        },
        concat: {
            examples: {
                src: 'src/*.js',
                dest: 'examples/<%= pkg.name %>.js'
            }
        },
        jshint: {
            all: ['*.js', 'src/*.js', 'test/*.js', '!src/_start.js', '!src/_end.js']
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        grizzly: {
            options: {
                root: "examples/"
            }
        },
        markdox: {
            doc: {
                src: 'src/sdk.js',
                dest: 'docs/sdk.md'
            }
        },
        watch: {
            options: {
                interval: 500
            },
            js: {
                files: ['src/*.js', 'examples/**/*.js', 'examples/**/*.html', '!examples/gdc.js', '!examples/gd-sdk-js.js'],
                tasks: ['concat:examples'],
                nospawn: true
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: 'src',
                    name: 'sdk',
                    out: 'dist/gooddata.js',
                    paths: {
                        loader: '../lib/tildeio/loader'
                    },
                    wrap: {
                        startFile: 'src/_start.js',
                        endFile: 'src/_end.js'
                    },
                    include: ['loader', 'gooddata'],
                    optimize: 'none',
                    preserveLicenseComments: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-grizzly');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-markdox');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('default', ['jshint', 'concat', 'requirejs', 'uglify']);
    grunt.registerTask('test', ['jshint', 'karma']);
    grunt.registerTask('dev', ['grizzly', 'watch']);
    grunt.registerTask('doc', ['markdox']);
};

