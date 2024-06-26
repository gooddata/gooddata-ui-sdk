// (C) 2020-2024 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    useBackendStrict,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

interface IUseWorkspaceAutomationsConfig
    extends UseCancelablePromiseCallbacks<IAutomationMetadataObject[], GoodDataSdkError> {
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
 * Hook allowing to download organization users
 * @param config - configuration of the hook
 * @internal
 */
export function useWorkspaceAutomations(
    {
        workspace,
        backend,
        onCancel,
        onError,
        onLoading,
        onPending,
        onSuccess,
    }: IUseWorkspaceAutomationsConfig,
    dependencies?: any[],
): UseCancelablePromiseState<IAutomationMetadataObject[], any> {
    const effectiveWorkspace = useWorkspaceStrict(workspace, "useWorkspaceAutomations");
    const effectiveBackend = useBackendStrict(backend, "useWorkspaceAutomations");

    return useCancelablePromise(
        {
            promise: () => effectiveBackend.workspace(effectiveWorkspace).automations().getAutomations(),
            onCancel,
            onError,
            onLoading,
            onPending,
            onSuccess,
        },
        [effectiveWorkspace, effectiveBackend, ...(dependencies ?? [])],
    );
}
