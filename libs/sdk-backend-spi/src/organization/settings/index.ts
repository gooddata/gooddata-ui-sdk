// (C) 2022 GoodData Corporation

import { ISettings, IWhiteLabeling, IOpenAiConfig } from "@gooddata/sdk-model";

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
     * Sets locale for current workspace.
     *
     * @param locale - IETF BCP 47 Code locale ID, for example "en-US", "cs-CZ", etc.
     *
     * @returns promise
     */
    setLocale(locale: string): Promise<void>;

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
     * Sets first day of week for organization.
     *
     * @param weekStart - "Sunday | "Monday"
     *
     * @returns promise
     */
    setWeekStart(weekStart: string): Promise<void>;

    /**
     * Sets theme for organization.
     *
     * @param themeId - ID of the theme to apply to workspaces in organization.
     *
     * @returns promise
     */
    setTheme(themeId: string): Promise<void>;

    /**
     * Sets color palette for organization.
     *
     * @param colorPaletteId - ID of the color palette to apply to charts in organization.
     *
     * @returns promise
     */
    setColorPalette(colorPaletteId: string): Promise<void>;

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
     * Sets OpenAI integration configuration for organization.
     *
     * @param openAiConfig - Open AI config.
     *
     * @returns promise
     */
    setOpenAiConfig(openAiConfig: IOpenAiConfig): Promise<void>;

    /**
     * Get all current organization settings.
     *
     * @remarks
     * User has to have an organization level permission to access them.
     *
     * @returns promise
     */
    getSettings(): Promise<ISettings>;
}
