// (C) 2020-2021 GoodData Corporation
import { IAnalyticalBackend, IDashboardLayout, layoutWidgets, IWidget } from "@gooddata/sdk-backend-spi";
import {
    GoodDataSdkError,
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useWorkspace,
} from "@gooddata/sdk-ui";
import { areObjRefsEqual, IInsight, insightVisualizationUrl, ObjRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import { insightDataLoaderFactory } from "../../../dataLoaders";
import { DashboardViewLayoutWidgetClass } from "../DashboardLayout/interfaces/dashboardLayoutSizing";

/**
 * @beta
 */
export interface IUseDashboardViewLayoutResult {
    getDashboardViewLayoutWidgetClass: (widget: IWidget) => DashboardViewLayoutWidgetClass;
    getInsightByRef: (insightRef: ObjRef) => IInsight | undefined;
}

/**
 * @beta
 */
export interface IUseDashboardViewLayoutConfig
    extends UseCancelablePromiseCallbacks<IUseDashboardViewLayoutResult, GoodDataSdkError> {
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
 */
export const useDashboardViewLayout = ({
    dashboardLayout,
    backend,
    workspace,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
}: IUseDashboardViewLayoutConfig): UseCancelablePromiseState<IUseDashboardViewLayoutResult, any> => {
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    invariant(
        effectiveBackend,
        "The backend in useDashboardViewLayout must be defined. Either pass it as a config prop or make sure there is a BackendProvider up the component tree.",
    );

    invariant(
        effectiveWorkspace,
        "The workspace in useDashboardViewLayout must be defined. Either pass it as a config prop or make sure there is a WorkspaceProvider up the component tree.",
    );

    const promise = dashboardLayout
        ? async () => {
              const insightRefsToLoad = layoutWidgets(dashboardLayout)
                  .filter((w) => w.type === "insight")
                  .map((w) => w.insight);

              const loader = insightDataLoaderFactory.forWorkspace(effectiveWorkspace);

              const insights = await Promise.all(
                  insightRefsToLoad.map((ref) => loader.getInsight(effectiveBackend, ref)),
              );

              const getInsightByRef = (insightRef: ObjRef): IInsight | undefined => {
                  return insights.find((i) => areObjRefsEqual(i.insight.ref, insightRef));
              };

              const getDashboardViewLayoutWidgetClass = (widget: IWidget): DashboardViewLayoutWidgetClass => {
                  if (widget.type === "kpi") {
                      return "kpi";
                  }
                  const insight = getInsightByRef(widget.ref);
                  return insightVisualizationUrl(insight).split(":")[1] as DashboardViewLayoutWidgetClass;
              };

              return {
                  getDashboardViewLayoutWidgetClass,
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
