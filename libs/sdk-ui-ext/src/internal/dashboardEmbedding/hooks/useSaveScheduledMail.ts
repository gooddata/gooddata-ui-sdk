// (C) 2020-2021 GoodData Corporation
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
import { backendInvariant, workspaceInvariant } from "../../../utils";

interface IUseSaveScheduledMailConfig
    extends UseCancelablePromiseCallbacks<IScheduledMail, GoodDataSdkError> {
    /**
     * Definition of the scheduled email to save.
     * Saves the scheduled email every time the reference equality of scheduledMail/filterContext changes.
     */
    scheduledMail?: IScheduledMailDefinition;

    /**
     * Filter context, that will be applied to the attached dashboard.
     */
    filterContext?: IFilterContextDefinition;

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
 * Hook allowing to schedule email
 * @param config - configuration of the hook
 * @internal
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

    backendInvariant(effectiveBackend, "useSaveScheduledMail");
    workspaceInvariant(effectiveWorkspace, "useSaveScheduledMail");

    const promise = scheduledMail
        ? () =>
              effectiveBackend
                  .workspace(effectiveWorkspace)
                  .dashboards()
                  .createScheduledMail(scheduledMail, filterContext)
        : null;

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
        scheduledMail,
        filterContext,
    ]);
}
