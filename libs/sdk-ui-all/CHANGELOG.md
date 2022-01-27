# Change Log - @gooddata/sdk-ui-all

This log was last generated on Thu, 27 Jan 2022 08:25:24 GMT and should not be manually modified.

## 8.8.0
Thu, 27 Jan 2022 08:25:24 GMT

### Updates

- Support for React 17 was added. React 16 is still supported as well.
- UI controls for sharing a dashboard with other users were added.
- The SPI was extended with the option for managing access permissions of a metadata object.
- The SPI was extended with the option for querying user groups in a workspace.
- The workspace user service was extended with the option for querying users per page.
- The workspace dashboard service was extended with the option for querying dashboards that are accessible only via their URL.
- The workspace dashboard interface was extended with information about sharing status and access control mode.
- The IListedDashboard interface was extended with the "availability" field.
- The bug with dashboardPluginHosts validation was fixed.
- Geo pushpin charts no longer support Internet Explorer 11.
- The option for setting compatibility of dashboard plugins with the minEngineVersion and maxEngineVersion properties was added.

## 8.7.1
Tue, 14 Dec 2021 13:31:37 GMT

### Updates

- Fixed bug with dashboardPluginHosts validation

## 8.7.0
Thu, 02 Dec 2021 08:24:11 GMT

### Updates

- Dashboard, a component for embedding dashboards created in KPI Dashboards, is added in the beta stage.

## 8.6.0
Thu, 07 Oct 2021 11:37:01 GMT

### Updates

- Opt-in support for loading user information when loading insights and dashboards was added.
- Support for data sampling in the charts and the DashboardView component through execution configuration was added (available only in GoodData.CN for Vertica).

## 8.5.1
Thu, 26 Aug 2021 13:55:29 GMT

### Updates

- Some redundant token requests prevented.

## 8.5.0
Thu, 08 Jul 2021 09:09:51 GMT

### Updates

- Support for the data sampling feature of GoodData.CN is added.
- Support for approximate count aggregation in GoodData.CN is added.
- The AttributeFilterButton component with DateFilter-like styles was added.
- Support for parent-child filtering was added to the AttributeFilter and AttributeFilterButton components.

## 8.4.0
Thu, 03 Jun 2021 09:24:58 GMT

### Updates

- The DateFilter component is no longer in beta and is considered stable.
- In the DateFilter component, the availableGranularities property of relativeForm is deprecated. Use availableGranularities instead.
- The option to disable tooltips in charts is added.
- The showTitle property and the onInsightLoaded property are added to the InsightView component.
- Visualization definition placeholders are added.
- The option to make the legend appear as a popup if the visualization is rendered in a too small container is added.
- The includeDateGranularities parameter is added to the loadDateDateDataSets request payload.
- The Execute components are extended to support LoadingComponent and ErrorComponent.
- The layout customizations of the DashboardView component are supported in GoodData.CN.
- The useBackendStrict and useWorkspaceStrict hooks are added for better developer experience.

## 8.3.1
Fri, 14 May 2021 12:00:31 GMT

### Updates

- Fixed logout flow on Tiger >=1.1

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

