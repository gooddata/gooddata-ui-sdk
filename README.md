# GoodData JS SDK
GoodData javascript sdk library mainly provides a thin javascript abstraction
over the GoodData REST API. It is created to makes it easy to use the GD platform
and write small javascript apps relying on GD APIs.

## Quick start
To build the sdk you need to have [git](http://git-scm.com) and [Node.js](http://nodejs.org)
installed. MacOS users should install [Homebrew](http://mxcl.github.com/homebrew/)
first and then run:
```
$ brew install git
$ brew install node
```
Now, clone this repo with `$ git clone git@github.com:gooddata/gd-sdk-js.git`
and get the library dependecies with
```
$ npm install -g grunt-cli
$ npm install -g bower
$ npm install
$ bower install
```
## Build
In the repository run:
```
$ grunt
```
and the built library is ready for you at `dist/gd-sdk-js.min.js`

## Develop
It is easy to start your own project with this repository or modify and explore
examples depicting some of the sdk usages. To start with examples run:
```
$ grunt dev
```
Which starts proxy that allows your script to communicate with [secure.gooddata.com](https://secure.gooddata.com)
(backend can be changed with `$ grunt dev --backend=some-other-backend.na.getgooddata.com`).
Check the app at [localhost:8443](https://localhost/8443)
To run some of the examples, just add the name of the example to URL like
[localhost:8443/d3-data-viz](https://localhost:8443/d3-data-viz)

## Documentation
Documentation of functions available in SDK can be found in [docs/sdk.md](./docs/sdk.md).  
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

## TODO
* examples
* starter template for custom app
* modules using ES6?
* profit
