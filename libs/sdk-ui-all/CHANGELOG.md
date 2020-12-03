# Change Log - @gooddata/sdk-ui-all

This log was last generated on Thu, 03 Dec 2020 09:40:04 GMT and should not be manually modified.

## 8.1.0
Thu, 03 Dec 2020 09:40:04 GMT

### Updates

- The dateFormat property from a BaseVisualization is passed to the definition of an IPreparedExecution and is transformed in the BearDataView so that the dates in the AFM execution response can be displayed in the desired format.
- The catalog-export tool generates comprehensive DateDataset mapping.
- ESM builds are added to allow the bundlers supporting them to employ tree shaking and reduce the size of the bundles.
- The sdk-ui-theme-provider library containing the ThemeProvider component is added. The component fetches the selected theme object, parses it, and injects the generated CSS variables into the document body to theme the wrapped application.
- The date format settings are loaded from the backend to the InsightView component.
- A tooltip is added to the value of a ranking filter.
- The date format option is added to the Date Filter component.
- Hook alternatives for the Execute component (useCancelablePromise, useDataView, useExecution, and useDataExport) are added.

## 8.0.0
Thu, 08 Oct 2020 07:51:36 GMT

_Initial release_

