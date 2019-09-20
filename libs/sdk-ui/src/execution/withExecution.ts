import { DataViewFacade, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { withLoading, WithLoadingResult, WithLoadingEvents } from "../base/hoc/withLoading";

export interface IWithExecution<T, R extends object> {
    executionOrFactory: IPreparedExecution | ((props: T) => IPreparedExecution);
    mapResultToProps: (result: WithLoadingResult<DataViewFacade>) => R;
    eventsOrFactory?:
        | WithLoadingEvents<T, DataViewFacade>
        | ((props: T) => WithLoadingEvents<T, DataViewFacade>);
    loadOnMount?: boolean;
}

export function withExecution<T, R extends object>({
    executionOrFactory,
    mapResultToProps,
    eventsOrFactory,
    loadOnMount,
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
        })(WrappedComponent);
}
