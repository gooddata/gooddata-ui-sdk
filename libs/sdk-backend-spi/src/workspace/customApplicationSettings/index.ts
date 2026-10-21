// (C) 2026 GoodData Corporation

import { type ICustomApplicationSetting } from "@gooddata/sdk-model";

/**
 * Service that manages the settings that applications store in a workspace.
 *
 * @alpha
 */
export interface IWorkspaceCustomApplicationSettingsService {
    /**
     * Returns the settings stored in the workspace.
     *
     * @param applicationName - when set, returns only the settings of this application
     */
    getSettings(applicationName?: string): Promise<ICustomApplicationSetting[]>;

    /**
     * Returns one setting.
     *
     * @param id - identifier of the setting
     */
    getSetting(id: string): Promise<ICustomApplicationSetting>;

    /**
     * Creates a setting.
     *
     * @param applicationName - name of the application that owns the setting
     * @param content - content of the setting
     * @param id - identifier of the setting; when not set, the backend generates one
     */
    createSetting(applicationName: string, content: object, id?: string): Promise<ICustomApplicationSetting>;

    /**
     * Deletes a setting.
     *
     * @param id - identifier of the setting
     */
    deleteSetting(id: string): Promise<void>;
}
