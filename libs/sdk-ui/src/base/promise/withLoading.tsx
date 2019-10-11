// (C) 2019 GoodData Corporation
import * as React from "react";
import noop = require("lodash/noop");
import hoistNonReactStatics = require("hoist-non-react-statics");
import { makeCancelable, ICancelablePromise } from "./CancelablePromise";

//
// Public interface
//

/**
 * TODO: SDK8: add docs
 * @public
 */
export type WithLoadingResult<T> = {
    isLoading: boolean;
    error: Error | undefined;
    result: T | undefined;
    fetch: () => Promise<T>;
};

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IWithLoadingEvents<T, P> {
    onError?: (error?: Error, props?: T) => void;
    onLoadingStart?: (props?: T) => void;
    onLoadingChanged?: (isLoading?: boolean, props?: T) => void;
    onLoadingFinish?: (result?: P, props?: T) => void;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IWithLoading<T, P, R extends object> {
    promiseFactory: (props?: T) => Promise<P>;
    mapResultToProps?: (result: WithLoadingResult<P>) => R;
    events?: IWithLoadingEvents<T, P> | ((props?: T) => IWithLoadingEvents<T, P>);
    loadOnMount?: boolean | ((props?: T) => boolean);
    shouldRefetch?: (prevProps?: T, nextProps?: T) => boolean;
}

/**
 * TODO: SDK8: add docs
 * @internal
 */
export type WithLoadingState<T> = {
    isLoading: boolean;
    error: Error | undefined;
    result: T | undefined;
};

/**
 * TODO: SDK8: add docs
 * @public
 */
export function withLoading<T, P, R extends object>({
    promiseFactory,
    mapResultToProps,
    loadOnMount = true,
    events = {},
    shouldRefetch = () => false,
}: IWithLoading<T, P, R>) {
    return (WrappedComponent: React.ComponentType<T & R>): React.ComponentClass<T> => {
        class WithLoading extends React.Component<T, WithLoadingState<P>> {
            private cancelablePromise: ICancelablePromise<P> | undefined;

            public state: WithLoadingState<P> = {
                error: undefined,
                isLoading: false,
                result: undefined,
            };

            constructor(props: T) {
                super(props);
                this.fetch = this.fetch.bind(this);
                this.startLoading = this.startLoading.bind(this);
                this.setError = this.setError.bind(this);
                this.setResult = this.setResult.bind(this);
                this.getEvents = this.getEvents.bind(this);
            }

            private getEvents() {
                const parsedEvents = typeof events === "function" ? events(this.props) : events;
                const {
                    onError = noop,
                    onLoadingChanged = noop,
                    onLoadingFinish = noop,
                    onLoadingStart = noop,
                } = parsedEvents;

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

            private setResult(result: P) {
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

            private async fetch() {
                if (this.cancelablePromise) {
                    this.cancelablePromise.cancel();
                }
                this.startLoading();
                const promise = promiseFactory(this.props);
                this.cancelablePromise = makeCancelable(promise);
                let result;
                try {
                    result = await this.cancelablePromise.promise;
                } catch (err) {
                    this.setError(err);
                    return;
                }

                this.setResult(result);
                return result;
            }

            public componentDidMount() {
                const _loadOnMount =
                    typeof loadOnMount === "function" ? loadOnMount(this.props) : loadOnMount;
                if (_loadOnMount) {
                    this.fetch();
                }
            }

            public componentDidUpdate(prevProps: T) {
                if (shouldRefetch(prevProps, this.props)) {
                    this.cancelablePromise.cancel();
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
