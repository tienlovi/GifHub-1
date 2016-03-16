import gulp from 'gulp';

gulp.task('copy:chrome', ['clean'], function() {
    return gulp.src('shells/chrome/*')
        .pipe(gulp.dest('dist/chrome'));
});
