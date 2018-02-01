# Gooddata React examples

This is example catalogue with basic showcases of what is possible to do with [@gooddata/react-components](https://github.com/gooddata/gooddata-react-components).

## Running examples

### Install prerequisites

```
yarn install
```

### Running locally

These examples rely on 'RAIL demo project'. Please make sure you have access to this project. The examples run by default against https://secure.gooddata.com/ backend.

Some keys may not match your project. To fix this, regenerate catalog files for target servers. Consider updating the .gdcatalogrc file with your credentials and/or custom project name.

* `yarn catalog` (all servers)
* `yarn catalog-secure` (https://secure.gooddata.com/`)
* `yarn catalog-staging2` (https://staging2.intgdc.com/`)
* `yarn catalog-staging3` (https://staging3.intgdc.com/`)
* `yarn catalog-client-demo-be` (https://client-demo-be.na.intgdc.com/`)

Then run the dev server against a server of your choice.

* `yarn dev` or `yarn dev-secure` (https://secure.gooddata.com/`)
* `yarn dev-staging2` (https://staging2.intgdc.com/`)
* `yarn dev-staging3` (https://staging3.intgdc.com/`)
* `yarn dev-client-demo-be` (https://client-demo-be.na.intgdc.com/`)

Then go to [https://localhost:8999](https://localhost:8999). You will be redirected to the login screen of the target server.
