// (C) 2019-2022 GoodData Corporation
import {
    IAttribute,
    IAttributeOrMeasure,
    IDimension,
    INullableFilter,
    isAttribute,
    ISortItem,
    ITotal,
    MeasureGroupIdentifier,
    newDimension,
    newTwoDimensional,
} from "@gooddata/sdk-model";
import { IAnalyticalBackend, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import isEmpty from "lodash/isEmpty";
import invariant from "ts-invariant";

/**
 * @internal
 */
export type CreateExecutionOptions = {
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
    filters?: INullableFilter[];

    /**
     * Optional sorting to apply on server side.
     */
    sortBy?: ISortItem[];

    /**
     * Optional informative name of the component. This value is sent as telemetry information together
     * with the actual execution request. We recommend to set this because it can be useful for diagnostic
     * purposes.
     *
     * Defaults 'Execute'.
     */
    componentName?: string;
};

/**
 * When caller desires just data series and no slicing, create a single-dim result.
 */
function seriesOnlyDim(seriesBy: IAttributeOrMeasure[]): IDimension[] {
    return [newDimension([...seriesBy.filter(isAttribute), MeasureGroupIdentifier])];
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
    return newTwoDimensional(
        [...slices, ...totals],
        [...seriesBy.filter(isAttribute), MeasureGroupIdentifier],
    );
}

/**
 * Given execute props, this will prepare execution to send to backend.
 *
 * @param options - create execution options
 * @internal
 */
export function createExecution(options: CreateExecutionOptions): IPreparedExecution {
    const {
        backend,
        workspace,
        seriesBy,
        slicesBy = [],
        filters = [],
        sortBy = [],
        totals = [],
        componentName = "Execution",
    } = options;
    invariant(
        backend && workspace,
        "backend and workspace must be either specified explicitly or be provided by context",
    );

    const dimensions = isEmpty(slicesBy)
        ? seriesOnlyDim(seriesBy)
        : seriesAndSlicesDim(seriesBy, slicesBy, totals);

    return backend
        .withTelemetry(componentName, options)
        .workspace(workspace)
        .execution()
        .forItems(seriesBy.concat(slicesBy), filters)
        .withSorting(...sortBy)
        .withDimensions(...dimensions);
}
