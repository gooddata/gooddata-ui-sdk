// (C) 2020 GoodData Corporation
import { ISettings } from "../../common/settings";

/**
 * This query service provides access to feature flags that are in effect for particular workspace.
 *
 * @public
 */
export interface IUserSettingsService {
    /**
     * Asynchronously queries actual feature flags.
     */
    query(): Promise<IUserSettings>;
}

/**
 * Settings for particular workspace.
 *
 * @public
 */
export interface IUserSettings extends ISettings {
    /**
     * User to which the settings belong.
     */
    userId: string;
}
