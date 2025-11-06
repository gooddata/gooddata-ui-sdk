# Change Log - @gooddata/sdk-ui-all

This log was last generated on Thu, 06 Nov 2025 08:32:11 GMT and should not be manually modified.

## 11.8.0

Thu, 06 Nov 2025 08:32:11 GMT

### Updates

- sdk-ui-dashboard: filters config and date dataset selection for rich text
- sdk-model: Add `isHidden` property to metadata objects.
- sdk-backend-tiger: Added support for reading and writing the `isHidden` property on metadata objects.
- sdk-ui-catalog: Introduce UI toggle for hiding objects from AI results
- api-client-tiger: Update generated client.
- sdk-ui-gen-ai: Do not show hidden objects in AI chat suggestions.
- sdk-model: Extend quality issue types with `attributeName` and `title`.
- sdk-ui-kit: Update `UiCard` and `UiDrawer` styles to match the latest design.
- sdk-ui-catalog: Implement catalog detail validations tab redesign with new interactions.
- sdk-ui-catalog: Redesign the filters.
- sdk-backend: Enhance `IFilterBaseOptions` with exclusion fields.
- sdk-ui-catalog: Filter queries now support excluding filter values when 'All except ...' option is selected.
- sdk-ui-catalog: Implement filter reset button allowing users to clear all applied filters with a single action.
- sdk-model: Add `status` field to `ISemanticQualityReport` in order to track the status of the quality report calculation.
- sdk-backend-tiger: Add `AbortSignal` support to semantic quality service `getQualityReport` method.
- sdk-ui-catalog: Tweak the quality score card date display to show only the year, month, and day to prevent overly long date strings.
- sdk-ui-kit: Add new `hiddenForAi` icon.
- sdk-backend: Add `isHidden` filter support to backend metadata queries.
- sdk-ui-catalog: Add support for AI visibility filtering.
- turn on Date Filter Accessibility
- adding data-testid for some elements
- fix: [Catalog] Detail view - "Last modified by" show User Id when update by user Manage ws permission
- Can NOT remove the description of object detail, Object details - Visualization - Missing "Created by" and "Last modified by" after refresh page
- [sdk-ui-gen-ai]: AI chatbot UI shows Chatbot restart when backend return "Some terms weren't recognized"
- [sdk-ui-dashboard]: Use filters from dashboard and also drill (apply filter) on graph click
- [sdk-ui-dashboard]: fix error that appears when drilling into some drivers
- [sdk-ui-dashboard]: Cannot trigger KDA option from drill menu on certain charts.
- [sdk-ui-dashboard]: Cannot add filter via "Plus" button.
- [sdk-ui-dashboard]: Filter when drilling into driver is not behaving correctly
- [sdk-ui-dashboar]: update key drivers chart to show only attributes with same trend, support char single bar color to differentiate driver
- [api-client-tiger]: update client for new definition in ai chat bot
- [sdk-ui-gen-ai]: support key driver analysis in chatbot
- recalculate metric value when is not provided to key driver analysis dialog
- [sdk-ui-dashboard]: remove filters with ALL from KDA initial run
- [sdk-ui-dashboard]: blank page appears when clicking on certain data points
- fix: Make menu items properly selectable to align with ARIA
- fix: Display focus outline on the "Only" filter option in Safari
- Modularize UiTabs component
- fix: Do not leak arrow key event from new filter creation popup
- feat: Ability to reorder dashboard tabs
- Cleanup filter accessibility feature flag
- Redesign schedule dialog to support dashboard tabs
- sdk-ui-pivot: PivotTableNext is now enabled by default and promoted from @alpha to @public. This new pivot table component, built on AG Grid Enterprise, offers better performance, text wrapping, and cell selection capabilities. PivotTableNext will be exported as PivotTable in the next major release and thus replace the legacy PivotTable component. To try out new features, users should use PivotTableNext instead of PivotTable.
- sdk-ui-gen-ai: Fix AG grid token propagation for the new pivot table
- sdk-ui-pivot: Fix initial grow to fit behaviour in new pivot tables
- Add @alpha support for geo area labels in sdk-model, sdk-backend-tiger and data modeler app.
- Fixed: Do not count "invisible" styling metrics in bucket item rules to not disable various chart controls that works only for limited number of rendered metrics.
- fix: prevent overriding selected dashboard filters with empty default value
- [home-ui]: Improving AI Memory UI
- [sdk-ui-kit] Add variant-delete class to ListItem component
- [api-client-tiger] Updating OpenAPI client.
- [sdk-ui-kit] Ability to specify to the header menu item use the starting path to check if the item is active.
- add chat feedback popup

## 11.7.1

Mon, 03 Nov 2025 08:30:02 GMT

_Version update only_

## 11.7.0

Thu, 30 Oct 2025 08:25:43 GMT

### Updates

- sdk-model: Add `isHidden` property to metadata objects.
- sdk-backend-tiger: Added support for reading and writing the `isHidden` property on metadata objects.
- sdk-ui-catalog: Introduce UI toggle for hiding objects from AI results
- api-client-tiger: Update generated client.
- sdk-model: Add `status` field to `ISemanticQualityReport` in order to track the status of the quality report calculation.
- sdk-backend-tiger: Add `AbortSignal` support to semantic quality service `getQualityReport` method.
- sdk-ui-catalog: Tweak the quality score card date display to show only the year, month, and day to prevent overly long date strings.
- sdk-backend: Add `isHidden` filter support to backend metadata queries.
- sdk-ui-catalog: Add support for AI visibility filtering.
- adding data-testid for some elements
- fix: [Catalog] Detail view - "Last modified by" show User Id when update by user Manage ws permission
- Can NOT remove the description of object detail, Object details - Visualization - Missing "Created by" and "Last modified by" after refresh page
- [sdk-ui-gen-ai]: AI chatbot UI shows Chatbot restart when backend return "Some terms weren't recognized"
- [sdk-ui-dashboard]: Use filters from dashboard and also drill (apply filter) on graph click
- [sdk-ui-dashboard]: fix error that appears when drilling into some drivers
- [sdk-ui-dashboard]: blank page appears when clicking on certain data points
- fix: Make menu items properly selectable to align with ARIA
- fix: Display focus outline on the "Only" filter option in Safari
- fix: Do not leak arrow key event from new filter creation popup
- sdk-ui-gen-ai: Fix AG grid token propagation for the new pivot table
- [home-ui]: Improving AI Memory UI
- [sdk-ui-kit] Ability to specify to the header menu item use the starting path to check if the item is active.

