// (C) 2020-2021 GoodData Corporation
import { IAnalyticalBackend, IWorkspacePermissions } from "@gooddata/sdk-backend-spi";
import {
    GoodDataSdkError,
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useWorkspace,
} from "@gooddata/sdk-ui";
import { userWorkspacePermissionsDataLoaderFactory } from "../dataLoaders";
import { backendInvariant, workspaceInvariant } from "../utils";

interface IUseUserWorkspacePermissionsConfig
    extends UseCancelablePromiseCallbacks<IWorkspacePermissions, GoodDataSdkError> {
    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the hook MUST be called within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace to work with.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the hook MUST be called within an existing WorkspaceContext.
     */
    workspace?: string;
}

/**
 * Hook allowing to download user workspace permissions
 * @param config - configuration of the hook
 * @internal
 */
export function useUserWorkspacePermissions({
    backend,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
    workspace,
}: IUseUserWorkspacePermissionsConfig): UseCancelablePromiseState<IWorkspacePermissions, any> {
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    backendInvariant(effectiveBackend, "useUserWorkspacePermissions");
    workspaceInvariant(effectiveWorkspace, "useUserWorkspacePermissions");

    const loader = userWorkspacePermissionsDataLoaderFactory.forWorkspace(effectiveWorkspace);
    const promise = () => loader.getUserWorkspacePermissions(effectiveBackend);

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
    ]);
}
