// (C) 2021 GoodData Corporation
import { IAnalyticalBackend, IWorkspacePermissions } from "@gooddata/sdk-backend-spi";

import { dataLoaderAbstractFactory } from "./DataLoaderAbstractFactory";

interface IUserWorkspacePermissionsDataLoader {
    /**
     * Obtains the user workspace permissions for the current user workspace.
     * @param backend - the {@link IAnalyticalBackend} instance to use to communicate with the backend
     */
    getUserWorkspacePermissions(backend: IAnalyticalBackend): Promise<IWorkspacePermissions>;
}

class UserWorkspacePermissionsDataLoader implements IUserWorkspacePermissionsDataLoader {
    private cachedUserWorkspacePermissions: Promise<IWorkspacePermissions> | undefined;

    constructor(protected readonly workspace: string) {}

    public getUserWorkspacePermissions(backend: IAnalyticalBackend): Promise<IWorkspacePermissions> {
        if (!this.cachedUserWorkspacePermissions) {
            this.cachedUserWorkspacePermissions = backend
                .workspace(this.workspace)
                .permissions()
                .getPermissionsForCurrentUser()
                .catch((error) => {
                    this.cachedUserWorkspacePermissions = undefined;
                    throw error;
                });
        }

        return this.cachedUserWorkspacePermissions;
    }
}

/**
 * @internal
 */
export const userWorkspacePermissionsDataLoaderFactory =
    dataLoaderAbstractFactory<IUserWorkspacePermissionsDataLoader>(
        (workspace) => new UserWorkspacePermissionsDataLoader(workspace),
    );
