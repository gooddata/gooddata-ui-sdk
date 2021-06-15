// (C) 2021 GoodData Corporation
import { IAnalyticalBackend, IDateFilterConfig, ISeparators, ISettings } from "@gooddata/sdk-backend-spi";
import { IColorPalette, ObjRef } from "@gooddata/sdk-model";
import { ILocale } from "@gooddata/sdk-ui";
import keys from "lodash/keys";
import includes from "lodash/includes";

/**
 * Dashboard configuration can influence the available features, look and feel and behavior of the dashboard.
 *
 * @internal
 */
export type DashboardConfig = {
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
     * Date filter configuration is used to influence what filtering presets (options) should be
     * available on the date filter component.
     */
    dateFilterConfig?: IDateFilterConfig;

    /**
     * Color palette to pass down to charts.
     */
    colorPalette?: IColorPalette;

    /**
     * Token for Mapbox API. You need this to use GeoCharts in your dashboards.
     *
     * @remarks To create a Mapbox account and an access token, see [this guide](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/).
     */
    mapboxToken?: string;

    /**
     * If set to true, the dashboard will be embedded in a read-only mode disabling any user interaction
     * that would alter any backend state (disabling creating/changing alerts, creating scheduled emails, etc.).
     *
     * Defaults to false i.e. NOT a read-only mode.
     */
    isReadOnly?: boolean;
};

/**
 * Dashboard configuration resolved using the config passed in via props and any essential data retrieved from
 * backend.
 *
 * Note: the resolved config may still contain some undefined properties:
 *
 * -  `mapboxToken` - has to be provided by the context
 * -  `isReadOnly` - is purely choice of context in which the dashboard is used
 *
 * @internal
 */
export type ResolvedDashboardConfig = Omit<Required<DashboardConfig>, "mapboxToken" | "isReadOnly"> &
    DashboardConfig;

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
 * Values in this context will be available to all sagas.
 *
 * @internal
 */
export type DashboardContext = {
    /**
     * Analytical Backend where the dashboard exists.
     */
    backend: IAnalyticalBackend;

    /**
     * Analytical Backend where the dashboard exists.
     */
    workspace: string;

    /**
     * Dashboard that should be loaded into the store.
     */
    dashboardRef: ObjRef;
};
