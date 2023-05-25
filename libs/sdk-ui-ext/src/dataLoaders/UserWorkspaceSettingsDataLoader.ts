// (C) 2021 GoodData Corporation
import { IAnalyticalBackend, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { dataLoaderAbstractFactory } from "./DataLoaderAbstractFactory.js";

/**
 * @internal
 */
export interface IUserWorkspaceSettingsDataLoader {
    /**
     * Obtains the color palette for the current workspace.
     * @param backend - the {@link IAnalyticalBackend} instance to use to communicate with the backend
     */
    getUserWorkspaceSettings(backend: IAnalyticalBackend): Promise<IUserWorkspaceSettings>;
}

class UserWorkspaceSettingsDataLoader implements IUserWorkspaceSettingsDataLoader {
    private cachedUserWorkspaceSettings: Promise<IUserWorkspaceSettings> | undefined;

    constructor(protected readonly workspace: string) {}

    public getUserWorkspaceSettings(backend: IAnalyticalBackend): Promise<IUserWorkspaceSettings> {
        if (!this.cachedUserWorkspaceSettings) {
            this.cachedUserWorkspaceSettings = backend
                .workspace(this.workspace)
                .settings()
                .getSettingsForCurrentUser()
                .catch((error) => {
                    this.cachedUserWorkspaceSettings = undefined;
                    throw error;
                });
        }

        return this.cachedUserWorkspaceSettings;
    }
}

/**
 * @internal
 */
export const userWorkspaceSettingsDataLoaderFactory =
    dataLoaderAbstractFactory<IUserWorkspaceSettingsDataLoader>(
        (workspace) => new UserWorkspaceSettingsDataLoader(workspace),
    );
