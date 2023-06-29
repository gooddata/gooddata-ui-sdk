// (C) 2019-2022 GoodData Corporation
import React from "react";
import noop from "lodash/noop.js";
import hoistNonReactStatics from "hoist-non-react-statics";
import {
    CancelledSdkError,
    convertError,
    createExportErrorFunction,
    createExportFunction,
    DataViewFacade,
    GoodDataSdkError,
    ICancelablePromise,
    IExportFunction,
    isCancelError,
    makeCancelable,
} from "../base/index.js";

/**
 * Structure specifying a particular portion of data.
 * @public
 */
export type DataViewWindow = {
    /**
     * Zero-based offsets into the data.
     */
    offset: number[];

    /**
     * Size of the window to retrieve.
     */
    size: number[];
};

/**
 * @public
 */
export type WithLoadingResult = {
    /**
     * The result of a successful loading is an instance of {@link DataViewFacade}. If this property
     * is undefined, then the data is not (yet) loaded.
     */
    result: DataViewFacade | undefined;

    /**
     * The result of failed loading. If this property is undefined, then no error has occurred (yet).
     */
    error: GoodDataSdkError | undefined;

    /**
     * Indicates whether loading is in progress or not. This value will be `false` when loading finished
     * successfully or when loading has failed. Otherwise it will be set to true.
     */
    isLoading: boolean;

    /**
     * Callback to trigger load or reload of data.
     */
    reload: () => void;
};

/**
 * @public
 */
export interface IWithLoadingEvents<TProps> {
    /**
     * If specified, this function will be called in case loading runs into an error.
     *
     * @param error - an instance of error. see also GoodDataSdkError
     * @param props - props effective at the time of load
     */
    onError?: (error: GoodDataSdkError, props: TProps) => void;

    /**
     * Called when loading starts.
     *
     * @param props - props effective at the time of load
     */
    onLoadingStart?: (props: TProps) => void;

    /**
     * Called when loading finishes.
     *
     * @param result - result wrapped in data view facade
     * @param props - props effective at the time of load
     */
    onLoadingFinish?: (result: DataViewFacade, props: TProps) => void;

    /**
     * Called when loading starts and finishes, indicating the current state using the `isLoading` parameter.
     *
     * @param isLoading - true if loading, false if no longer loading
     * @param props - props effective at the time of load
     */
    onLoadingChanged?: (isLoading: boolean, props: TProps) => void;

    /**
     * Called when loading finishes and it is possible to export the underlying data. Function that does
     * the export will be provided on the callback.
     *
     * @param exportFunction - function to call if export is desired
     * @param props - props effective at the time export is ready
     */
    onExportReady?: (exportFunction: IExportFunction, props: TProps) => void;
}

/**
 * Configuration for the {@link withExecutionLoading} HOC.
 *
 * @remarks
 * All configuration parameters can be either actual parameter values or functions to obtain them
 * from the wrapped component props.
 *
 * If functions are specified, the HOC will call them with the wrapped component props as parameter and then use
 * the resulting values as if they were passed directly.
 *
 * @internal
 */
export interface IWithExecutionLoading<TProps> {
    /**
     * Specify export title that will be used unless the export function caller sends their own custom title.
     *
     * @param props - props to retrieve export title from
     */
    exportTitle: string | ((props: TProps) => string);

    /**
     * Specify a factory function to create data promises, based on props and optionally the data window size.
     *
     * This is where the data is actually being loaded. And the HOC hides the promise from the wrapped component
     * which just receives the data.
     *
     * @param props - wrapped component props
     * @param window - data view window to retrieve, not specified in case all data should be retrieved
     */
    promiseFactory: (props: TProps, window?: DataViewWindow) => Promise<DataViewFacade>;

    /**
     * Specify data view window to retrieve from backend.
     *
     * @remarks
     * If specified as function, the function can return undefined in case all data must be retrieved.
     */
    window?: DataViewWindow | ((props: TProps) => DataViewWindow | undefined);

    /**
     * Specify event callbacks which the HOC will trigger in different situations.
     */
    events?: IWithLoadingEvents<TProps> | ((props: TProps) => IWithLoadingEvents<TProps>);

    /**
     * Customize, whether execution & data loading should start as soon as component is mounted.
     *
     * Default is true. When not loading on mount, the wrapped component can trigger the load by calling the
     * reload() function which the HOC injects into its props.
     */
    loadOnMount?: boolean | ((props: TProps) => boolean);

    /**
     * Specify function that will be called during component prop updates and will be used to
     * determine whether execution should be re-run and data reloaded.
     *
     * @param prevProps - previous props
     * @param nextProps - next props
     */
    shouldRefetch?: (prevProps: TProps, nextProps: TProps) => boolean;
}

type WithLoadingState = {
    isLoading: boolean;
    error: GoodDataSdkError | undefined;
    result: DataViewFacade | undefined;
};

/**
 * A React HOC responsible for orchestrating resolution of a data promise (e.g. data to load).
 *
 * This component offers more flexibility in regards to how to obtain the data - all that is encapsulated
 * into a promise of data. For most use cases, the withExecution HOC is a better fit.
 *
 * @internal
 */
