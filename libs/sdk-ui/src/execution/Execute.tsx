// (C) 2019 GoodData Corporation
import React from "react";
import { withExecution } from "./withExecution";
import { WithLoadingResult, IWithLoadingEvents, DataViewWindow } from "./withExecutionLoading";
import {
    attributeLocalId,
    IAttributeOrMeasure,
    DimensionItem,
    IAttribute,
    IDimension,
    IFilter,
    isAttribute,
    ITotal,
    MeasureGroupIdentifier,
    newDimension,
    newTwoDimensional,
    ISortItem,
} from "@gooddata/sdk-model";
import { IAnalyticalBackend, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import isEmpty = require("lodash/isEmpty");
import isEqual = require("lodash/isEqual");
import { withContexts } from "../base";
import { InvariantError } from "ts-invariant";

/**
 * @public
 */
export interface IExecuteProps extends IWithLoadingEvents<IExecuteProps> {
    /**
     * Backend to execute against.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the executor MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace in whose context to perform the execution.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the executor MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;

    /**
     * Data series will be built using the provided measures that are optionally further scoped for
     * elements of the specified attributes.
     */
    seriesBy: IAttributeOrMeasure[];

    /**
     * Optionally slice all data series by elements of these attributes.
     */
    slicesBy?: IAttribute[];

    /**
     * Optionally include these totals among the data slices.
     */
    totals?: ITotal[];

    /**
     * Optional filters to apply on server side.
     */
    filters?: IFilter[];

    /**
     * Optional sorting to apply on server side.
     */
    sortBy?: ISortItem[];

    /**
     * Optional name to use for files exported from this component. If you do not specify this, then
     * the componentName will be used instead.
     *
     * Note: it is also possible to pass custom name to the export function that will be sent via the
     * onExportReady callback. That approach is preferred if you need to assign the names in an ad-hoc
     * fashion.
     */
    exportTitle?: string;

    /**
     * Optional informative name of the component. This value is sent as telemetry information together
     * with the actual execution request. We recommend to set this because it can be useful for diagnostic
     * purposes.
     *
     * Defaults 'Execute'.
     */
    componentName?: string;

    /**
     * Specifies whether `Execute` should trigger execution and loading right after it is
     * mounted. If not specified defaults to `true`.
     *
     * If set to `false`, then the {@link WithLoadingResult#reload} function needs to be called
     * to trigger the execution and loading.
     */
    loadOnMount?: boolean;

    /**
     * Specifies whether `Execute` should load all data from backend or just a particular window - specified by
     * offset and size of the window.
     *
     * If not specified, all data will be loaded.
     */
    window?: DataViewWindow;

    /**
     * Child component to which rendering is delegated. This is a function that will be called
     * every time state of execution and data loading changes.
     *
     * @param executionResult - execution result, indicating state and/or results
     */
    children: (executionResult: WithLoadingResult) => React.ReactElement | null;
}

type Props = IExecuteProps & WithLoadingResult;

const CoreExecute: React.FC<Props> = (props: Props) => {
    const { children, error, isLoading, reload, result } = props;

    return children({
        error,
        isLoading,
        reload,
        result,
    });
};

/**
 * When caller desires just data series and no slicing, create a single-dim result.
 */
function seriesOnlyDim(seriesBy: IAttributeOrMeasure[]): IDimension[] {
    return [newDimension(seriesBy.filter(isAttribute).map(attributeLocalId).concat(MeasureGroupIdentifier))];
}

/**
 * When caller desires data series to be sliced further by some attributes (and perhaps with totals as well)
 * then create two-dim result resembling a pivot table:
 *
 * -  slices are in rows (first dim)
 * -  measures & scoping attributes will be in columns (second dim)
 */
function seriesAndSlicesDim(
    seriesBy: IAttributeOrMeasure[],
    slices: IAttribute[],
    totals: ITotal[],
): IDimension[] {
    const firstDimItems: DimensionItem[] = slices.map(attributeLocalId);
    firstDimItems.push(...totals);

    return newTwoDimensional(
        firstDimItems,
        seriesBy.filter(isAttribute).map(attributeLocalId).concat(MeasureGroupIdentifier),
    );
}

function componentName(props: IExecuteProps): string {
    return props.componentName || "Execute";
}

function exportTitle(props: IExecuteProps): string {
    return props.exportTitle || componentName(props);
}

/**
 * Given execute props, this will prepare execution to send to backend.
 *
 * @param props - execute component props
 * @internal
 */
export function createExecution(props: IExecuteProps): IPreparedExecution {
    const { backend, workspace, seriesBy, slicesBy = [], filters = [], sortBy = [], totals = [] } = props;

    if (!backend || !workspace) {
        throw new InvariantError(
            "backend and workspace must be either specified explicitly or be provided by context",
        );
    }

    const dimensions = isEmpty(slicesBy)
        ? seriesOnlyDim(seriesBy)
        : seriesAndSlicesDim(seriesBy, slicesBy, totals);

    return backend
        .withTelemetry(componentName(props), props)
        .workspace(workspace)
        .execution()
        .forItems(seriesBy.concat(slicesBy), filters)
        .withSorting(...sortBy)
        .withDimensions(...dimensions);
}

/**
 * The executor provides a more curated experience to obtain and work with data from backends. It is aligned
 * with the `DataAccess` infrastructure which exposes the underlying data as data series that can be
 * optionally sliced by additional attributes.
 *
 * Once the executor finishes, the `DataViewFacade.data()` method will expose the data as series and
 * slices according to the specification to the executor.
 *
 * @remarks see `IDataAccessMethods` for additional documentation
 * @public
 */
export const Execute = withContexts(
    withExecution<IExecuteProps>({
        exportTitle,
        execution: createExecution,
        events: (props: IExecuteProps) => {
            const { onError, onLoadingChanged, onLoadingFinish, onLoadingStart, onExportReady } = props;

            return {
                onError,
                onLoadingChanged,
                onLoadingFinish,
                onLoadingStart,
                onExportReady,
            };
        },
        shouldRefetch: (prevProps: IExecuteProps, nextProps: IExecuteProps) => {
            const relevantProps: Array<keyof IExecuteProps> = [
                "onError",
                "onLoadingChanged",
                "onLoadingFinish",
                "onLoadingStart",
            ];

            const relevantPropsDeepEqual: Array<keyof IExecuteProps> = [
                "seriesBy",
                "slicesBy",
                "totals",
                "filters",
                "sortBy",
                "window",
            ];

            return (
                relevantProps.some((propName) => prevProps[propName] !== nextProps[propName]) ||
                relevantPropsDeepEqual.some((propName) => !isEqual(prevProps[propName], nextProps[propName]))
            );
        },
        loadOnMount: (props?: IExecuteProps) => {
            const { loadOnMount = true } = props ?? {};

            return loadOnMount;
        },
        window: (props: IExecuteProps) => props.window,
    })(CoreExecute),
);
