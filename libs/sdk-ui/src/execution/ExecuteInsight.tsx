// (C) 2019-2022 GoodData Corporation
import React from "react";
import { withExecution } from "./withExecution.js";
import { DataViewWindow, IWithLoadingEvents, WithLoadingResult } from "./withExecutionLoading.js";
import { IDimension, IExecutionDefinition, INullableFilter, ISortItem, ObjRef } from "@gooddata/sdk-model";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import isEqual from "lodash/isEqual.js";
import { withContexts } from "../base/index.js";
import { IExecuteErrorComponent, IExecuteLoadingComponent } from "./interfaces.js";
import { invariant } from "ts-invariant";

/**
 * Props of the {@link ExecuteInsight} component.
 * @public
 */
export interface IExecuteInsightProps extends IWithLoadingEvents<IExecuteInsightProps> {
    /**
     * Backend to execute against.
     *
     * @remarks
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the executor MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace in whose context to perform the execution.
     *
     * @remarks
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the executor MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;

    /**
     * Reference to the insight for which you want to get the data view.
     */
    insight: ObjRef;

    /**
     * Modify sorts on prepared insight execution, before it's executed.
     */
    sorts?: ISortItem[] | ((def: IExecutionDefinition, props: IExecuteInsightProps) => ISortItem[]);

    /**
     * Modify dimensions on prepared insight execution, before it's executed.
     */
    dimensions?: IDimension[] | ((def: IExecutionDefinition, props: IExecuteInsightProps) => IDimension[]);

    /**
     * Modify date formatting on prepared insight execution, before it's executed.
     */
    dateFormat?: string | ((def: IExecutionDefinition, props: IExecuteInsightProps) => string);

    /**
     * Filters to apply on server side.
     */
    filters?: INullableFilter[];

    /**
     * Name to use for files exported from this component.
     *
     * @remarks
     * If you do not specify this, then the componentName will be used instead.
     *
     * Note: it is also possible to pass custom name to the export function that will be sent via the
     * onExportReady callback. That approach is preferred if you need to assign the names in an ad-hoc
     * fashion.
     */
    exportTitle?: string;

    /**
     * Informative name of the component.
     *
     * @remarks
     * This value is sent as telemetry information together with the actual execution request. We recommend to set this
     * because it can be useful for diagnostic purposes.
     *
     * Defaults 'Execute'.
     */
    componentName?: string;

    /**
     * Specifies whether `Execute` should trigger execution and loading right after it is
     * mounted.
     *
     * @remarks
     * If not specified defaults to `true`.
     *
     * If set to `false`, then the {@link WithLoadingResult#reload} function needs to be called
     * to trigger the execution and loading.
     */
    loadOnMount?: boolean;

    /**
     * Specifies whether `Execute` should load all data from backend or just a particular window - specified by
     * offset and size of the window.
     *
     * @remarks
     * If not specified, all data will be loaded.
     */
    window?: DataViewWindow;

    /**
     * Indicates that the execution to obtain the data for the insight should be an 'execution by reference'.
     *
     * Execution by reference means that the ExecuteInsight will ask analytical backend to compute results for an insight
     * which is stored on the backend by specifying link to the insight, additional filters and description how
     * to organize the data.
     *
     * Otherwise, a freeform execution is done, in which the InsightView will send to backend the full execution
     * definition of what to compute.
     *
     * This distinction is in place because some backends MAY want to prohibit users from doing freeform executions
     * and only allow computing data for set of insights created by admins.
     *
     * Note: the need for execute by reference is rare. You will typically be notified by the solution admin to use
     * this mode.
     */
    executeByReference?: boolean;

    /**
     * Child component to which rendering is delegated.
     *
     * @remarks
     * This is a function that will be called every time state of execution and data loading changes.
     *
     * @param executionResult - execution result, indicating state and/or results
     */
    children: (executionResult: WithLoadingResult) => React.ReactElement | null;

    /**
     * Provide component for rendering of the loading state.
     *
     * @remarks
     * Note: When you provide both LoadingComponent and ErrorComponent, the children function with the execution result
     * will be called only with a successful result.
     */
    LoadingComponent?: IExecuteLoadingComponent;

