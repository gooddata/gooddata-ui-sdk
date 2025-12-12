// (C) 2021-2025 GoodData Corporation

import { type IAnalyticalBackend, type IDashboardReferences } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IColorPalette,
    type IDashboard,
    type IDashboardLayout,
    type IDateFilterConfig,
    type IEntitlementDescriptor,
    type IInsight,
    type ISeparators,
    type ISettings,
    type Identifier,
    type ObjRef,
} from "@gooddata/sdk-model";
import { type ILocale } from "@gooddata/sdk-ui";

import { type ExtendedDashboardWidget } from "./layoutTypes.js";
import { type IDashboardFilter, type IMenuButtonItemsVisibility, type RenderMode } from "../../types.js";

/**
 * Dashboard component may offer users to pick objects to use on the dashboard.
 *
 * @remarks
 * User can, for instance, select a metric to use on KPI, select an attribute or a date dataset to filter by.
 *
 * The object availability configuration can be used to filter objects that the user can pick.
 *
 * By default, all objects
 *
 * @public
 */
export interface ObjectAvailabilityConfig {
    /**
     * Specify tags to exclude objects by.
     *
     * @remarks
     * If any of these tags appears on an object, then it will be not available for use.
     */
    excludeObjectsWithTags?: string[];

    /**
     * Specify tags to include objects by.
     *
     * @remarks
     * This option does not make sense on its own - as all objects are
     * included by default. However it can be used in conjunction with {@link ObjectAvailabilityConfig.excludeObjectsWithTags} - a wide
     * range of objects may be excluded at first and then a subset will be cherry-picked using this prop.
     */
    includeObjectsWithTags?: string[];
}

/**
 * Dashboard item
 *
 * @public
 */
export type DashboardItem = DashboardItemVisualization | DashboardItemVisualizationContent;

/**
 * Dashboard item with visualization
 *
 * @public
 */
export type DashboardItemVisualization = {
    visualization: ObjRef;
};

/**
 * Tests whether the provided item is a dashboard item with visualization.
 * @param item - item to test
 *
 * @public
 */
export function isDashboardItemVisualization(item: unknown): item is DashboardItemVisualization {
    return (item as DashboardItemVisualization).visualization !== undefined;
}

/**
 * Dashboard item with visualization content
 *
 * @public
 */
export type DashboardItemVisualizationContent = {
    visualizationContent: IInsight;
};

/**
 * Tests whether the provided item is a dashboard item with visualization content.
 * @param item - item to test
 *
 * @public
 */
export function isDashboardItemVisualizationContent(
    item: unknown,
): item is DashboardItemVisualizationContent {
    return (item as DashboardItemVisualizationContent).visualizationContent !== undefined;
}

/**
 * Dashboard configuration can influence the available features, look and feel and behavior of the dashboard.
 *
 * @public
 */
export interface DashboardConfig {
    /**
     * Locale to use for the dashboard.
     */
    locale?: ILocale;

    /**
     * Number separators to use for charts and KPIs on the dashboard.
     */
    separators?: ISeparators;

    /**
     * Settings may influence how the dashboard behaves or what features it exposes.
     */
    settings?: ISettings;

    /**
     * Date filter configuration.
     *
     * @remarks
     * Date filter configuration is used to influence what filtering presets (options) should be
     * available on the date filter component.
     */
    dateFilterConfig?: IDateFilterConfig;

    /**
     * Override filters in the default filter context.
     *
     * @remarks
     * Overrides dashboard's default filters by matching display forms.
     * These overrides persist in edit mode and after filter resets.
     *
     * Compatible matching filters will replace originals.
     *
     * Incompatible filters are merged following these rules:
     * - Non-matching filters won't be added
     * - Multi-to-single selection conversions will use first element only
     * - Changes to readonly/hidden filters won't be applied
     *
     * Incompatible overrides/conversions will lead to a toast message with warning.
     */
    overrideDefaultFilters?: FilterContextItem[];

    /**
     * Override dashboard title.
     */
    overrideTitle?: string;

    /**
     * Color palette to pass down to charts.
     */
    colorPalette?: IColorPalette;

    /**
     * Specifies exclusion and inclusion criteria for objects that should be available during the
     * different object selections (e.g. selecting metric for KPI, attributes to filter by, date data sets to use for filtering).
     */
    objectAvailability?: ObjectAvailabilityConfig;

    /**
     * Token for Mapbox API. You need this to use GeoCharts in your dashboards.
     *
     * @remarks To create a Mapbox account and an access token, see [this guide](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/).
     */
    mapboxToken?: string;

