// (C) 2020-2024 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IWorkspaceUser } from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    useBackendStrict,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

interface IUseWorkspaceUsersConfig extends UseCancelablePromiseCallbacks<IWorkspaceUser[], GoodDataSdkError> {
    /**
     * Option to filter users by the provided string.
     */
    search?: string;

    /**
     * Enable or disable the hook.
     */
    enable?: boolean;

    /**
     * Organization to work with.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace to work with.
     */
    workspace?: string;
}

/**
 * Hook allowing to download workspace users
 * @param config - configuration of the hook
 * @internal
 */
export function useWorkspaceUsers({
    workspace,
    backend,
    search,
    enable,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
}: IUseWorkspaceUsersConfig): UseCancelablePromiseState<IWorkspaceUser[], any> {
    const effectiveBackend = useBackendStrict(backend, "useWorkspaceUsers");
    const effectiveWorkspace = useWorkspaceStrict(workspace, "useWorkspaceUsers");

    return useCancelablePromise(
        {
            promise: enable ? () => effectiveBackend.workspace(effectiveWorkspace).users().queryAll() : null,
            onCancel,
            onError,
            onLoading,
            onPending,
            onSuccess,
        },
        [backend, workspace, search],
    );
}
