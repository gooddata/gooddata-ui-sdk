// (C) 2022-2025 GoodData Corporation
import { AnalyticalBackendError } from "@gooddata/sdk-backend-spi";
import { IWorkspacePermissions } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise } from "@gooddata/sdk-ui";

import { emptyWorkspacePermissions } from "./utils.js";

export function useWorkspacePermissions(workspaceId: string): {
    result: Partial<IWorkspacePermissions>;
    error?: AnalyticalBackendError;
    loading: boolean;
} {
    const backend = useBackendStrict();

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
