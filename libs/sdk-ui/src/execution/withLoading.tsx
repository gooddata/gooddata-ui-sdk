// (C) 2019 GoodData Corporation
import * as React from "react";
import noop = require("lodash/noop");
import hoistNonReactStatics = require("hoist-non-react-statics");
import { DataViewFacade, makeCancelable, ICancelablePromise } from "../base";

export type DataViewWindow = {
    offset: number[];
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
    error: Error | undefined;

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
 * TODO: SDK8: add docs
 * @public
 */
export interface IWithLoadingEvents<TProps> {
    onError?: (error: Error, props: TProps) => void;
    onLoadingStart?: (props: TProps) => void;
    onLoadingChanged?: (isLoading: boolean, props: TProps) => void;
    onLoadingFinish?: (result: DataViewFacade, props: TProps) => void;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IWithLoading<TProps> {
    promiseFactory: (props: TProps, window?: DataViewWindow) => Promise<DataViewFacade>;
    window?: DataViewWindow | ((props: TProps) => DataViewWindow | undefined);
    events?: IWithLoadingEvents<TProps> | ((props: TProps) => IWithLoadingEvents<TProps>);
    loadOnMount?: boolean | ((props: TProps) => boolean);
    shouldRefetch?: (prevProps: TProps, nextProps: TProps) => boolean;
}

type WithLoadingState = {
    isLoading: boolean;
    error: Error | undefined;
    result: DataViewFacade | undefined;
};

/**
 * TODO: SDK8: add docs
 * @public
 */
export function withLoading<TProps>(params: IWithLoading<TProps>) {
    const { promiseFactory, loadOnMount = true, events = {}, shouldRefetch = () => false, window } = params;

    return (
        WrappedComponent: React.ComponentType<TProps & WithLoadingResult>,
    ): React.ComponentClass<TProps> => {
        class WithLoading extends React.Component<TProps, WithLoadingState> {
            private cancelablePromise: ICancelablePromise<DataViewFacade> | undefined;

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
                } = _events;

                return {
                    onError,
                    onLoadingChanged,
                    onLoadingFinish,
                    onLoadingStart,
                };
            }

            private startLoading() {
                const { onLoadingStart, onLoadingChanged } = this.getEvents();

                onLoadingStart(this.props);
                onLoadingChanged(true, this.props);

                this.setState(state => ({
                    ...state,
                    isLoading: true,
                    error: undefined,
                }));
            }

            private setError(error: Error) {
                const { onError, onLoadingChanged } = this.getEvents();

                onError(error, this.props);
                onLoadingChanged(false, this.props);

                this.setState(state => ({
                    ...state,
                    isLoading: false,
                    error,
                }));
            }

            private setResult(result: DataViewFacade) {
                const { onLoadingFinish, onLoadingChanged } = this.getEvents();

                onLoadingFinish(result, this.props);
                onLoadingChanged(false, this.props);

                this.setState(state => ({
                    ...state,
                    isLoading: false,
                    error: undefined,
                    result,
                }));
            }

            private async fetch(): Promise<void> {
                if (this.cancelablePromise) {
                    this.cancelablePromise.cancel();
                }

                this.startLoading();

                const readWindow = typeof window === "function" ? window(this.props) : window;
                const promise = promiseFactory(this.props, readWindow);
                this.cancelablePromise = makeCancelable(promise);

                try {
                    const result = await this.cancelablePromise.promise;
                    this.setResult(result);
                } catch (err) {
                    this.setError(err);
                }
            }

            public componentDidMount() {
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
                if (this.cancelablePromise) {
                    this.cancelablePromise.cancel();
                }
            }

            public render() {
                const { result, isLoading, error } = this.state;
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
