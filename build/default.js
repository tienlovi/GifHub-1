import gulp from 'gulp';

gulp.task('default', [
    'clean',
    'copy:chrome',
    'browserify',
    'styles'
]);
