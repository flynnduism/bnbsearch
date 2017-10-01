/*!
 * gulp
 * $ npm install del gulp gulp-ruby-sass gulp-autoprefixer gulp-cache gulp-cssnano gulp-imagemin gulp-livereload gulp-minify-css gulp-notify gulp-rename gulp-sourcemaps streamqueue --save-dev
*/

// Load plugins
var gulp = require('gulp'),
  del = require('del');
  sass = require('gulp-ruby-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  uncss = require('gulp-uncss'),
  cache = require('gulp-cache'),
  cssnano = require('gulp-cssnano'),
  imagemin = require('gulp-imagemin'),
  livereload = require('gulp-livereload'),
  minifycss = require('gulp-minify-css'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  notify = require('gulp-notify'),
  rename = require('gulp-rename'),
  sourcemaps = require('gulp-sourcemaps'),
  streamqueue = require('streamqueue'),
  critical = require('critical'),
  inlineCss = require('gulp-inline-css'),
  runSequence = require('run-sequence');


// Styles
gulp.task('styles', function () {
  return sass('assets/scss/app.scss', {style: 'compressed'})
    .pipe(autoprefixer('last 2 version'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(sourcemaps.init())
    .pipe(cssnano())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest( 'dist/css'))
    .pipe(notify({message: 'Styles task complete'}))
});

// UnCSS
gulp.task('styles-uncss', function () {
  return gulp.src('assets/css')
  .pipe(uncss({
    html: ['index.html'],
    timeout: 1000
  }))
  .pipe(gulp.dest( 'dist/css'))
  .pipe(notify({message: 'Styles - UnCSS task complete'}))
});

// Inline Critical CSS
gulp.task('styles-inline', function (cb) {
  critical.generate({
    src: 'index.html',
    css: ['dist/css/app.min.css'],
    dimensions: [{
      width: 320,
      height: 480
    },{
      width: 768,
      height: 1024
    },{
      width: 1280,
      height: 960
    }],
    dest: 'dist/css/critical.min.css',
    minify: true,
    extract: false,
    ignore: ['font-face']
  })
});

// Images
gulp.task('images', function () {
  return streamqueue({objectMode: true},
    gulp.src('assets/images/**/*{.jpg,.png,.gif}')
      .pipe(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true})))
      // .pipe(notify({message: 'Image minifed'}))
      .pipe(gulp.dest('dist/images/'))
  )
});


// Clean
gulp.task('clean', function () {
  return del('dist/', {force: true});
});


// Default task
gulp.task('default', function () {
  runSequence(
    'clean',
    'styles', 'images',
    'styles-uncss',
    'styles-inline');
});

// Watch task
gulp.task('watch', function () {

  // Watch .scss files
  gulp.watch('assets/scss/**/*.scss', ['styles']);

  // Watch image files
  gulp.watch('images/**/*.{png,gif,jpg}', ['images']);

  // Watch .js files
  gulp.watch('assets/js/**/*.js', ['scripts']);

  // Create LiveReload server
  livereload.listen();

  // Watch any files in _site, reload on change
  gulp.watch(['dist/**/*']).on('change', livereload.changed);

});