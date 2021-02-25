// (C) 2020-2021 GoodData Corporation
import { IAnalyticalBackend, IUser } from "@gooddata/sdk-backend-spi";
import {
    GoodDataSdkError,
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
} from "@gooddata/sdk-ui";
import { backendInvariant } from "../utils";

interface IUseCurrentUserConfig extends UseCancelablePromiseCallbacks<IUser, GoodDataSdkError> {
    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the hook MUST be called within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;
}

/**
 * Hook allowing to get current user details
 * @param config - configuration of the hook
 * @internal
 */
export function useCurrentUser({
    backend,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
}: IUseCurrentUserConfig): UseCancelablePromiseState<IUser, any> {
    const effectiveBackend = useBackend(backend);

    backendInvariant(effectiveBackend, "useCurrentUser");

    const promise = () => effectiveBackend.currentUser().getUser();

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
    ]);
}
