import * as React from 'react';
import bindAll = require('lodash/bindAll');
import get = require('lodash/get');
import noop = require('lodash/noop');
import merge = require('lodash/merge');

import { Visualization } from '@gooddata/indigo-visualizations';
import {
    Afm,
    DataSourceUtils,
    ExecutorResult,
    VisualizationObject,
    Transformation
} from '@gooddata/data-layer';

import { IntlWrapper } from './IntlWrapper';
import { IEvents, ILoadingState } from '../../../interfaces/Events';
import { IDrillableItem } from '../../../interfaces/DrillableItem';
import { IVisualizationProperties } from '../../../interfaces/VisualizationProperties';
import { ErrorStates } from '../../../constants/errorStates';
import { initChartDataLoading as initDataLoading } from '../../../helpers/load';
import { getConfig, ILegendConfig } from '../../../helpers/config';
import { ISorting } from '../../../helpers/metadata';
import { getCancellable } from '../../../helpers/promise';
import { IntlTranslationsProvider } from './TranslationsProvider';
import { ISimpleDataAdapterProviderInjectedProps } from '../../afm/SimpleDataAdapterProvider';

export type ChartTypes = 'line' | 'bar' | 'column' | 'pie';

export interface IExecutorResult {
    metadata: VisualizationObject.IVisualizationObjectMetadata;
    result: ExecutorResult.ISimpleExecutorResult;
    sorting?: ISorting;
}

export interface IChartConfig {
    colors?: String[];
    legend?: ILegendConfig;
    limits?: {
        series?: Number,
        categories?: Number
    };
}

export interface ICommonChartProps extends IEvents {
    locale?: string;
    afterRender?;
    pushData?;
    config?: IChartConfig;
    height?: number;
    environment?: string;
    drillableItems?: IDrillableItem[];
    transformation?: Transformation.ITransformation;
    visualizationProperties?: IVisualizationProperties;
}

export type IChartProps = ICommonChartProps & ISimpleDataAdapterProviderInjectedProps;

export interface IChartAFMProps extends ICommonChartProps {
    projectId: string;
    afm: Afm.IAfm;
}

export interface IBaseChartProps extends IChartProps {
    type: ChartTypes;
}

export interface IBaseChartState {
    error: string;
    result: ExecutorResult.ISimpleExecutorResult;
    metadata: VisualizationObject.IVisualizationObjectMetadata;
    isLoading: boolean;
}

const defaultErrorHandler = (error) => {
    if (error.status !== ErrorStates.OK) {
        console.error(error);
    }
};

export class BaseChart extends React.Component<IBaseChartProps, IBaseChartState> {
    public static defaultProps: Partial<IBaseChartProps> = {
        metadataSource: null,
        transformation: {},
        onError: defaultErrorHandler,
        onLoadingChanged: noop,
        pushData: noop,
        drillableItems: [],
        config: {},
        visualizationProperties: null
    };

    private dataCancellable;

    constructor(props) {
        super(props);

        this.state = {
            error: ErrorStates.OK,
            result: null,
            metadata: null,
            isLoading: false
        };

        bindAll(this, ['onLoadingChanged', 'onDataTooLarge', 'onError', 'onNegativeValues']);
        this.dataCancellable = null;
    }

    public componentDidMount() {
        const { metadataSource, dataSource, transformation } = this.props;
        this.initDataLoading(dataSource, metadataSource, transformation);
    }

    public componentWillReceiveProps(nextProps) {
        const { metadataSource, dataSource, transformation } = nextProps;
        if (!DataSourceUtils.dataSourcesMatch(this.props.metadataSource, metadataSource)) {
            metadataSource.getVisualizationMetadata().then(({ metadata }) => {
                this.setState({ metadata });
            });
        }

        if (!DataSourceUtils.dataSourcesMatch(this.props.dataSource, dataSource)) {
            this.initDataLoading(dataSource, metadataSource, transformation);
        }
    }

    public componentWillUnmount() {
        if (this.dataCancellable) {
            this.dataCancellable.cancel();
        }
        this.onLoadingChanged = noop;
        this.onError = noop;
        this.initDataLoading = noop;
    }

    public render() {
        const { result } = this.state;

        if (this.canRender()) {
            const { afterRender, height, locale } = this.props;
            const finalConfig = this.getChartConfig();

            return (
                <IntlWrapper locale={locale}>
                    <IntlTranslationsProvider result={result}>
                        <Visualization
                            afm={this.props.dataSource.getAfm()}
                            height={height}
                            config={finalConfig}
                            afterRender={afterRender}
                            onDataTooLarge={this.onDataTooLarge}
                            onNegativeValues={this.onNegativeValues}
                            drillableItems={this.props.drillableItems}
                        />
                    </IntlTranslationsProvider>
                </IntlWrapper>
            );
        }

        return null;
    }

    private getChartConfig() {
        const { type, environment, config } = this.props;
        const { metadata } = this.state;

        const basicConfig = getConfig(metadata, type, environment);

        const legendConfig = merge({}, basicConfig.legend, config.legend);

        return {
            ...basicConfig,
            ...config,
            legend: legendConfig
        };
    }

    private canRender() {
        const { result, isLoading, error } = this.state;
        return result && !isLoading && error === ErrorStates.OK;
    }

    private onLoadingChanged(loadingState: ILoadingState) {
        this.props.onLoadingChanged(loadingState);
        const isLoading = loadingState.isLoading;

        if (isLoading) {
            this.props.onError({ status: ErrorStates.OK }); // reset all errors in parent on loading start
            this.setState({
                isLoading,
                error: ErrorStates.OK // reset local errors
            });
        } else {
            this.setState({
                isLoading
            });
        }
    }

    private onError(errorCode, dataSource = this.props.dataSource) {
        if (DataSourceUtils.dataSourcesMatch(this.props.dataSource, dataSource)) {
            this.props.onError({ status: errorCode });
            this.setState({
                error: errorCode
            });
            this.onLoadingChanged({ isLoading: false });
        }
    }

    private onNegativeValues() {
        this.onError(ErrorStates.NEGATIVE_VALUES);
    }

    private onDataTooLarge() {
        this.onError(ErrorStates.DATA_TOO_LARGE_TO_DISPLAY);
    }

    private initDataLoading(dataSource, metadataSource, transformation) {
        this.onLoadingChanged({ isLoading: true });
        this.setState({ result: null });

        if (this.dataCancellable) {
            this.dataCancellable.cancel();
        }

        this.dataCancellable = getCancellable(initDataLoading(dataSource, metadataSource, transformation));
        this.dataCancellable.promise.then((result) => {
            if (DataSourceUtils.dataSourcesMatch(this.props.dataSource, dataSource)) {
                const executionResult = get<IExecutorResult, ExecutorResult.ISimpleExecutorResult>(result, 'result');
                const metadata = get<IExecutorResult,
                    VisualizationObject.IVisualizationObjectMetadata>(result, 'metadata');
                this.setState({
                    metadata,
                    result: executionResult
                });

                this.props.pushData({ executionResult });
                this.onLoadingChanged({ isLoading: false });
            }
        }, (error) => {
            if (error !== ErrorStates.PROMISE_CANCELLED) {
                this.onError(error, dataSource);
            }
        });
    }
}
