// (C) 2020 GoodData Corporation
import {
    IAnalyticalBackend,
    IDashboardLayout,
    layoutWidgets,
    isWidget,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    GoodDataSdkError,
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useWorkspace,
} from "@gooddata/sdk-ui";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import { IDashboardViewLayout } from "../DashboardLayout";
import { FluidLayoutTransforms } from "@gooddata/sdk-backend-spi";
import { DashboardViewLayoutWidgetClass } from "../DashboardLayout/interfaces/dashboardLayout";

/**
 * @beta
 */
export interface IUseDashboardViewLayoutConfig
    extends UseCancelablePromiseCallbacks<IDashboardViewLayout, GoodDataSdkError> {
    /**
     * Dashboard layout to transform to view model.
     */
    dashboardLayout: IDashboardLayout | undefined;

    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the executor MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where the insight exists.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the executor MUST be rendered within an existing WorkspaceContext.
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
}: IUseDashboardViewLayoutConfig): UseCancelablePromiseState<IDashboardViewLayout, any> => {
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

              const insights = await Promise.all(
                  insightRefsToLoad.map((ref) =>
                      effectiveBackend.workspace(effectiveWorkspace).insights().getInsight(ref),
                  ),
              );

              const getDashboardViewWidgetClass = (insightRef: ObjRef): DashboardViewLayoutWidgetClass => {
                  const insight = insights.find((i) => areObjRefsEqual(i.insight.ref, insightRef));
                  return insight.insight.visualizationUrl.split(":")[1] as DashboardViewLayoutWidgetClass;
              };

              // Convert current layout model to "legacy" layout model,
              // to keep it backward compatible with KD
              const emptyLayout: IDashboardViewLayout = {
                  ...dashboardLayout,
                  rows: [],
              };

              return FluidLayoutTransforms.for(dashboardLayout).reduceColumns(
                  (acc: IDashboardViewLayout, { column, columnIndex, row, rowIndex }) => {
                      if (!acc.rows[rowIndex]) {
                          acc.rows[rowIndex] = {
                              ...row,
                              columns: [],
                          };
                      }
                      const currentContent = column.content;
                      if (isWidget(currentContent)) {
                          acc.rows[rowIndex].columns[columnIndex] = {
                              ...column,
                              content: {
                                  type: "widget",
                                  widget: currentContent,
                                  widgetClass:
                                      currentContent.type === "insight"
                                          ? getDashboardViewWidgetClass(currentContent.insight)
                                          : "kpi",
                              },
                          };
                      } else {
                          throw new UnexpectedError("Unknown widget");
                      }

                      return acc;
                  },
                  emptyLayout,
              );
          }
        : null;

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
        dashboardLayout,
    ]);
};
