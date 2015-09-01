"use strict";

module.exports = function(grunt) {

    require("load-grunt-tasks")(grunt);

    var gruntConfig = require("./grunt.config.js");

    // Project configuration.
    var taskConfig = {
        pkg: grunt.file.readJSON("package.json"),

        /**
         * Clean up the build directory.
         */
        clean: {
            build: {
                src: ["<%= buildDir %>"]
            }
        },

        /**
         * Compile templates.
         */
        html2js: {
            app: {
                options: {
                    base: "web"
                },
                src: ["<%= tpl.files %>"],
                dest: "<%= tpl.jsFile %>",
                module: "<%= tpl.moduleName %>"
            }
        },

        jshint: {
            options: {
                jshintrc: ".jshintrc",
                force: true, // Don"t fail the task, just warn
                ignores: []
            },
            app: {
                files: {
                    src: [
                        "<%= webDir %>/<%= webFiles.js %>",
                        "grunt.config.js",
                        "Gruntfile.js"
                    ]
                }
            }
        },

        copy: {
            web: {
                files: [{
                    src: [
                        "<%= webFiles.js %>",
                        "<%= webFiles.php %>",
                        "<%= webFiles.apache %>",
                        "<%= webFiles.images %>",
                        "<%= webFiles.html %>"
                    ],
                    dest: "<%= buildDir %>",
                    cwd: "<%= webDir %>",
                    expand: true
                }, {
                    src: [
                        "<%= vendor.files.js %>",
                        "<%= vendor.files.map %>",
                        "<%= vendor.files.fonts %>",
                        "<%= vendor.files.css %>"
                    ],
                    dest: "<%= buildDir %>",
                    cwd: "<%= webDir %>",
                    expand: true
                }]
            },
            backend: {
                files: [{
                    src: ["<%= backendFiles.php %>"],
                    dest: "<%= buildDir %>",
                    cwd: ".",
                    expand: true
                }]
            }
        },

        ngAnnotate: {
            build: {
                files: [{
                    src: [
                        "<%= webFiles.js %>"
                    ],
                    cwd: "<%= buildDir %>",
                    dest: "<%= buildDir %>",
                    expand: true
                }]
            }
        },

        less: {
            build: {
                files: {
                    "<%= buildDir %>/assets/app/css/app.css": "<%= webDir %>/assets/app/css/app.less",
                    "<%= buildDir %>/assets/app/css/app-print.css": "<%= webDir %>/assets/app/css/app-print.less"
                }
            }
        },

        "string-replace": {
            base: {
                files: {
                    "<%= buildDir %>/<%= webFiles.html %>": "<%= buildDir %>/<%= webFiles.html %>"
                },
                options: {
                    replacements: [{
                        pattern: /<base href=".*?">/,
                        replacement: "<base href=\"<%= base %>\">"
                    }]
                }
            }
        },

        "file-creator": {
            backend: {
                files: [{
                    file: "<%= buildDir %>/preconf.php",
                    method: function(fs, fd, done) {
                        fs.writeSync(fd, "<?php\n$backendRoot = \"" + gruntConfig.buildBackendDir + "/\";");
                        done();
                    }
                }]
            }
        },

        mkdir: {
            var: {
                options: {
                    mode: 511, // 0777
                    create: ["<%= buildDir %>/<%= buildBackendDir %>/var"]
                }
            }
        },

        compress: {
            shared: {
                options: {
                    archive: "<%= packageDir %>/agile-v<%= pkg.version %>.tar.gz",
                    mode: "tgz"
                },
                files: [
                    {
                        expand: true,
                        cwd: "<%= buildDir %>",
                        dot: true,
                        src: ["**"],
                        dest: ""
                    }
                ]
            }
        }
    };

    grunt.initConfig(grunt.util._.merge(taskConfig, gruntConfig));

    grunt.registerTask("configurePaths", [
        "string-replace:base",
        "file-creator:backend"
    ]);

    grunt.registerTask("build", [
        "clean:build",
        "jshint",
        "copy:web",
        "copy:backend",
        "html2js",
        "ngAnnotate",
        "less",
        "configurePaths",
        "mkdir"
    ]);


    grunt.registerTask("pack", [
        "build",
        "compress"
    ]);

    // Default task(s).
    grunt.registerTask("default", ["build"]);

};