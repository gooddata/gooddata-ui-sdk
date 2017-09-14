# GoodData JS SDK
GoodData javascript sdk library mainly provides a thin javascript abstraction
over the GoodData REST API. It is created to makes it easy to use the GD platform
and write small javascript apps relying on GD APIs.

## Usage

GoodData javascript sdk can be used as bower component. The result of the build is
in `dist/gooddata[.min].js`. Result of the build [UMD](https://github.com/umdjs/umd)-compatible -
you can use it both globally (see [D3 example][d3ex]) and as AMD module. Note that you need to provide
jQuery before trying to load sdk. In both AMD and CommonJS environment we expect jQuery library module
to be named `jquery`.

### Node JS

You can use the SDK in nodejs, but do not forget to set custom domain URL:
```js
const gooddata = require('gooddata');
const getStream = require('get-stream');

gooddata.config.setCustomDomain('secure.gooddata.com');

gooddata.user.login('john.doe@example.com', 'your-secret-password')
    .then(() => console.log('Success'))
    .catch((e) => {
        getStream(e.response.body).then(str => console.error(str))
    });
```

## Quick start
To build the sdk you need to have [git](http://git-scm.com) and [Node.js](http://nodejs.org)
installed. MacOS users should install [Homebrew](http://mxcl.github.com/homebrew/)
first and then run:
```
$ brew install git node yarn
```
Now, clone this repo with `$ git clone git@github.com:gooddata/gooddata-js.git`
and get the library dependecies with
```
$ yarn install
```
## Build
In the repository run:
```
$ grunt
```
and the built library is ready for you at `dist/gooddata.min.js`

## Develop
It is easy to start your own project with this repository or modify and explore
examples depicting some of the sdk usages. To start with examples run:
```
$ grunt dev
```
Which starts proxy that allows your script to communicate with [secure.gooddata.com](https://secure.gooddata.com)
(backend can be changed with `$ grunt dev --backend=some-other-backend.na.getgooddata.com`).

To run some of the examples, first you need to update credentials in the related js file.
In case of d3-data-viz example you need to edit
[viz.js](https://github.com/gooddata/gooddata-js/blob/develop/examples/d3-data-viz/viz.js)
file and update `user` and `passwd` variables. Then just add the name of the example to URL like
[localhost:8443/d3-data-viz](https://localhost:8443/d3-data-viz) and you should get a nice chord
chart rendered in a while.

## Documentation
Documentation of functions available in SDK can be found at [sdk.gooddata.com/gooddata-js/api](http://sdk.gooddata.com/gooddata-js/api).
It can be generated right from the source code by running:
```
$ grunt doc
```

## Tests
Run tests with:
```
$ grunt test
```
Test coverage report can be found in `coverage/` folder.

## Releasing
New version of library can be released with `grunt release:[major|minor|patch]` task (major|minor|patch means
breaking|feature|fix respectively). For all options see [grunt-bump task][vjBump].

Task is meant to be run from `master` branch of this repository.

Flow of release is:

* bump version to version+1 in `bower.json` and `package.json`
* create version commit & tag and push these to your *upstream* remote (so watch your remote naming)
* create version commit & tag and push product of build (`dist/*`) to `gooddata/bower-gooddata-js` repository

Steps to publish a release:

* you should have `gooddata/gooddata-js` as `upstream` since all tasks publish to upstream remote
* run `grunt release:{version-type}` in `master`
* run `grunt bump-gh-pages` in `master`
* run `npm publish` in `master`
* you're done

[d3ex]: examples/d3-data-viz/viz.js
[vjBump]: https://github.com/vojtajina/grunt-bump
