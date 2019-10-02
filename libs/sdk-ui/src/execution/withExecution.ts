// (C) 2019 GoodData Corporation
import { DataViewFacade, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { withLoading, WithLoadingResult, IWithLoadingEvents } from "../base/hoc/withLoading";

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IWithExecution<T, R extends object> {
    executionOrFactory: IPreparedExecution | ((props: T) => IPreparedExecution);
    mapResultToProps: (result: WithLoadingResult<DataViewFacade>) => R;
    eventsOrFactory?:
        | IWithLoadingEvents<T, DataViewFacade>
        | ((props: T) => IWithLoadingEvents<T, DataViewFacade>);
    loadOnMount?: boolean;
    shouldRefetch?: (prevProps: T, nextProps: T) => boolean;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export function withExecution<T, R extends object>({
    executionOrFactory,
    mapResultToProps,
    eventsOrFactory,
    loadOnMount,
    shouldRefetch,
}: IWithExecution<T, R>) {
    return (WrappedComponent: React.ComponentType<T & R>) =>
        withLoading({
            promiseFactory: async (props: T) => {
                let execution;

                if (typeof executionOrFactory === "function") {
                    execution = executionOrFactory(props);
                } else {
                    execution = executionOrFactory;
                }

                const executionResult = await execution.execute();
                const dataView = await executionResult.readAll();
                const dataViewFacade = new DataViewFacade(dataView);

                return dataViewFacade;
            },
            mapResultToProps,
            loadOnMount,
            eventsOrFactory,
            shouldRefetch,
        })(WrappedComponent);
}
