// (C) 2020-2025 GoodData Corporation
import { ISeparators } from "@gooddata/sdk-model";
import { IUserSettings } from "../../common/settings.js";

/**
 * This query service provides access to feature flags that are in effect for particular user.
 *
 * @public
 */
export interface IUserSettingsService {
    /**
     * Asynchronously queries actual feature flags.
     *
     * @returns promise of the feature flags of the current user
     */
    getSettings(): Promise<IUserSettings>;

    /**
     * Set locale for the current user
     *
     * @param locale - IETF BCP 47 Code locale ID, for example "en-US", "cs-CZ", etc.
     *
     * @returns promise
     */
    setLocale(locale: string): Promise<void>;

    /**
     * Set metadata locale for the current user
     *
     * @param locale - IETF BCP 47 Code locale ID, for example "en-US", "cs-CZ", etc.
     *
     * @returns promise
     */
    setMetadataLocale(locale: string): Promise<void>;

    /**
     * Set separators for the current user
     *
     * @param separators - separators for the current user
     *
     * @returns promise
     */
    setSeparators(separators: ISeparators): Promise<void>;
}
