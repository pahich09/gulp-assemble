const {src, dest, watch, parallel, series, task} = require('gulp');
const browserSync = require('browser-sync').create();
const fileInclude = require('gulp-file-include');
const del = require('del');
const scss = require('gulp-sass');
const autoPrefix = require('gulp-autoprefixer');
const groupMedia = require('gulp-group-css-media-queries');
const cleanCss = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const webphtml = require('gulp-webp-html');
const svgSprite = require('gulp-svg-sprite');


const project_folder = 'dist';
const source_folder = 'src';

const path = {
  build: {
    html: project_folder + '/',
    css: project_folder + '/css/',
    js: project_folder + '/js/',
    img: project_folder + '/img/',
  },
  src: {
    html: [source_folder + '/*.html'],
    css: source_folder + '/scss/style.scss',
    js: source_folder + '/js/script.js',
    img: source_folder + '/img/**/*.{jpg, png, svg, gif, ico, webp}',
  },
  watch: {
    html: source_folder + '/**/*.html',
    css: source_folder + '/scss/**/*.scss',
    js: source_folder + '/js/**/*.js',
    img: source_folder + '/img/**/*.{jpg, png, svg, gif, ico, webp}',
  },
  clean: './' + project_folder + '/'
};


function server() {
  browserSync.init({
    server: {
      baseDir: './' + project_folder + '/'
    },
    port: 5000,
    notify: false
  });
}

function html() {
  return src(path.src.html)
    .pipe(fileInclude())
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browserSync.stream());
}

function css() {
  return src(path.src.css)
    .pipe(scss({
      outputStyle: 'expanded'
    }))
    .pipe(groupMedia())
    .pipe(autoPrefix({
      overrideBrowserslist: ['last 5 versions'],
      cascade: true
    }))
    .pipe(dest(path.build.css))
    .pipe(cleanCss())
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(dest(path.build.css))
    .pipe(browserSync.stream());
}

function js() {
  return src(path.src.js)
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(dest(path.build.js))
    .pipe(browserSync.stream());
}

function images() {
  return src(path.src.img)
    .pipe(webp({
      quality: 70
    }))
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(imagemin({
      progressive: true,
      interlaced: true,
      optimizationLevel: 3,
      svgoPlugins: [{
        removeViewBox: false
      }]

    }))
    .pipe(dest(path.build.img))
    .pipe(browserSync.stream());
}

function clean() {
  return del(path.clean);
}

task('svgSprite', function () {
  return src([source_folder + '/iconSprite/*.svg'])
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../icons/icons.svg',
          example: true
        }
      }
    }))
    .pipe(dest(path.build.img));
});


const watchFiles = () => {
  watch([path.watch.html], html);
  watch([path.watch.css], css);
  watch([path.watch.js], js);
  watch([path.watch.img], images);
};

const build = series(clean, parallel(css, html, js, images));
const dev = parallel(build, watchFiles, server);

exports.build = build;
exports.default = dev;
