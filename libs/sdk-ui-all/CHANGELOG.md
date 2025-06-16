# Change Log - @gooddata/sdk-ui-all

This log was last generated on Mon, 16 Jun 2025 14:58:30 GMT and should not be manually modified.

## 10.31.0

Mon, 16 Jun 2025 14:58:30 GMT

_Version update only_

## 10.30.0

Mon, 09 Jun 2025 16:54:46 GMT

### Updates

-   Added method for setting metadata locale to settings services

## 10.29.0

Thu, 05 Jun 2025 07:23:01 GMT

_Version update only_

## 10.28.0

Thu, 29 May 2025 06:57:15 GMT

### Updates

-   Introduced embeddable AI Assistant as part of public API
-   fix attribute filter not reloading values after dropdown close when some search query is not empty
-   fix failing storybook test for AttributeFilterStatusBar
-   Change chart's X axis label autorotation value from -90° to -45°

## 10.27.0

Fri, 16 May 2025 08:01:14 GMT

### Updates

-   Fix irrelevant values info in attribute filter when apply all at once is on

## 10.26.0

Mon, 05 May 2025 06:30:05 GMT

### Updates

-   add property drillStep into InsightBody component so dashboard customizations can behave based on drill context

## 10.25.1

Wed, 23 Apr 2025 14:19:46 GMT

_Version update only_

## 10.25.0

Thu, 17 Apr 2025 06:58:58 GMT

### Updates

-   Make relative range picker more accessible
-   Make relative range picker more accessible

## 10.24.0

Thu, 03 Apr 2025 11:48:06 GMT

### Updates

-   Update minimal node to 22.13.0
-   Fix: Do not reset date filter on cancel click in apply all filters at once mode
-   Bugfix of attribute filter. When together apply all filters and close values dropdown with filled search the app crashes.
-   Dashboard execution and rendering is not blocked by loading of catalog

## 10.23.0

Thu, 20 Mar 2025 09:15:55 GMT

### Updates

-   Update ag-grid-community and ag-grid-react library to latest version
-   Add an option to specify chart tooltip class name
-   Support of new filter mode Apply all at once in Dashboard

## 10.22.0

Thu, 06 Mar 2025 08:46:39 GMT

### Updates

-   New helper factory createRedirectToTigerAuthenticationWithParams to create a parametrized redirectToTigerAuthentication handler. Useful in Federated Identity Management context.
-   Add support for execution cancelling via AbortController.
-   Support workspace and organization level setting for Dashboard filters apply mode
-   Make DashboardAttributeFilter component customizable by prop
-   Add support for enableDashboardFiltersApplyModes feature flag
-   Update HighCharts library to latest version

## 10.20.0

Thu, 20 Feb 2025 08:45:08 GMT

_Version update only_

## 10.19.0

Thu, 06 Feb 2025 07:58:07 GMT

_Version update only_

## 10.18.0

Thu, 23 Jan 2025 08:58:58 GMT

### Updates

-   Introduce NotificationPanel component.

## 10.17.0

Thu, 09 Jan 2025 09:00:05 GMT

_Version update only_

## 10.16.0

Thu, 12 Dec 2024 07:29:13 GMT

### Updates

-   Add support for nested dashboard layouts (hidden behind a feature flag)

## 10.15.0

Thu, 28 Nov 2024 11:23:13 GMT

_Version update only_

## 10.14.0

Thu, 14 Nov 2024 11:46:42 GMT

_Version update only_

## 10.13.0

Thu, 31 Oct 2024 08:50:19 GMT

### Updates

-   attribute filters now allow improved work with duplicate values by default
-   Added new Visualization Switcher widget to render group of visualizations together on dashboard (available for GoodData.CN / GoodData Cloud only).

## 10.12.0

Thu, 17 Oct 2024 06:56:12 GMT

### Updates

-   Introduce support for saved filter views on dashboards. It allows to customize filter context for individual user and dashboard and save it for later use.

## 10.11.0

Thu, 03 Oct 2024 07:11:15 GMT

### Updates

-   Introduce support for saved filter views on dashboards. It allows to customize filter context for individual user and dashboard and save it for later use.

## 10.10.0

Thu, 19 Sep 2024 06:58:04 GMT

