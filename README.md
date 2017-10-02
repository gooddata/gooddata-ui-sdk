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
[Documentation in Confluence](https://confluence.intgdc.com/display/VS/React+Components)

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

### Deployment
```
git checkout master && git pull upstream master --tags
npm version patch -m "Release v%s"
npm publish --access=restricted
git push upstream master --tags
```

## Contributing
Report bugs and features on our [issues page](https://github.com/gooddata/gooddata-react-components/issues).

## License
Copyright (C) 2007-2017, GoodData(R) Corporation. All rights reserved.

For more information, please see [LICENSE](https://github.com/gooddata/gooddata-react-components/blob/master/LICENSE)
