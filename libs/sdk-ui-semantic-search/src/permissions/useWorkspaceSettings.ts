// (C) 2026 GoodData Corporation

import { type AnalyticalBackendError, type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IUserWorkspaceSettings } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

export function useWorkspaceSettings(
    backendProvided?: IAnalyticalBackend,
    workspaceIdProvided?: string,
): {
    result: Partial<IUserWorkspaceSettings>;
    error?: AnalyticalBackendError;
    loading: boolean;
} {
    const backend = useBackendStrict(backendProvided);
    const workspaceId = useWorkspaceStrict(workspaceIdProvided);

    const promise = () =>
        workspaceId
            ? backend.workspace(workspaceId).settings().getSettingsForCurrentUser()
            : Promise.resolve<undefined>(undefined);

    const { result, status, error } = useCancelablePromise<
        IUserWorkspaceSettings | undefined,
        AnalyticalBackendError | undefined
    >({ promise }, [backend, workspaceId]);

    return {
        error,
        result: result ?? {},
        loading: status === "loading" || status === "pending",
    };
}
