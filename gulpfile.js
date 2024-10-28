const { src, dest, watch, series } = require("gulp");
const autoprefixer = require("autoprefixer");
const babel = require("gulp-babel");
const browsersync = require("browser-sync");
const concat = require("gulp-concat");
const cssnano = require("cssnano");
const del = require("del");
const fs = require("fs");
const { readFileSync } = require("fs");
const gulpif = require("gulp-if");
const htmlreplace = require("gulp-html-replace");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const postcss = require("gulp-postcss");
const purgecss = require("gulp-purgecss");
const rename = require("gulp-rename");
const rev = require("gulp-rev");
const revRewrite = require("gulp-rev-rewrite");
const sass = require("gulp-dart-sass");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");

// File paths
const paths = {
  html: {
    src: "./src/**/*.html",
    dest: "./dist/**/*.html"
  },
  styles: {
    scss: "./src/scss/**/*.scss",
    css: "./src/css/",
    dest: "./dist/css/"
  },
  javascript: {
    src: {
      custom: ["./src/js/components/*.js", "./src/js/features/*.js", "./src/js/main.js"],
      vendors: "./src/js/vendors/**/*.js",
      others: "./src/js/others/**/*.js"
    },
    dest: {
      custom: "./dist/js/",
      vendors: "./dist/js/vendors/",
      others: "./dist/js/others/"
    }
  },
  images: {
    src: "./src/img/**/*",
    dest: "./dist/img/"
  },
  fonts: {
    src: "./src/fonts/**/*",
    dest: "./dist/fonts/"
  }
};

// Browsersync serve
function browsersyncServe(cb) {
  browsersync.init({
    server: {
      baseDir: "./"
    },
    startPath: "/src/index.html",
    online: true,
    tunnel: false
  });
  cb();
}

// Browsersync reload
function browsersyncReload(cb) {
  browsersync.reload();
  cb();
}

// Watch file changes
function watchChanges() {
  watch(paths.html.src, browsersyncReload);
  watch(paths.styles.scss, series(compileSCSS, browsersyncReload));
  watch(paths.javascript.src.custom, browsersyncReload);
}

// Compile SCSS into CSS, add prefixes
function compileSCSS() {
  return src(paths.styles.scss).pipe(sourcemaps.init()).pipe(sass().on("error", sass.logError)).pipe(sourcemaps.write("./")).pipe(dest(paths.styles.css));
}

// Minify CSS
function minifyCSS() {
  return src("./src/css/main.css")
    .pipe(
      purgecss({
        content: [paths.html.src],
        safelist: {
          standard: [/is/, /Alert/, /Loader/],
          deep: [/is/, /Alert/, /Loader/],
          greedy: [/is/, /Alert/, /Loader/]
        }
      })
    )
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(dest(paths.styles.dest));
}

// Compile and minify JS
function minifyJS() {
  return src(paths.javascript.src.custom)
    .pipe(sourcemaps.init())
    .pipe(
      gulpif(
        "!*.min.js",
        babel({
          presets: ["@babel/env"]
        })
      )
    )
    .pipe(
      gulpif(
        "!*.min.js",
        uglify({
          output: {
            comments: /^!/
          }
        })
      )
    )
    .pipe(concat("main.min.js"))
    .pipe(sourcemaps.write("./"))
    .pipe(dest(paths.javascript.dest.custom));
}

// Compress images
function compressImg() {
  return src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: false }, { cleanupIDs: false }]
        })
      ])
    )
    .pipe(dest(paths.images.dest));
}

// Clean "dist" folder
function cleanDist() {
  return del(["./dist/*.html", "./dist/css/main*.css", "./dist/js/"]);
}

// Copy HTML files from "src" to "dist" folder with replaced CSS and JavaScript paths
function copyHTML() {
  return src(paths.html.src)
    .pipe(
      htmlreplace({
        css: {
          src: "./css/main.min.css"
        },
        js: {
          src: "./js/main.min.js",
          tpl: '<script src="%s" defer></script>'
        }
      })
    )
    .pipe(dest("./dist/"));
}

// Copy vendor CSS from "src" to "dist"
function copyVendorCSS() {
  return src(["./src/css/**/*", "!./src/css/main*.css"]).pipe(dest(paths.styles.dest));
}

// Copy vendor JS from "src" to "dist"
function copyVendorJS() {
  return src(paths.javascript.src.vendors).pipe(dest(paths.javascript.dest.vendors));
}

// Copy fonts from "src" to "dist"
function copyFonts() {
  return src(paths.fonts.src).pipe(dest(paths.fonts.dest));
}

// Revision
function revision() {
  return src(["./dist/**/main*.{css,js}", "!./dist/js/vendors/**"]).pipe(rev()).pipe(dest("./dist/")).pipe(rev.manifest()).pipe(dest("./dist/"));
}

// Rewrite
function rewrite() {
  const manifest = readFileSync("./dist/rev-manifest.json");
  return src("./dist/**/*.html").pipe(revRewrite({ manifest })).pipe(dest("./dist/"));
}

// Dev task
const dev = series(browsersyncServe, compileSCSS, watchChanges);
exports.default = dev;

// Production task
const build = series(cleanDist, copyHTML, copyVendorCSS, copyVendorJS, copyFonts, minifyCSS, minifyJS, compressImg, revision, rewrite);
exports.build = build;
