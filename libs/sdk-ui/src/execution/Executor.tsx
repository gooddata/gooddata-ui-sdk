// (C) 2019 GoodData Corporation
import React from "react";
import { DataViewFacade, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { withExecution } from "./withExecution";
import { WithLoadingResult } from "../base";

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface IExecutorProps {
    children: (executionResult: WithLoadingResult<DataViewFacade>) => React.ReactElement<any> | null;
    execution: IPreparedExecution;
    onError?: (error?: Error, props?: IExecutorProps) => void;
    onLoadingStart?: (props?: IExecutorProps) => void;
    onLoadingChanged?: (isLoading?: boolean, props?: IExecutorProps) => void;
    onLoadingFinish?: (result?: DataViewFacade, props?: IExecutorProps) => void;
    loadOnMount?: boolean;
}

type Props = IExecutorProps & WithLoadingResult<DataViewFacade>;

const CoreExecutor: React.StatelessComponent<Props> = ({ children, error, isLoading, fetch, result }) => {
    return children({
        error,
        isLoading,
        fetch,
        result,
    });
};

/**
 * TODO: SDK8: add docs
 * @public
 */
export const Executor = withExecution({
    execution: (props: IExecutorProps) => props.execution,
    mapResultToProps: r => r,
    events: props => {
        const { onError, onLoadingChanged, onLoadingFinish, onLoadingStart } = props;
        return {
            onError,
            onLoadingChanged,
            onLoadingFinish,
            onLoadingStart,
        };
    },
    shouldRefetch: (prevProps, nextProps) => {
        const relevantProps: Array<keyof IExecutorProps> = [
            "onError",
            "onLoadingChanged",
            "onLoadingFinish",
            "onLoadingStart",
            "execution",
        ];
        return relevantProps.some(propName => prevProps[propName] !== nextProps[propName]);
    },
    loadOnMount: ({ loadOnMount = true }) => loadOnMount,
})(CoreExecutor);
