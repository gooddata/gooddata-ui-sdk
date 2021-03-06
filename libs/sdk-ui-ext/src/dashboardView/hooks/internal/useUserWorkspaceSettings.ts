// (C) 2020-2021 GoodData Corporation
import { IAnalyticalBackend, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import {
    GoodDataSdkError,
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useWorkspace,
} from "@gooddata/sdk-ui";
import { userWorkspaceSettingsDataLoaderFactory } from "../../../dataLoaders";
import { backendInvariant, workspaceInvariant } from "../utils";

interface IUseUserWorkspaceSettingsConfig
    extends UseCancelablePromiseCallbacks<IUserWorkspaceSettings, GoodDataSdkError> {
    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the hook MUST be called within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where the insight exists.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the hook MUST be called within an existing WorkspaceContext.
     */
    workspace?: string;
}

/**
 * Hook allowing to download user workspace settings
 * @param config - configuration of the hook
 * @internal
 */
export function useUserWorkspaceSettings({
    backend,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
    workspace,
}: IUseUserWorkspaceSettingsConfig): UseCancelablePromiseState<IUserWorkspaceSettings, any> {
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    backendInvariant(effectiveBackend, "useUserWorkspaceSettings");
    workspaceInvariant(effectiveWorkspace, "useUserWorkspaceSettings");

    const loader = userWorkspaceSettingsDataLoaderFactory.forWorkspace(effectiveWorkspace);
    const promise = () => loader.getUserWorkspaceSettings(effectiveBackend);

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
    ]);
}
