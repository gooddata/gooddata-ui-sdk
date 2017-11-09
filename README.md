# GoodData Typings
> TypeScript interfaces used in UI SDK describing executeAfm API

## Getting started

### Usage

With [yarn](https://yarnpkg.com) installed, go to your project directory and run
```
$ yarn add -D @gooddata/typings
```

If you prefer [npm](npmjs.com) run
```
$ npm install --save-dev @gooddata/typings
```

## Documentation
[Documentation](https://help.gooddata.com/display/bHsp5IhQjuz0e6HS0s76/React+Components)

## Develop

### Running the development

To develop, you need to run the typescript compiler. By running `yarn dev`, the typescript compiler will be run in watch mode.
```sh
$ cd gooddata-typings
$ yarn dev
```


### Deployment
```
git checkout master && git pull upstream master --tags
npm version [major|minor|patch] -m "Release v%s"
npm publish
git push upstream master --tags
```

## Contributing
Report bugs and features on our [issues page](https://github.com/gooddata/gooddata-typings/issues).

## License
Copyright (C) 2007-2017, GoodData(R) Corporation. All rights reserved.

For more information, please see [LICENSE](https://github.com/gooddata/gooddata-typings/blob/master/LICENSE)