## 11.6.0

Thu, 23 Oct 2025 07:42:08 GMT

### Updates

- sdk-ui-kit: Add `recommendation` icon.
- sdk-ui-catalog: Add support for filtering catalog items by semantic quality validations.
- sdk-model: Remove ERROR semantic quality issue severity and add severity order constant.
- sdk-ui-catalog: Introduce semantic quality issue grouping by code and severity.
- sdk-ui-catalog: Introduce `ISemanticQualityReport` interface with additional metadata like `updatedAt`.
- sdk-backend: Rename `getQualityIssues` to `getQualityReport`.
- fix: [Catalog] Detail view - "Last modified by" show User Id when update by user Manage ws permission
- Can NOT remove the description of object detail, Object details - Visualization - Missing "Created by" and "Last modified by" after refresh page
- [sdk-ui-gen-ai]: AI chatbot UI shows Chatbot restart when backend return "Some terms weren't recognized"
- [sdk-ui-dashboard] KDA Cannot Be Triggered When Visualization Is Sliced by Date–Week/Year, Support table chart for drill
- [sdk-ui-dashboard]: repair KDA graph to show relevant key drivers
- [api-client-tiger]: Update definition from new server openapi specs
- [sdk-ui-dashboard]: Update key driver analysis dialog to use new api + some minor fixes
- [sdk-ui-dashboard] Drivers Detail Chart - the columns don’t match the driver names for negative values. Cannot activate Year-over-Year option for chart sliced by Week.
- [sdk-ui-dashboard]: prepare for filters from dashboard, repairs for more slicing
- fix: Display focus outline on the "Only" filter option in Safari
- Improved focus handling in insights
- Bubble chart produces just single series to align its behavior with other charts and improve its accessibility
- Fix accessible tooltip on some charts
- sdk-ui-pivot: Fix bug when custom metric in transposed table has original title instead of provided title
- sdk-ui-pivot: Fix unexpected active/disabled pivot table menu wrapping items
- sdk-ui-dashboard: Fix dispatch of visualization properties in view mode for pivot table
- LDM Modeler: Added support for column description field from scan API
- Add new MapLibre-based geo pushpin chart implementation, currently exported as @alpha from @gooddata/sdk-ui-geo/next.
- [api-client-tiger]: update openapi spec to include new memory item endpoint
- [home-ui]: Add AI Memory to workspace catalog.
- Removing AI Memory POC UI

## 11.5.0

Fri, 17 Oct 2025 07:29:11 GMT

### Updates

- Introduce React compatibility testing app for dashboard plugins
- api-client-tiger: Expose quality issues API types.
- sdk-model: Introduce semantic quality domain model and feature flag.
- sdk-backend-tiger: Implement semantic quality service
- sdk-ui-catalog: Introduce semantic quality UI integration
- sdk-ui-catalog: Fix font styles for the embedding case
- sdk-ui-model: Introduce `ISemanticQualityIssuesCalculation` that represents the state of a semantic quality issues calculation.
- api-client-tiger: Expose semantic quality calculation endpoints.
- sdk-ui-catalog: Introduce semantic quality score card with capability to run a semantic quality check.
- fix: [Catalog] Detail view - "Last modified by" show User Id when update by user Manage ws permission
- Can NOT remove the description of object detail, Object details - Visualization - Missing "Created by" and "Last modified by" after refresh page
- [sdk-ui-gen-ai]: AI chatbot UI shows Chatbot restart when backend return "Some terms weren't recognized"
- [sdk-ui]: Support normalizedValue in execution, propagate into KDA dialog, update date formatter
- key driver analysis implementation, load from backend, update dialog
- [sdk-ui-dashboard]: Support for graph in key driver detail
- [sdk-ui-dashboard]: Ellipses in key driver list, Filter only supported attributes
- [sdk-backend-spi]: Rename kda => keyDriverAnalysis
- [sdk-api-client]: Update client by latest openapi specs
- [sdk-ui-dashboard] Period switch support, Internal definitions for attr filter update, Update design and logic of kda graph
- [sdk-ui-gen-ai] allow accessible tooltip in vis
- Fix: Close the drill window when a filter option is selected
- fix: Display drill menu above chart tooltips
- Improve accessibility of recipient list
- Fixed: Dashboard widget insight menu did not always fit into a mobile viewport.
- Fixed: Static descriptions of dashboard sections do not need to wait for filters to load.
- Added: Tiger API client has been updated to match the latest backend state.

## 11.4.0

Fri, 10 Oct 2025 08:42:12 GMT

### Updates

- fix: [Catalog] Detail view - "Last modified by" show User Id when update by user Manage ws permission
- Can NOT remove the description of object detail, Object details - Visualization - Missing "Created by" and "Last modified by" after refresh page
- [sdk-ui-gen-ai]: AI chatbot UI shows Chatbot restart when backend return "Some terms weren't recognized"
- [sdk-ui-kit]: Chatbot icon does not have enough contrast against the background
- [sdk-ui-kit]: Upgrade codemirror
- [sdk-ui-dashboard]: support KDA drill menu in graph with date attribute
- Improve single select attribute filter
- Fix issue with latest Safari not rendering dashboards visualizations.

## 11.3.0

Wed, 08 Oct 2025 11:02:53 GMT

### Updates

