// (C) 2019-2020 GoodData Corporation
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { withLoading, IWithLoadingEvents, WithLoadingResult, DataViewWindow } from "./withLoading";
import { DataViewFacade } from "../base";

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IWithExecution<T> {
    execution: IPreparedExecution | ((props: T) => IPreparedExecution);
    window?: DataViewWindow | ((props: T) => DataViewWindow | undefined);
    events?: IWithLoadingEvents<T> | ((props: T) => IWithLoadingEvents<T>);
    loadOnMount?: boolean | ((props: T) => boolean);
    shouldRefetch?: (prevProps: T, nextProps: T) => boolean;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export function withExecution<T>(params: IWithExecution<T>) {
    const { execution, events, loadOnMount, shouldRefetch, window } = params;

    return (WrappedComponent: React.ComponentType<T & WithLoadingResult>) => {
        const withLoadingParams = {
            promiseFactory: async (props: T, window?: DataViewWindow) => {
                const _execution = typeof execution === "function" ? execution(props) : execution;
                const executionResult = await _execution.execute();
                const dataView = !window
                    ? await executionResult.readAll()
                    : await executionResult.readWindow(window.offset, window.size);

                return DataViewFacade.for(dataView);
            },
            loadOnMount,
            events,
            shouldRefetch,
            window,
        };

        return withLoading(withLoadingParams)(WrappedComponent);
    };
}