### Updates

-   Improved Handling of Secondary Labels in AttributeFilter

## 10.9.0

Thu, 05 Sep 2024 08:14:25 GMT

### Updates

-   Add possibility to ignore specified attributes in the drill down intersection. Modify addDrillDownForInsightWidget and modifyDrillDownForInsightWidget commands to be able to configure it (breaking).

## 10.8.0

Thu, 22 Aug 2024 07:33:19 GMT

### Updates

-   Introduce user filter views to dashboard component

## 10.7.0

Thu, 08 Aug 2024 09:46:36 GMT

### Updates

-   Introduced GenAI Service in sdk-backend-tiger to be able to consume semantic search feeds.
-   Introduced @gooddata/sdk-ui-semantic-search package in alpha stage
-   Top menu UI component now supports a new search button

## 10.6.0

Thu, 25 Jul 2024 08:35:32 GMT

_Version update only_

## 10.5.1

Fri, 12 Jul 2024 11:00:39 GMT

### Updates

-   Fixed display of tooltips in drill dialog

## 10.5.0

Thu, 11 Jul 2024 08:01:45 GMT

### Updates

-   Allow specifying returnTo parameter with backend deauthenticate
-   Adjusted export function to support pdf options.
-   Using visualizationObject whenever provided as alternative to executionResult for export.

## 10.4.0

Thu, 27 Jun 2024 08:11:53 GMT

_Version update only_

## 10.3.0

Thu, 13 Jun 2024 08:17:52 GMT

### Updates

-   Allow different position of ellipsis in ShortenedText component
-   F1-349 Implement webhooks api in tiger functions
-   allow creating a workspace as a child

## 10.2.0

Thu, 30 May 2024 08:50:26 GMT

### Updates

-   API method importCsv now returns update info about file
-   Forecast implementation into line chart
-   Include hierarchy data in workspace descriptor
-   added filter for root workspaces only to workspaces query
-   use only description attribute for workspace description
-   Enhanced export function to support PDF format and added PDF configuration option.

## 10.1.0

Thu, 16 May 2024 08:08:00 GMT

### Updates

-   Added a workspace service for working with export definitions metadata objects

## 10.0.0

Thu, 18 Apr 2024 08:07:32 GMT

### Updates

-   Drop support for the GoodData Platform (Bear) in all packages.
-   Removed the @gooddata/experimental-workspace and @gooddata/live-examples-workspace packages.
-   Removed the sdk-examples package.
-   Package @gooddata/reference-workspace migrated from GoodData Platform (Bear) to GoodData.CN (Panther/Tiger).
-   Removed GoodData Platform (Bear) related packages: @gooddata/api-client-bear, @gooddata/sdk-backend-bear, @gooddata/api-model-bear.
-   Introduced a new visualization type - Repeater, currently in the @beta stage.
-   Introduce ability to limit attribute filter values by dependent date filters on GoodData Cloud dashboards.

## 9.9.2

Wed, 19 Mar 2025 11:50:06 GMT

### Updates

-   Update ag-grid-community and ag-grid-react library to latest version

## 9.9.1

Thu, 18 Apr 2024 11:19:00 GMT

_Version update only_

## 9.9.0

Thu, 21 Mar 2024 09:56:41 GMT

### Updates

-   To unify null values representation replace pattern fill by background color in Heatmap
-   Introduce theme loading status with better information about state of theme loading
-   Add tags to 'measure' objects

## 9.8.1

Fri, 15 Mar 2024 13:31:24 GMT

### Updates

-   Introduce theme loading status with better information about state of theme loading

## 9.8.0

Thu, 07 Mar 2024 09:02:52 GMT

### Updates

-   Rename word 'Insight' to 'Visualization'
-   Add services to list insights and dashboards with paging

## 9.7.0

Thu, 22 Feb 2024 09:17:23 GMT

### Updates

-   Added new RichText widget to render markdown on dashboard (available for GoodData.CN / GoodData Cloud only).
-   Introduced possibility to use multiple date filters (available for GoodData.CN / GoodData Cloud only).
-   Introduce ability to limit attribute filter values by metric on GoodData Cloud dashboards.

## 9.6.0

Thu, 25 Jan 2024 10:00:31 GMT

