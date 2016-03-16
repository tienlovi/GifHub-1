import gulp from 'gulp';
import concat from 'gulp-concat';

gulp.task('styles', ['clean'], function() {
    return gulp.src('src/styles/**/*.css')
        .pipe(concat('extension.css'))
        .pipe(gulp.dest('dist/chrome'));
});
