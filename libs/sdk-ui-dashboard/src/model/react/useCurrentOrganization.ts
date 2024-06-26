// (C) 2020-2024 GoodData Corporation
import { IAnalyticalBackend, IOrganization } from "@gooddata/sdk-backend-spi";
import {
    GoodDataSdkError,
    useBackendStrict,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
} from "@gooddata/sdk-ui";

interface IUseCurrentOrganizationConfig
    extends UseCancelablePromiseCallbacks<IOrganization, GoodDataSdkError> {
    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the hook MUST be called within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Enable or disable the hook.
     */
    enable?: boolean;
}

/**
 * @internal
 */
export function useCurrentOrganization({
    enable,
    backend,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
}: IUseCurrentOrganizationConfig): UseCancelablePromiseState<IOrganization, any> {
    const effectiveBackend = useBackendStrict(backend);

    return useCancelablePromise(
        {
            promise: enable ? () => effectiveBackend.organizations().getCurrentOrganization() : undefined,
            onCancel,
            onError,
            onLoading,
            onPending,
            onSuccess,
        },
        [effectiveBackend],
    );
}
