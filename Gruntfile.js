module.exports = function(grunt) {
	grunt.initConfig({
		concat: {
			options: {
				separator: ';'
			},
			cg: {
				// expand: true,
				// cwd: 'public/js',
				src: ['public/js/_*.js', 'public/js/cg/_*.js', 'public/js/cg/varsity/_*.js'],
				dest: 'public/js/cg.js'
			}
		},
		sass: {
			dist: {
				options: {
					style: 'expanded'
				},
				files: [{
					expand: true,
					cwd: 'scss/',
					src: ['[^_]*.scss'],
					dest: 'public/css',
					ext: '.css'
				}]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('default', ['sass']);
};
