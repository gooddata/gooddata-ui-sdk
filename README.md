# Gooddata JS SDK
GoodData javascript sdk library mainly provides a thin javascript abstraction
over the GoodData REST API. It is created to makes it easy to use the GD platform
and write small javascript apps relying on GD APIs.

## Quick start
To build the sdk you need to have [git](http://git-scm.com) and [Node.js](http://nodejs.org)
and installed. MacOS users should install [Homebrew](http://mxcl.github.com/homebrew/)
first and then run:  
```
$ brew install git
$ brew install node
```
Now, clone this repo with `$ git clone git@github.com:gooddata/gd-sdk-js.git`
and get the library dependecies with  
```
$ npm install -g grunt-cli
$ npm install
```
## Build
In the repository run:  
```
$ grunt
```
and the built library is ready for you at `buid/gd-sdk-js.min.js`

## Tests
Run tests with:  
`$ grunt test`

## TODO
* grunt dev (grizzly integration)
* examples
* starter template for custom app
* modules using ES6?
* profit
