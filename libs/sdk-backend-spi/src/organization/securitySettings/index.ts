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
     * Validate URL against backend whitelist.
     *
     * @param url - URL for validation.
     * @param context - context in which the URL must be valid.
     * @returns promise with boolean: true when validated URL is allowed as external host, false if it is not.
     */
    isUrlValid(url: string, context: ValidationContext): Promise<boolean>;
}
