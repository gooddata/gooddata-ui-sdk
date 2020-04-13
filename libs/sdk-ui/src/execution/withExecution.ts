// (C) 2019-2020 GoodData Corporation
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { withLoading, IWithLoadingEvents, DataViewFacade, WithLoadingResult } from "../base";

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IWithExecution<T> {
    execution: IPreparedExecution | ((props: T) => IPreparedExecution);
    events?: IWithLoadingEvents<T> | ((props: T) => IWithLoadingEvents<T>);
    loadOnMount?: boolean | ((props: T) => boolean);
    shouldRefetch?: (prevProps: T, nextProps: T) => boolean;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export function withExecution<T>(params: IWithExecution<T>) {
    const { execution, events, loadOnMount, shouldRefetch } = params;

    return (WrappedComponent: React.ComponentType<T & WithLoadingResult>) => {
        const withLoadingParams = {
            promiseFactory: async (props: T) => {
                const _execution = typeof execution === "function" ? execution(props) : execution;
                const executionResult = await _execution.execute();
                const dataView = await executionResult.readAll();

                return DataViewFacade.for(dataView);
            },
            loadOnMount,
            events,
            shouldRefetch,
        };

        return withLoading(withLoadingParams)(WrappedComponent);
    };
}
