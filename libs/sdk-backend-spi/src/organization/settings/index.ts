// (C) 2022-2026 GoodData Corporation

import {
    type DashboardFiltersApplyMode,
    type IActiveCalendars,
    type IAlertDefault,
    type IFiscalYear,
    type IMetricFormatOverrideSetting,
    type IOpenAiConfig,
    type ISeparators,
    type ISettings,
    type IWhiteLabeling,
} from "@gooddata/sdk-model";

/**
 * This service provides access to organization settings
 *
 * @public
 */
export interface IOrganizationSettingsService {
    /**
     * Sets whiteLabeling for organization.
     *
     * @param whiteLabeling - describes whitelabeling setting for logoUrl, faviconUrl etc.
     *
     * @returns promise
     */
    setWhiteLabeling(whiteLabeling: IWhiteLabeling): Promise<void>;

    /**
     * Sets locale for organization.
     *
     * @param locale - IETF BCP 47 Code locale ID, for example "en-US", "cs-CZ", etc.
     *
     * @returns promise
     */
    setLocale(locale: string): Promise<void>;

    /**
     * Sets metadata locale for organization.
     *
     * @param locale - IETF BCP 47 Code locale ID, for example "en-US", "cs-CZ", etc.
     *
     * @returns promise
     */
    setMetadataLocale(locale: string): Promise<void>;

    /**
     * Sets format locale for organization.
     *
     * @param locale - IETF BCP 47 Code locale ID, for example "en-US", "cs-CZ", etc.
     *
     * @returns promise
     */
    setFormatLocale(locale: string): Promise<void>;

    /**
     * Set separators for the organization
     *
     * @param separators - separators for the organization
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
     * Deletes active LLM endpoint for the organization.
     *
     * @returns promise
     */
    deleteActiveLlmEndpoint(): Promise<void>;

    /**
     * Sets timezone for organization.
     *
     * @param timezone - the value based on IANA time zone database naming convention.
     * for example: "America/Los_Angeles", etc.
     *
     * @returns promise
     */
    setTimezone(timezone: string): Promise<void>;

    /**
     * Sets date format for organization.
     *
     * @param dateFormat - the format based on the ICU standard, for example: "en-US", "cs-CZ", etc.
     *
     * @returns promise
     */
    setDateFormat(dateFormat: string): Promise<void>;

    /**
     * Sets attachment size limit sent to email for organization.
     *
     * @param size - the size in bytes.
     *
     * @returns promise
     */
    setAttachmentSizeLimit(size: number): Promise<void>;

    /**
     * Sets first day of week for organization.
     *
     * @param weekStart - "Sunday | "Monday"
     *
     * @returns promise
     */
    setWeekStart(weekStart: string): Promise<void>;

    /**
     * Sets fiscal calendar for organization.
     *
     * @param fiscalYear - fiscal year configuration including month offset and optional prefixes.
     *
     * @returns promise
     */
    setFiscalCalendar(fiscalYear: IFiscalYear): Promise<void>;

    /**
     * Sets active calendars configuration for organization.
     *
     * @param calendars - configuration for which calendars are enabled and which is the default.
     *
     * @returns promise
     */
    setActiveCalendars(calendars: IActiveCalendars): Promise<void>;

    /**
     * Sets theme for organization.
     *
     * @param themeId - ID of the theme to apply to workspaces in organization.
     *
     * @returns promise
     */
    setTheme(themeId: string): Promise<void>;

    /**
     * Sets alert default
     *
     * @param value - describes parameters for alerting.
     *
     * @returns promise
     */
    setAlertDefault(value: IAlertDefault): Promise<void>;

    /**
     * Sets color palette for organization.
     *
     * @param colorPaletteId - ID of the color palette to apply to charts in organization.
     *
     * @returns promise
     */
    setColorPalette(colorPaletteId: string): Promise<void>;

    /**
     * Sets OpenAI configuration for organization.
     *
     * @param config - describes parameters for OpenAI integration.
     *
     * @returns promise
     * @alpha
     */
    setOpenAiConfig(config: IOpenAiConfig): Promise<void>;

    /**
     * Sets DashboardFiltersApplyMode configuration for organization.
     *
     * @param dashboardFiltersApplyMode - describes new mode for applying dashboard filters.
     *
     * @returns promise
     * @alpha
     */
    setDashboardFiltersApplyMode(dashboardFiltersApplyMode: DashboardFiltersApplyMode): Promise<void>;

    /**
     * Deletes theme from organization settings returning workspace styling to default.
     *
     * @returns promise
     */
    deleteTheme(): Promise<void>;

    /**
     * Deletes color palette from organization settings returning chart colors to default.
     *
     * @returns promise
     */
    deleteColorPalette(): Promise<void>;

    /**
     * Sets metric format override for organization.
     *
     * @param override - mapping of metric types to custom format strings.
     *
     * @returns promise
     */
    setMetricFormatOverride(override: IMetricFormatOverrideSetting): Promise<void>;

    /**
     * Sets the maximum zoom level allowed for geo visualizations in the organization.
     *
     * @param level - maximum zoom level, or null to clear the limit.
     *
     * @returns promise
     */
    setMaxZoomLevel(level: number | null): Promise<void>;

    /**
     * Returns effective organization settings with all defaults resolved.
     *
     * @remarks
     * The returned settings include system defaults, not just those directly set
     * at the organization level. User-specific overrides are excluded.
     * User has to have an organization level permission to access them.
     *
     * @returns promise of resolved settings
     */
    getSettings(): Promise<ISettings>;
}