- sdk-ui-kit: Introduced optional `autoFocus` behavior to `UiTreeview` component so nothing is focused by default when `autoFocus` is disabled.
- sdk-ui-semantic-search: Disable initial `autoFocus` for history items.
- sdk-model: Introduced `SharePermission` and adds optional `sharePermissions` to `IAccessControlAware`.
- sdk-ui-spi: Add `withMetaInclude` to `IDashboardsQuery`.
- sdk-backend-tiger: Add support for `metaInclude` in dashboards query
- sdk-ui-catalog: Introduce `isEditable` property to `ICatalogItem`.
- sdk-ui-catalog: Disallow editing of dashboards without proper permissions.
- sdk-backend-spi: Add missing `IGetMeasureOptions` interface with `loadUserData` option.
- sdk-backend-tiger: Enhance `getMeasure` to accept `IGetMeasureOptions` with `loadUserData` option.
- sdk-backend-catalog: Load user data for measures in the detail view.
- sdk-ui-catalog: Fix incorrect import of the Intl provider in catalog detail.
- sdk-ui-catalog: Make the `objectId` and `objectType` props required in the public API of catalog detail components.
- fix: [Catalog] Detail view - "Last modified by" show User Id when update by user Manage ws permission
- Can NOT remove the description of object detail, Object details - Visualization - Missing "Created by" and "Last modified by" after refresh page
- [ui-sdk-gen-ai] Missing button tooltips on focus
- [sdk-ui-kit] Support badge on button
- [sdk-ui-gen-ai] Switch to table on every visualisation
- [sdk-ui-gen-ai]: Save button incorrectly available in AI chatbot when insight fails to render
- [sdk-ui-gen-ai]: AI chatbot UI shows Chatbot restart when backend return "Some terms weren't recognized"
- [sdk-ui-backend-tiger]: feature flag for enableChangeAnalysis
- Fix: Add proper a11y attributes to saved views
- Return default feature flags on FeatureHub request failure.
- Added validation to ensure plugin names use snake_case instead of kebab-case
- Improve accessibility of single select AF
- New iconButton variant. New submenu header component.
- Fix date filter accessibility issue
- Improve semantics of InvertableSelectAllCheckbox
- Improve bypass navigation
- Remove unused feature flag: enableEditInsightsFromKD
- Remove unused feature flag: enableAnalyticalDashboards
- Remove unused feature flag: enableAdDescriptionEdit
- Remove unused feature flag: enableDuplicatedLabelValuesInAttributeFilter
- Remove unused feature flag: enableNewNavigationForResponsiveUi

## 11.2.0

Thu, 02 Oct 2025 09:04:26 GMT

### Updates

- Remove unused feature flag: enableActiveFilterContext
- sdk-ui-kit: Add `aria-autocomplete` to accessibility configuration.
- sdk-ui-semantic-search: Improve semantic search accessibility attributes.
- api-client-tiger: Update client to include `tags`, `createdBy` and `getQualityIssues` endpoints
- sdk-backend-tiger: Add missing side-loaded data to metrics queries.
- sdk-backend: Added `getCreatedBy` method to `IAnalyticsCatalogService` for retrieving creator information.
- sdk-ui-kit: Add `renderActions` prop to `DropdownInvertableSelect` component.
- sdk-ui-catalog: Add support for created by filtering.
- fix: [Catalog] Detail view - "Last modified by" show User Id when update by user Manage ws permission
- Can NOT remove the description of object detail, Object details - Visualization - Missing "Created by" and "Last modified by" after refresh page
- [sdk-ui-kit]: sometimes tags additinal nubmer is hidden under cointainer box
- [sdk-ui-kit]: Update chip to support only disabled state, Update popover and tooltip behaviour
- [sdk-ui-dashboard]: Added attributes settings into footer + some minor changes
- [sdk-ui-dashboard] KDA dioalog: Empty page on design, Switch on filled trend if any
- [sdk-ui-gen-ai]: Chatbot accessibility repairs
- [sdk-ui-kit] Repair of UiFocusTrap to be albe react on props change
- Escape nonstandard characters in email
- sdk-ui-kit: Update `UiDate` so that relative timestamps under one minute use the localized `now` text instead of showing the number of seconds ago.
- Remove unused feature flag: enableInvalidValuesInAttributeFilter
- Enable automation management by default.
- Remove unused feature flag: ADCatalogGroupsExpanded
- Remove unused feature flag: ADMeasureValueFilterNullAsZeroOption
- Remove unused feature flag: activeFiltersByDefault
- Remove unused feature flag: analyticalDesigner
- Remove unused feature flag: cellMergedByDefault
- Remove unused feature flag: disableKpiDashboardHeadlineUnderline
- Remove unused feature flag: enableADMultipleDateFilters
- Remove unused feature flag: enableAdAdditionalDateAttributes
- Remove unused feature flag: enableAdCatalogRefresh
- Remove unused feature flag: enableAdRankingFilter
- Remove unused feature flag: enableAlternativeDisplayFormSelection
- Remove unused feature flag: enableAnalyticalDashboardPermissions
- Remove unused feature flag: enableAnalyticalDesignerExport
- Remove unused feature flag: enableApproxCount
- Remove unused feature flag: enableAttributeFilterValuesValidation
- Remove unused feature flag: enableAxisLabelFormat
- Remove unused feature flag: enableAxisNameConfiguration
- Remove unused feature flag: enableAxisNameViewByTwoAttributes
- Remove unused feature flag: enableChartsSorting
- Remove unused feature flag: enableClickableAttributeURL
- Remove unused feature flag: enableColumnHeadersPosition
- Remove unused feature flag: enableCompanyLogoInEmbeddedUI
- Remove unused feature flag: enableCsvUploader
- Remove unused feature flag: enableCustomColorPicker
- Remove unused feature flag: enableDataSampling
- Remove unused feature flag: enableDrilledInsightExport
- Remove unused feature flag: enableEmbedButtonInAD
- Remove unused feature flag: enableEmbedButtonInKD
- Remove unused feature flag: enableExploreInsightsFromKD
- Remove unused feature flag: enableHidingOfWidgetTitle
- Remove unused feature flag: enableInsightExportScheduling
- Remove unused feature flag: enableKDZooming
- Remove unused feature flag: enableKPIDashboardDeleteFilterButton
- Remove unused feature flag: enableKPIDashboardDrillFromAttribute
- Remove unused feature flag: enableKPIDashboardDrillToDashboard
- Remove unused feature flag: enableKPIDashboardDrillToInsight
- Remove unused feature flag: enableKPIDashboardDrillToURL
- Remove unused feature flag: enableKPIDashboardImplicitDrillDown
- Remove unused feature flag: enableKPIDashboardSaveAsNew
- Remove unused feature flag: enableKPIDashboardScheduleRecipients
- Remove unused feature flag: enableKPIDashboardSchedule
- Remove dead bear-related code
- Remove unused feature flag: enableLongitudeAndLatitudeLabels
- Remove unused feature flag: enableMeasureValueFilters
- Remove unused feature flag: enabledMetricDateFilter
- Remove unused feature flag: enableMultipleCSVs
- Remove unused feature flag: enableMultipleDates
- Remove unused feature flag: enableNewADFilterBar
- Remove unused feature flag: enablePdmRemovalDeprecationPhase
- Remove unused feature flag: enablePivotTableTransposition
- Remove unused feature flag: enablePixelPerfectExperience
- Remove unused feature flag: enableRenamingMeasureToMetric
- Remove unused feature flag: enableRenamingProjectToWorkspace
- Remove unused feature flag: enableReversedStacking
- Remove unused feature flag: enableSeparateTotalLabels
- Remove unused feature flag: enableSortingByTotalGroup
- Remove unused feature flag: enableUnavailableItemsVisible
- Remove unused feature flag: hidePixelPerfectExperience
- Remove unused feature flag: showHiddenCatalogItems
- Remove unused entitlements (all are now enabled by default): CustomTheming, UiLocalization, WhiteLabeling, PdfExports
- Update dashboard logo alt text to display organization name when custom logo is applied, for accessibility purposes.
- sdk-ui-filters: remove react-window library and let dropdowns with fixed item count render without it
- Fixed: UI Kit menu item must respect the width of its container
- create alert/schedule dialog accessibility, changes to sdk components

