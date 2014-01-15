// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            build: {
                src: 'src/*.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        concat: {
            build: {
                src: 'src/*.js',
                dest: 'build/<%= pkg.name %>.js'
            },
            examples: {
                src: 'src/*.js',
                dest: 'examples/<%= pkg.name %>.js'
            }
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
        watch: {
            options: {
                interval: 500
            },
            js: {
                files: ['src/*.js', 'examples/**/*.js', 'examples/**/*.html'],
                nospawn: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-grizzly');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('default', ['concat', 'uglify']);
    grunt.registerTask('test', ['karma']);
    grunt.registerTask('dev', ['grizzly', 'watch']);
}

