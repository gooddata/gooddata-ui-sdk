// (C) 2019-2026 GoodData Corporation

import { type ComponentClass, type ComponentType, useCallback, useEffect, useRef, useState } from "react";

import { isEqual, omit } from "lodash-es";
import { type IntlShape, injectIntl } from "react-intl";

import {
    type IClusteringConfig,
    type IDataView,
    type IExecutionResult,
    type IForecastConfig,
    type IOutliersConfig,
    type IPreparedExecution,
    isNoDataError,
    isUnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import { defFingerprint } from "@gooddata/sdk-model";

import { convertError } from "../../errors/errorHandling.js";
import {
    ClusteringNotReceivedSdkError,
    DataTooLargeToDisplaySdkError,
    ForecastNotReceivedSdkError,
    type GoodDataSdkError,
    NegativeValuesSdkError,
    isClusteringNotReceived,
    isForecastNotReceived,
} from "../../errors/GoodDataSdkError.js";
import { IntlWrapper } from "../../localization/IntlWrapper.js";
import { DataViewFacade } from "../../results/facade.js";
import { type IExportFunction, type ILoadingState } from "../../vis/Events.js";
import { createExportErrorFunction, createExportFunction } from "../../vis/export.js";
import { type IDataVisualizationProps } from "../../vis/VisualizationProps.js";

import { getAvailableDrillTargets } from "./availableDrillTargets.js";

interface IDataViewLoadState {
    isLoading: boolean;
    error?: string | null;
    seType?: GoodDataSdkError["seType"] | null;
    executionResult?: IExecutionResult | null;
    dataView?: IDataView | null;
}

/**
 * Applies the wrapped component's `defaultProps` the same way React did for class components: the default
 * value is only used when the respective prop is `undefined`.
 */
function applyDefaultProps<P extends object>(props: P, defaultProps: Partial<P>): P {
    const keys = Object.keys(defaultProps) as (keyof P)[];

    if (keys.every((key) => props[key] !== undefined)) {
        return props;
    }

    const propsWithDefaults = { ...props };

    keys.forEach((key) => {
        if (propsWithDefaults[key] === undefined) {
            propsWithDefaults[key] = defaultProps[key]!;
        }
    });

    return propsWithDefaults;
}

/**
 * These props are injected by withEntireDataView HOC. This HOC takes care of driving the execution and obtaining
 * the data view to visualize. Oh and by the way, the HOC also provides internationalization context :/
 *
 * @internal
 */
export interface ILoadingInjectedProps {
    /**
     * If the data is loading, then this prop contains true. Otherwise, if the loading finished with either
     * success or failure, this prop contains false.
     */
    isLoading: boolean;

    /**
     * If loading succeeds, then this prop contains the data to visualize. Otherwise is undefined.
     */
    dataView?: IDataView;

    /**
     * If loading fails, then this prop contains description of the error. Otherwise is undefined.
     */
    error?: string;
    /**
     * If loading fails, then this prop contains description of the se error. Otherwise is undefined.
     */
    seType?: GoodDataSdkError["seType"];

    // TODO: take this out of here
    intl: IntlShape;

    /**
     * Callback to trigger when export is ready
     */
    onExportReady(exportFunction: IExportFunction): void;

    /**
     * Callback to trigger if the chart cannot visualize the data because it is too large.
     */
    onDataTooLarge(data: any, errorMessage?: string): void;

    /**
     * Callback to trigger if the chart cannot visualize the data because it contains negative values.
     */
    onNegativeValues(): void;
}

/**
 * A HOC to wrap data visualization components with loading / error handling.
 *
 * Note: this is a legacy HOC with a long history. In v7 we had VisualizationLoadingHOC - that one was used for
 * all components and was linked to AFM and the paging and everything. We took this and gutted it out, changed to
 * work with executions and to only support reading all the data.
 *
 * @param InnerComponent - component to wrap
 * @internal
 */
export function withEntireDataView<T extends IDataVisualizationProps>(
    InnerComponent: ComponentType<T & ILoadingInjectedProps>,
): ComponentType<T> {
    const innerDefaultProps = ((InnerComponent as unknown as ComponentClass).defaultProps || {}) as Partial<
        T & ILoadingInjectedProps
    >;

    function LoadingHOCWrapped(receivedProps: T & ILoadingInjectedProps) {
        const props = applyDefaultProps(receivedProps, innerDefaultProps);

        const [state, setState] = useState<IDataViewLoadState>({
            isLoading: false,
            error: null,
            executionResult: null,
            dataView: null,
        });

        // refs holding the latest props and state, so that the (possibly async) callbacks below always work
        // with the current values - the same way `this.props` and `this.state` did
        const latestPropsRef = useRef(props);
        latestPropsRef.current = props;
        const latestStateRef = useRef(state);
        latestStateRef.current = state;

        const hasUnmounted = useRef(false);
        const abortController = useRef(new AbortController());

        /**
         * Identity of the last initialize request.
         *
         * This has to identify the REQUEST, not the execution definition it was made with. The same
         * definition can legitimately be requested again after a different one - Analytical Designer
         * does exactly that when a saved insight with a persisted sort is opened: it executes the
         * insight WITH the sort, then once WITHOUT it (the pluggable visualization's initial-properties
         * push briefly clears the extended reference point) and then WITH it again. Keyed by
         * definition fingerprint, the first request stops looking superseded the moment the third one
         * re-registers the same fingerprint, so the cancellation error of that already-aborted request
         * is reported as a genuine execution failure.
         */
        const lastInitRequestId = useRef(0);

        const updateState = useCallback((newState: Partial<IDataViewLoadState>) => {
            setState((s) => ({ ...s, ...newState }));
        }, []);

        const refreshAbortController = useCallback(() => {
            if (latestPropsRef.current.enableExecutionCancelling) {
                if (latestStateRef.current.isLoading) {
                    abortController.current.abort();
                }
                abortController.current = new AbortController();
            }
        }, []);

        const onLoadingChanged = useCallback(
            (loadingState: ILoadingState) => {
                if (hasUnmounted.current) {
                    return;
                }

                latestPropsRef.current.onLoadingChanged?.(loadingState);

                const { isLoading } = loadingState;

                const newState: IDataViewLoadState = { isLoading };

                if (isLoading) {
                    newState.error = null;
                }

                updateState(newState);
            },
            [updateState],
        );

        const onDataView = useCallback((dataView: IDataView) => {
            if (hasUnmounted.current) {
                return;
            }

            latestPropsRef.current.onDataView?.(DataViewFacade.for(dataView));
        }, []);

        const onError = useCallback(
            (error: GoodDataSdkError) => {
                if (hasUnmounted.current) {
                    return;
                }

                const { onExportReady } = latestPropsRef.current;

                if (!isForecastNotReceived(error) && !isClusteringNotReceived(error)) {
                    const err = error as GoodDataSdkError;
                    updateState({ error: err.getMessage(), seType: err.seType, dataView: null });
                }
                onLoadingChanged({ isLoading: false });

                if (onExportReady) {
                    onExportReady(createExportErrorFunction(error));
                }

                latestPropsRef.current.onError?.(error);
            },
            [onLoadingChanged, updateState],
        );

        const onDataTooLarge = useCallback(
            (_data: any, errorMessage?: string) => {
                onError(new DataTooLargeToDisplaySdkError(errorMessage));
            },
            [onError],
        );

        const onNegativeValues = useCallback(() => {
            onError(new NegativeValuesSdkError());
        }, [onError]);

        const isRequestStale = useCallback((requestId: number): boolean => {
            return lastInitRequestId.current !== requestId || hasUnmounted.current;
        }, []);

        const loadClusteringData = useCallback(
            async (
                dataView: IDataView,
                executionResult: IExecutionResult,
                clusteringConfig: IClusteringConfig,
            ): Promise<IDataView> => {
                let result = dataView.withClustering(clusteringConfig);
                try {
                    const clusteringResult = await executionResult.readClusteringAll(clusteringConfig);
                    result = result.withClustering(clusteringConfig, clusteringResult);
                } catch (e) {
                    result = result.withClustering(clusteringConfig, {
                        attribute: [],
                        clusters: [],
                        xcoord: [],
                        ycoord: [],
                    });

                    const err = e as any;
                    throw new ClusteringNotReceivedSdkError(
                        err.responseBody?.reason || err.message || "Unknown error",
                        err,
                    );
                }
                return result;
            },
            [],
        );

        const loadForecastData = useCallback(
            async (
                dataView: IDataView,
                executionResult: IExecutionResult,
                forecastConfig: IForecastConfig,
            ): Promise<IDataView> => {
                const { pushData } = latestPropsRef.current;
                try {
                    const forecastResult = await executionResult.readForecastAll(dataView.forecastConfig!);
                    const updatedDataView = dataView.withForecast(dataView.forecastConfig, forecastResult);
                    updateState({ dataView: updatedDataView });
                    if (pushData) {
                        pushData({
                            dataView: updatedDataView,
                            propertiesMeta: {
                                slicedForecast:
                                    forecastConfig.forecastPeriod !== dataView.forecastConfig?.forecastPeriod,
                            },
                        });
                    }
                    return updatedDataView;
                } catch (e) {
                    const updatedDataView = dataView.withForecast(undefined);
                    updateState({ dataView: updatedDataView });
                    if (pushData) {
                        pushData({ dataView: updatedDataView });
                    }

                    const err = e as any;
                    throw new ForecastNotReceivedSdkError(
                        err.responseBody?.reason || err.message || "Unknown error",
                        err,
                    );
                }
            },
            [updateState],
        );

        const loadOutliersData = useCallback(
            async (
                dataView: IDataView,
                executionResult: IExecutionResult,
                _outliersConfig: IOutliersConfig,
            ): Promise<IDataView> => {
                const { pushData } = latestPropsRef.current;
                try {
                    const outliersResult = await executionResult.readOutliersAll(dataView.outliersConfig!);
                    const updatedDataView = dataView.withOutliers(dataView.outliersConfig, outliersResult);
                    updateState({ dataView: updatedDataView });
                    if (pushData) {
                        pushData({
                            dataView: updatedDataView,
                        });
                    }
                    return updatedDataView;
                } catch (e) {
                    const updatedDataView = dataView.withForecast(undefined);
                    updateState({ dataView: updatedDataView });
                    if (pushData) {
                        pushData({ dataView: updatedDataView });
                    }

                    const err = e as any;
                    throw new ForecastNotReceivedSdkError(
                        err.responseBody?.reason || err.message || "Unknown error",
                        err,
                    );
                }
            },
            [updateState],
        );

        const handleLoadingSuccess = useCallback(
            (dataView: IDataView, executionResult: IExecutionResult): void => {
                const { onExportReady, pushData, exportTitle } = latestPropsRef.current;

                updateState({ dataView, error: null, executionResult });
                onLoadingChanged({ isLoading: false });
                onDataView(dataView);

                if (onExportReady) {
                    onExportReady(createExportFunction(dataView.result, exportTitle));
                }

                if (pushData) {
                    const availableDrillTargets = getAvailableDrillTargets(DataViewFacade.for(dataView));
                    pushData({ dataView, availableDrillTargets });
                }
            },
            [onDataView, onLoadingChanged, updateState],
        );

        const handleLoadingError = useCallback(
            (error: unknown, requestId: number): void => {
                if (isRequestStale(requestId)) {
                    return;
                }

                const { pushData } = latestPropsRef.current;
                /*
                 * There can be situations, where there is no data to visualize but the result / dataView contains
                 * metadata essential for setup of drilling. Look for that and if available push up.
                 */
                if (isNoDataError(error) && error.dataView && pushData) {
                    const availableDrillTargets = getAvailableDrillTargets(
                        DataViewFacade.for(error.dataView),
                    );
                    pushData({ availableDrillTargets });
                }

                onError(convertError(error));
            },
            [isRequestStale, onError],
        );

        const initDataLoading = useCallback(
            async (
                originalExecution: IPreparedExecution,
                forecastConfig?: IForecastConfig,
                outliersConfig?: IOutliersConfig,
                clusteringConfig?: IClusteringConfig,
            ) => {
                let execution = originalExecution;
                if (latestPropsRef.current.enableExecutionCancelling) {
                    execution = execution.withSignal(abortController.current.signal);
                }
                const { pushData } = latestPropsRef.current;
                onLoadingChanged({ isLoading: true });
                updateState({ dataView: null });
                const fingerprint = defFingerprint(execution.definition);
                const requestId = lastInitRequestId.current + 1;
                lastInitRequestId.current = requestId;

                try {
                    const executionResult = await execution.execute();
                    if (isRequestStale(requestId)) {
                        return;
                    }

                    const originalDataView = await executionResult.readAll().catch((err) => {
                        /**
                         * When execution result is received successfully,
                         * but data load fails with unexpected http response,
                         * we still want to push availableDrillTargets
                         */
                        if (isUnexpectedResponseError(err) && pushData) {
                            const availableDrillTargets = getAvailableDrillTargets(
                                DataViewFacade.forResult(executionResult),
                            );

                            pushData({ availableDrillTargets });
                        }
                        throw err;
                    });

                    if (
                        isRequestStale(requestId) ||
                        defFingerprint(originalDataView.definition) !== fingerprint
                    ) {
                        /*
                         * Stop right now if the data are not relevant anymore because there was another
                         * initialize request in the meantime, or because they do not belong to the
                         * definition this request asked for.
                         */
                        return;
                    }

                    let dataView = originalDataView;

                    if (forecastConfig) {
                        dataView = originalDataView.withForecast(forecastConfig);
                    }
                    if (outliersConfig) {
                        dataView = dataView.withOutliers(outliersConfig);
                    }

                    if (clusteringConfig) {
                        dataView = await loadClusteringData(
                            originalDataView,
                            executionResult,
                            clusteringConfig,
                        );
                        if (forecastConfig) {
                            dataView = dataView.withForecast(forecastConfig);
                        }
                        if (outliersConfig) {
                            dataView = dataView.withOutliers(outliersConfig);
                        }
                    }

                    handleLoadingSuccess(dataView, executionResult);

                    if (hasUnmounted.current) {
                        return;
                    }

                    if (dataView.forecastConfig && forecastConfig) {
                        dataView = await loadForecastData(dataView, executionResult, forecastConfig);
                    }
                    if (dataView.outliersConfig && outliersConfig) {
                        await loadOutliersData(dataView, executionResult, outliersConfig);
                    }
                } catch (error) {
                    handleLoadingError(error, requestId);
                }
            },
            [
                handleLoadingError,
                handleLoadingSuccess,
                isRequestStale,
                loadClusteringData,
                loadForecastData,
                loadOutliersData,
                onLoadingChanged,
                updateState,
            ],
        );

        // componentDidMount & componentWillUnmount
        useEffect(() => {
            hasUnmounted.current = false;

            void initDataLoading(
                props.execution,
                props.forecastConfig,
                props.outliersConfig,
                props.clusteringConfig,
            );

            return () => {
                hasUnmounted.current = true;
                refreshAbortController();
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        // UNSAFE_componentWillReceiveProps; the props are compared with custom equality, hence the effect runs
        // on every render and decides on its own whether the data must be loaded again
        const isFirstEffectRunRef = useRef(true);
        const prevRef = useRef({
            execution: props.execution,
            forecastConfig: props.forecastConfig,
            outliersConfig: props.outliersConfig,
            clusteringConfig: props.clusteringConfig,
        });
        useEffect(() => {
            const { execution, forecastConfig, outliersConfig, clusteringConfig } = props;

            if (isFirstEffectRunRef.current) {
                // the mount effect above has already started the initial load
                isFirstEffectRunRef.current = false;
                return;
            }

            const prev = prevRef.current;
            prevRef.current = { execution, forecastConfig, outliersConfig, clusteringConfig };

            //  we need strict equality here in case only the buckets changed (not measures or attributes)
            if (
                !prev.execution.equals(execution) ||
                !isEqual(prev.forecastConfig, forecastConfig) ||
                !isEqual(prev.clusteringConfig, clusteringConfig) ||
                !isEqual(prev.outliersConfig, outliersConfig)
            ) {
                refreshAbortController();
                void initDataLoading(execution, forecastConfig, outliersConfig, clusteringConfig);
            }
        });

        const stripWorkspace = (allProps: T & ILoadingInjectedProps): T & ILoadingInjectedProps => {
            return omit(allProps, ["workspace"]) as any;
        };

        const { isLoading, error, dataView, seType } = state;
        const { intl } = props;

        // lower-level components do not need workspace
        const innerProps = stripWorkspace(props);

        return (
            <InnerComponent
                {...(innerProps as any)}
                dataView={dataView}
                onDataTooLarge={onDataTooLarge}
                onNegativeValues={onNegativeValues}
                error={error}
                seType={seType}
                isLoading={isLoading}
                intl={intl}
            />
        );
    }

    const IntlLoadingHOC = injectIntl<"intl", T & ILoadingInjectedProps>(LoadingHOCWrapped);

    function LoadingHOC(props: T) {
        return (
            <IntlWrapper locale={props.locale}>
                <IntlLoadingHOC {...(props as any)} />
            </IntlWrapper>
        );
    }

    return LoadingHOC;
}
