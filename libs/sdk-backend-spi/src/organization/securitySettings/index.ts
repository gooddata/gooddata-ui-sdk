// (C) 2021 GoodData Corporation

/**
 * The type of context in which is tested URL valid.
 *
 * @public
 */
export type ValidationContext = "CORS" | "UI_EVENT" | "DRILL_TO_URI";

/**
 * This service provides access to security settings defined on backend.
 *
 * @public
 */
export interface ISecuritySettingsService {
    /**
     * The scope in which is security settings accessed (URI of organization, workspace, user profile).
     */
    readonly scope: string;

    /**
     * Validate URL against backend list of allowed URLs.
     *
     * @param url - URL for validation.
     * @param context - context in which the URL must be valid.
     * @returns promise with boolean: true when validated URL is allowed as external host, false if it is not.
     */
    isUrlValid(url: string, context: ValidationContext): Promise<boolean>;

    /**
     * Validate plugin URL against list of allowed hosting locations.
     *
     * Dashboard plugins MUST be loaded only from allowed locations. If the plugin is hosted elsewhere, it
     * MUST NOT be loaded.
     *
     * @param url - plugin content URL
     * @param workspace - workspace in context of which the validation is done
     */
    isDashboardPluginUrlValid(url: string, workspace: string): Promise<boolean>;
}
