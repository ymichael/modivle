![MODIVLE source](http://dl.dropbox.com/u/24733998/modivleblack.png)

Application is hosted on github pages!

## Overview
- The app uses localstorage to manage state, allowing it to be deployed on github pages.
- [gulp](gulpjs.com) is use as the build tool
- [react](https://facebook.github.io/react/) is used in the view layer.
- [browserify](browserify.org) is used to package the various source files.
- [less](lesscss.org) is used to manage the stylesheets.

## Running the app

This builds the various assets, starts a webserver in the root directory and opens `localhost:8000`.

```sh
$ gulp dev
```

It automatically watches for changes and rebuilds the assets.

## Setting up the development environment

1. Install gulp, browserify
2. Install dependencies: `npm install`
3. Run `gulp dev` (to start webserver).
4. Run `gulp min` to generate minified assets for production.

See `gulpfile.js` for other tasks.

## Sessions

The code for user sessions can be found in `javascript/auth.js`.

This file is included at the top of both `welcome.html` and `index.html` so that we don't download the rest of the page if we need to redirect the user to the correct location.

## Contributions
- Feedback, Bugs, Contributions are most welcomed!
