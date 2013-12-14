module.exports = function (grunt) {
    var config = {
            pkg: grunt.file.readJSON('package.json'),
            jshint: {
                all: [
                    'Gruntfile.js',
                    'bin/*.js'
                ]
            },
            nodeunit: {
                all: [
                    'bin/test.js'
                ]
            },
            concat: {
                srcMacros: {
                    src: ['src/*.sjs'],
                    dest: 'bin/src.sjs'
                },
                testMacros: {
                    src: ['test/*.js', 'bin/src.sjs'],
                    dest: 'bin/test.sjs'
                }
            },
            macro: {
                all: {
                }
            },
            clean: {
                all: {
                    src: 'bin'
                }
            },
            sweet: {
                all: {
                    src: 'bin/test.sjs',
                    dest: 'bin/test.js'
                }
            }
        };

    grunt.initConfig(config);

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    grunt.registerMultiTask('macro', 'Run macro sweet.js unit tests with nodeunit.', function() {
        grunt.task.run([    'clean',
                            'jshint',
                            'concat:srcMacros',
                            'concat:testMacros',
                            'sweet',
                            'nodeunit'
                        ]);
    });

    grunt.registerMultiTask('clean', 'Clean bin folder', function() {
        var shell = require('shelljs'),
            options = this.data;
        shell.rm('-rf', options.src);
    });

    grunt.registerMultiTask('sweet', 'Run sweet.js', function() {
        var shell = require('shelljs'),
            options = this.data;
        shell.exec('sjs -o ' + options.dest + ' ' + options.src);
    });

    grunt.registerTask('default', ['macro']);
};