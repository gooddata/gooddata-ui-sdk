// (C) 2021-2022 GoodData Corporation
import identity from "lodash/identity.js";
import {
    IAnalyticalBackend,
    IUserWorkspaceSettings,
    IWorkspaceSettings,
    IWorkspaceSettingsService,
} from "@gooddata/sdk-backend-spi";
import { ISettings } from "@gooddata/sdk-model";
import { decoratedBackend, WorkspaceSettingsDecoratorFactory } from "../decoratedBackend/index.js";
import { DecoratedWorkspaceSettingsService } from "../decoratedBackend/workspaceSettings.js";

/**
 * Adjusts workspace config
 *
 * @beta
 */
export type SettingsWrapper = (settings: IWorkspaceSettings) => IWorkspaceSettings;

/**
 * Adjusts current user config
 *
 * @beta
 */
export type CurrentUserSettingsWrapper = (settings: IUserWorkspaceSettings) => IUserWorkspaceSettings;

/**
 * Adjusts both workspace and user settings
 *
 * @beta
 */
export type CommonSettingsWrapper = (settings: ISettings) => ISettings;

class WithModifiedWorkspaceSettingsService extends DecoratedWorkspaceSettingsService {
    constructor(
        decorated: IWorkspaceSettingsService,
        readonly settingsWrapper: SettingsWrapper,
        readonly currentUserSettingsWrapper: CurrentUserSettingsWrapper,
        readonly commonSettingsSetter: CommonSettingsWrapper,
    ) {
        super(decorated);
    }

    async getSettings(): Promise<IWorkspaceSettings> {
        const settings = await this.decorated.getSettings();
        return this.settingsWrapper({
            ...settings,
            ...this.commonSettingsSetter(settings),
        });
    }

    async getSettingsForCurrentUser(): Promise<IUserWorkspaceSettings> {
        const currentUserSettings = await this.decorated.getSettingsForCurrentUser();
        return this.currentUserSettingsWrapper({
            ...currentUserSettings,
            ...this.commonSettingsSetter(currentUserSettings),
        });
    }
}

function customWorkspaceSettings(config: WorkspaceSettingsConfiguration): WorkspaceSettingsDecoratorFactory {
    const emptySettingsSetter = () => ({});
    return (original: IWorkspaceSettingsService) =>
        new WithModifiedWorkspaceSettingsService(
            original,
            config.settingsWrapper || identity,
            config.currentUserSettingsWrapper || identity,
            config.commonSettingsWrapper || emptySettingsSetter,
        );
}

/**
 * Specifies workspace settings and current user settings to be adjusted by the decorator.
 *
 * @beta
 */
export interface WorkspaceSettingsConfiguration {
    /**
     * Transforms both workspace settings and user settings obtained from the real backend. Can add,
     * remove or alter settings or provide a completely new settings.
     * Execution of this wrapper precedes execution of the specific wrappers for user and workspace settings
     */
    commonSettingsWrapper?: CommonSettingsWrapper;
    /**
     * Transforms workspace settings obtained from the real backend. Can add, remove or alter settings
     * or provide a completely new settings
     */
    settingsWrapper?: SettingsWrapper;
    /**
     * Transforms user settings obtained from the real backend. Can add, remove or alter settings
     * or provide a completely new settings
     */
    currentUserSettingsWrapper?: CurrentUserSettingsWrapper;
}

/**
 * Adjusts workspace configs and current user configs from the real backend.
 *
 * @remarks see {@link WorkspaceSettingsConfiguration} properties for more information.
 * @param realBackend - real backend to decorate with custom workspace settings
 * @param config - workspace configs configuration
 * @beta
 */

export function withCustomWorkspaceSettings(
    realBackend: IAnalyticalBackend,
    config: WorkspaceSettingsConfiguration,
): IAnalyticalBackend {
    const workspaceSettings = customWorkspaceSettings(config);
    return decoratedBackend(realBackend, { workspaceSettings });
}