    /**
     * AG Grid Enterprise license token to unlock enterprise features in PivotTable.
     */
    agGridToken?: string;

    /**
     * Sets dashboard to the read-only mode.
     *
     * @remarks
     * If set to true, the dashboard will be embedded in a read-only mode disabling any user interaction
     * that would alter any backend state (disabling creating/changing alerts, creating scheduled emails, etc.).
     *
     * Defaults to false i.e. NOT a read-only mode.
     */
    isReadOnly?: boolean;

    /**
     * Sets dashboard to the embedded mode.
     *
     * @remarks
     * When dashboard is embedded via iframe, this property must be set to true.
     * In embedded mode, some interactions may be disabled.
     *
     * Defaults to false.
     */
    isEmbedded?: boolean;

    /**
     * When dashboard is executed in export mode, this property must be set to true.
     *
     * @remarks
     * Defaults to false.
     */
    isExport?: boolean;

    /**
     * When dashboard is white labeled, we hide GD links and branding.
     * @internal
     */
    isWhiteLabeled?: boolean;

    /**
     * Disables default dashboard drills.
     *
     * @remarks
     * Drills configured and stored on the widgets, or implicit drills (eg. drill down).
     * This property has no effect for drills enabled by drillableItems set by {@link ChangeDrillableItems} command.
     *
     * Defaults to false.
     */
    disableDefaultDrills?: boolean;

    /**
     * If set to true, filter values will resolve in drill events.
     *
     * @remarks
     * Defaults to false.
     */
    enableFilterValuesResolutionInDrillEvents?: boolean;

    /**
     * Configure which of the default menu button buttons are visible.
     * @beta
     */
    menuButtonItemsVisibility?: IMenuButtonItemsVisibility;

    /**
     * When turned on the features still under development will be turned on based on corresponding settings
     *
     * @remarks
     * Defaults to false.
     */
    allowUnfinishedFeatures?: boolean;

    /**
     * @internal
     * Allow to create insight button and event
     */
    allowCreateInsightRequest?: boolean;

    /**
     * Specify which render mode will be use d for initial rendering.
     *
     * @remarks
     * If you do not specify initialRenderMode, the dashboard component will be display in view mode.
     */
    initialRenderMode?: RenderMode;

    /**
     * @internal
     * Hide "Save as new" button in ButtonBar and MenuButton
     */
    hideSaveAsNewButton?: boolean;

    /**
     * @internal
     * Hide "Share" button in TopBar
     */
    hideShareButton?: boolean;

    /**
     * @internal
     * Hide "Widget titles" in the dashboard
     */
    hideWidgetTitles?: boolean;

    /**
     * @internal
     * Provide widgets overlays for dashboard
     */
    widgetsOverlay?: Record<string, IDashboardWidgetOverlay>;

    /**
     * @internal
     * Identifier of the export
     *
     * @remarks
     * This identifier is utilized only by those backend implementations which suport storing
     * export metadata with the export request and is typically used to store inlined filter context.
     * In the future, there's a possibility to store some additional export-related temporary metadata there.
     *
     * As the backend does not expose the filter context publicly, this id is then used to access export metadata
     * api, retrieve the metadata and extract filter context from there.
     *
     * Important: When exportId is given, the filter context stored with export metadata for this exportId has
     * priority over other stored or supplied filter context.
     */
    exportId?: string;

    /**
     * Specify type of the currently performed dashboard export.
     * This id is used to retrieve export-related metadata, such as currently active attribute filters.
     */
    exportType?: "visual" | "slides";

    /**
     * Disable cross filtering
     *
     * @remarks
     * If set to true, cross filtering will be forced disabled even if the dashboard is configured to support it.
     * If set to false or not set, cross filtering will be enabled if the dashboard is configured to support it.
     */
    disableCrossFiltering?: boolean;

    /**
     * Disable user filter reset
     *
     * @remarks
     * If set to true, user filter reset will be disabled even if the dashboard is configured to support it.
     * If set to false or not set, user filter reset will be enabled if the dashboard is configured to support it.
     */
    disableUserFilterReset?: boolean;

    /**
     * @alpha
     *
     * Open automation on load
     *
     * @remarks
     * If set to true, the selected automation form focus object will be opened on dashboard load.
     */
    openAutomationOnLoad?: boolean;

    /**
     * @beta
     *
     * Specify the focus object in which context the dashboard should be opened.
     *
     * @remarks Only provide one of the focus properties at a time.
     */
    focusObject?: DashboardFocusObject;

