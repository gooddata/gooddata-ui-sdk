// (C) 2020 GoodData Corporation
import {
    IAnalyticalBackend,
    IFilterContextDefinition,
    IScheduledMail,
    IScheduledMailDefinition,
} from "@gooddata/sdk-backend-spi";
import {
    GoodDataSdkError,
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useWorkspace,
} from "@gooddata/sdk-ui";
import invariant from "ts-invariant";

/**
 * @beta
 */
export interface IUseSaveScheduledMailConfig
    extends UseCancelablePromiseCallbacks<IScheduledMail, GoodDataSdkError> {
    /**
     * Definition of the scheduled e-mail to save.
     */
    scheduledMail: IScheduledMailDefinition;

    /**
     * Filter context, that will be applied to the attached dashboard.
     */
    filterContext: IFilterContextDefinition;

    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the executor MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace to work with.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the executor MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;
}

/**
 * Hook allowing to schedule email
 * @param config - configuration of the hook
 * @beta
 */
export function useSaveScheduledMail({
    scheduledMail,
    filterContext,
    backend,
    workspace,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
}: IUseSaveScheduledMailConfig): UseCancelablePromiseState<IScheduledMail, any> {
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    invariant(
        effectiveBackend,
        "The backend in useSaveScheduledMail must be defined. Either pass it as a config prop or make sure there is a BackendProvider up the component tree.",
    );

    invariant(
        effectiveWorkspace,
        "The workspace in useSaveScheduledMail must be defined. Either pass it as a config prop or make sure there is a WorkspaceProvider up the component tree.",
    );

    const promise = () =>
        effectiveBackend
            .workspace(effectiveWorkspace)
            .dashboards()
            .createScheduledMail(scheduledMail, filterContext);

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
        scheduledMail,
        filterContext,
    ]);
}
