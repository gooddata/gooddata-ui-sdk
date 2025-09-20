// (C) 2019-2025 GoodData Corporation

import { Component, ComponentClass, ComponentType } from "react";

import { isEqual, noop, omit } from "lodash-es";
import { IntlShape, injectIntl } from "react-intl";

import {
    IClusteringConfig,
    IDataView,
    IExecutionResult,
    IForecastConfig,
    IPreparedExecution,
    isNoDataError,
    isUnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import { defFingerprint } from "@gooddata/sdk-model";

import { getAvailableDrillTargets } from "./availableDrillTargets.js";
import { convertError } from "../../errors/errorHandling.js";
import {
    ClusteringNotReceivedSdkError,
    DataTooLargeToDisplaySdkError,
    ForecastNotReceivedSdkError,
    GoodDataSdkError,
    NegativeValuesSdkError,
    isClusteringNotReceived,
    isForecastNotReceived,
} from "../../errors/GoodDataSdkError.js";
import { IntlWrapper } from "../../localization/IntlWrapper.js";
import { DataViewFacade } from "../../results/facade.js";
import { IExportFunction, ILoadingState } from "../../vis/Events.js";
import { createExportErrorFunction, createExportFunction } from "../../vis/export.js";
import { IDataVisualizationProps } from "../../vis/VisualizationProps.js";

interface IDataViewLoadState {
    isLoading: boolean;
    error?: string | null;
    seType?: GoodDataSdkError["seType"] | null;
    executionResult?: IExecutionResult | null;
    dataView?: IDataView | null;
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
    class LoadingHOCWrapped extends Component<T & ILoadingInjectedProps, IDataViewLoadState> {
        public static defaultProps = (InnerComponent as unknown as ComponentClass).defaultProps || {};

        private hasUnmounted: boolean = false;
        private abortController: AbortController;

        /**
         * Fingerprint of the last execution definition the initialize was called with.
         */
        private lastInitRequestFingerprint: string | null = null;

        constructor(props: T & ILoadingInjectedProps) {
            super(props);

            this.state = {
                isLoading: false,
                error: null,
                executionResult: null,
                dataView: null,
            };

            this.onLoadingChanged = this.onLoadingChanged.bind(this);
            this.onDataTooLarge = this.onDataTooLarge.bind(this);
            this.onNegativeValues = this.onNegativeValues.bind(this);
            this.onDataView = this.onDataView.bind(this);
            this.abortController = new AbortController();
        }

        public override componentDidMount() {
            this.initDataLoading(
                this.props.execution,
                this.props.forecastConfig,
                this.props.clusteringConfig,
            );
        }

        public override render() {
            const { isLoading, error, dataView, seType } = this.state;
            const { intl } = this.props;

            // lower-level components do not need workspace
            const props = this.stripWorkspace(this.props);

            return (
                <InnerComponent
                    {...(props as any)}
                    dataView={dataView}
                    onDataTooLarge={this.onDataTooLarge}
                    onNegativeValues={this.onNegativeValues}
                    error={error}
                    seType={seType}
                    isLoading={isLoading}
                    intl={intl}
                />
            );
        }

        public override UNSAFE_componentWillReceiveProps(nextProps: Readonly<T & ILoadingInjectedProps>) {
            //  we need strict equality here in case only the buckets changed (not measures or attributes)
            if (
                !this.props.execution.equals(nextProps.execution) ||
                !isEqual(this.props.forecastConfig, nextProps.forecastConfig) ||
                !isEqual(this.props.clusteringConfig, nextProps.clusteringConfig)
            ) {
                this.refreshAbortController();
                this.initDataLoading(
                    nextProps.execution,
                    nextProps.forecastConfig,
                    nextProps.clusteringConfig,
                );
            }
        }

        public override componentWillUnmount() {
            this.hasUnmounted = true;
            this.onLoadingChanged = noop;
            this.onDataView = noop;
            this.onError = noop;
            this.refreshAbortController();
        }

        private refreshAbortController() {
            if (this.props.enableExecutionCancelling) {
                if (this.state.isLoading) {
                    this.abortController.abort();
                }
                this.abortController = new AbortController();
            }
        }

        private onLoadingChanged(loadingState: ILoadingState) {
            const { onLoadingChanged } = this.props;

            onLoadingChanged?.(loadingState);

            const { isLoading } = loadingState;

            const state: IDataViewLoadState = { isLoading };

            if (isLoading) {
                state.error = null;
            }

            this.setState(state);
        }

        private onDataView(dataView: IDataView) {
            const { onDataView } = this.props;

            onDataView?.(DataViewFacade.for(dataView));
        }

        private onError(error: GoodDataSdkError) {
            const { onExportReady } = this.props;

            if (!isForecastNotReceived(error) && !isClusteringNotReceived(error)) {
                const err = error as GoodDataSdkError;
                this.setState({ error: err.getMessage(), seType: err.seType, dataView: null });
            }
            this.onLoadingChanged({ isLoading: false });

            if (onExportReady) {
                onExportReady(createExportErrorFunction(error));
            }

            this.props.onError?.(error);
        }

        private onDataTooLarge(_data: any, errorMessage?: string) {
            this.onError(new DataTooLargeToDisplaySdkError(errorMessage));
        }

        private onNegativeValues() {
            this.onError(new NegativeValuesSdkError());
        }

        private async initDataLoading(
            originalExecution: IPreparedExecution,
            forecastConfig?: IForecastConfig,
            clusteringConfig?: IClusteringConfig,
        ) {
            let execution = originalExecution;
            if (this.props.enableExecutionCancelling) {
                execution = execution.withSignal(this.abortController.signal);
            }
            const { onExportReady, pushData, exportTitle } = this.props;
            this.onLoadingChanged({ isLoading: true });
            this.setState({ dataView: null });
            this.lastInitRequestFingerprint = defFingerprint(execution.definition);

            try {
                const executionResult = await execution.execute();
                if (this.lastInitRequestFingerprint !== defFingerprint(execution.definition)) {
                    return;
                }

                if (this.hasUnmounted) {
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

                if (this.hasUnmounted) {
                    return;
                }

                if (this.lastInitRequestFingerprint !== defFingerprint(originalDataView.definition)) {
                    /*
                     * Stop right now if the data are not relevant anymore because there was another
                     * initialize request in the meantime.
                     */
                    return;
                }

                let dataView = originalDataView;

                if (forecastConfig) {
                    dataView = originalDataView.withForecast(forecastConfig);
                }

                if (clusteringConfig) {
                    dataView = originalDataView.withClustering(clusteringConfig);
                    try {
                        const clusteringResult = await executionResult.readClusteringAll(clusteringConfig);
                        dataView = dataView.withClustering(clusteringConfig, clusteringResult);
                    } catch (e) {
                        dataView = dataView.withClustering(clusteringConfig, {
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
                }

                this.setState({ dataView, error: null, executionResult });
                this.onLoadingChanged({ isLoading: false });
                this.onDataView(dataView);

                if (onExportReady) {
                    onExportReady(createExportFunction(dataView.result, exportTitle));
                }

                if (pushData) {
                    const availableDrillTargets = getAvailableDrillTargets(DataViewFacade.for(dataView));

                    pushData({ dataView, availableDrillTargets });
                }

                if (this.hasUnmounted) {
                    return;
                }

                if (dataView.forecastConfig && forecastConfig) {
                    try {
                        const forecastResult = await executionResult.readForecastAll(dataView.forecastConfig);
                        const updatedDataView = dataView.withForecast(
                            dataView.forecastConfig,
                            forecastResult,
                        );
                        this.setState((s) => ({ ...s, dataView: updatedDataView }));
                        if (pushData) {
                            pushData({
                                dataView: updatedDataView,
                                propertiesMeta: {
                                    slicedForecast:
                                        forecastConfig.forecastPeriod !==
                                        dataView.forecastConfig?.forecastPeriod,
                                },
                            });
                        }
                    } catch (e) {
                        const updatedDataView = dataView.withForecast(undefined);
                        this.setState((s) => ({ ...s, dataView: updatedDataView }));
                        if (pushData) {
                            pushData({ dataView: updatedDataView });
                        }

                        const err = e as any;
                        throw new ForecastNotReceivedSdkError(
                            err.responseBody?.reason || err.message || "Unknown error",
                            err,
                        );
                    }
                }
            } catch (error) {
                if (this.lastInitRequestFingerprint !== defFingerprint(execution.definition)) {
                    return;
                }

                if (this.hasUnmounted) {
                    return;
                }

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

                this.onError(convertError(error));
            }
        }

        private stripWorkspace = (props: T & ILoadingInjectedProps): T & ILoadingInjectedProps => {
            return omit(props, ["workspace"]) as any;
        };
    }

    const IntlLoadingHOC = injectIntl<"intl", T & ILoadingInjectedProps>(LoadingHOCWrapped);

    return class LoadingHOC extends Component<T> {
        public override render() {
            return (
                <IntlWrapper locale={this.props.locale}>
                    <IntlLoadingHOC {...(this.props as any)} />
                </IntlWrapper>
            );
        }
    };
}
