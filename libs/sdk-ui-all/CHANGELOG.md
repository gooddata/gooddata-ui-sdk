# Change Log - @gooddata/sdk-ui-all

This log was last generated on Wed, 14 Apr 2021 11:56:54 GMT and should not be manually modified.

## 8.3.0
Wed, 14 Apr 2021 11:56:54 GMT

### Updates

- DateFilter now hides options with visible: false.
- DateFilter now respects name property in AbsoluteForm, RelativeForm and AllTime options.
- Highcharts dependency upgraded from version 7.1.1 to 8.2.2
- Date bucket items no longer removed from request body in loadDateDataset (api-client-bear). If you need to remove bucket date items from the request, you have to filter them manually.
- GoodData.CN compatibility - this version is the first version fully compatible with GoodData.CN backend

## 8.2.0
Thu, 11 Mar 2021 10:47:16 GMT

### Updates

- The ThemeProvider component is no longer in beta and is considered stable.
- DashboardView, a component for embedding dashboards created in KPI Dashboards, is added in the beta stage.
- The capability to validate URLs against an organization’s whitelist is added to the backend. Currently, the implementation supports only the sdk-backend-bear package backend. The sdk-backend-tiger package backend considers all validation requests valid. The responses from the backend are cached by the decorated caching backend layer.

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

