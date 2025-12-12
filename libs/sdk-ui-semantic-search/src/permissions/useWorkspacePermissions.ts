// (C) 2022-2025 GoodData Corporation
import { type AnalyticalBackendError, type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IWorkspacePermissions } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { emptyWorkspacePermissions } from "./utils.js";

export function useWorkspacePermissions(
    backendProvided?: IAnalyticalBackend,
    workspaceIdProvided?: string,
): {
    result: Partial<IWorkspacePermissions>;
    error?: AnalyticalBackendError;
    loading: boolean;
} {
    const backend = useBackendStrict(backendProvided);
    const workspaceId = useWorkspaceStrict(workspaceIdProvided);

    const promise = () =>
        workspaceId
            ? backend.workspace(workspaceId).permissions().getPermissionsForCurrentUser()
            : Promise.resolve<undefined>(undefined);

    const { result, status, error } = useCancelablePromise({ promise }, [backend, workspaceId]);

    return {
        error,
        result: result || emptyWorkspacePermissions(),
        loading: status === "loading" || status === "pending",
    };
}
