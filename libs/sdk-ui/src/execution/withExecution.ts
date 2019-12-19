// (C) 2019 GoodData Corporation
import { DataViewFacade, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { withLoading, WithLoadingResult, IWithLoadingEvents } from "../base";

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IWithExecution<T, R extends object> {
    execution: IPreparedExecution | ((props?: T) => IPreparedExecution);
    mapResultToProps: (result: WithLoadingResult<DataViewFacade>, props?: T) => R;
    events?: IWithLoadingEvents<T, DataViewFacade> | ((props?: T) => IWithLoadingEvents<T, DataViewFacade>);
    loadOnMount?: boolean | ((props?: T) => boolean);
    shouldRefetch?: (prevProps?: T, nextProps?: T) => boolean;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export function withExecution<T, R extends object>({
    execution,
    mapResultToProps,
    events,
    loadOnMount,
    shouldRefetch,
}: IWithExecution<T, R>) {
    return (WrappedComponent: React.ComponentType<T & R>) =>
        withLoading({
            promiseFactory: async (props: T) => {
                let _execution;

                if (typeof execution === "function") {
                    _execution = execution(props);
                } else {
                    _execution = execution;
                }

                const executionResult = await _execution.execute();
                const dataView = await executionResult.readAll();
                const dataViewFacade = new DataViewFacade(dataView);

                return dataViewFacade;
            },
            mapResultToProps,
            loadOnMount,
            events,
            shouldRefetch,
        })(WrappedComponent);
}
