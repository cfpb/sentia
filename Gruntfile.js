module.exports = function (grunt) {

    'use strict';

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    var path = require('path');
    var config = {

        /**
         * Pull in the package.json file so we can read its metadata.
         */
        pkg: grunt.file.readJSON('bower.json'),

        /**
         * Set some src and dist location variables.
         */
        loc: {
            src: 'src',
            dist: 'dist'
        },
        bower_concat: {
            bower: {
                dest: '<%=loc.src %>/public/apps/reports/bower-report.js',
                cssDest: '<%=loc.src %>/public/static/css/bower-report.css',
                include: [
                    'jquery',
                    'async',
                    'bootstrap',
                    'lodash'
                ],
            }
        },
        /**
         * Bower: https://github.com/yatskevich/grunt-bower-task
         *
         * Set up Bower packages and migrate static assets.
         */
        bower: {
            cf: {
                options: {
                    targetDir: '<%= loc.src %>/public/vendor/',
                    install: true,
                    verbose: true,
                    cleanTargetDir: true,
                    layout: function (type, component) {
                        if (type === 'img') {
                            return path.join('../public/static/img');
                        } else if (type === 'fonts') {
                            return path.join('../static/fonts');
                        } else {
                            return path.join(component);
                        }
                    }
                }
            }

        },

        /**
         ANGULAR ANNOTATION FIX
         **/
        ngAnnotate: {
            sentia: {
                files: {
                    '<%= loc.src %>/public/apps/ng/annotatedApp.js': ['<%= loc.src %>/public/apps/ng/app.js']
                },
            }
        },

        /**
         * Concat: https://github.com/gruntjs/grunt-contrib-concat
         *
         * Concatenate cf-* Less files prior to compiling them.
         */
        concat: {
            js: {
                src: [
                    '<%= loc.src %>/public/vendor/jquery/jquery.js',
                    '<%= loc.src %>/public/vendor/underscore/underscore-min.js',
                    '<%= loc.src %>/public/vendor/jquery.easing/jquery.easing.js',
                    '<%= loc.src %>/public/vendor/cf-*/*.js',
                    '<%= loc.src %>/public/vendor/d3-tip/index.js',
                    // '<%= loc.src %>/vendor/d3/d3.min.js',
                    '!<%= loc.src %>/public/vendor/cf-*/Gruntfile.js',
                    '<%= loc.src %>/public/apps/ng/app.js'
                ],
                dest: '<%= loc.dist %>/public/apps/ng/main.js'
            }
        },
        /**
         * Less: https://github.com/gruntjs/grunt-contrib-less
         *
         * Compile Less files to CSS.
         */
        less: {
            main: {
                options: {
                    // The src/vendor paths are needed to find the CF components' files.
                    // Feel free to add additional paths to the array passed to `concat`.
                    paths: grunt.file.expand('src/vendor/*').concat([])
                },
                files: {
                    '<%= loc.dist %>/public/static/css/main.css': ['<%= loc.src %>/public/static/css/main.less'],
                    '<%= loc.dist %>/public/static/css/main-report.css': ['<%= loc.src %>/public/static/css/main-report.less']
                }
            }
        },

        /**
         * Autoprefixer: https://github.com/nDmitry/grunt-autoprefixer
         *
         * Parse CSS and add vendor-prefixed CSS properties using the Can I Use database.
         */
        autoprefixer: {
            options: {
                // Options we might want to enable in the future.
                diff: false,
                map: false
            },
            main: {
                // Prefix `static/css/main.css` and overwrite.
                expand: true,
                src: ['<%= loc.dist %>/public/static/css/main.css']
            },
        },

        /**
         * Uglify: https://github.com/gruntjs/grunt-contrib-uglify
         *
         * Minify JS files.
         * Make sure to add any other JS libraries/files you'll be using.
         * You can exclude files with the ! pattern.
         */
        uglify: {
            options: {
                preserveComments: 'some',
                sourceMap: true
            },
            // headScripts: {
            //   src: 'vendor/html5shiv/html5shiv-printshiv.js',
            //   dest: 'static/js/html5shiv-printshiv.js'
            // },
            js: {
                src: ['<%= loc.dist %>/public/apps/ng/main.js'],
                dest: '<%= loc.dist %>/public/apps/ng/main.min.js'
            }
        },

        /**
         * Banner: https://github.com/mattstyles/grunt-banner
         *
         * Here's a banner with some template variables.
         * We'll be inserting it at the top of minified assets.
         */
        banner: '/*!\n' +
        ' *  <%= pkg.name %> - v<%= pkg.version %>\n' +
        ' *  <%= pkg.homepage %>\n' +
        ' *  Licensed <%= pkg.license %> by <%= pkg.author.name %> <<%= pkg.author.email %>>\n' +
        ' */',

        usebanner: {
            css: {
                options: {
                    position: 'top',
                    banner: '<%= banner %>',
                    linebreak: true
                },
                files: {
                    src: ['<%= loc.dist %>/static/css/*.min.css']
                }
            },
            js: {
                options: {
                    position: 'top',
                    banner: '<%= banner %>',
                    linebreak: true
                },
                files: {
                    src: ['<%= loc.dist %>/static/js/*.min.js']
                }
            }
        },

        /**
         * CSS Min: https://github.com/gruntjs/grunt-contrib-cssmin
         *
         * Compress CSS files.
         */
        cssmin: {
            main: {
                options: {
                    processImport: false
                },
                files: {
                    '<%= loc.dist %>/public/static/css/main.min.css': ['<%= loc.dist %>/public/static/css/main.css'],
                    '<%= loc.dist %>/public/static/css/main-report.min.css': ['<%= loc.dist %>/public/static/css/main-report.css']
                }
            },
            'ie-alternate': {
                options: {
                    processImport: false
                },
                files: {
                    '<%= loc.dist %>/public/static/css/main.ie.min.css': ['<%= loc.dist %>/public/static/css/main.ie.css'],
                    '<%= loc.dist %>/public/static/css/main-report.ie.min.css': ['<%= loc.dist %>/public/static/css/main-report.ie.css']
                }
            }
        },

        /**
         * Legacssy: https://github.com/robinpokorny/grunt-legacssy
         *
         * Fix your CSS for legacy browsers.
         */
        legacssy: {
            'ie-alternate': {
                options: {
                    // Flatten all media queries with a min-width over 960 or lower.
                    // All media queries over 960 will be excluded fromt he stylesheet.
                    // EM calculation: 960 / 16 = 60
                    legacyWidth: 60
                },
                files: {
                    '<%= loc.dist %>/public/static/css/main.ie.css': '<%= loc.dist %>/public/static/css/main.css'
                }
            }
        },

        /**
         * Copy: https://github.com/gruntjs/grunt-contrib-copy
         *
         * Copy files and folders.
         */
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/public/apps',
                        src: [
                            '**/*'
                        ],
                        dest: '<%= loc.dist %>/public/apps'
                    },
                    {
                        expand: true,
                        cwd: 'src/public/vendor',
                        src: [
                            '**/*'
                        ],
                        dest: '<%= loc.dist %>/public/vendor'
                    },
                    {
                        expand: true,
                        cwd: '<%= loc.src %>/public/static',
                        src: [
                            // Fonts
                            'fonts/*',
                            'images/*'
                        ],
                        dest: '<%= loc.dist %>/public/static'
                    },
                    {
                        expand: true,
                        cwd: '<%= loc.src %>/public/local',
                        src: [
                            '**/*'
                        ],
                        dest: '<%= loc.dist %>/public/local'
                    },
                    {
                        expand: true,
                        cwd: '<%= loc.src %>',
                        src: [
                            // Vendor files
                            'vendor/html5shiv/html5shiv-printshiv.min.js',
                            'vendor/box-sizing-polyfill/boxsizing.htc'
                        ],
                        dest: '<%= loc.dist %>/public/static'
                    }
                ]
            }
        },

        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        mochacli: {
            options: {
                ui: 'bdd',
                require: ['should','chai','sinon'],
                bail: true,
                reporter: 'spec',
                env: {
                    NODE_TLS_REJECT_UNAUTHORIZED: 0
                }
            },
            all: ['test/server/server_spec.js']
        },
        casper : {
            frontend : {
                src: ['test/client/*.js'],
                options : {
                    test : true,
                    verbose: false,
                    'log-level': 'error',
                    'ignore-ssl-errors': true,
                    'ssl-protocol': 'tlsv1',
                    'fail-fast':false
                }
            }
        },
        express: {
            options: {
                // output: "Express server listening "
            },
            dev: {
                options: {
                    script: 'server.js'
                }
            },
            test: {
                options: {
                    script: 'server.js'
                }
            }
        },

        /**
         * JSHint: https://github.com/gruntjs/grunt-contrib-jshint
         *
         * Validate files with JSHint.
         * Below are options that conform to idiomatic.js standards.
         * Feel free to add/remove your favorites: http://www.jshint.com/docs/#options
         */
        jshint: {
            options: {
                camelcase: false,
                curly: false,
                forin: false,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                quotmark: true,
                sub: true,
                boss: true,
                strict: false,
                evil: true,
                eqnull: true,
                browser: true,
                plusplus: false,
                globals: {
                    jQuery: true,
                    $: true,
                    module: true,
                    require: false,
                    define: false,
                    console: true,
                    EventEmitter: true
                }
            },
            all: ['<%= loc.src %>/public/apps/ng/app.js','<%= loc.src %>/public/apps/bb/router.js', '<%= loc.src %>/public/apps/bb/components/networkchart/app.js']
        },

        /**
         * Watch: https://github.com/gruntjs/grunt-contrib-watch
         *
         * Run predefined tasks whenever watched file patterns are added, changed or deleted.
         * Add files to monitor below.
         */
        watch: {
            default: {
                files: ['Gruntfile.js', '<%= loc.src %>/public/static/css/**/*.less', '<%= loc.src %>/public/apps/**/*.js',
                    '<%= loc.src %>/*.html'],
                tasks: ['default']
            }
        }

    };

    /**
     * Initialize a configuration object for the current project.
     */
    grunt.initConfig(config);

    /**
     * Create custom task aliases and combinations.
     */
    grunt.loadNpmTasks('grunt-bower-concat');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-casper');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.registerTask('compile-cf', ['bower:cf','bower_concat']);
    grunt.registerTask('css', ['less', 'autoprefixer', 'legacssy', 'cssmin', 'usebanner:css']);
    grunt.registerTask('js', ['concat:js', 'uglify', 'usebanner:js']);
    grunt.registerTask('test', ['jshint']);
    grunt.registerTask('testServerSide',['mochacli']);
    grunt.registerTask('frontEndTest',['karma','casper:frontend']);
    grunt.registerTask('frontAndServerSideTest','This will run tests by starting up express (sentia), run front-end tests,  stop express (sentia), run server side tests',['express:test:start', 'karma','casper:frontend','test','express:test:stop','mochacli']);
    grunt.registerTask('build', [ 'ngAnnotate', 'css', 'js', 'copy']);
    grunt.registerTask('default', ['build']);


};
