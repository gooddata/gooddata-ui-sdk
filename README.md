[![npm version](https://badge.fury.io/js/%40gooddata%2Freact-components.svg)](https://www.npmjs.com/package/@gooddata/react-components) 

# GoodData.UI React components
> A React-based JavaScript library for building data-driven applications

## Getting started
- [GoodData.UI Documentation](http://sdk.gooddata.com/gooddata-ui/)
- [GoodData.UI Live Examples](https://gooddata-examples.herokuapp.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/gooddata)

### Usage
With [yarn](https://yarnpkg.com) installed, go to your project directory and run
```
$ yarn add @gooddata/react-components
```
If you prefer [npm](npmjs.com) run
```
$ npm install --save @gooddata/react-components
```

The public API is exposed via global `index.js`. Except for the styles, do not import any other file directly
because they are not intended to be part of the public API.

## Contributing

We welcome any contribution in form of [issues](https://github.com/gooddata/gooddata-react-components/issues) or [pull requests](https://github.com/gooddata/gooddata-react-components/pulls).
These commands may come in handy while developing:

| command | description |
| ------- | ----------- |
| `yarn install --pure-lockfile` | first step |
| ||
| `yarn dev` | build react-components to `/dist` in watch mode |
| `yarn test` | run all unit tests |
| `yarn prettier-write` | format the source code to match the valid codestyle |
| `yarn validate` | validate codestyle |
| ||
| `yarn storybook` | run storybook from `/stories` on http://localhost:9001 |
| `yarn build-storybook` | build storybook to `/dist-storybook` |
| `yarn test-storybook` | run storybook and [screenshot tests](https://github.com/gooddata/gdc-client-utils/tree/master/test-storybook) |
| ||
| `yarn examples` | run Live Examples dev-server from `/examples` on https://localhost:8999 |
| `yarn examples-build` | build Live Examples to `/examples/dist` |
| `yarn examples-server` | serve built Live Examples - see `/examples/server/src` |
| `yarn examples-testcafe` | run testcafe tests against `localhost:8999` |

### Deploy to heroku.com
When you deploy this repo to heroku, it serves *GoodData.UI Live Examples*.
Relevant tasks are in `Procfile` and `package.json`.

```bash
# run in the project directory
heroku login
heroku create <your-app-name>
heroku config:set DOMAIN_ADMIN_USERNAME=x@gooddata.com DOMAIN_ADMIN_PASSWORD=xy PROJECT_ID_TO_ASSIGN=xms7ga4tf3g3nzucd8380o2bev8oeknp
git push heroku HEAD:master
heroku open
```

### Run Live Examples Locally
To run *GoodData.UI Live Examples* locally:
```bash
git clone <this-repository>
cd  <repository-folder>
yarn install --pure-lockfile
yarn examples
```
Then open https://localhost:8999 and login using Live Examples account (you can [create one here](https://gooddata-examples.herokuapp.com/registration)).

### Source code formatting
The source code in the repository is formatted by [Prettier](https://prettier.io/). 
The format of the code is validated by our Continuous Integration server and is one of the requirements of successful merge.

Prettier is supported by every major IDE. You can find the list of supported editors and how to configure them [here](https://prettier.io/docs/en/editors.html).

In the case, when your editor is not supported or you don't want to setup the integration, you can run the `yarn prettier-write` command to reformat the code before commit.

## Changelog

- see [CHANGELOG.md](CHANGELOG.md)

## License

(C) 2007-2018 GoodData Corporation

This project is dual licensed:

- The ATTRIBUTION-NONCOMMERCIAL 4.0 INTERNATIONAL (CC BY-NC 4.0) is used for purpose of the trial experience and evaluation of GoodData.UI library.
- The GOODDATA GOODDATA.UI LIBRARY END USER LICENSE AGREEMENT is used for GoodData customers.

For more information, please see [LICENSE](https://github.com/gooddata/gooddata-react-components/blob/master/LICENSE)
