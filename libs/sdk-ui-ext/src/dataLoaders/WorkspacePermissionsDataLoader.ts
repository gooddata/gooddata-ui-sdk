// (C) 2021-2026 GoodData Corporation

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IWorkspacePermissions } from "@gooddata/sdk-model";

import { dataLoaderAbstractFactory } from "./DataLoaderAbstractFactory.js";

/**
 * @internal
 */
export interface IWorkspacePermissionsDataLoader {
    /**
     * Obtains the workspace permissions for the current workspace.
     * @param backend - the {@link IAnalyticalBackend} instance to use to communicate with the backend
     */
    getWorkspacePermissions(backend: IAnalyticalBackend): Promise<IWorkspacePermissions>;
}

class WorkspacePermissionsDataLoader implements IWorkspacePermissionsDataLoader {
    private cachedWorkspacePermissions: Promise<IWorkspacePermissions> | undefined;

    constructor(protected readonly workspace: string) {}

    public getWorkspacePermissions(backend: IAnalyticalBackend): Promise<IWorkspacePermissions> {
        if (!this.cachedWorkspacePermissions) {
            this.cachedWorkspacePermissions = backend
                .workspace(this.workspace)
                .permissions()
                .getPermissionsForCurrentUser()
                .catch((error) => {
                    this.cachedWorkspacePermissions = undefined;
                    throw error;
                });
        }

        return this.cachedWorkspacePermissions;
    }
}

/**
 * @internal
 */
export const workspacePermissionsDataLoaderFactory =
    dataLoaderAbstractFactory<IWorkspacePermissionsDataLoader>(
        (workspace) => new WorkspacePermissionsDataLoader(workspace),
    );
