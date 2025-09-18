// (C) 2025 GoodData Corporation

import type {
    AnalyticalBackendError,
    IAnalyticalBackend,
    IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";
import type { IUser, IWorkspacePermissions } from "@gooddata/sdk-model";
import { useCancelablePromise } from "@gooddata/sdk-ui";

import type { PermissionsState } from "./types.js";

type Options = {
    backend: IAnalyticalBackend;
    workspace: string;
};

export function usePermissionsQuery({ backend, workspace }: Options): PermissionsState {
    return useCancelablePromise<
        { user: IUser; permissions: IWorkspacePermissions; settings: IUserWorkspaceSettings },
        AnalyticalBackendError
    >(
        {
            promise: async () => {
                const [user, permissions, settings] = await Promise.all([
                    backend.currentUser().getUserWithDetails(),
                    backend.workspace(workspace).permissions().getPermissionsForCurrentUser(),
                    backend.workspace(workspace).settings().getSettingsForCurrentUser(),
                ]);

                return {
                    settings,
                    permissions,
                    user,
                };
            },
        },
        [backend, workspace],
    );
}