### Updates

-   Deliver support for multiple date filters fully specified including date data set
-   Introduce cross-filtering highlighting in charts.

## 9.5.0

Thu, 11 Jan 2024 12:13:13 GMT

### Updates

-   Users can create multiple insight interactions per attribute/measure for the Panther environment.
-   Users can create, edit, and delete attribute hierarchies in the UI. Additionally, they can view and interact with a list of drill-down interactions.
-   Support for dependent filters on Tiger backend added. Attribute filter on Tiger can now be dependent on other filters which will effectively filter out some of its elements. It supports circular dependencies in filters, keeping selected values when parent filter changes and showing/clearing of filtered out elements.
-   Introduce cross-filtering for GoodData Cloud
-   Dashboard plugins no longer support version lock of the GoodData.UI dependencies. Since now, all GoodData.UI dependencies will be injected to the plugin in their latest version at runtime. Also improve way to specify compatibility of the plugin.
-   Add support for attribute filter selection in drill to custom url.
-   Enable decorating attribute filters in plugins customization API.
-   Enable decorating dashboard content in plugins customization API.

## 9.4.0

Thu, 30 Nov 2023 11:57:11 GMT

### Updates

-   Users can configure the dashboard filter to be interactive, locked, or hidden.
-   Remove `isDomainAdmin` method from Bear Legacy Functions.

## 9.3.0

Thu, 02 Nov 2023 11:25:49 GMT

### Updates

-   The headline allows two secondary measures to be displayed as the headline values.
-   The headline allows for the customization of comparison values and styles using the comparison config.
-   Introduce possibility to cache client calls

## 9.2.0

Fri, 06 Oct 2023 13:12:04 GMT

### Updates

-   Supporting to share the dashboard with all workspace users.
-   Introduce new attribute hierarchy catalog entity which is used for implicit drill-down in dashboards.

## 9.1.0

Fri, 08 Sep 2023 07:19:23 GMT

### Updates

-   Added support for pivot tables, allowing you to transpose column headers to rows for more flexible data analysis.
-   The pivot table allows metrics to be placed in rows instead of columns.
-   Optimized attribute filter to fetch element counts only for child filters, reducing overhead and improving performance by not fetching the total count of elements by default.
-   Sdk-backend-tiger now supports the following entity properties: createdAt, createdBy, modifiedAt, modifedBy for the following analytical objects: insight, analytical dashboard, dashboard plugin, metric.
-   Sdk-backend-tiger now supports JWT authentication.
-   Added support for Waterfall chart visualizations.

## 9.0.1

Thu, 17 Aug 2023 13:20:29 GMT

_Version update only_

## 9.0.0

Thu, 27 Jul 2023 12:35:32 GMT

### Updates

-   catalog-export: unified the way configuration is loaded for tiger and bear
-   sdk-backend-tiger: add apis to config localization, timezone for organization
-   Change build target of all libraries to ES2017
-   update minimal node version to 16.20.0
-   Single selection variant of Attribute Filter component
-   Remove all enzyme related packages and rewrite tests to react testing library.
-   Upgrade TypeScript to v5.
-   Add Dependency wheel chart visualizations.
-   Add Sankey chart visualizations.
-   Add @gooddata/app-toolkit as replacement for @gooddata/create-gooddata-react-app
-   Deprecated APIs were removed.
-   Attribute Filter Dropdown button supports description customisation in form of tooltip
-   Add Funnel chart and Pyramid chart visualizations.
-   The new SPI export methods for downloading of insight and dashboard export data were added. The methods attach exported data as a blob to current browser window instance and return Object URL pointing to the blob and name of the downloaded file. There is no need to export data manually via URI. The dashboard component uses these new methods now. This means that export from dashboard component works even when provided backend uses Tiger token authentication.
-   Make it possible to hide/show on demand the web components tab on embedding dialogs
-   Add the continuous line configuration for the Line, Area and Combo charts

## 8.12.3

Thu, 05 Oct 2023 07:58:45 GMT

### Updates

-   Use @gooddata/number-formatter instead of @gooddata/numberjs library

## 8.12.2

Wed, 19 Jul 2023 14:12:54 GMT

### Updates

