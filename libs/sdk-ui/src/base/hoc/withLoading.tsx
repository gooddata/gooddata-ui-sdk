// (C) 2019 GoodData Corporation
import * as React from "react";
import noop from "lodash/noop";
import hoistNonReactStatics = require("hoist-non-react-statics");

interface ICancelablePromise<T> {
    promise: Promise<T>;
    cancel: () => void;
}

function makeCancelable<T>(promise: Promise<T>): ICancelablePromise<T> {
    let hasCanceled = false;

    const wrappedPromise = new Promise<T>((resolve, reject) => {
        promise.then(
            val => (hasCanceled ? reject({ isCanceled: true }) : resolve(val)),
            error => (hasCanceled ? reject({ isCanceled: true }) : reject(error)),
        );
    });

    return {
        promise: wrappedPromise,
        cancel() {
            hasCanceled = true;
        },
    };
}

export type WithLoadingState<T> = {
    isLoading: boolean;
    error: Error | undefined;
    result: T | undefined;
    promise: ICancelablePromise<T> | undefined;
};

export type WithLoadingResult<T> = {
    isLoading: boolean;
    error: Error | undefined;
    result: T | undefined;
    fetch: () => Promise<T>;
};

export interface IWithLoadingEvents<T, P> {
    onError?: (error?: Error, props?: T) => void;
    onLoadingStart?: (props?: T) => void;
    onLoadingChanged?: (isLoading?: boolean, props?: T) => void;
    onLoadingFinish?: (result?: P, props?: T) => void;
}

export interface IWithLoading<T, P, R extends object> {
    promiseFactory: (props: T) => Promise<P>;
    mapResultToProps: (result: WithLoadingResult<P>) => R;
    eventsOrFactory?: IWithLoadingEvents<T, P> | ((props: T) => IWithLoadingEvents<T, P>);
    loadOnMount?: boolean;
}

export function withLoading<T, P, R extends object>({
    promiseFactory,
    mapResultToProps,
    loadOnMount = true,
    eventsOrFactory = {},
}: IWithLoading<T, P, R>) {
    return (WrappedComponent: React.ComponentType<T & R>): React.ComponentClass<T> => {
        class WithLoading extends React.Component<T, WithLoadingState<P>> {
            public state: WithLoadingState<P> = {
                error: undefined,
                isLoading: false,
                result: undefined,
                promise: undefined,
            };

            constructor(props: T) {
                super(props);
                this.fetch = this.fetch.bind(this);
                this.startLoading = this.startLoading.bind(this);
                this.setError = this.setError.bind(this);
                this.setResult = this.setResult.bind(this);
                this.setPromise = this.setPromise.bind(this);
                this.getEvents = this.getEvents.bind(this);
            }

            private getEvents() {
                const events =
                    typeof eventsOrFactory === "function" ? eventsOrFactory(this.props) : eventsOrFactory;
                const {
                    onError = noop,
                    onLoadingChanged = noop,
                    onLoadingFinish = noop,
                    onLoadingStart = noop,
                } = events;

                return {
                    onError,
                    onLoadingChanged,
                    onLoadingFinish,
                    onLoadingStart,
                };
            }

            private setPromise(promise: ICancelablePromise<P>) {
                this.setState(state => ({
                    ...state,
                    promise,
                }));
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

            private setResult(result: P) {
                const { onLoadingFinish, onLoadingChanged } = this.getEvents();
                onLoadingFinish(result, this.props);
                onLoadingChanged(false, this.props);
                this.setState(state => ({
                    ...state,
                    isLoading: false,
                    result,
                }));
            }

            private async fetch() {
                this.startLoading();
                let result;
                const promise = promiseFactory(this.props);
                const cancelablePromise = makeCancelable(promise);
                this.setPromise(cancelablePromise);

                try {
                    result = await cancelablePromise.promise;
                } catch (err) {
                    if (!err.isCanceled) {
                        this.setError(err);
                    }
                    return;
                }

                this.setResult(result);

                return result;
            }

            public componentDidMount() {
                if (loadOnMount) {
                    this.fetch();
                }
            }

            public componentWillUnmount() {
                const { promise } = this.state;
                if (promise) {
                    promise.cancel();
                }
            }

            public render() {
                const { result, isLoading, error } = this.state;
                const injectedProps = mapResultToProps({
                    result,
                    isLoading,
                    error,
                    fetch: this.fetch,
                });

                return <WrappedComponent {...this.props} {...injectedProps} />;
            }
        }

        hoistNonReactStatics(WithLoading, WrappedComponent);

        return WithLoading;
    };
}
