// (C) 2020 GoodData Corporation
import { IUserSettings } from "../../common/settings";

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
}