-   The new SPI export methods for downloading of insight and dashboard export data were added. The methods attach exported data as a blob to current browser window instance and return Object URL pointing to the blob and name of the downloaded file. There is no need to export data manually via URI. The dashboard component uses these new methods now. This means that export from dashboard component works even when provided backend uses Tiger token authentication.

## 8.12.1

Mon, 17 Apr 2023 08:24:37 GMT

### Updates

-   Add fallback for unknown visualization types of insights

## 8.12.0

Thu, 09 Mar 2023 08:43:20 GMT

### Updates

-   Dashboard component and dashboard plugins now supports edit mode.
-   Insights and dashboard widgets now allow to specify description in form of tooltips.
-   Analytical dashboards created in GoodData Cloud are now created as private visible only to the creator and to all organization and workspace administrators. SDK allows granular sharing of any dashboard with selected users and user groups. Dashboard permissions can be managed via SPI library and are fully integrated into the Dashboard component.
-   Export permissions have been made more granular and the EXPORT permission now includes both EXPORT_TABULAR and EXPORT_PDF. Export permissions can also be set individually to allow exports to certain formats only.
-   Improved GoodData Cloud formatting of date attributes based on locale user setting and defined formatting pattern.
-   Add support for PDF export for GoodData Cloud.
-   Support Geo Pushpin chart for GoodData Cloud.

## 8.11.0

Thu, 20 Oct 2022 09:18:18 GMT

### Updates

-   Improved custom attribute filters were added. We added support for customization of the AttributeFilter and AttributeFilterButton components and new features, such as static and hidden elements.
-   Dashboard plugins APIs to customize attribute filters were added. You can now customize the attribute filters with dashboard plugins.
-   Core API for attribute filter components was added. These components now allow implementation of custom attribute filters.
-   SDK SPI ability for white-labeling was added. You can enable white-labeling for your organization.
-   Mapbox token React provider was added.
-   The withCaching backend decorator has been made public. RecommendedCachingConfiguration from @gooddata/sdk-backend-base can be used to configure backend caching.

## 8.10.0

Thu, 14 Jul 2022 08:56:22 GMT

### Updates

-   DashboardView component was removed. Use Dashboard component from @gooddata/sdk-ui-dashboard instead.
-   Support for GoodData Cloud was added.
-   Dashboard filterContext selectors are public now.
-   Dashboard component user and permissions selectors are public now.
-   Catalog load is now more optimized for GoodData Platform.
-   Model interfaces from @gooddata/sdk-backend-spi were moved to @gooddata/sdk-model.
-   Global Dashboard CSS styles were removed.
-   SVG and CSS imports in typescript files were removed, GoodData.UI can be used without an additional bundler setup now
-   Execution definition by slices/series can be now used without React. You can use the DataViewLoader @alpha version from @gooddata/sdk-ui.
-   The useDashboardAsyncRender hook and related commands and events that inform about the dashboard rendering status are now public.

## 8.9.0

Thu, 17 Mar 2022 12:48:39 GMT

### Updates

-   The dashboard commands and events related to filter modification were included in the public API.
-   The general dashboard events (such as DashboardSaved) were included in the public API.
-   The useDispatchDashboardCommand hook was added to make dispatching of the Dashboard commands easier.
-   The DashboardStoreAccessor, SingleDashboardStoreAccessor and DashboardStoreAccessorRepository classes were added to enable handling of the state of the Dashboard component outside the component itself.

## 8.8.0

Thu, 27 Jan 2022 08:25:24 GMT

### Updates

-   Support for React 17 was added. React 16 is still supported as well.
-   UI controls for sharing a dashboard with other users were added.
-   The SPI was extended with the option for managing access permissions of a metadata object.
-   The SPI was extended with the option for querying user groups in a workspace.
-   The workspace user service was extended with the option for querying users per page.
-   The workspace dashboard service was extended with the option for querying dashboards that are accessible only via their URL.
-   The workspace dashboard interface was extended with information about sharing status and access control mode.
-   The IListedDashboard interface was extended with the "availability" field.
-   The bug with dashboardPluginHosts validation was fixed.
-   Geo pushpin charts no longer support Internet Explorer 11.
-   The option for setting compatibility of dashboard plugins with the minEngineVersion and maxEngineVersion properties was added.

