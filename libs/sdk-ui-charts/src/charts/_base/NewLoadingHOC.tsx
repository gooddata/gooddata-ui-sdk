// (C) 2019 GoodData Corporation

import {
    IDataView,
    IExecutionResult,
    IExportResult,
    IMeasureDescriptor,
    IPreparedExecution,
    isNoDataError,
} from "@gooddata/sdk-backend-spi";
import * as React from "react";
import { injectIntl, IntlShape } from "react-intl";
import {
    DataViewFacade,
    ILoadingState,
    IExportFunction,
    IExtendedExportConfig,
    IDrillableItemPushData,
    convertError,
    ErrorCodes,
    GoodDataSdkError,
    IntlWrapper,
    createExportFunction,
} from "@gooddata/sdk-ui";
import { ICoreChartProps } from "../../interfaces";
import noop = require("lodash/noop");
import omit = require("lodash/omit");

interface IDataViewLoadState {
    isLoading: boolean;
    error?: string;
    executionResult?: IExecutionResult;
    dataView?: IDataView;
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

    // TODO: take this out of here
    intl: IntlShape;

    /**
     * Callback to trigger when export is ready
     */
    onExportReady(exportFunction: IExportFunction): void;

    /**
     * Callback to trigger if the chart cannot visualize the data because it is too large.
     */
    onDataTooLarge(): void;

    /**
     * Callback to trigger if the chart cannot visualize the data because it contains negative values.
     */
    onNegativeValues(): void;
}

export function withEntireDataView<T extends ICoreChartProps>(
    InnerComponent: React.ComponentClass<T & ILoadingInjectedProps>,
): React.ComponentClass<T> {
    class LoadingHOCWrapped extends React.Component<T & ILoadingInjectedProps, IDataViewLoadState> {
        public static defaultProps: Partial<T & ILoadingInjectedProps> = InnerComponent.defaultProps;

        private hasUnmounted: boolean = false;

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
        }

        public componentDidMount() {
            this.initDataLoading(this.props.execution);
        }

        public render() {
            const { isLoading, error, dataView } = this.state;
            const { intl } = this.props;

            // lower-level components do not need workspace
            const props = this.stripWorkspace(this.props);

            return (
                <InnerComponent
                    {...props}
                    dataView={dataView}
                    onDataTooLarge={this.onDataTooLarge}
                    onNegativeValues={this.onNegativeValues}
                    error={error}
                    isLoading={isLoading}
                    intl={intl}
                />
            );
        }

        public UNSAFE_componentWillReceiveProps(nextProps: Readonly<T & ILoadingInjectedProps>) {
            if (!this.props.execution.equals(nextProps.execution)) {
                this.initDataLoading(nextProps.execution);
            }
        }

        public componentWillUnmount() {
            this.hasUnmounted = true;
            this.onLoadingChanged = noop;
            this.onError = noop;
        }

        private onLoadingChanged(loadingState: ILoadingState) {
            const { onLoadingChanged } = this.props;

            onLoadingChanged(loadingState);

            const { isLoading } = loadingState;

            const state: IDataViewLoadState = { isLoading };

            if (isLoading) {
                state.error = null;
            }

            this.setState(state);
        }

        private onError(error: GoodDataSdkError, execution = this.props.execution) {
            const { onExportReady } = this.props;
            if (this.props.execution.equals(execution)) {
                this.setState({ error: error.getMessage(), dataView: null });
                this.onLoadingChanged({ isLoading: false });
                if (onExportReady) {
                    onExportReady(this.createExportErrorFunction(error));
                }
                this.props.onError(error);
            }
        }

        private createExportErrorFunction(error: GoodDataSdkError): IExportFunction {
            return (_exportConfig: IExtendedExportConfig): Promise<IExportResult> => {
                return Promise.reject(error);
            };
        }

        private onDataTooLarge() {
            this.onError(new GoodDataSdkError(ErrorCodes.DATA_TOO_LARGE_TO_DISPLAY));
        }

        private onNegativeValues() {
            this.onError(new GoodDataSdkError(ErrorCodes.NEGATIVE_VALUES));
        }

        private getSupportedDrillableItems(dv: DataViewFacade): IDrillableItemPushData[] {
            return dv
                .meta()
                .measureDescriptors()
                .map(
                    (measure: IMeasureDescriptor): IDrillableItemPushData => ({
                        type: "measure",
                        localIdentifier: measure.measureHeaderItem.localIdentifier,
                        title: measure.measureHeaderItem.name,
                    }),
                );
        }

        private async initDataLoading(execution: IPreparedExecution) {
            const { onExportReady, pushData, exportTitle } = this.props;
            this.onLoadingChanged({ isLoading: true });
            this.setState({ dataView: null });

            try {
                const executionResult = await execution.execute();

                if (this.hasUnmounted) {
                    return;
                }

                const dataView = await executionResult.readAll();

                if (this.hasUnmounted) {
                    return;
                }

                this.setState({ dataView, executionResult });
                this.onLoadingChanged({ isLoading: false });

                if (onExportReady) {
                    onExportReady(createExportFunction(dataView.result, exportTitle));
                }

                if (pushData) {
                    const supportedDrillableItems = this.getSupportedDrillableItems(
                        DataViewFacade.for(dataView),
                    );

                    pushData({ dataView, supportedDrillableItems });
                }
            } catch (error) {
                if (this.hasUnmounted) {
                    return;
                }

                /*
                 * There can be situations, where there is no data to visualize but the result / dataView contains
                 * metadata essential for setup of drilling. Look for that and if available push up.
                 */
                if (isNoDataError(error) && error.dataView && pushData) {
                    const supportedDrillableItems = this.getSupportedDrillableItems(
                        DataViewFacade.for(error.dataView),
                    );

                    pushData({ supportedDrillableItems });
                }

                this.onError(convertError(error));
            }
        }

        private stripWorkspace = (props: T & ILoadingInjectedProps): T & ILoadingInjectedProps => {
            return omit(props, ["workspace"]) as any;
        };
    }

    const IntlLoadingHOC = injectIntl<"intl", T & ILoadingInjectedProps>(LoadingHOCWrapped);

    return class LoadingHOC extends React.Component<T & ILoadingInjectedProps, null> {
        public render() {
            return (
                <IntlWrapper locale={this.props.locale}>
                    <IntlLoadingHOC {...this.props} />
                </IntlWrapper>
            );
        }
    };
}
