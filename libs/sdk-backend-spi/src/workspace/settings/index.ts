// (C) 2019-2025 GoodData Corporation

import {
    type DashboardFiltersApplyMode,
    type IAlertDefault,
    type IMetricFormatOverrideSetting,
    type ISeparators,
} from "@gooddata/sdk-model";

import { type IUserWorkspaceSettings, type IWorkspaceSettings } from "../../common/settings.js";

/**
 * This query service provides access to feature flags that are in effect for particular workspace.
 *
 * @public
 */
export interface IWorkspaceSettingsService {
    /**
     * Sets alert default
     *
     * @param value - describes parameters for alerting.
     *
     * @returns promise
     */
    setAlertDefault(value: IAlertDefault): Promise<void>;

    /**
     * Asynchronously queries actual feature flags.
     *
     * @returns promise of workspace settings
     */
    getSettings(): Promise<IWorkspaceSettings>;

    /**
     * Asynchronously queries feature flags taking into account settings from both the workspace and the current user.
     *
     * @returns promise of user/workspace settings
     */
    getSettingsForCurrentUser(): Promise<IUserWorkspaceSettings>;

    /**
     * Sets locale for current workspace.
     *
     * @param locale - IETF BCP 47 Code locale ID, for example "en-US", "cs-CZ", etc.
     *
     * @returns promise
     */
    setLocale(locale: string): Promise<void>;

    /**
     * Sets metadata locale for current workspace.
     *
     * @param locale - IETF BCP 47 Code locale ID, for example "en-US", "cs-CZ", etc.
     *
     * @returns promise
     */
    setMetadataLocale(locale: string): Promise<void>;

    /**
     * Sets format locale for current workspace.
     *
     * @param locale - IETF BCP 47 Code locale ID, for example "en-US", "cs-CZ", etc.
     *
     * @returns promise
     */
    setFormatLocale(locale: string): Promise<void>;

    /**
     * Set separators for the current workspace
     *
     * @param separators - separators for the current workspace
     *
     * @returns promise
     */
    setSeparators(separators: ISeparators): Promise<void>;

    /**
     * Set active LLM endpoint for the organization.
     *
     * @param endpoint - id of the LLM endpoint to set as active for the organization.
     *
     * @returns promise
     */
    setActiveLlmEndpoint(endpoint: string): Promise<void>;

    /**
     * Sets timezone for current workspace.
     *
     * @param timezone - the value based on IANA time zone database naming convention.
     * for example: "America/Los_Angeles", etc.
     *
     * @returns promise
     */
    setTimezone(timezone: string): Promise<void>;

    /**
     * Sets date format for current workspace.
     *
     * @param dateFormat - the format based on the ICU standard, for example: "en-US", "cs-CZ", etc.
     *
     * @returns promise
     */
    setDateFormat(dateFormat: string): Promise<void>;

    /**
     * Sets first day of week for current workspace.
     *
     * @param weekStart - "Sunday | "Monday"
     *
     * @returns promise
     */
    setWeekStart(weekStart: string): Promise<void>;

    /**
     * Sets fiscal calendar for current workspace.
     *
     * @param monthOffset - number of months the fiscal year is offset from the calendar year. Can be positive or negative.
     *
     * @returns promise
     */
    setCalendar(monthOffset: number): Promise<void>;

    /**
     * Deletes fiscal calendar from workspace settings returning calendar to default.
     *
     * @returns promise
     */
    deleteCalendar(): Promise<void>;

    /**
     * Sets DashboardFiltersApplyMode configuration for workspace. Default is taken from organization setting.
     *
     * @param dashboardFiltersApplyMode - describes new mode for applying dashboard filters.
     *
     * @returns promise
     * @alpha
     */
    setDashboardFiltersApplyMode(dashboardFiltersApplyMode: DashboardFiltersApplyMode): Promise<void>;

    /**
     * Clears DashboardFiltersApplyMode configuration for workspace
     * so default value from organization is used.
     *
     * @returns promise
     * @alpha
     */
    deleteDashboardFiltersApplyMode(): Promise<void>;

    /**
     * Sets color palette for current workspace.
     *
     * @param colorPaletteId - ID of the color palette to apply to charts in workspace.
     *
     * @returns promise
     */
    setColorPalette(colorPaletteId: string): Promise<void>;

    /**
     * Sets theme for current workspace.
     *
     * @param themeId - ID of the theme to apply to the current workspace.
     *
     * @returns promise
     */
    setTheme(themeId: string): Promise<void>;

    /**
     * Deletes theme from workspace settings returning workspace styling to default.
     *
     * @returns promise
     */
    deleteTheme(): Promise<void>;

    /**
     * Deletes color palette from workspace settings returning chart colors to default.
     *
     * @returns promise
     */
    deleteColorPalette(): Promise<void>;

    /**
     * Sets metric format override for the current workspace.
     *
     * @param override - mapping of metric types to custom format strings.
     *
     * @returns promise
     */
    setMetricFormatOverride(override: IMetricFormatOverrideSetting): Promise<void>;

    /**
     * Deletes metric format override from workspace settings,
     * returning to inherited organization-level format.
     *
     * @returns promise
     */
    deleteMetricFormatOverride(): Promise<void>;
}
