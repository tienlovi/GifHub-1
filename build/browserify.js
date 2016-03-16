import gulp from 'gulp';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

gulp.task('browserify', ['clean'], function() {
    return browserify({
        entries: ['src/js/sites/GitHub/index.js'],
        debug: true
    }).transform('babelify')
    .transform('brfs')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist/chrome'));
});
