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


## Contributing

We welcome any contribution in form of [issues](https://github.com/gooddata/gooddata-react-components/issues) or [pull requests](https://github.com/gooddata/gooddata-react-components/pulls).
These commands may come in handy while developing:

| command | description |
| ------- | ----------- |
| `yarn install --pure-lockfile` | first step |
| ||
| `yarn dev` | build react-components to `/dist` in watch mode |
| `yarn test` | run all unit tests |
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

## Changelog
- see [CHANGELOG.md](CHANGELOG.md)

## License
(C) 2007-2018 GoodData Corporation

For more information, please see [LICENSE](https://github.com/gooddata/gooddata-react-components/blob/master/LICENSE)
