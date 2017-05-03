var Gulp = require('gulp');
var Sass = require('gulp-sass');
var Nodemon = require('gulp-nodemon');
var PostCSS = require('gulp-postcss');
var Sourcemaps = require('gulp-sourcemaps');
var Concat = require('gulp-concat');

var Cssnext = require('postcss-cssnext');

Gulp.task('css', () =>
    Gulp.src('scss/**/*.scss')
        .pipe(Sourcemaps.init())
        .pipe(Sass({
            style: 'expanded',
            includePaths: [
                'bower_components/bootstrap-sass/assets/stylesheets/',
                'bower_components/'
            ]
        }))
        .pipe(PostCSS([
            Cssnext({
                browsers: ['Chrome > 20']
            })
        ]))
        .pipe(Sourcemaps.write())
        .pipe(Gulp.dest('public/css/'))
);

Gulp.task('js:cg', () =>
    Gulp.src('public/js/**/_*.js')
        .pipe(Sourcemaps.init())
        .pipe(Concat('cg.js', { newLine: ';\n' }))
        .pipe(Sourcemaps.write())
        .pipe(Gulp.dest('public/js/'))
);

Gulp.task('js:dash', () =>
    Gulp.src('public/dashboard/js/**/_*.js')
        .pipe(Sourcemaps.init())
        .pipe(Concat('dashboard.js', { newLine: ';\n' }))
        .pipe(Sourcemaps.write())
        .pipe(Gulp.dest('public/dashboard/js/'))
);

Gulp.task('js', Gulp.parallel('js:cg', 'js:dash'));

Gulp.task('watch:css', () =>
    Gulp.watch('scss/**/*.scss', Gulp.series('css'))
);

Gulp.task('watch:js:cg', () =>
    Gulp.watch('public/js/**/_*.js', Gulp.series('js:cg'))
);

Gulp.task('watch:js:dash', () =>
    Gulp.watch('public/dashboard/js/**/_*.js', Gulp.series('js:dash'))
);

Gulp.task('nodemon', () =>
    Nodemon({
        script: 'server.js',
        watch: ['server.js', '*.es6', 'config.json'],
        ext: 'js, es6, json',
        args: ['--debug']
    })
);

Gulp.task('watch', Gulp.parallel('watch:css', 'watch:js:cg', 'watch:js:dash'));

Gulp.task('default', Gulp.parallel('css', 'js'));
Gulp.task('dev', Gulp.series('default', Gulp.parallel('watch', 'nodemon')));
