var Gulp = require('gulp');
var Nodemon = require('gulp-nodemon');

Gulp.task('nodemon', () =>
    Nodemon({
        script: 'server.js',
        watch: ['server.js', '*.es6', 'config.json'],
        ext: 'js, es6, json',
        args: ['--debug']
    })
);

Gulp.task('dev', Gulp.series('nodemon'));
Gulp.task('default', Gulp.series('dev'));