## 11.1.0

Thu, 25 Sep 2025 08:07:44 GMT

### Updates

- sdk-ui-dashboard: Added tabular PDF export option in drill down
- sdk-ui-dashboard: Settings for PDF tabular export
- sdk-ui-catalog: Filter by tag when a tag is clicked in the table. This enables quick drill into tagged items directly from the table without opening filter panel.
- sdk-backend-spi: Add full-text `search` to `IFilterBaseOptions`
- sdk-ui-catalog: Add full-text search to the catalog, temporarily replacing semantic search.
- sdk-ui-catalog: Show the total count of items by object type in the tooltip
- sdk-model: Introduce `dataSet` property to attribute `IAttributeMetadataObject` and fact `IFactMetadataObject` metadata objects.
- sdk-backend: Expose dataset metadata on attribute/fact builders and tiger converters.
- sdk-ui-catalog: Show dataset title in the catalog detail view for attributes and facts.
- [sdk-ui-catalog] Detail drawer is open fullscreen
- fix: [Catalog] Detail view - "Last modified by" show User Id when update by user Manage ws permission
- Can NOT remove the description of object detail, Object details - Visualization - Missing "Created by" and "Last modified by" after refresh page
- [sdk-ui-ext] Added KDA dialog component designs
- [sdk-ui-catalog] tags filter is not sorted alphabetically
- Added method for setting format locale to settings services
- UiAyncTable: general grid a11y, changes to table structure
- Improve accessibility of attribute filter
- Remove unused feature flag: enableBulletChart
- Remove unused feature flag: enableHidingOfDataPoints
- Remove unused feature flag: enablePushpinGeoChart
- Remove unused feature flag: enableTableColumnsAutoResizing
- Remove unused feature flag: enableTableColumnsGrowToFit
- Remove unused feature flag: enableTableColumnsManualResizing
- Remove unused feature flag: enableWeekFilters
- Remove unused feature flag: hideKpiDrillInEmbedded

## 11.0.0

Mon, 22 Sep 2025 08:18:19 GMT

### Minor changes

- Added GenAI Memory management types and interfaces - new IGenAIMemoryItem, IGenAIMemoryItemCreate, GenAIMemoryItemType from sdk-model and IMemoryService interface from sdk-backend-spi for CRUD operations on AI memory items

### Updates

