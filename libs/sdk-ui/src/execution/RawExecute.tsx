// (C) 2019-2022 GoodData Corporation
import React from "react";
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { withExecution } from "./withExecution.js";
import { WithLoadingResult, IWithLoadingEvents, DataViewWindow } from "./withExecutionLoading.js";
import isEqual from "lodash/isEqual.js";
import { IExecuteErrorComponent, IExecuteLoadingComponent } from "./interfaces.js";

/**
 * Props of the {@link RawExecute} component.
 * @public
 */
export interface IRawExecuteProps extends IWithLoadingEvents<IRawExecuteProps> {
    /**
     * Prepared execution which the executor will drive to completion and will obtain data from.
     */
    execution: IPreparedExecution;

    /**
     * Specifies whether {@link RawExecute} should load all data from backend or just a particular window - specified by
     * offset and size of the window.
     *
     * @remarks
     * If not specified, all data will be loaded.
     */
    window?: DataViewWindow;

    /**
     * Name to use for files exported from this component.
     *
     * @remarks
     * If you do not specify this, then the 'RawExecute' will be used instead.
     *
     * Note: it is also possible to pass custom name to the export function that will be sent via the
     * onExportReady callback. That approach is preferred if you need to assign the names in an ad-hoc
     * fashion.
     */
    exportTitle?: string;

    /**
     * Indicates whether the executor should trigger execution and loading right after it is
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

type Props = IRawExecuteProps & WithLoadingResult;

const CoreExecutor: React.FC<Props> = (props: Props) => {
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

function exportTitle(props: IRawExecuteProps): string {
    return props.exportTitle || "RawExecute";
}

/**
 * Raw executor is the most basic React component to drive custom executions to obtain
 * data from backends.
 *
 * @remarks
 * The component accepts an instance of prepared execution and drives all the necessary
 * APIs and boilerplate needed to obtain a {@link DataViewFacade}.
 * Note that if the resulting data is empty this will NOT throw a {@link @gooddata/sdk-backend-spi#NoDataError}.
 * It is the responsibility of the child component to handle that if they need to.
 *
 * The rendering is delegated to a child component. This will be called every time the
 * state of the loading changes.
 *
 * @public
 */
export const RawExecute = withExecution<IRawExecuteProps>({
    exportTitle,
    execution: (props: IRawExecuteProps) => props.execution,
    events: (props: IRawExecuteProps) => {
        const { onError, onLoadingChanged, onLoadingFinish, onLoadingStart, onExportReady } = props;

        return {
            onError,
            onLoadingChanged,
            onLoadingFinish,
            onLoadingStart,
            onExportReady,
        };
    },
    shouldRefetch: (prevProps: IRawExecuteProps, nextProps: IRawExecuteProps) => {
        const relevantProps: Array<keyof IRawExecuteProps> = [
            "onError",
            "onLoadingChanged",
            "onLoadingFinish",
            "onLoadingStart",
        ];

        const relevantPropsDeepEqual: Array<keyof IRawExecuteProps> = ["window"];

        return (
            relevantProps.some((propName) => prevProps[propName] !== nextProps[propName]) ||
            relevantPropsDeepEqual.some((propName) => !isEqual(prevProps[propName], nextProps[propName])) ||
            prevProps.execution.fingerprint() !== nextProps.execution.fingerprint()
        );
    },
    loadOnMount: (props: IRawExecuteProps) => {
        const { loadOnMount = true } = props;

        return loadOnMount;
    },
    window: (props: IRawExecuteProps) => props.window,
})(CoreExecutor);
