// (C) 2019 GoodData Corporation
import React from "react";
import { DataViewFacade, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { withExecution } from "./withExecution";
import { WithLoadingResult } from "../base/hoc/withLoading";

interface IExecutor {
    children: (executionResult: WithLoadingResult<DataViewFacade>) => React.ReactElement<any> | null;
    execution: IPreparedExecution;
    onError?: (error?: Error, props?: IExecutor) => void;
    onLoadingStart?: (props?: IExecutor) => void;
    onLoadingChanged?: (isLoading?: boolean, props?: IExecutor) => void;
    onLoadingFinish?: (result?: DataViewFacade, props?: IExecutor) => void;
}

type Props = IExecutor & WithLoadingResult<DataViewFacade>;

const CoreExecutor: React.StatelessComponent<Props> = ({ children, error, isLoading, fetch, result }) => {
    return children({
        error,
        isLoading,
        fetch,
        result,
    });
};

export const Executor = withExecution({
    executionOrFactory: (props: IExecutor) => props.execution,
    mapResultToProps: r => r,
    eventsOrFactory: props => {
        const { onError, onLoadingChanged, onLoadingFinish, onLoadingStart } = props;
        return {
            onError,
            onLoadingChanged,
            onLoadingFinish,
            onLoadingStart,
        };
    },
})(CoreExecutor);
