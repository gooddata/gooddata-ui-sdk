// (C) 2020-2025 GoodData Corporation

import { IUserSettings } from "@gooddata/sdk-backend-spi";
import { ISettings } from "@gooddata/sdk-model";

import { DefaultFeatureFlags } from "./uiFeatures.js";

/**
 * Locale for the applications.
 */
export const DefaultLocale: string = "en-US";

export const DefaultWeekStart: string = "Sunday";

/**
 * Number separators.
 */
export const DefaultSeparators = {
    thousand: ",",
    decimal: ".",
};

/**
 * Tiger does not yet have endpoints for settings. All the UI-specific
 * settings are thus hardcoded here.
 */
export const DefaultUiSettings: ISettings = {
    platformEdition: "enterprise",
    portalLogoPage: false,
    enableAnalyticalDashboards: true,
    enableKPIDashboardDependentFilters: false,
    enableSectionHeaders: true,

    // embedding AD in KD
    enableKPIDashboardNewInsight: true,

    // drilling
    enableFilterValuesResolution: false,

    enableDataSection: true,
    enableNewAnalyticalDashboardsNavigation: true,

    // enable the plugin-ready Dashboard component in gdc-dashboards
    dashboardComponentDevRollout: true,

    enableKPIDashboardExport: true,
    enableAdDescriptionEdit: true,
    drillIntoUrlDocumentationLink:
        "https://www.gooddata.com/developers/cloud-native/doc/cloud/create-dashboards/drilling-in-dashboards/set-drill-into-hyperlink/",

    tableSortingCheckDisabled: true,
    metadataTimeZone: "UTC", // Panther/Tiger metadata are always stored in UTC time zone
    separators: DefaultSeparators,
    ...DefaultFeatureFlags,
};

/**
 * Default user settings. Make sure to override the 'userId' with the real id when using.
 */
export const DefaultUserSettings: IUserSettings = {
    userId: "template",
    locale: DefaultLocale,
    separators: DefaultSeparators,
    ...DefaultUiSettings,
};