    /**
     * @alpha
     *
     * Specify the slide configuration for the dashboard. This sizes will be used in export mode as size
     * of the slide where visualization will be fit and rendered.
     *
     */
    slideConfig?: DashboardExportSlideConfig;

    /**
     * @alpha
     *
     * Dashboard referenced objects.
     * If provided, initialization of the dashboard avoid additional requests to resolve them.
     */
    references?: IDashboardReferences;

    /**
     * @alpha
     *
     * Entitlements for the user who is rendering the dashboard
     */
    entitlements?: IEntitlementDescriptor[];

    /**
     * Initial content of the dashboard. In case of empty dashboard, this content will be filled
     * into created section. If the dashboard is loaded from backend, this content will be ignored.
     */
    initialContent?: DashboardItem[];

    /**
     * @alpha
     *
     * Timestamp for the dashboard execution as ISO string
     */
    executionTimestamp?: string;

    /**
     * @alpha
     *
     * Default evaluation frequency for the dashboard provided from settings.
     */
    evaluationFrequency?: string;

    /**
     * @alpha
     *
     * Workspace descriptor
     */
    workspaceDescriptor?: {
        title: string;
    };

    /**
     * @alpha
     *
     * Customized recipient context for automations
     */
    externalRecipient?: string;
}

/**
 * @alpha
 *
 * Specifies the size of the slide where visualization will be fit and rendered.
 */
export interface DashboardExportSlideConfig {
    /**
     * Preferred width of slide in export mode.
     */
    width: number;
    /**
     * Preferred height of slide in export mode.
     */
    height: number;
}

/**
 * @beta
 *
 * Specifies the focus object for the dashboard.
 */
export interface DashboardFocusObject {
    /**
     * @beta
     * If provided, the dashboard will be opened in the context of the given automation.
     * This means, that target widget will be focused in the dashboard,
     * and filter context will be set to the one used in the automation.
     */
    automationId?: Identifier;

    /**
     * @beta
     * If provided, the dashboard will be opened in the context of the given widget.
     * This means, that target widget will be focused in the dashboard.
     *
     * @remarks This property is not a formal MD identifier
     */
    widgetId?: string;

    /**
     * @beta
     * If provided, the dashboard will be opened in the context of the given visualization.
     * This means, that target visualizations represented by widgets will be focused in the dashboard.
     */
    visualizationId?: Identifier;
}

/**
 * Dashboard configuration resolved using the config passed in via props and any essential data retrieved from
 * backend.
 *
 * @remarks
 * Note: the resolved config may still contain some undefined properties:
 *
 * -  `mapboxToken` - has to be provided by the context
 * -  `agGridToken` - has to be provided by the context
 * -  `exportId` - optional, used for fetching filters during export mode
 * -  `isReadOnly` - is purely choice of context in which the dashboard is used
 *
 * @public
 */
export type ResolvedDashboardConfig = Omit<
    Required<DashboardConfig>,
    | "mapboxToken"
    | "agGridToken"
    | "exportId"
    | "exportType"
    | "focusObject"
    | "slideConfig"
    | "references"
    | "entitlements"
    | "initialContent"
    | "executionTimestamp"
    | "overrideDefaultFilters"
    | "overrideTitle"
    | "hideWidgetTitles"
    | "workspaceDescriptor"
    | "evaluationFrequency"
    | "externalRecipient"
    | "openAutomationOnLoad"
> &
    DashboardConfig;

/**
 *
 * @beta
 */
export type ResolvedEntitlements = IEntitlementDescriptor[];

type DashboardConfigKeys = keyof DashboardConfig;
const RequiredConfigKeys: DashboardConfigKeys[] = [
    "dateFilterConfig",
    "locale",
    "separators",
    "colorPalette",
    "settings",
];

/**
 * Tests whether the provided config is fully resolved - it contains all the necessary values.
 *
 * @param config - config to test
 */
export function isResolvedConfig(config?: DashboardConfig): config is ResolvedDashboardConfig {
    if (!config) {
        return false;
    }

    const specifiedConfig = Object.keys(config);

    return RequiredConfigKeys.every((key) => specifiedConfig.includes(key));
}

/**
 * @public
 */
export interface DashboardContext {
    /**
     * Analytical Backend where the dashboard exists.
     */
    backend: IAnalyticalBackend;

    /**
     * Analytical Backend where the dashboard exists.
     */
    workspace: string;

    /**
     * Dashboard config
     * @internal
     *
     * @remarks
     * Do not use this, can be changed in future or removed at all
     *
     */
    config?: DashboardConfig;

