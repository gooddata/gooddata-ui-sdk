[![npm version](https://badge.fury.io/js/%40gooddata%2Fgooddata-js.svg)](https://www.npmjs.com/package/@gooddata/gooddata-js) 
# GoodData JS SDK
> Thin javascript abstraction over the GoodData REST API

## Getting started
* For rich visualizations, please use the **GoodData.UI**:
    - [GoodData.UI Documentation](http://sdk.gooddata.com/gooddata-ui/)
    - [GoodData.UI React components](https://github.com/gooddata/gooddata-react-components) repository
    - the [Execute component](https://sdk.gooddata.com/gooddata-ui/docs/execute_component.html) for custom visualizations
* gooddata-js serves for specific background tasks, but it could be used for small applications both in the browser and in the node.js environment.

## Usage
### Using as a npm package
1) go to your project directory and add the package: \
      → with [yarn](https://yarnpkg.com): `yarn add @gooddata/gooddata-js` \
      → with [npm](npmjs.com): `npm install --save @gooddata/gooddata-js`
    
    :heavy_exclamation_mark: **WARNING: npm package renamed from `gooddata` to `@gooddata/gooddata-js`** :heavy_exclamation_mark:

2) import the package's default export: \
    → in transpiled browser app with ES6 modules syntax: `import gooddata from '@gooddata/gooddata-js';` \
    → in node.js with CommonJS syntax: `const gooddata = require('@gooddata/gooddata-js').default;`
 
4) call the API:
    ```js
    gooddata.config.setCustomDomain('secure.gooddata.com');
    gooddata.user.login('john.doe@example.com', 'your-secret-password')
        .then((response) => console.log('Login OK', response))
        .catch((apiError) => console.error('Login failed', apiError, "\n\n", apiError.responseBody));

    ```
    
5) Please note that CORS could prevent the request. Refer to [your options in GoodData.UI documentation](https://sdk.gooddata.com/gooddata-ui/docs/cors.html), ie. setup local proxy or ask the GoodData platform for allowing a specific domain. 

    


### Using as a standalone library
You have two options:
  - [download `gooddata.js` or `gooddata.min.js`](https://unpkg.com/@gooddata/gooddata-js@latest/dist/) from the latest release
  - build on your own:
    ```bash
    git clone https://github.com/zbycz/gooddata-js.git
    cd gooddata-js
    git checkout v6.0.0 # choose a version, or omit this line to use unstable code from `master` branch
    yarn install --pure-lockfile
    yarn build
    # get gooddata.js and gooddata.min.js from /dist folder
    ```

Than you can import the library file and global variable `gooddata` contains all exported members:
```html
<script type="text/javascript" src="gooddata.js"></script>
<script type="text/javascript">
    var sdk = gooddata.default;
    sdk.user.login('john.doe@example.com', 'your-secret-password')
</script>
``` 

## Contributing :coffee:

We welcome any contribution in form of [issues](https://github.com/gooddata/gooddata-js/issues) or [pull requests](https://github.com/gooddata/gooddata-js/pulls).
These commands may come in handy while developing: 

| command | description |
| ------- | ----------- |
| `yarn install --pure-lockfile` | first step |
| `yarn dev` | build gooddata-js to `/dist` in watch mode |
| `yarn test` | run unit tests in watch mode |
| `yarn validate` | validate codestyle (tslint) |
| `yarn build` | build commonjs `/lib` and bundle files to `/dist`  |


#### NPM package publishing
```bash
# only for internal gooddata developers
git checkout master && git pull upstream master --tags
yarn version
npm publish
git push upstream master --tags
```


## Changelog
- see [CHANGELOG.md](CHANGELOG.md)


## License
(C) 2007-2018 GoodData Corporation

For more information, please see [LICENSE](https://github.com/gooddata/gooddata-js/blob/master/LICENSE)
