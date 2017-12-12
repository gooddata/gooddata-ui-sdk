# GoodData React Components
> React.js components for building visualizations on top of GoodData platform

## Getting started

### Usage

With [yarn](https://yarnpkg.com) installed, go to your project directory and run
```
$ yarn add @gooddata/react-components
```

If you prefer [npm](npmjs.com) run
```
$ npm install --save @gooddata/react-components
```

## Documentation
[Documentation](https://help.gooddata.com/display/bHsp5IhQjuz0e6HS0s76/React+Components)

## Develop

### Running the development

To develop, you need to run the typescript compiler. By running `yarn dev`, the typescript compiler will be run in watch mode.
```sh
$ cd gooddata-react-components
$ yarn dev
```

If you just need to build the CSS files from SASS, run
```sh
$ yarn build-css
```

To see and validate the react components, you can use [Storybook](https://storybook.js.org/).
To run the storybook in development mode, run
```sh
$ yarn storybook
```

To deploy the production version of storybook, run
```sh
$ yarn build-storybook
```


### Running the tests

To validate using [tslint](https://palantir.github.io/tslint/), run
```sh
$ yarn validate
```

#### Storybook visual regression tests

Visual regression testing for Storybook is provided by [@gooddata/test-storybook](https://github.com/gooddata/gdc-client-utils/tree/master/test-storybook) package.

### Deployment
```
git checkout master && git pull upstream master --tags
npm version [major|minor|patch] -m "Release v%s"
npm publish --access=public
git push upstream master --tags
```

## Contributing
Report bugs and features on our [issues page](https://github.com/gooddata/gooddata-react-components/issues).

## License
Copyright (C) 2007-2017, GoodData(R) Corporation. All rights reserved.

For more information, please see [LICENSE](https://github.com/gooddata/gooddata-react-components/blob/master/LICENSE)
