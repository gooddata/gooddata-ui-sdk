# Gooddata React examples

This is example catalogue with basic showcases of what is possible to do with [@gooddata/react-components](https://github.com/gooddata/gooddata-react-components).

### Running examples

By default it runs with `@gooddata/react-components` aliased to `../dist`, 
so you have to install & build the parent folder first.

```
gooddata-react-components $ yarn install
gooddata-react-components $ cd examples
gooddata-react-components/examples $ yarn install
gooddata-react-components/examples $ yarn dev
```
Then visit [https://localhost:8999](https://localhost:8999).

All examples use metrics,attributes and visualizations from the 'RAIL demo project'. 
Please make sure you have access to this project. You may find its projectId in [catalogs/catalog-secure.json](catalogs/catalog-secure.json)


## Notes for GoodData developers (internal servers)

* `yarn dev` or `yarn dev-secure` (https://secure.gooddata.com/)
* `yarn dev-staging2` (https://staging2.intgdc.com/)
* `yarn dev-staging3` (https://staging3.intgdc.com/)
* `yarn dev-client-demo-be` (https://client-demo-be.na.intgdc.com/)

### Updating demo project

When you add new objects to the RAIL demo project, please ask Jirka Šitina to distribute it across all dev servers.
Then regenerate the catalog files, consider updating the .gdcatalogrc file with your credentials.
The project is matched by name, make sure you have view persmission.

* `yarn catalog` (all servers)
* `yarn catalog-secure` (https://secure.gooddata.com/)
* `yarn catalog-staging2` (https://staging2.intgdc.com/)
* `yarn catalog-staging3` (https://staging3.intgdc.com/)
* `yarn catalog-client-demo-be` (https://client-demo-be.na.intgdc.com/)
