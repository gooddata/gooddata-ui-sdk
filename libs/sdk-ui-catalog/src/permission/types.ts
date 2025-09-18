// (C) 2025 GoodData Corporation

import type { AnalyticalBackendError, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import type { IUser, IWorkspacePermissions } from "@gooddata/sdk-model";
import type { UseCancelablePromiseState } from "@gooddata/sdk-ui";

export type PermissionsState = UseCancelablePromiseState<
    {
        user: IUser;
        permissions: IWorkspacePermissions;
        settings: IUserWorkspaceSettings;
    },
    AnalyticalBackendError
>;
