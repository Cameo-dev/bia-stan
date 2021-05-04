const Path = require('path');
const { DateTime } = require("luxon");
const fs = require("fs");
const pluginNavigation = require("@11ty/eleventy-navigation");
const Image = require('@11ty/eleventy-img');
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const pluginSass = require('eleventy-plugin-sass');
const metagen = require('eleventy-plugin-metagen');
const criticalCss = require('eleventy-critical-css');
const htmlmin = require('html-minifier');
const {minify} = require('terser');
const slugify = require('slugify');
const pluginInjector = require('@infinity-interactive/eleventy-plugin-injector');

const DEFAULT_DOMAIN = 'localhost:8080';

module.exports = function(eleventyConfig) {
  const pathPrefix = process.env.PATH_PREFIX || '/';

  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.addPlugin(pluginSass, {
		watch: 'scss/**/*.{scss,sass}',
		outputDir: '_site/css',
		sourcemaps: true
	});
  eleventyConfig.addPlugin(criticalCss, {
    css: ['_site/css/*.css'],
    minify: true
  });
  eleventyConfig.addPlugin(metagen);
  //eleventyConfig.addPlugin(pluginInjector, {
    //watch: 'js/*.js',
    //inject: async (instance, options, file) => {
      //try {
        //fs.mkdirSync('_site')
        //fs.mkdirSync('_site/js')
      //} catch(e) {[> console.error(e);<] }
      //const code = {
        //'index.js': fs.readFileSync('js/index.js', {encoding: 'utf-8'}),
        //'splide.js': fs.readFileSync('js/splide.js', {encoding: 'utf-8'})
      //};
      //const result = await minify(code);
      //fs.writeFileSync('_site/js/index.js', result.code);
    //}
  //});

  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addNunjucksShortcode("image", (src, alt, sizes, classes, widths) => {
    const options = {
      widths: widths ? widths.split(' ').map(s => parseInt(s, 10)) : [300],
      formats: ["webp"],
      outputDir: '_site/img',
      urlPath: pathPrefix + 'img/'
    };

    Image(src, options);

    const metadata = Image.statsSync(src, options);

    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
      class: `img-fluid ${classes || ''}`
    };

    return Image.generateHTML(metadata, imageAttributes);
  })

  eleventyConfig.addFilter("date", (dateObj, format) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat(format);
  });

  eleventyConfig.addFilter("slug", str => {
    return slugify(str).toLowerCase();
  });

  eleventyConfig.addFilter("absolute", url => {
    let domain, protocol;
    if(process.env.DOMAIN) {
      domain = process.env.DOMAIN;
      protocol = 'https://';
    } else {
      domain = DEFAULT_DOMAIN;
      protocol = 'http://';
    }
    const prefixedUrl = Path.join(pathPrefix, url);
    return protocol + Path.join(domain, prefixedUrl);
  })

  eleventyConfig.addFilter("pad", number => {
    return number.toString().padStart(2, '0');
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if( n < 0 ) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  eleventyConfig.addFilter('log', (elem) => {
    console.log(elem);
  });
  eleventyConfig.addFilter('selectPublished', (elem) => {
    return elem.filter((entry) => !!entry.data?.published);
  });

  //eleventyConfig.addPassthroughCopy("img");
  //eleventyConfig.addPassthroughCopy("video");
  //eleventyConfig.addPassthroughCopy("fonts");
	eleventyConfig.addPassthroughCopy("js");
	eleventyConfig.addPassthroughCopy("assets");
	//eleventyConfig.addPassthroughCopy({scss: "css"});
  eleventyConfig.addPassthroughCopy("favicon.svg");

  /* Minify HTML */
  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if(outputPath.endsWith(".html") ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }
    return content;
  });

  /* Markdown Overrides */
  let markdownLibrary = markdownIt({
    html: true,
    breaks: false,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: false,
    permalinkClass: "direct-link",
    permalinkSymbol: "#"
  });
  // Remember old renderer, if overridden, or proxy to default renderer
  const defaultRender = markdownLibrary.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  markdownLibrary.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    // If link URL is outside of this domain
    if(tokens[idx].attrGet('href').startsWith('http'))
      tokens[idx].attrPush(['target', '_blank']); // add new attribute

    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self);
  };

  eleventyConfig.setLibrary("md", markdownLibrary);
  eleventyConfig.addFilter('markdown', (string) => {
    return markdownLibrary.render(string);
  });

  // Browsersync Overrides
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = fs.readFileSync('_site/404.html');

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false
  });

  return {
    templateFormats: [
      "md",
      "njk",
      "html",
      "liquid"
    ],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about those.

    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`
    pathPrefix: pathPrefix ? pathPrefix : "/",

    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",

    // These are all optional, defaults are shown:
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
