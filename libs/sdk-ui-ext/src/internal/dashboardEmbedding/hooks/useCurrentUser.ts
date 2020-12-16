// (C) 2020 GoodData Corporation
import { IAnalyticalBackend, IUser } from "@gooddata/sdk-backend-spi";
import {
    GoodDataSdkError,
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
} from "@gooddata/sdk-ui";
import invariant from "ts-invariant";

/**
 * @beta
 */
export interface IUseCurrentUserConfig extends UseCancelablePromiseCallbacks<IUser, GoodDataSdkError> {
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
 * @beta
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

    invariant(
        effectiveBackend,
        "The backend in useCurrentUser must be defined. Either pass it as a config prop or make sure there is a BackendProvider up the component tree.",
    );

    const promise = () => effectiveBackend.currentUser().getUser();

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
    ]);
}
