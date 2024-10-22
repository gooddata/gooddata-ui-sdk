// (C) 2019-2024 GoodData Corporation
import { ISeparators } from "@gooddata/sdk-model";
import { IWorkspaceSettings, IUserWorkspaceSettings } from "../../common/settings.js";

/**
 * This query service provides access to feature flags that are in effect for particular workspace.
 *
 * @public
 */
export interface IWorkspaceSettingsService {
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
     * Set separators for the current workspace
     *
     * @param separators - separators for the current workspace
     *
     * @returns promise
     */
    setSeparators(separators: ISeparators): Promise<void>;

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
}
