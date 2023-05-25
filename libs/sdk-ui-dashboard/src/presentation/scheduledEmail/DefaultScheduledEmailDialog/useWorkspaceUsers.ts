// (C) 2020-2022 GoodData Corporation
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

import { useDashboardSelector, selectCanListUsersInWorkspace } from "../../../model/index.js";

interface IUseWorkspaceUsersConfig extends UseCancelablePromiseCallbacks<IWorkspaceUser[], GoodDataSdkError> {
    /**
     * Option to filter users by the provided string.
     */
    search?: string;

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
 * Hook allowing to download workspace users
 * @param config - configuration of the hook
 * @internal
 */
export function useWorkspaceUsers({
    search,
    backend,
    workspace,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
}: IUseWorkspaceUsersConfig): UseCancelablePromiseState<IWorkspaceUser[], any> {
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);
    const canListUsersInWorkspace = useDashboardSelector(selectCanListUsersInWorkspace);

    // if the user cannot list the users, do not even try and resolve to an empty array
    const promise = canListUsersInWorkspace
        ? () => {
              let loader = effectiveBackend.workspace(effectiveWorkspace).users();
              if (search) {
                  loader = loader.withOptions({ search: `%${search}` });
              }
              return loader.queryAll();
          }
        : () => Promise.resolve([]);

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
        search,
    ]);
}