    /**
     * Reference to dashboard that should be loaded into the store.
     *
     * @remarks
     * If the dashboardRef is not specified, then this indicates
     * the dashboard should be initialized with empty state (new dashboard).
     */
    dashboardRef?: ObjRef;

    /**
     * Reference to filter context that defines filters to use on the dashboard.
     */
    filterContextRef?: ObjRef;

    /**
     * Client identifier.
     *
     * @remarks
     * It's required, if the backend implementation supports it and workspace is provisioned via LCM.
     */
    clientId?: string;

    /**
     * Data product identifier.
     * @remarks
     * It's required, if the backend implementation supports it and workspace is provisioned via LCM.
     */
    dataProductId?: string;
}

/**
 * @internal
 */
export type PrivateDashboardContext = DashboardModelCustomizationFns & {
    /**
     * If specified, the dashboard initialization should use this dashboard definition instead of
     * loading dashboard from backend.
     */
    preloadedDashboard?: IDashboard;
    /**
     * Provide a function that will be used during dashboard initialization and can add overlays with some info
     * about modification or insertion by plugin
     *
     * @remarks
     *
     * -  If the function is not defined, then no overlays will be rendered
     */
    widgetsOverlayFn?: WidgetsOverlayFn;
};

/**
 * @public
 */
export type DashboardTransformFn = (
    dashboard: IDashboard<ExtendedDashboardWidget>,
) => IDashboard<ExtendedDashboardWidget> | undefined;

/**
 * @public
 */
export type DashboardLayoutExportTransformFn = <TWidget>(
    layout: IDashboardLayout<TWidget>,
    focusObject?: DashboardFocusObject,
) => IDashboardLayout<TWidget> | undefined;

/**
 * @public
 */
export interface DashboardModelCustomizationFns {
    /**
     * Provide a function that will be used during dashboard initialization of an existing dashboard.
     *
     * @remarks
     * This function will be called after the dashboard is loaded from backend and before it is dispatched for
     * cleanup, sanitization and storage in the Dashboard component state.
     *
     * -  If the function is not defined, results in an error or returns `undefined`, then the original
     *    dashboard will be used as-is.
     */
    existingDashboardTransformFn?: DashboardTransformFn;

    /**
     * Provide a function that will be used during dashboard export initialization of an existing dashboard.
     *
     * @remarks
     * This function will be called after the dashboard is loaded from backend transformed by another plugins
     * and before is rendered to the export. This will be not stored in the state.
     *
     *  - If the function is not defined, results in an error or returns `undefined`, then the original
     *  dashboard export transformation will be used as-is.
     */
    existingExportTransformFn?: DashboardLayoutExportTransformFn;
}

/**
 * @alpha
 */
export type WidgetsOverlayFn = (
    dashboard: IDashboard<ExtendedDashboardWidget>,
) => Record<string, IDashboardWidgetOverlay>;

/**
 * @beta
 */
export interface IDashboardWidgetOverlay {
    /**
     * Overlay over widget is display
     *
     * @alpha
     */
    showOverlay: boolean;

    /**
     * Modifications type for widget
     *
     * @remarks
     * "insertedByPlugin"
     * Widget is inserted by plugin and is not originally in layout
     *
     * "modifiedByPlugin"
     * Widget is originally in layout but was modified by plugin by adding some decorators, tags, providers and so on
     *
     * @alpha
     */
    modification?: "insertedByPlugin" | "modifiedByPlugin";
}

/**
 * @alpha
 */
export interface IResolvedAttributeFilterValues {
    [elementRef: string]: string | undefined | null; // restricted elements values cant be resolved
}

/**
 * @alpha
 */
export interface IResolvedDateFilterValue {
    from: string;
    to: string;
}

/**
 * @alpha
 */
export type ResolvedDateFilterValues = IResolvedDateFilterValue[];

/**
 * Resolved values types for all resolvable filters.
 *
 * @alpha
 */
export interface IResolvedFilterValues {
    dateFilters: ResolvedDateFilterValues;
    attributeFilters: {
        [filterStringRef: string]: IResolvedAttributeFilterValues;
    };
}

/**
 * Supported dashboard filter types for values resolution.
 *
 * @alpha
 */
export type ResolvableFilter = IDashboardFilter;

/**
 * Contains information about dashboard filters.
 *
 * @alpha
 */
export type FiltersInfo = {
    filters: IDashboardFilter[];
    resolvedFilterValues?: IResolvedFilterValues;
};