export function withExecutionLoading<TProps>(
    params: IWithExecutionLoading<TProps>,
): (WrappedComponent: React.ComponentType<TProps & WithLoadingResult>) => React.ComponentClass<TProps> {
    const {
        promiseFactory,
        loadOnMount = true,
        events = {},
        shouldRefetch = () => false,
        window,
        exportTitle,
    } = params;

    return (
        WrappedComponent: React.ComponentType<TProps & WithLoadingResult>,
    ): React.ComponentClass<TProps> => {
        class WithLoading extends React.Component<TProps, WithLoadingState> {
            private isWithExecutionLoadingUnmounted: boolean = false;
            private cancelablePromise: ICancelablePromise<DataViewFacade> | undefined;
            private effectiveProps: TProps | undefined;

            public state: WithLoadingState = {
                error: undefined,
                isLoading: false,
                result: undefined,
            };

            constructor(props: TProps) {
                super(props);

                this.fetch = this.fetch.bind(this);
                this.startLoading = this.startLoading.bind(this);
                this.setError = this.setError.bind(this);
                this.setResult = this.setResult.bind(this);
                this.getEvents = this.getEvents.bind(this);
            }

            private getEvents() {
                const _events = typeof events === "function" ? events(this.props) : events;
                const {
                    onError = noop,
                    onLoadingChanged = noop,
                    onLoadingFinish = noop,
                    onLoadingStart = noop,
                    onExportReady = noop,
                } = _events;

                return {
                    onError,
                    onLoadingChanged,
                    onLoadingFinish,
                    onLoadingStart,
                    onExportReady,
                };
            }

            private startLoading() {
                const { onLoadingStart, onLoadingChanged } = this.getEvents();

                onLoadingStart(this.props);
                onLoadingChanged(true, this.props);

                this.effectiveProps = undefined;
                this.setState((state) => ({
                    ...state,
                    isLoading: true,
                    error: undefined,
                    result: undefined,
                }));
            }

            private setError(error: GoodDataSdkError) {
                const { onError, onLoadingChanged, onExportReady } = this.getEvents();

                onError(error, this.props);
                onLoadingChanged(false, this.props);
                onExportReady(createExportErrorFunction(error));

                this.setState((state) => ({
                    ...state,
                    isLoading: false,
                    error,
                }));
            }

            private setResult(result: DataViewFacade) {
                const { onLoadingFinish, onLoadingChanged, onExportReady } = this.getEvents();
                const title = typeof exportTitle === "function" ? exportTitle(this.props) : exportTitle;

                onLoadingFinish(result, this.props);
                onLoadingChanged(false, this.props);
                onExportReady(createExportFunction(result.result(), title));

                this.effectiveProps = this.props;
                this.setState((state) => ({
                    ...state,
                    isLoading: false,
                    error: undefined,
                    result,
                }));
            }

            private async fetch(): Promise<void> {
                if (this.cancelablePromise) {
                    this.cancelablePromise.cancel();
                    // On refetch, when cancelablePromise was not fulfilled, throw cancel error immediately
                    if (!this.cancelablePromise.getHasFulfilled()) {
                        this.setError(new CancelledSdkError());
                    }
                }

                this.startLoading();

                const readWindow = typeof window === "function" ? window(this.props) : window;
                const promise = promiseFactory(this.props, readWindow);
                this.cancelablePromise = makeCancelable(promise);

                try {
                    const result = await this.cancelablePromise.promise;
                    if (!this.isWithExecutionLoadingUnmounted) {
                        this.setResult(result);
                    }
                } catch (err) {
                    // We throw cancel error immediately on refetch, when cancelablePromise was not fulfilled,
                    // but CancelablePromise throw cancel error after promise resolution, so here
                    // we don't care about it anymore.
                    if (!this.isWithExecutionLoadingUnmounted && !isCancelError(err)) {
                        const sdkError = convertError(err);
                        this.setError(sdkError);
                    }
                }
            }

            private isStaleResult(): boolean {
                return this.effectiveProps !== undefined && shouldRefetch(this.props, this.effectiveProps);
            }

            public componentDidMount() {
                this.isWithExecutionLoadingUnmounted = false;
                const _loadOnMount =
                    typeof loadOnMount === "function" ? loadOnMount(this.props) : loadOnMount;

                if (_loadOnMount) {
                    this.fetch();
                }
            }

            public componentDidUpdate(prevProps: TProps) {
                if (shouldRefetch(prevProps, this.props)) {
                    this.fetch();
                }
            }

            public componentWillUnmount() {
                this.isWithExecutionLoadingUnmounted = true;
                if (this.cancelablePromise) {
                    this.cancelablePromise.cancel();
                    if (!this.cancelablePromise.getHasFulfilled()) {
                        this.setError(new CancelledSdkError());
                    }
                }
            }

            public render() {
                const { result, isLoading, error } = this.state;

                if (this.isStaleResult()) {
                    /*
                     * When props update, this render will be called first and state will still contain
                     * data calculated thus far. After the render, the componentDidUpdate will test whether
                     * data reload is needed and if so trigger it.
                     *
                     * The problem with this is, that the child function would be called once with stale
                     * data. This can lead to problems in expectations - the child function may work with
                     * assumptions that the result is always up to date and try access data that is just not
                     * there yet.
                     */
                    const executionResult = {
                        result: undefined,
                        isLoading: true,
                        error: undefined,
                        reload: this.fetch,
                    };

                    return <WrappedComponent {...this.props} {...executionResult} />;
                }

                const executionResult = {
                    result,
                    isLoading,
                    error,
                    reload: this.fetch,
                };

                return <WrappedComponent {...this.props} {...executionResult} />;
            }
        }

        hoistNonReactStatics(WithLoading, WrappedComponent);

        return WithLoading;
    };
}
