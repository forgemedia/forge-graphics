module.exports = function(grunt) {
	grunt.initConfig({
		concurrent: {
			dev: {
				tasks: ['watch', 'nodemon'],
				options: {
					logConcurrentOutput: true
				}
			}
		},
		nodemon: {
			dev: {
				script: 'server.js',
				options: {
					nodeArgs: ['--debug'],
					callback: function(nodemon) {
						nodemon.on('log', function (event) {
					        console.log(event.colour);
					    });
					}
				}
			}
		},
		concat: {
			options: {
				separator: ';'
			},
			cg: {
				// expand: true,
				// cwd: 'public/js',
				src: ['public/js/_cg.js', 'public/js/cg/_*.js', 'public/js/cg/varsity/_*.js'],
				dest: 'public/js/cg.js'
			},
			dashboard: {
				src: ['public/dashboard/js/_*.js', 'public/dashboard/js/varsity/_*.js'],
				dest: 'public/dashboard/js/dashboard.js'
			}
		},
		sass: {
			dist: {
				options: {
					style: 'compressed',
					precision: 10
				},
				files: [{
					expand: true,
					cwd: 'scss/',
					src: ['*.scss'],
					dest: 'public/css',
					ext: '.css'
				}]
			}
		},
		watch: {
			cgjs: {
				files: ['<%= concat.cg.src %>'],
				tasks: ['concat:cg']
			},
			dashjs: {
				files: ['<%= concat.dashboard.src %>'],
				tasks: ['concat:dashboard']
			},
			sass: {
				files: ['scss/**/*.scss'],
				tasks: ['sass'],
				options: {
					spawn: false
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-notify');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-concurrent');

	grunt.registerTask('default', ['sass', 'concat']);
	grunt.registerTask('dev', ['concurrent']);
};
