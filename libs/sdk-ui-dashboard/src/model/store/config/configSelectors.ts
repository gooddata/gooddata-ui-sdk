// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../types";
import invariant from "ts-invariant";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.config,
);

/**
 * Returns dashboard's config.
 *
 * @remarks
 * It is expected that the selector is called only after the config state
 * is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectConfig = createSelector(selectSelf, (configState) => {
    invariant(configState.config, "attempting to access uninitialized config state");

    return configState.config!;
});

/**
 * Returns workspace-level configuration for the of the date filter options and presets.
 *
 * @remarks
 * Note: this configuration SHOULD be further augmented by the dashboard-level overrides to obtain
 * the effective date filter configuration.
 *
 * @public
 */
export const selectDateFilterConfig = createSelector(selectConfig, (state) => {
    return state.dateFilterConfig ?? undefined;
});

/**
 * Returns settings that are in effect for the current dashboard.
 *
 * @public
 */
export const selectSettings = createSelector(selectConfig, (state) => {
    return state.settings ?? undefined;
});

/**
 * Returns locale to use for internationalization of the dashboard.
 *
 * @public
 */
export const selectLocale = createSelector(selectConfig, (state) => {
    return state.locale ?? undefined;
});

/**
 * Returns number separators to use when rendering numeric values on charts or KPIs.
 *
 * @public
 */
export const selectSeparators = createSelector(selectConfig, (state) => {
    return state.separators ?? undefined;
});

/**
 * Returns the color palette for dashboard charts.
 *
 * @public
 */
export const selectColorPalette = createSelector(selectConfig, (state) => {
    return state.colorPalette ?? undefined;
});

/**
 * Returns the object availability configuration for this dashboard.
 *
 * @remarks
 * Only objects that match the availability criteria can appear in selections where user has pick
 * an object to use for some purpose (for instance metric for KPI or date dataset to filter by).
 *
 * @public
 */
export const selectObjectAvailabilityConfig = createSelector(selectConfig, (state) => {
    return state.objectAvailability ?? undefined;
});

/**
 * Returns Mapbox token.
 *
 * @internal
 */
export const selectMapboxToken = createSelector(selectConfig, (state) => {
    return state.mapboxToken ?? undefined;
});

/**
 * Returns whether the Dashboard is executed in read-only mode.
 *
 * @remarks
 * Read-only mode disables any interactions that can alter the backend data.
 *
 * @public
 */
export const selectIsReadOnly = createSelector(selectConfig, (state) => {
    return state.isReadOnly ?? false;
});

/**
 * Returns whether the Dashboard is executed in embedded context.
 *
 * @remarks
 * In embedded mode, some interactions may be disabled.
 *
 * @public
 */
export const selectIsEmbedded = createSelector(selectConfig, (state) => {
    return state.isEmbedded ?? false;
});

/**
 * Returns whether the Dashboard is rendered in the export mode.
 * In export mode, some components can be hidden, or rendered differently.
 *
 * @internal
 */
export const selectIsExport = createSelector(selectConfig, (state) => {
    return state.isExport ?? false;
});

/**
 * Returns whether the Dashboard is white labeled.
 *
 * @internal
 */
export const selectIsWhiteLabeled = createSelector(selectConfig, (state) => {
    return state.isWhiteLabeled ?? false;
});

/**
 * Returns whether the default drills configured on the widgets or implicit drills (eg. drill down) are disabled.
 * This option does not affect drilling enabled by drillableItems.
 *
 * @public
 */
export const selectDisableDefaultDrills = createSelector(selectConfig, (state) => {
    return state.disableDefaultDrills ?? false;
});

/**
 * Returns whether filter values in drill events should be resolved.
 *
 * @public
 */
export const selectEnableFilterValuesResolutionInDrillEvents = createSelector(selectConfig, (state) => {
    return state.enableFilterValuesResolutionInDrillEvents ?? false;
});

/**
 * Returns whether the save as new button is hidden.
 *
 * @internal
 */
export const selectIsSaveAsNewButtonHidden = createSelector(selectConfig, (state) => {
    return state.hideSaveAsNewButton ?? false;
});

//
// FEATURE FLAGS
//

/**
 * Returns date format.
 *
 * @public
 */
export const selectDateFormat = createSelector(selectConfig, (state) => {
    return state.settings?.responsiveUiDateFormat ?? undefined;
});

/**
 * Returns whether the current user can schedule emails.
 *
 * @public
 */
