// (C) 2019 GoodData Corporation

import {
    IDataView,
    IDimensionDescriptor,
    IExecutionResult,
    IMeasureDescriptor,
    IPreparedExecution,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
    isNoDataError,
    isUnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import React from "react";
import { injectIntl, IntlShape } from "react-intl";
import noop from "lodash/noop";
import omit from "lodash/omit";
import flatMap from "lodash/fp/flatMap";
import filter from "lodash/fp/filter";
import flow from "lodash/fp/flow";
import uniqBy from "lodash/fp/uniqBy";
import {
    IAvailableDrillTargetMeasure,
    IAvailableDrillTargets,
    IExportFunction,
    ILoadingState,
} from "../../vis/Events";
import {
    DataTooLargeToDisplaySdkError,
    GoodDataSdkError,
    NegativeValuesSdkError,
} from "../../errors/GoodDataSdkError";
import { createExportErrorFunction, createExportFunction } from "../../vis/export";
import { DataViewFacade } from "../../results/facade";
import { convertError } from "../../errors/errorHandling";
import { IntlWrapper } from "../../localization/IntlWrapper";
import { IDataVisualizationProps } from "../../vis/VisualizationProps";
import {
    IAttributeDescriptor,
    IMeasureGroupDescriptor,
} from "../../../../../sdk-backend-spi/dist/workspace/execution/results";

interface IDataViewLoadState {
    isLoading: boolean;
    error?: string | null;
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

/**
 * A HOC to wrap data visualization components with loading / error handling.
 *
 * Note: this is a legacy HOC with a long history. In v7 we had VisualizationLoadingHOC - that one was used for
 * all components and was linked to AFM and the paging and everything. We took this and gutted it out, changed to
 * work with executions and to only support reading all the data.
 *
 * @param InnerComponent
 * @internal
 */
export function withEntireDataView<T extends IDataVisualizationProps>(
    InnerComponent: React.ComponentClass<T & ILoadingInjectedProps>,
): React.ComponentClass<T> {
    class LoadingHOCWrapped extends React.Component<T & ILoadingInjectedProps, IDataViewLoadState> {
        public static defaultProps: Partial<T & ILoadingInjectedProps> = InnerComponent.defaultProps || {};

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
                    {...(props as any)}
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
            //  we need strict equality here in case only the buckets changed (not measures or attributes)
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

            onLoadingChanged?.(loadingState);

            const { isLoading } = loadingState;

            const state: IDataViewLoadState = { isLoading };

            if (isLoading) {
                state.error = null;
            }

            this.setState(state);
        }

        private onError(error: GoodDataSdkError) {
            const { onExportReady } = this.props;

            this.setState({ error: error.getMessage(), dataView: null });
            this.onLoadingChanged({ isLoading: false });

            if (onExportReady) {
                onExportReady(createExportErrorFunction(error));
            }

            this.props.onError?.(error);
        }

        private onDataTooLarge() {
            this.onError(new DataTooLargeToDisplaySdkError());
        }

        private onNegativeValues() {
            this.onError(new NegativeValuesSdkError());
        }

        private getAvailableDrillTargets(dv: DataViewFacade): IAvailableDrillTargets {
            const attributes = uniqBy(
                (attributeDescriptor) => attributeDescriptor.attributeHeader.formOf.identifier,
                dv.meta().attributeDescriptors(),
            );
            return {
                measures: dv
                    .meta()
                    .measureDescriptors()
                    .map(
                        (measure: IMeasureDescriptor): IAvailableDrillTargetMeasure => ({
                            measure,
                            attributes,
                        }),
                    ),
                attributes: dv
                    .meta()
                    .attributeDescriptors()
                    .map((attribute) => ({ attribute })),
            };
        }

        private getAvailableDrillTargetsFromExecutionResult(
            executionResult: IExecutionResult,
        ): IAvailableDrillTargets {
            const getDimensionHeaders = (dimensionDescriptor: IDimensionDescriptor) =>
                dimensionDescriptor.headers;
            const attributeDescriptors: IAttributeDescriptor[] = flow(
                flatMap(getDimensionHeaders),
                filter(isAttributeDescriptor),
                uniqBy((attributeDescriptor) => attributeDescriptor.attributeHeader.formOf.identifier),
            )(executionResult.dimensions);

            const measureDescriptors: IMeasureDescriptor[] = flow(
                flatMap((dimensionDescriptor: IDimensionDescriptor) => dimensionDescriptor.headers),
                filter(isMeasureGroupDescriptor),
                flatMap(
                    (measureGroupDescriptor: IMeasureGroupDescriptor) =>
                        measureGroupDescriptor.measureGroupHeader.items,
                ),
            )(executionResult.dimensions);

            return {
                measures: measureDescriptors.map(
                    (measure: IMeasureDescriptor): IAvailableDrillTargetMeasure => ({
                        measure,
                        attributes: attributeDescriptors,
                    }),
                ),
                attributes: attributeDescriptors.map((attribute) => ({ attribute })),
            };
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

                const dataView = await executionResult.readAll().catch((err) => {
                    /**
                     * When execution result is received successfully,
                     * but data load fails with unexpected http response,
                     * we still want to push availableDrillTargets
                     */
                    if (isUnexpectedResponseError(err) && pushData) {
                        const availableDrillTargets = this.getAvailableDrillTargetsFromExecutionResult(
                            executionResult,
                        );

                        pushData({ availableDrillTargets });
                    }
                    throw err;
                });

                if (this.hasUnmounted) {
                    return;
                }

                this.setState({ dataView, error: null, executionResult });
                this.onLoadingChanged({ isLoading: false });

                if (onExportReady) {
                    onExportReady(createExportFunction(dataView.result, exportTitle));
                }

                if (pushData) {
                    const availableDrillTargets = this.getAvailableDrillTargets(DataViewFacade.for(dataView));

                    pushData({ dataView, availableDrillTargets });
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
                    const availableDrillTargets = this.getAvailableDrillTargets(
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

    return class LoadingHOC extends React.Component<T> {
        public render() {
            return (
                <IntlWrapper locale={this.props.locale}>
                    <IntlLoadingHOC {...(this.props as any)} />
                </IntlWrapper>
            );
        }
    };
}