## 8.7.1

Tue, 14 Dec 2021 13:31:37 GMT

### Updates

-   Fixed bug with dashboardPluginHosts validation

## 8.7.0

Thu, 02 Dec 2021 08:24:11 GMT

### Updates

-   Dashboard, a component for embedding dashboards created in KPI Dashboards, is added in the beta stage.

## 8.6.0

Thu, 07 Oct 2021 11:37:01 GMT

### Updates

-   Opt-in support for loading user information when loading insights and dashboards was added.
-   Support for data sampling in the charts and the DashboardView component through execution configuration was added (available only in GoodData.CN for Vertica).

## 8.5.1

Thu, 26 Aug 2021 13:55:29 GMT

### Updates

-   Some redundant token requests prevented.

## 8.5.0

Thu, 08 Jul 2021 09:09:51 GMT

### Updates

-   Support for the data sampling feature of GoodData.CN is added.
-   Support for approximate count aggregation in GoodData.CN is added.
-   The AttributeFilterButton component with DateFilter-like styles was added.
-   Support for parent-child filtering was added to the AttributeFilter and AttributeFilterButton components.

## 8.4.0

Thu, 03 Jun 2021 09:24:58 GMT

### Updates

-   The DateFilter component is no longer in beta and is considered stable.
-   In the DateFilter component, the availableGranularities property of relativeForm is deprecated. Use availableGranularities instead.
-   The option to disable tooltips in charts is added.
-   The showTitle property and the onInsightLoaded property are added to the InsightView component.
-   Visualization definition placeholders are added.
-   The option to make the legend appear as a popup if the visualization is rendered in a too small container is added.
-   The includeDateGranularities parameter is added to the loadDateDateDataSets request payload.
-   The Execute components are extended to support LoadingComponent and ErrorComponent.
-   The layout customizations of the DashboardView component are supported in GoodData.CN.
-   The useBackendStrict and useWorkspaceStrict hooks are added for better developer experience.

## 8.3.1

Fri, 14 May 2021 12:00:31 GMT

### Updates

-   Fixed logout flow on Tiger >=1.1

## 8.3.0

Wed, 14 Apr 2021 11:56:54 GMT

### Updates

-   DateFilter now hides options with visible: false.
-   DateFilter now respects name property in AbsoluteForm, RelativeForm and AllTime options.
-   Highcharts dependency upgraded from version 7.1.1 to 8.2.2
-   Date bucket items no longer removed from request body in loadDateDataset (api-client-bear). If you need to remove bucket date items from the request, you have to filter them manually.
-   GoodData.CN compatibility - this version is the first version fully compatible with GoodData.CN backend

## 8.2.0

Thu, 11 Mar 2021 10:47:16 GMT

### Updates

-   The ThemeProvider component is no longer in beta and is considered stable.
-   DashboardView, a component for embedding dashboards created in KPI Dashboards, is added in the beta stage.
-   The capability to validate URLs against an organization’s whitelist is added to the backend. Currently, the implementation supports only the sdk-backend-bear package backend. The sdk-backend-tiger package backend considers all validation requests valid. The responses from the backend are cached by the decorated caching backend layer.

## 8.1.0

Thu, 03 Dec 2020 09:40:04 GMT

### Updates

-   The dateFormat property from a BaseVisualization is passed to the definition of an IPreparedExecution and is transformed in the BearDataView so that the dates in the AFM execution response can be displayed in the desired format.
-   The catalog-export tool generates comprehensive DateDataset mapping.
-   ESM builds are added to allow the bundlers supporting them to employ tree shaking and reduce the size of the bundles.
-   The sdk-ui-theme-provider library containing the ThemeProvider component is added. The component fetches the selected theme object, parses it, and injects the generated CSS variables into the document body to theme the wrapped application.
-   The date format settings are loaded from the backend to the InsightView component.
-   A tooltip is added to the value of a ranking filter.
-   The date format option is added to the Date Filter component.
-   Hook alternatives for the Execute component (useCancelablePromise, useDataView, useExecution, and useDataExport) are added.

## 8.0.0

Thu, 08 Oct 2020 07:51:36 GMT

_Initial release_
