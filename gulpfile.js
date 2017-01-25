'use strict';
var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    cleanCSS = require('gulp-clean-css'),
    less = require('gulp-less'),
    postCss = require('gulp-postcss'),
    imagemin = require('gulp-imagemin'),
    sourceMaps = require('gulp-sourcemaps'),
    htmlmin = require('gulp-html-minifier'),
    rename = require('gulp-rename'),
    webp = require('gulp-webp'),  // Эффективное сжатие PNG,JPEG,TIFF,WebP
    uglify = require('gulp-uglify'),
    useref = require('gulp-useref'),    // конкатенация Html
    gulpif = require('gulp-if'),    // конкатенация Js,Css
    htmlhint = require("gulp-htmlhint"), // валидатор Html
    plumber = require('gulp-plumber'),
    babel = require('gulp-babel'),
    // coffee = require('gulp-coffee'),
    concat = require('gulp-concat'), //Собирает все Js файлы в один
    autoPrefix = require('autoprefixer');

gulp.task('connect', function () {
    browserSync.init({
        server: 'app/'
    });
    gulp.watch([
        'app/style.less'
    ], ['build']);
    gulp.watch([
        'app/main.html'
    ], ['watchHtml']);
    gulp.watch([
        'app/scripts/main.js'
    ], ['watchJs']);
});

gulp.task('watchHtml', function () {
    gulp.src('app/main.html')
        .pipe(useref())
        .pipe(gulpif('app/*.js', uglify()))
        .pipe(gulpif('app/*.css', cleanCSS()))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(htmlhint())
        .pipe(rename('index.html'))
        .pipe(gulp.dest('app/'));
    browserSync.reload();
});

gulp.task('watchJs', function () {
    gulp.src('./app/scripts/main.js')
        .pipe(plumber())
        .pipe(sourceMaps.init())
       // .pipe(coffee())
        .pipe(uglify())
        .pipe(sourceMaps.write('.'))
        .pipe(rename('main.min.js'))
        .pipe(gulp.dest('./app/scripts/'));
    browserSync.reload();
});

gulp.task('compressorCss', function () {
    gulp.src(['./app/**/*.css', './app/**/*.min.css'])
        .pipe(plumber())
        .pipe(cleanCSS({debug: true}, function (details) {
            console.log(details.name + ': ' + details.stats.originalSize);
            console.log(details.name + ': ' + details.stats.minifiedSize);}))
        .pipe(sourceMaps.init())
        .pipe(postCss([autoPrefix({browsers: ['last 3 versions']})]))
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('./app/'));
});

gulp.task('compressorJs', function () {
    gulp.src(['./app/**/*.js', './app/**/*.min.js', '!./app/scripts/main.js'])
        .pipe(plumber())
        .pipe(sourceMaps.init())
        .pipe(uglify())
        .pipe(sourceMaps.write('.'))
        .pipe(gulp.dest('./app/'));
});

gulp.task('import', function () {
    gulp.src(['./app/**/*.*', './app/.*'])
        .pipe(gulp.dest('./build/'));
});

gulp.task('reduce', function () {
    gulp.src('./app/img/**/*.png')
        .pipe(plumber())
        .pipe(webp())
        .pipe(imagemin())
        .pipe(gulp.dest('./build/img/'));
});

gulp.task('build', function () {
    gulp.src('./app/style.less')
        .pipe(plumber())
        .pipe(less())
        .pipe(cleanCSS({debug: true}, function (details) {
            console.log(details.name + ': ' + details.stats.originalSize);
            console.log(details.name + ': ' + details.stats.minifiedSize);}))
        .pipe(sourceMaps.init())
        .pipe(postCss([autoPrefix({browsers: ['last 3 versions']})]))
        .pipe(sourceMaps.write('.'))
        .pipe(rename('style.css'))
        .pipe(gulp.dest('./app/'));
    browserSync.reload();
});

gulp.task('default', ['connect', 'build', 'watchHtml', 'watchJs']);