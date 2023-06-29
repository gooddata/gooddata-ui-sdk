// (C) 2019-2022 GoodData Corporation
import React from "react";
import { withExecution } from "./withExecution.js";
import { DataViewWindow, IWithLoadingEvents, WithLoadingResult } from "./withExecutionLoading.js";
import { IAttribute, IAttributeOrMeasure, INullableFilter, ISortItem, ITotal } from "@gooddata/sdk-model";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import isEqual from "lodash/isEqual.js";
import {
    useResolveValuesWithPlaceholders,
    withContexts,
    AttributesMeasuresOrPlaceholders,
    AttributesOrPlaceholders,
    TotalsOrPlaceholders,
    NullableFiltersOrPlaceholders,
    SortsOrPlaceholders,
    UnexpectedSdkError,
} from "../base/index.js";
import { createExecution } from "./createExecution.js";
import { IExecuteErrorComponent, IExecuteLoadingComponent } from "./interfaces.js";

/**
 * Props of the {@link Execute} component.
 * @public
 */
export interface IExecuteProps extends IWithLoadingEvents<IExecuteProps> {
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
     * Data series will be built using the provided measures that are further scoped for
     * elements of the specified attributes.
     */
    seriesBy?: AttributesMeasuresOrPlaceholders;

    /**
     * Slice all data series by elements of these attributes.
     */
    slicesBy?: AttributesOrPlaceholders;

    /**
     * Include these totals among the data slices.
     */
    totals?: TotalsOrPlaceholders;

    /**
     * Filters to apply on server side.
     */
    filters?: NullableFiltersOrPlaceholders;

    /**
     * Sorting to apply on server side.
     */
    sortBy?: SortsOrPlaceholders;

    /**
     * Resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;

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
     * This value is sent as telemetry information together with the actual execution request.
     * We recommend to set this because it can be useful for diagnostic purposes.
     *
     * Defaults 'Execute'.
     */
    componentName?: string;

    /**
     * Specifies whether {@link Execute} should trigger execution and loading right after it is
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
     * Specifies whether {@link Execute} should load all data from backend or just a particular window - specified by
     * offset and size of the window.
     *
     * @remarks
     * If not specified, all data will be loaded.
     */
    window?: DataViewWindow;

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

type Props = IExecuteProps & WithLoadingResult;

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

function componentName(props: IExecuteProps): string {
    return props.componentName || "Execute";
}

function exportTitle(props: IExecuteProps): string {
    return props.exportTitle || componentName(props);
}

const WrappedExecute = withContexts(
    withExecution<IExecuteProps>({
        exportTitle,
        execution: (props) => {
            const { seriesBy, slicesBy, totals, filters, sortBy } = props;
            if (!seriesBy?.length && !slicesBy?.length) {
                throw new UnexpectedSdkError(
                    "In the Execute component, either seriesBy or slicesBy must be defined and must contain at least one item",
                );
            }

            return createExecution({
                ...props,
                componentName: componentName(props),
                seriesBy: seriesBy as IAttributeOrMeasure[],
                slicesBy: slicesBy as IAttribute[],
                totals: totals as ITotal[],
                filters: filters as INullableFilter[],
                sortBy: sortBy as ISortItem[],
            });
        },
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
                "workspace",
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

/**
 * The executor provides a more curated experience to obtain and work with data from backends.
 *
 * @remarks
 * It is aligned with the `DataAccess` infrastructure which exposes the underlying data as data series that can be
 * sliced by additional attributes.
 *
 * Once the executor finishes, the {@link DataViewFacade.data} method will expose the data as series and
 * slices according to the specification to the executor.
 * Note that if the resulting data is empty this will NOT throw a NoDataError. It is the responsibility
 * of the child component to handle that if they need to.
 *
 * See {@link IDataAccessMethods} for additional documentation
 * @public
 */
export const Execute = (props: IExecuteProps) => {
    const [seriesBy, slicesBy, totals, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.seriesBy, props.slicesBy, props.totals, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return <WrappedExecute {...props} {...{ seriesBy, slicesBy, totals, filters, sortBy }} />;
};
