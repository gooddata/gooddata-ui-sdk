var gulp = require('gulp');
var gutil = require('gulp-util');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('scripts', function() {
    gulp.src(['src/gdc-sdk/*.js'])
        .pipe(concat('gd-sdk.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./build'));
});

gulp.task('default', function() {
    gulp.run('scripts');
});

