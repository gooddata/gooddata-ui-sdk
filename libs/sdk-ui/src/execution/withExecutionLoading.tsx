// (C) 2019-2025 GoodData Corporation
import React, { useCallback, useEffect, useRef, useState } from "react";

import hoistNonReactStatics from "hoist-non-react-statics";
import noop from "lodash/noop.js";

import {
    CancelledSdkError,
    DataViewFacade,
    GoodDataSdkError,
    ICancelablePromise,
    IExportFunction,
    convertError,
    createExportErrorFunction,
    createExportFunction,
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
     * @param signal - abort signal, will be used to cancel the execution
     */
    promiseFactory: (props: TProps, window?: DataViewWindow, signal?: AbortSignal) => Promise<DataViewFacade>;

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

    /**
     * Optionally enable real execution cancellation.
     *
     * This means that if the execution request is not yet finished and the execution changes,
     * the request will be cancelled and the new execution will be started.
     *
     * Default: false
     */
    enableExecutionCancelling?: boolean | ((props: TProps) => boolean);
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
): (WrappedComponent: React.ComponentType<TProps & WithLoadingResult>) => React.ComponentType<TProps> {
    const {
        promiseFactory,
        loadOnMount = true,
        events = {},
        shouldRefetch = () => false,
        window,
        exportTitle,
        enableExecutionCancelling = false,
    } = params;

    return (
        WrappedComponent: React.ComponentType<TProps & WithLoadingResult>,
    ): React.ComponentType<TProps> => {
        function WithLoading(props: TProps) {
            const isWithExecutionLoadingUnmountedRef = useRef<boolean>(false);
            const cancelablePromiseRef = useRef<ICancelablePromise<DataViewFacade> | undefined>();
            const effectivePropsRef = useRef<TProps | undefined>();

            // Store initial props for mount effect
            const initialPropsRef = useRef<TProps>(props);

            // Use ref to store latest props for callbacks to always use current values
            const latestPropsRef = useRef(props);
            latestPropsRef.current = props;

            const [state, setState] = useState<WithLoadingState>({
                error: undefined,
                isLoading: false,
                result: undefined,
            });

            const getEvents = useCallback(() => {
                const currentProps = latestPropsRef.current;
                const _events = typeof events === "function" ? events(currentProps) : events;
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
            }, [events]);

            const startLoading = useCallback(() => {
                const currentProps = latestPropsRef.current;
                const { onLoadingStart, onLoadingChanged } = getEvents();

                onLoadingStart(currentProps);
                onLoadingChanged(true, currentProps);

                effectivePropsRef.current = undefined;
                setState((state) => ({
                    ...state,
                    isLoading: true,
                    error: undefined,
                    result: undefined,
                }));
            }, [getEvents]);

            const setError = useCallback(
                (error: GoodDataSdkError) => {
                    const currentProps = latestPropsRef.current;
                    const { onError, onLoadingChanged, onExportReady } = getEvents();

                    onError(error, currentProps);
                    onLoadingChanged(false, currentProps);
                    onExportReady(createExportErrorFunction(error));

                    setState((state) => ({
                        ...state,
                        isLoading: false,
                        error,
                    }));
                },
                [getEvents],
            );

            const setResult = useCallback(
                (result: DataViewFacade) => {
                    const currentProps = latestPropsRef.current;
                    const { onLoadingFinish, onLoadingChanged, onExportReady } = getEvents();
                    const title = typeof exportTitle === "function" ? exportTitle(currentProps) : exportTitle;

                    onLoadingFinish(result, currentProps);
                    onLoadingChanged(false, currentProps);
                    onExportReady(createExportFunction(result.result(), title));

                    // Important: set effectiveProps to current props, matching class component behavior
                    effectivePropsRef.current = currentProps;
                    setState((state) => ({
                        ...state,
                        isLoading: false,
                        error: undefined,
                        result,
                    }));
                },
                [getEvents, exportTitle],
            );

            const latestCallbacksRef = useRef({ startLoading, setError, setResult });
            latestCallbacksRef.current = { startLoading, setError, setResult };

            const fetch = useCallback(async (): Promise<void> => {
                const currentProps = latestPropsRef.current;
                const { startLoading, setError, setResult } = latestCallbacksRef.current;

                if (cancelablePromiseRef.current) {
                    cancelablePromiseRef.current.cancel();
                    // On refetch, when cancelablePromise was not fulfilled, throw cancel error immediately
                    if (!cancelablePromiseRef.current.getHasFulfilled()) {
                        setError(new CancelledSdkError());
                    }
                }

                startLoading();

                const readWindow = typeof window === "function" ? window(currentProps) : window;
                const enableRealCancellation =
                    typeof enableExecutionCancelling === "function"
                        ? enableExecutionCancelling(currentProps)
                        : enableExecutionCancelling;
                const promise = (signal?: AbortSignal) => promiseFactory(currentProps, readWindow, signal);
                cancelablePromiseRef.current = makeCancelable(
                    (signal) => promise(enableRealCancellation ? signal : undefined),
                    enableRealCancellation,
                );

                try {
                    const result = await cancelablePromiseRef.current.promise;
                    if (!isWithExecutionLoadingUnmountedRef.current) {
                        setResult(result);
                    }
                } catch (err) {
                    // We throw cancel error immediately on refetch, when cancelablePromise was not fulfilled,
                    // but CancelablePromise throw cancel error after promise resolution, so here
                    // we don't care about it anymore.
                    if (!isWithExecutionLoadingUnmountedRef.current && !isCancelError(err)) {
                        const sdkError = convertError(err);
                        setError(sdkError);
                    }
                }
            }, [window, enableExecutionCancelling, promiseFactory]);

            const isStaleResult = useCallback((): boolean => {
                // Check if we have effective props and if current props require a refetch
                // shouldRefetch(prevProps, currentProps) - returns true if data needs to be refetched
                return (
                    effectivePropsRef.current !== undefined &&
                    shouldRefetch(effectivePropsRef.current, latestPropsRef.current)
                );
            }, [shouldRefetch]);

            // ComponentDidMount equivalent
            useEffect(() => {
                isWithExecutionLoadingUnmountedRef.current = false;
                // Use initial props to match class component's componentDidMount behavior
                const _loadOnMount =
                    typeof loadOnMount === "function" ? loadOnMount(initialPropsRef.current) : loadOnMount;

                if (_loadOnMount) {
                    // fetch will use latest props via latestPropsRef
                    fetch();
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, []); // Empty dependency array for mount only

            // ComponentDidUpdate equivalent
            const prevPropsRef = useRef<TProps>();
            useEffect(() => {
                const currentProps = latestPropsRef.current;
                if (prevPropsRef.current && shouldRefetch(prevPropsRef.current, currentProps)) {
                    fetch();
                }
                prevPropsRef.current = currentProps;
            });

            // ComponentWillUnmount equivalent
            useEffect(() => {
                return () => {
                    isWithExecutionLoadingUnmountedRef.current = true;
                    if (cancelablePromiseRef.current) {
                        cancelablePromiseRef.current.cancel();
                        if (!cancelablePromiseRef.current.getHasFulfilled()) {
                            setError(new CancelledSdkError());
                        }
                    }
                };
            }, [setError]);

            const { result, isLoading, error } = state;

            if (isStaleResult()) {
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
                    reload: fetch,
                };

                return <WrappedComponent {...props} {...executionResult} />;
            }

            const executionResult = {
                result,
                isLoading,
                error,
                reload: fetch,
            };

            return <WrappedComponent {...props} {...executionResult} />;
        }

        hoistNonReactStatics(WithLoading, WrappedComponent);

        return WithLoading;
    };
}
