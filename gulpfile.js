var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var watchify = require('watchify');
var webserver = require('gulp-webserver');
var imagemin = require('gulp-imagemin');


gulp.task('images', function() {
  return gulp.src(['./images/*', './images/*/*'])
    .pipe(imagemin())
    .pipe(gulp.dest('./build/images/'))
});

gulp.task('stylesheets', stylesheetTask());


function stylesheetTask(minify) {
  return function() {
    return gulp.src([
      './stylesheets/app.less',
      './stylesheets/landing.less',
    ])
    .pipe(less())
    .pipe(gulpif(minify, minifyCSS()))
    .pipe(gulp.dest('./build/stylesheets'));
  }
}

function javascriptTask(watch, minify) {
  return function(name) {
    var browserifyOptions = {
      // Enables source maps.
      // debug: true,
      entries: './javascript/' + name,
      transform: [reactify],
      extensions: [".jsx"],
      // Requirements of watchify
      cache: {},
      packageCache: {}
    };

    var b = browserify(browserifyOptions);
    if (watch) {
      b = watchify(b);
    }
    var build = function() {
      b.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source(name))
        .pipe(buffer())
        .pipe(gulpif(minify, uglify()))
        .pipe(gulp.dest('./build/javascript/'));
    };
    b.on('log', gutil.log);
    b.on('update', build);
    build();
  };
}

gulp.task('min', function() {
  stylesheetTask(true /* minify */)();
  var browserifyFile = javascriptTask(false /* watch */, true /* minify */);
  browserifyFile('auth.js');
  browserifyFile('welcome.js');
  browserifyFile('main.js');
});

gulp.task('javascript', function() {
  var browserifyFile = javascriptTask(true /* watch */);
  browserifyFile('auth.js');
  browserifyFile('welcome.js');
  browserifyFile('main.js');
});

gulp.task('serve', function() {
  return gulp.src('.').pipe(webserver({
    livereload: true,
    directoryListing: false,
    open: true,
    fallback: 'index.html'
  }));
});

gulp.task('dev', ['serve', 'stylesheets', 'javascript'], function() {
  gulp.watch('./stylesheets/*', ['stylesheets']);
});