export const selectEnableKPIDashboardSchedule = createSelector(selectConfig, (state) => {
    return state.settings?.enableKPIDashboardSchedule ?? false;
});

/**
 * Returns whether the current user can share scheduled email to other recipients.
 *
 * @public
 */
export const selectEnableKPIDashboardScheduleRecipients = createSelector(selectConfig, (state) => {
    return state.settings?.enableKPIDashboardScheduleRecipients ?? false;
});

/**
 * Returns current platform edition.
 *
 * @public
 */
export const selectPlatformEdition = createSelector(selectConfig, (state) => {
    return state.settings?.platformEdition ?? "enterprise";
});

/**
 * Returns whether company logo should be visible in embedded dashboard.
 *
 * @public
 */
export const selectEnableCompanyLogoInEmbeddedUI = createSelector(selectConfig, (state) => {
    return state.settings?.enableCompanyLogoInEmbeddedUI ?? false;
});

/**
 * Returns whether the export to pdf is enabled.
 *
 * @public
 */
export const selectEnableKPIDashboardExportPDF = createSelector(selectConfig, (state) => {
    return state.settings?.enableKPIDashboardExportPDF ?? false;
});

/**
 * Returns whether the drill to dashboard is enabled.
 *
 * @public
 */
export const selectEnableKPIDashboardDrillToDashboard = createSelector(selectConfig, (state) => {
    return state.settings?.enableKPIDashboardDrillToDashboard ?? false;
});

/**
 * Returns whether the save as new dashboard functionality is enabled.
 *
 * @public
 */
export const selectEnableKPIDashboardSaveAsNew = createSelector(selectConfig, (state) => {
    return state.settings?.enableKPIDashboardSaveAsNew ?? false;
});

/**
 * Returns whether implicit drill to attributes url enabled
 *
 * @public
 */
export const selectEnableClickableAttributeURL = createSelector(selectConfig, (state) => {
    return state.settings?.enableClickableAttributeURL ?? true;
});

/**
 * Returns whether drill to url is enabled
 *
 * @public
 */
export const selectEnableKPIDashboardDrillToURL = createSelector(selectConfig, (state) => {
    return state.settings?.enableKPIDashboardDrillToURL ?? false;
});

/**
 * Returns whether drill to insight is enabled
 *
 * @public
 */
export const selectEnableKPIDashboardDrillToInsight = createSelector(selectConfig, (state) => {
    return state.settings?.enableKPIDashboardDrillToInsight ?? false;
});

/**
 * Returns whether implicit drill to attributes url enabled
 *
 * @public
 */
export const selectEnableKPIDashboardImplicitDrillDown = createSelector(selectConfig, (state) => {
    return state.settings?.enableKPIDashboardImplicitDrillDown ?? false;
});

/**
 * Returns whether Kpi drills in embedded mode are disabled.
 *
 * @public
 */
export const selectHideKpiDrillInEmbedded = createSelector(selectConfig, (state) => {
    return state.settings?.hideKpiDrillInEmbedded ?? false;
});

/**
 * Returns whether insight export scheduling is enabled.
 *
 * @public
 */
export const selectEnableInsightExportScheduling = createSelector(selectConfig, (state) => {
    return state.settings?.enableInsightExportScheduling ?? false;
});

/**
 * Returns whether dashboard edit mode is enabled.
 *
 * @internal
 */
export const selectDashboardEditModeDevRollout = createSelector(selectConfig, (state) => {
    return !!state.settings?.dashboardEditModeDevRollout ?? false;
});

/**
 * Returns whether analytical dashboard permissions are enabled
 *
 * @internal
 */
export const selectEnableAnalyticalDashboardPermissions = createSelector(selectConfig, (state) => {
    return state.settings?.enableAnalyticalDashboardPermissions ?? false;
});

/**
 * Returns whether custom widget heights are enabled
 *
 * @internal
 */
export const selectEnableWidgetCustomHeight = createSelector(selectConfig, (state) => {
    return state.settings?.enableKDWidgetCustomHeight ?? false;
});

/**
 * Returns whether we should call workspaces workspaces (true) or projects (false).
 *
 * @internal
 */
export const selectEnableRenamingProjectToWorkspace = createSelector(selectConfig, (state) => {
    return !!(state.settings?.enableRenamingProjectToWorkspace ?? true);
});

/**
 * Returns whether we should call measures metrics (true) or measures (false).
 *
 * @internal
 */
export const selectEnableRenamingMeasureToMetric = createSelector(selectConfig, (state) => {
    return !!(state.settings?.enableRenamingMeasureToMetric ?? false);
});