    /**
     * Provide component for rendering of the error state.
     *
     * @remarks
     * Note: When you provide both LoadingComponent and ErrorComponent, the children function with the execution result
     * will be called only with a successful result.
     */
    ErrorComponent?: IExecuteErrorComponent;
}

type Props = IExecuteInsightProps & WithLoadingResult;

const CoreExecute: React.FC<Props> = (props: Props) => {
    const { children, error, isLoading, reload, result, LoadingComponent, ErrorComponent } = props;

    if (ErrorComponent && error) {
        return <ErrorComponent error={error} />;
    }

    if (LoadingComponent && isLoading) {
        return <LoadingComponent />;
    }

    if (LoadingComponent && ErrorComponent && !result) {
        return null;
    }

    return children({
        error,
        isLoading,
        reload,
        result,
    });
};

function componentName(props: IExecuteInsightProps): string {
    return props.componentName || "ExecuteInsight";
}

function exportTitle(props: IExecuteInsightProps): string {
    return props.exportTitle || componentName(props);
}

/**
 * Gets data for a specific stored insight.
 *
 * @public
 */
export const ExecuteInsight = withContexts(
    withExecution<IExecuteInsightProps>({
        exportTitle,
        execution: async (props) => {
            const {
                insight: insightRef,
                filters,
                sorts,
                dimensions,
                dateFormat,
                backend,
                workspace,
                executeByReference,
            } = props;
            invariant(
                backend,
                "The backend in ExecuteInsight must be defined. Either pass it as a prop or make sure there is a BackendProvider up the component tree.",
            );
            invariant(
                workspace,
                "The workspace in ExecuteInsight must be defined. Either pass it as a prop or make sure there is a WorkspaceProvider up the component tree.",
            );

            const insight = await backend.workspace(workspace).insights().getInsight(insightRef);

            const executionFactory = backend.workspace(workspace).execution();

            const executeFn = (
                executeByReference ? executionFactory.forInsightByRef : executionFactory.forInsight
            ).bind(executionFactory);

            let insightExecution = executeFn(insight, filters);

            if (sorts) {
                const resolvedSorts =
                    typeof sorts === "function" ? sorts(insightExecution.definition, props) : sorts;
                insightExecution = insightExecution.withSorting(...resolvedSorts);
            }
            if (dimensions) {
                const resolvedDimensions =
                    typeof dimensions === "function"
                        ? dimensions(insightExecution.definition, props)
                        : dimensions;
                insightExecution = insightExecution.withDimensions(...resolvedDimensions);
            }
            if (dateFormat) {
                const resolvedDateFormat =
                    typeof dateFormat === "function"
                        ? dateFormat(insightExecution.definition, props)
                        : dateFormat;
                insightExecution = insightExecution.withDateFormat(resolvedDateFormat);
            }

            return insightExecution;
        },
        events: (props: IExecuteInsightProps) => {
            const { onError, onLoadingChanged, onLoadingFinish, onLoadingStart, onExportReady } = props;

            return {
                onError,
                onLoadingChanged,
                onLoadingFinish,
                onLoadingStart,
                onExportReady,
            };
        },
        shouldRefetch: (prevProps: IExecuteInsightProps, nextProps: IExecuteInsightProps) => {
            const relevantProps: Array<keyof IExecuteInsightProps> = [
                "onError",
                "onLoadingChanged",
                "onLoadingFinish",
                "onLoadingStart",
            ];

            const relevantPropsDeepEqual: Array<keyof IExecuteInsightProps> = [
                "insight",
                "filters",
                "window",
            ];

            return (
                relevantProps.some((propName) => prevProps[propName] !== nextProps[propName]) ||
                relevantPropsDeepEqual.some((propName) => !isEqual(prevProps[propName], nextProps[propName]))
            );
        },
        loadOnMount: (props?: IExecuteInsightProps) => {
            const { loadOnMount = true } = props ?? {};

            return loadOnMount;
        },
        window: (props: IExecuteInsightProps) => props.window,
    })(CoreExecute),
);
