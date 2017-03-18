module.exports = function(grunt) {
	grunt.initConfig({
		sass: {
			dist: {
				options: {
					style: 'expanded'
				},
				files: {
					'public/css/theme.css': 'scss/theme.scss',
					'public/css/dashboard.css': 'scss/dashboard.scss'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-sass');

	grunt.registerTask('default', ['sass']);
};