- sdk-ui-catalog: Fix mismatch typo between `visualizationType` property and its type in the `ICatalogItem` interface
- sdk-backend: Implement GenAI Analytics Catalog service
- sdk-ui-catalog: Add support for tags filtering
- sdk-ui-catalog: Update the tooltip text content for the catalog help icon.
- sdk-ui-kit: Extend `DropdownInvertableSelect` with `header` prop to support custom header in the dropdown.
- sdk-ui-kit: Extend `DropdownInvertableSelect` with `renderNoData` prop
- sdk-ui-kit: Extend `DropdownInvertableSelect` with `alignPoints` prop to support custom alignment.
- sdk-ui-catalog: Improve responsiveness on smaller screens.
- sdk-ui-catalog: Render `createdAt` in the table as a fallback when `updatedAt` is not defined in the measure metadata object.
- fix: [Catalog] Detail view - "Last modified by" show User Id when update by user Manage ws permission
- Can NOT remove the description of object detail, Object details - Visualization - Missing "Created by" and "Last modified by" after refresh page
- sdk-ui-catalog: Update wording and detail page, Support [space] in tag management
- [sdk-ui-kit]: Update design of async table to match figma specifications
- [sdk-gen-ai]: Added sorting for top / bottom ranking filter
- [sdk-ui-kit]: Support override empty state in async table, default component exported
- [sdk-ui-catalog] Update designs of empty table
- [sdk-ui-catalog] Support theming in workspace catalog page
- [sdk-ui-gen-ai] Cannot move cursor back with keyboard after selecting an object from AutoComplete.
- [sdk-backend-tiger] Fix message resolution when reach limit size of request
- Improved accessibility of saved views and attribute filter
- Improve accessibility of the saved views list
- Use proper color for pattern fill chart tooltips
- Add cron-parser to sdk-ui-ext
- Remove code related to the obsolete enableKDWidgetCustomHeight setting
- remove legacy code related to the old layouting
- Prevent re-mounting of automation date filter button
- propagate properly onExportReady callback in Headline
- enable charts accessibility improvements by default
- Add support for React 19 and drop support for older React versions (16, 17). See [migration guide](https://www.gooddata.com/docs/gooddata-ui/latest/quick_start/#update-from-v10-to-v11).

## 10.43.0

Thu, 11 Sep 2025 07:36:12 GMT

### Updates

- sdk-ui-dashboard: Added evaluation mode checkbox to schedule exports dialog
- sdk-model: Introduced `isLocked` property in `IAttributeMetadataObject` and `IFactMetadataObject` interfaces.
- sdk-ui-catalog: Restrict updates for parent's workspace objects.
- sdk-ui-catalog: Sort catalog items based on search results score
- sdk-ui-catalog: Implement object type counter to display the number of occurrences for each object type in the results.
- New icons in kit, catalog icons update per type
- GDAI-625 - filter by PARENT | CHILD not working
- fe support for ranking filter in AI Assistant
- fix: [Catalog] User with ANALYZE workspace permission can NOT edit all visualization or Dashboard they have edit access to
- fix: [Catalog] Detail view - "Last modified by" show User Id when update by user Manage ws permission
- Can NOT remove the description of object detail, Object details - Visualization - Missing "Created by" and "Last modified by" after refresh page
- Suppress row click to open the tag component, Long object ID content overflows the infomation dialog.
- limit for ai assistant search in feature flag
- sdk-ui-catalog: design QA of Analytics Catalogue
- sdk-ui-catalog: design QA of Analytics Catalogue
- fe support for ranking filter in AI Assistant
- Updates to tooltip and popover components
- Update table component to support align and some css tune
- Improved the accessibility of attribute filter.
- Fixed dashboard charts flickering under specific conditions.
- Redesign Dashboard's Date filter for better accessibility
- Make description trigger better with screen reader
- Add identifier prop for description tooltip component
- Improve accessibility of switchToTable feature
- Improve support for Windows High Contrast Mode
- Make focus ring more visible on headline primary value
- Improve initial autofocus in date filter
- Improve disable export options with accessible tooltip
- Avoid double execution when rendering charts with InsightView
- Added: chart fill support for a bullet chart
- Changed: Chart fill patterns were updated for the better legibility on non-retina displays
- Fix: Render paragraph text in UiTooltip with the normal text color
- Added: data test id prop to SDK UI Kit Input component.

## 10.42.0

Thu, 04 Sep 2025 08:00:17 GMT

### Updates

- Introduced a help icon with tooltip in the header, providing users with information about the Analytics Catalog.
- Introduce optional `id` array field to `IFilterBaseOptions`
- Updated the `useSemanticSearch` hook to pass `deepSearch` boolean value. This fixes previous behavior when `true` value was always passed.
- Updated the `useSemanticSearch` hook to ignore state changes when the search request is aborted, ensuring that no updates occur after cancellation.
- Integrate the semantic search functionality into the Analytics Catalog.
- Show created by display name in Analytics Catalog when possible
- sdk-model: Added `ObjectOrigin` type to define the origin of objects for inheritance-based filtering.
- sdk-backend-spi/tiger: Add origin filtering to query interfaces
- sdk-catalog: Introduce filtering capabilities for object origins
- sdk-ui-catalog: Re-order object type selection
- Add suport for opening view details on catalog item. now empty
- Implement first version of catalog detail
- Support opening view details on catalog item when id is provided. Fill detail page of catalog item, now only in read only view.
- Analytics Catalog: Support for update title, description and tags on dashboard, vis and metric
- Support for update title, description and tags on facts and attributes
- Improve chart legends accessibility
- Respect the allowUnsafeFlexConnectEndpoints setting on the UI
- Fix reference workspace provisioning scripts
- Remove the enableNewUserCreationFlow feature flag and related code.
- Migrate to the latest OpenAPI generator version
- Allow customization of chart data labels by theme.Deprecate some theme.chart properties and replace them by more hierarchical equivalents. Eg. theme.chart.axisValueColor replaced by theme.chart.axis.valueColor
- Introduce configurable chart point shapes (square, triangle, triangle-down, diamond).
- feat: Add support for en-US-x-24h locale with timezone formatting
- Introduce configurable chart fill (solid, pattern, outline).
- Fixed: Postponed HighChart resizing till the chart is really mounted to prevent error when treemap and heatmap charts are initialy rendered or destroyed when pattern is applied.
- Added: Introduce a property to map the pattern fill per measure
- convert minute/hour granularities of en-US-x-24h locale to UTC before passing to formatInTimezone due to time conversion already happening on BE and then again within this function

## 10.41.0

Thu, 28 Aug 2025 07:43:12 GMT

### Updates

- Extend `IDashboardsQuery` and `IInsightsQuery` with additional filtering and include parameters capabilities.
- Update `createdBy` in `IFilterBaseOptions` to accept an array
- UiDrawer component
- GDAI-589 catalog list should be sorted alphabetically
- Propagate visualization title and description to chart accessibility
- Fix: Read the latest toast message even while a modal window is open
- Show as table/original visualization on drill dialog only affects this specific insight.

## 10.40.0

Thu, 21 Aug 2025 07:17:56 GMT

### Updates

- Add theme variables to control message styling
- Links rendered by the repeater visualization respect the theme now.
- Remove enableNewHeadline feature flag and old headline code

## 10.39.0

Thu, 14 Aug 2025 10:14:08 GMT

### Updates

- Improved accessibility of notification toast messages.
- UiIconButton now supports the tabIndex property.
- Improve keyboard navigation in drill dialog with table
- Increased contrast in the data picker component to make it more accessible.
- Introduce new icons into UiIcon component.
- Make various dashboard menu icons to respect the theme (schedules, drills, save dashboard as new).

## 10.38.0

Thu, 07 Aug 2025 08:23:00 GMT

_Version update only_

## 10.37.0

Thu, 31 Jul 2025 07:50:16 GMT

### Updates

- Fix focusing of hidden legend items

## 10.36.0

Tue, 29 Jul 2025 13:43:27 GMT

### Updates

- Fix keyboard navigation in chart legend

## 10.35.0

Thu, 24 Jul 2025 10:25:27 GMT

### Updates

- fix of selection mode switching. Allow propagation of invalid AF selection together with isInvalid flag. Dashboard component can now handle invalid state.
- Rewrite logic for withoutApply mode. Fixing child filter selection.
- Deprecate enableDashboardFiltersApplyModes prop and use only withoutApply.
- Upgrade typescript to version 5.8.3
- support threshold measure in combo chart & support excluding data series measures from being affected by threshold measure
- feat(api-client-tiger): upgrade the API client to match the latest backend REST API capabilities

## 10.34.0

Mon, 14 Jul 2025 09:23:49 GMT

### Updates

- remove obsolete UiMenu props
- fix(sdk-ui-dashboard): documentation link displayed in tooltip shown over the new Column container item of dashboard leads to the related part of documentation page now
- fix(sdk-ui-dashboard): render row end hotspot only when a widget is dragged to fix the row height resizer offset in the column container
- fix(sdk-ui-dashboard): make widget a width resizer the same thickness as a height resizer
- feat: introduce a new feature flag for pre-aggregated facts
- fix(sdk-ui-dashboard): introduce and use a new feature flag to enable Flexible Layout to not enable the uncomplete feature in previously released SDKs

## 10.33.0

Thu, 10 Jul 2025 06:54:29 GMT

### Updates

- Updated state management libraries, like @reduxjs/toolkit, immer, redux, reselect
- Exclude width resizer preview from auto scroll behavior. It prevents dashboard content from vertical scroll when only horizontal movement of resizer is happening
- Replace ~@gooddata/ imports in scss files with @gooddata/ to allow integration with next.js
- Enable flexible dashboard layouts with nesting support by default.
- Allow resizing of flexible layout containers with nested row containers inside of them.
- Make the last column drop zone in flexible layouts take all the remaining space of the column.
- Size flexible layout containers to full row height to have the last drop zone fill the remaining space of the column.
- Do not render the flexible layout previous row's row end drop zone.

## 10.32.0

Mon, 30 Jun 2025 11:32:45 GMT

_Version update only_

## 10.31.0

Mon, 16 Jun 2025 14:58:30 GMT

_Version update only_

## 10.30.0

Mon, 09 Jun 2025 16:54:46 GMT

### Updates

- Added method for setting metadata locale to settings services

## 10.29.0

Thu, 05 Jun 2025 07:23:01 GMT

_Version update only_

## 10.28.0

Thu, 29 May 2025 06:57:15 GMT

### Updates

- Introduced embeddable AI Assistant as part of public API
- fix attribute filter not reloading values after dropdown close when some search query is not empty
- fix failing storybook test for AttributeFilterStatusBar
- Change chart's X axis label autorotation value from -90° to -45°

## 10.27.0

Fri, 16 May 2025 08:01:14 GMT

### Updates

- Fix irrelevant values info in attribute filter when apply all at once is on

## 10.26.0

Mon, 05 May 2025 06:30:05 GMT

### Updates

- add property drillStep into InsightBody component so dashboard customizations can behave based on drill context

## 10.25.1

Wed, 23 Apr 2025 14:19:46 GMT

_Version update only_

## 10.25.0

Thu, 17 Apr 2025 06:58:58 GMT

### Updates

- Make relative range picker more accessible
- Make relative range picker more accessible

## 10.24.0

Thu, 03 Apr 2025 11:48:06 GMT

### Updates

- Update minimal node to 22.13.0
- Fix: Do not reset date filter on cancel click in apply all filters at once mode
- Bugfix of attribute filter. When together apply all filters and close values dropdown with filled search the app crashes.
- Dashboard execution and rendering is not blocked by loading of catalog

## 10.23.0

Thu, 20 Mar 2025 09:15:55 GMT

### Updates

- Update ag-grid-community and ag-grid-react library to latest version
- Add an option to specify chart tooltip class name
- Support of new filter mode Apply all at once in Dashboard

## 10.22.0

Thu, 06 Mar 2025 08:46:39 GMT

### Updates

- New helper factory createRedirectToTigerAuthenticationWithParams to create a parametrized redirectToTigerAuthentication handler. Useful in Federated Identity Management context.
- Add support for execution cancelling via AbortController.
- Support workspace and organization level setting for Dashboard filters apply mode
- Make DashboardAttributeFilter component customizable by prop
- Add support for enableDashboardFiltersApplyModes feature flag
- Update HighCharts library to latest version

## 10.20.0

Thu, 20 Feb 2025 08:45:08 GMT

_Version update only_

## 10.19.0

Thu, 06 Feb 2025 07:58:07 GMT

_Version update only_

## 10.18.0

Thu, 23 Jan 2025 08:58:58 GMT

### Updates

- Introduce NotificationPanel component.

## 10.17.0

Thu, 09 Jan 2025 09:00:05 GMT

_Version update only_

## 10.16.0

Thu, 12 Dec 2024 07:29:13 GMT

### Updates

- Add support for nested dashboard layouts (hidden behind a feature flag)

## 10.15.0

Thu, 28 Nov 2024 11:23:13 GMT

_Version update only_

## 10.14.0

Thu, 14 Nov 2024 11:46:42 GMT

_Version update only_

## 10.13.0

Thu, 31 Oct 2024 08:50:19 GMT

### Updates

- attribute filters now allow improved work with duplicate values by default
- Added new Visualization Switcher widget to render group of visualizations together on dashboard (available for GoodData.CN / GoodData Cloud only).

## 10.12.0

Thu, 17 Oct 2024 06:56:12 GMT

### Updates

- Introduce support for saved filter views on dashboards. It allows to customize filter context for individual user and dashboard and save it for later use.

## 10.11.0

Thu, 03 Oct 2024 07:11:15 GMT

### Updates

- Introduce support for saved filter views on dashboards. It allows to customize filter context for individual user and dashboard and save it for later use.

## 10.10.0

Thu, 19 Sep 2024 06:58:04 GMT

### Updates

- Improved Handling of Secondary Labels in AttributeFilter

## 10.9.0

Thu, 05 Sep 2024 08:14:25 GMT

### Updates

- Add possibility to ignore specified attributes in the drill down intersection. Modify addDrillDownForInsightWidget and modifyDrillDownForInsightWidget commands to be able to configure it (breaking).

## 10.8.0

Thu, 22 Aug 2024 07:33:19 GMT

### Updates

- Introduce user filter views to dashboard component

## 10.7.0

Thu, 08 Aug 2024 09:46:36 GMT

### Updates

- Introduced GenAI Service in sdk-backend-tiger to be able to consume semantic search feeds.
- Introduced @gooddata/sdk-ui-semantic-search package in alpha stage
- Top menu UI component now supports a new search button

## 10.6.0

Thu, 25 Jul 2024 08:35:32 GMT

_Version update only_

## 10.5.1

Fri, 12 Jul 2024 11:00:39 GMT

### Updates

- Fixed display of tooltips in drill dialog

## 10.5.0

Thu, 11 Jul 2024 08:01:45 GMT

### Updates

- Allow specifying returnTo parameter with backend deauthenticate
- Adjusted export function to support pdf options.
- Using visualizationObject whenever provided as alternative to executionResult for export.

## 10.4.0

Thu, 27 Jun 2024 08:11:53 GMT

_Version update only_

## 10.3.0

Thu, 13 Jun 2024 08:17:52 GMT

### Updates

- Allow different position of ellipsis in ShortenedText component
- F1-349 Implement webhooks api in tiger functions
- allow creating a workspace as a child

## 10.2.0

Thu, 30 May 2024 08:50:26 GMT

### Updates

- API method importCsv now returns update info about file
- Forecast implementation into line chart
- Include hierarchy data in workspace descriptor
- added filter for root workspaces only to workspaces query
- use only description attribute for workspace description
- Enhanced export function to support PDF format and added PDF configuration option.

## 10.1.0

Thu, 16 May 2024 08:08:00 GMT

### Updates

- Added a workspace service for working with export definitions metadata objects

## 10.0.0

Thu, 18 Apr 2024 08:07:32 GMT

### Updates

- Drop support for the GoodData Platform (Bear) in all packages.
- Removed the @gooddata/experimental-workspace and @gooddata/live-examples-workspace packages.
- Removed the sdk-examples package.
- Package @gooddata/reference-workspace migrated from GoodData Platform (Bear) to GoodData.CN (Panther/Tiger).
- Removed GoodData Platform (Bear) related packages: @gooddata/api-client-bear, @gooddata/sdk-backend-bear, @gooddata/api-model-bear.
- Introduced a new visualization type - Repeater, currently in the @beta stage.
- Introduce ability to limit attribute filter values by dependent date filters on GoodData Cloud dashboards.

## 9.9.2

Wed, 19 Mar 2025 11:50:06 GMT

### Updates

- Update ag-grid-community and ag-grid-react library to latest version

## 9.9.1

Thu, 18 Apr 2024 11:19:00 GMT

_Version update only_

## 9.9.0

Thu, 21 Mar 2024 09:56:41 GMT

### Updates

- To unify null values representation replace pattern fill by background color in Heatmap
- Introduce theme loading status with better information about state of theme loading
- Add tags to 'measure' objects

## 9.8.1

Fri, 15 Mar 2024 13:31:24 GMT

### Updates

- Introduce theme loading status with better information about state of theme loading

## 9.8.0

Thu, 07 Mar 2024 09:02:52 GMT

### Updates

- Rename word 'Insight' to 'Visualization'
- Add services to list insights and dashboards with paging

## 9.7.0

Thu, 22 Feb 2024 09:17:23 GMT

### Updates

- Added new RichText widget to render markdown on dashboard (available for GoodData.CN / GoodData Cloud only).
- Introduced possibility to use multiple date filters (available for GoodData.CN / GoodData Cloud only).
- Introduce ability to limit attribute filter values by metric on GoodData Cloud dashboards.

## 9.6.0

Thu, 25 Jan 2024 10:00:31 GMT

### Updates

- Deliver support for multiple date filters fully specified including date data set
- Introduce cross-filtering highlighting in charts.

## 9.5.0

Thu, 11 Jan 2024 12:13:13 GMT

### Updates

- Users can create multiple insight interactions per attribute/measure for the Panther environment.
- Users can create, edit, and delete attribute hierarchies in the UI. Additionally, they can view and interact with a list of drill-down interactions.
- Support for dependent filters on Tiger backend added. Attribute filter on Tiger can now be dependent on other filters which will effectively filter out some of its elements. It supports circular dependencies in filters, keeping selected values when parent filter changes and showing/clearing of filtered out elements.
- Introduce cross-filtering for GoodData Cloud
- Dashboard plugins no longer support version lock of the GoodData.UI dependencies. Since now, all GoodData.UI dependencies will be injected to the plugin in their latest version at runtime. Also improve way to specify compatibility of the plugin.
- Add support for attribute filter selection in drill to custom url.
- Enable decorating attribute filters in plugins customization API.
- Enable decorating dashboard content in plugins customization API.

## 9.4.0

Thu, 30 Nov 2023 11:57:11 GMT

### Updates

- Users can configure the dashboard filter to be interactive, locked, or hidden.
- Remove `isDomainAdmin` method from Bear Legacy Functions.

## 9.3.0

Thu, 02 Nov 2023 11:25:49 GMT

### Updates

- The headline allows two secondary measures to be displayed as the headline values.
- The headline allows for the customization of comparison values and styles using the comparison config.
- Introduce possibility to cache client calls

## 9.2.0

Fri, 06 Oct 2023 13:12:04 GMT

### Updates

- Supporting to share the dashboard with all workspace users.
- Introduce new attribute hierarchy catalog entity which is used for implicit drill-down in dashboards.

## 9.1.0

Fri, 08 Sep 2023 07:19:23 GMT

### Updates

- Added support for pivot tables, allowing you to transpose column headers to rows for more flexible data analysis.
- The pivot table allows metrics to be placed in rows instead of columns.
- Optimized attribute filter to fetch element counts only for child filters, reducing overhead and improving performance by not fetching the total count of elements by default.
- Sdk-backend-tiger now supports the following entity properties: createdAt, createdBy, modifiedAt, modifedBy for the following analytical objects: insight, analytical dashboard, dashboard plugin, metric.
- Sdk-backend-tiger now supports JWT authentication.
- Added support for Waterfall chart visualizations.

## 9.0.1

Thu, 17 Aug 2023 13:20:29 GMT

_Version update only_

## 9.0.0

Thu, 27 Jul 2023 12:35:32 GMT

### Updates

- catalog-export: unified the way configuration is loaded for tiger and bear
- sdk-backend-tiger: add apis to config localization, timezone for organization
- Change build target of all libraries to ES2017
- update minimal node version to 16.20.0
- Single selection variant of Attribute Filter component
- Remove all enzyme related packages and rewrite tests to react testing library.
- Upgrade TypeScript to v5.
- Add Dependency wheel chart visualizations.
- Add Sankey chart visualizations.
- Add @gooddata/app-toolkit as replacement for @gooddata/create-gooddata-react-app
- Deprecated APIs were removed.
- Attribute Filter Dropdown button supports description customisation in form of tooltip
- Add Funnel chart and Pyramid chart visualizations.
- The new SPI export methods for downloading of insight and dashboard export data were added. The methods attach exported data as a blob to current browser window instance and return Object URL pointing to the blob and name of the downloaded file. There is no need to export data manually via URI. The dashboard component uses these new methods now. This means that export from dashboard component works even when provided backend uses Tiger token authentication.
- Make it possible to hide/show on demand the web components tab on embedding dialogs
- Add the continuous line configuration for the Line, Area and Combo charts

## 8.12.3

Thu, 05 Oct 2023 07:58:45 GMT

### Updates

- Use @gooddata/number-formatter instead of @gooddata/numberjs library

## 8.12.2

Wed, 19 Jul 2023 14:12:54 GMT

### Updates

- The new SPI export methods for downloading of insight and dashboard export data were added. The methods attach exported data as a blob to current browser window instance and return Object URL pointing to the blob and name of the downloaded file. There is no need to export data manually via URI. The dashboard component uses these new methods now. This means that export from dashboard component works even when provided backend uses Tiger token authentication.

## 8.12.1

Mon, 17 Apr 2023 08:24:37 GMT

### Updates

- Add fallback for unknown visualization types of insights

## 8.12.0

Thu, 09 Mar 2023 08:43:20 GMT

### Updates

- Dashboard component and dashboard plugins now supports edit mode.
- Insights and dashboard widgets now allow to specify description in form of tooltips.
- Analytical dashboards created in GoodData Cloud are now created as private visible only to the creator and to all organization and workspace administrators. SDK allows granular sharing of any dashboard with selected users and user groups. Dashboard permissions can be managed via SPI library and are fully integrated into the Dashboard component.
- Export permissions have been made more granular and the EXPORT permission now includes both EXPORT_TABULAR and EXPORT_PDF. Export permissions can also be set individually to allow exports to certain formats only.
- Improved GoodData Cloud formatting of date attributes based on locale user setting and defined formatting pattern.
- Add support for PDF export for GoodData Cloud.
- Support Geo Pushpin chart for GoodData Cloud.

## 8.11.0

Thu, 20 Oct 2022 09:18:18 GMT

### Updates

- Improved custom attribute filters were added. We added support for customization of the AttributeFilter and AttributeFilterButton components and new features, such as static and hidden elements.
- Dashboard plugins APIs to customize attribute filters were added. You can now customize the attribute filters with dashboard plugins.
- Core API for attribute filter components was added. These components now allow implementation of custom attribute filters.
- SDK SPI ability for white-labeling was added. You can enable white-labeling for your organization.
- Mapbox token React provider was added.
- The withCaching backend decorator has been made public. RecommendedCachingConfiguration from @gooddata/sdk-backend-base can be used to configure backend caching.

## 8.10.0

Thu, 14 Jul 2022 08:56:22 GMT

### Updates

- DashboardView component was removed. Use Dashboard component from @gooddata/sdk-ui-dashboard instead.
- Support for GoodData Cloud was added.
- Dashboard filterContext selectors are public now.
- Dashboard component user and permissions selectors are public now.
- Catalog load is now more optimized for GoodData Platform.
- Model interfaces from @gooddata/sdk-backend-spi were moved to @gooddata/sdk-model.
- Global Dashboard CSS styles were removed.
- SVG and CSS imports in typescript files were removed, GoodData.UI can be used without an additional bundler setup now
- Execution definition by slices/series can be now used without React. You can use the DataViewLoader @alpha version from @gooddata/sdk-ui.
- The useDashboardAsyncRender hook and related commands and events that inform about the dashboard rendering status are now public.

## 8.9.0

Thu, 17 Mar 2022 12:48:39 GMT

### Updates

- The dashboard commands and events related to filter modification were included in the public API.
- The general dashboard events (such as DashboardSaved) were included in the public API.
- The useDispatchDashboardCommand hook was added to make dispatching of the Dashboard commands easier.
- The DashboardStoreAccessor, SingleDashboardStoreAccessor and DashboardStoreAccessorRepository classes were added to enable handling of the state of the Dashboard component outside the component itself.

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
