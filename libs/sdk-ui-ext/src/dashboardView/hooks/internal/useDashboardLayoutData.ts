// (C) 2020-2022 GoodData Corporation
import {
    IAnalyticalBackend,
    IDashboardLayout,
    layoutWidgets,
    IWidget,
    isInsightWidget,
} from "@gooddata/sdk-backend-spi";
import {
    GoodDataSdkError,
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useWorkspace,
    VisType,
} from "@gooddata/sdk-ui";
import { areObjRefsEqual, IInsight, insightVisualizationUrl, ObjRef } from "@gooddata/sdk-model";
import { insightDataLoaderFactory } from "../../../dataLoaders";
import { backendInvariant, workspaceInvariant } from "../utils";

/**
 * @beta
 * @deprecated Will be removed in the 8.10.0 release. Superseded by Dashboard component; please see `@gooddata/sdk-ui-dashboard` and GoodData.UI documentation for v8.7
 */
export interface IUseDashboardLayoutDataResult {
    getVisType: (widget: IWidget) => VisType | undefined;
    getInsightByRef: (insightRef: ObjRef) => IInsight | undefined;
}

/**
 * @beta
 * @deprecated Will be removed in the 8.10.0 release. Superseded by Dashboard component; please see `@gooddata/sdk-ui-dashboard` and GoodData.UI documentation for v8.7
 */
export interface IUseDashboardLayoutDataConfig
    extends UseCancelablePromiseCallbacks<IUseDashboardLayoutDataResult, GoodDataSdkError> {
    /**
     * Dashboard layout to transform to view model.
     */
    dashboardLayout: IDashboardLayout | undefined;

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
 * Hook allowing to download additional dashboard layout data (visualization classes and insights)
 * @param config - configuration of the hook
 * @beta
 * @deprecated Will be removed in the 8.10.0 release. Superseded by Dashboard component; please see `@gooddata/sdk-ui-dashboard` and GoodData.UI documentation for v8.7
 */
export const useDashboardLayoutData = ({
    dashboardLayout,
    backend,
    workspace,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
}: IUseDashboardLayoutDataConfig): UseCancelablePromiseState<IUseDashboardLayoutDataResult, any> => {
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    backendInvariant(effectiveBackend, "useDashboardLayoutData");
    workspaceInvariant(effectiveWorkspace, "useDashboardLayoutData");

    const promise = dashboardLayout
        ? async () => {
              const insightRefsToLoad = layoutWidgets(dashboardLayout)
                  .filter(isInsightWidget)
                  .map((w) => w.insight);

              const loader = insightDataLoaderFactory.forWorkspace(effectiveWorkspace);

              const insights = await Promise.all(
                  insightRefsToLoad.map((ref) => loader.getInsight(effectiveBackend, ref)),
              );

              const getInsightByRef = (insightRef: ObjRef): IInsight | undefined => {
                  return insights.find((i) => areObjRefsEqual(i.insight.ref, insightRef));
              };

              const getVisType = (widget: IWidget): VisType => {
                  if (widget.type === "kpi") {
                      return undefined;
                  }
                  const insight = getInsightByRef(widget.insight);
                  return insightVisualizationUrl(insight).split(":")[1] as VisType;
              };

              return {
                  getVisType,
                  getInsightByRef,
              };
          }
        : null;

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
        dashboardLayout,
    ]);
};
