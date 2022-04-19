// (C) 2021-2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    IColorPalette,
    ObjRef,
    IDateFilterConfig,
    IDashboard,
    ISettings,
    ISeparators,
} from "@gooddata/sdk-model";
import { ILocale } from "@gooddata/sdk-ui";
import keys from "lodash/keys";
import includes from "lodash/includes";
import { IDashboardFilter, IMenuButtonItemsVisibility, RenderMode } from "../../types";
import { ExtendedDashboardWidget } from "./layoutTypes";

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
     * Specify which render mode will be use d for initial rendering.
     *
     * @remarks
     * If you do not specify initialRenderMode, the dashboard component will be display in view mode.
     */
    initialRenderMode?: RenderMode;
}

/**
 * Dashboard configuration resolved using the config passed in via props and any essential data retrieved from
 * backend.
 *
 * @remarks
 * Note: the resolved config may still contain some undefined properties:
 *
 * -  `mapboxToken` - has to be provided by the context
 * -  `isReadOnly` - is purely choice of context in which the dashboard is used
 *
 * @public
 */
export type ResolvedDashboardConfig = Omit<Required<DashboardConfig>, "mapboxToken"> & DashboardConfig;

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

    const specifiedConfig = keys(config);

    return RequiredConfigKeys.every((key) => includes(specifiedConfig, key));
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
}

/**
 * @alpha
 */
export interface IResolvedAttributeFilterValues {
    [elementRef: string]: string | undefined; // restricted elements values cant be resolved
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
