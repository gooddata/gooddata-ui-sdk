// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            dist: {
                src: 'src/*.js',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        concat: {
            dist: {
                src: 'src/*.js',
                dest: 'dist/<%= pkg.name %>.js'
            },
            examples: {
                src: 'src/*.js',
                dest: 'examples/<%= pkg.name %>.js'
            }
        },
        jshint: {
            all: ['*.js', 'src/*.js', 'test/*.js']
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
                files: ['src/*.js', 'examples/**/*.js', 'examples/**/*.html', '!examples/gd-sdk-js.js'],
                tasks: ['concat:examples'],
                nospawn: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-grizzly');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-markdox');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
    grunt.registerTask('test', ['jshint', 'karma']);
    grunt.registerTask('dev', ['grizzly', 'watch']);
    grunt.registerTask('doc', ['markdox']);
};

