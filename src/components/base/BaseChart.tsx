import * as React from 'react';
import { noop, bindAll, get } from 'lodash';
import { injectIntl, intlShape } from 'react-intl';

import { Visualization } from '@gooddata/indigo-visualizations';
import {
    DataSource,
    DataSourceUtils,
    MetadataSource,
    VisualizationObject,
    ExecutorResult
} from '@gooddata/data-layer';
import { IntlWrapper } from './IntlWrapper';
import { IEvents } from '../../interfaces/Events';
import { IDrillableItem } from '../../interfaces/DrillableItem';
import { ErrorStates } from '../../constants/errorStates';
import { initChartDataLoading as initDataLoading } from '../../helpers/load';
import { getConfig, ILegendConfig } from '../../helpers/config';
import { getCancellable } from '../../helpers/promise';

export type ChartTypes = 'line' | 'bar' | 'column' | 'pie';

export interface IChartConfig {
    colors?: String[];
    legend?: ILegendConfig;
    limits?: {
        series?: Number,
        categories?: Number
    };
}

export interface IChartProps extends IEvents {
    dataSource: DataSource.IDataSource;
    metadataSource: MetadataSource.IMetadataSource;
    type: string;
    locale?: string;
    afterRender?;
    pushData?;
    config?: IChartConfig;
    height?: number;
    environment?: string;
    drillableItems?: IDrillableItem[];
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

export interface INumericSymbolsProviderProps {
    intl: intlShape;
}

export class NumericSymbolsProvider extends React.Component<INumericSymbolsProviderProps, null> {
    public render() {
        return (
            <span>
                {React.cloneElement(this.props.children as any, {
                    numericSymbols: this.getNumericSymbols()
                })}
            </span>
        );
    }

    private formatMessage(id: string, ...args) {
        return this.props.intl.formatMessage({ id }, ...args);
    }

    private getNumericSymbols() {
        return [
            `${this.formatMessage('visualization.numericValues.k')}`,
            `${this.formatMessage('visualization.numericValues.m')}`,
            `${this.formatMessage('visualization.numericValues.g')}`,
            `${this.formatMessage('visualization.numericValues.t')}`,
            `${this.formatMessage('visualization.numericValues.p')}`,
            `${this.formatMessage('visualization.numericValues.e')}`
        ];
    }
}

const IntlNumericSymbolsProvider = injectIntl(NumericSymbolsProvider);

export class BaseChart extends React.Component<IChartProps, IBaseChartState> {
    public static defaultProps: Partial<IChartProps> = {
        onError: defaultErrorHandler,
        onLoadingChanged: noop,
        pushData: noop,
        drillableItems: [],
        config: {}
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
        const { metadataSource, dataSource } = this.props;
        this.initDataLoading(metadataSource, dataSource);
    }

    public componentWillReceiveProps(nextProps) {
        if (!DataSourceUtils.dataSourcesMatch(this.props.dataSource, nextProps.dataSource)) {
            if (this.dataCancellable) {
                this.dataCancellable.cancel();
            }
            this.initDataLoading(nextProps.metadataSource, nextProps.dataSource);
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
        const { result, metadata } = this.state;

        if (this.canRender()) {
            const { type, afterRender, height, locale, environment, config } = this.props;
            const basicConfig = getConfig(metadata, type, environment);
            const legendConfig = {
                ...basicConfig.legend,
                ...config.legend
            };
            const finalConfig = {
                ...basicConfig,
                ...config,
                legend: legendConfig
            };

            return (
                <IntlWrapper locale={locale}>
                    <IntlNumericSymbolsProvider>
                        <Visualization
                            afm={this.props.dataSource.getAfm()}
                            height={height}
                            config={finalConfig}
                            data={result}
                            afterRender={afterRender}
                            onDataTooLarge={this.onDataTooLarge}
                            onNegativeValues={this.onNegativeValues}
                            drillableItems={this.props.drillableItems}
                        />
                    </IntlNumericSymbolsProvider>
                </IntlWrapper>
            );
        }

        return null;
    }

    private canRender() {
        const { result, metadata, isLoading, error } = this.state;
        return result && metadata && !isLoading && error === ErrorStates.OK;
    }

    private onLoadingChanged(isLoading) {
        this.props.onLoadingChanged(isLoading);
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
            this.onLoadingChanged(false);
        }
    }

    private onNegativeValues() {
        this.onError(ErrorStates.NEGATIVE_VALUES);
    }

    private onDataTooLarge() {
        this.onError(ErrorStates.DATA_TOO_LARGE_DISPLAY);
    }

    private initDataLoading(metadataSource, dataSource) {
        this.onLoadingChanged(true);
        this.setState({ result: null });
        if (this.dataCancellable) {
            this.dataCancellable.cancel();
        }

        this.dataCancellable = getCancellable(initDataLoading(metadataSource, dataSource));
        this.dataCancellable.promise.then((result) => {
            if (DataSourceUtils.dataSourcesMatch(this.props.dataSource, dataSource)) {
                const executionResult = get(result, 'result') as ExecutorResult.ISimpleExecutorResult;
                const warnings =  get(result, 'result.warnings');
                const metadata = get(result, 'metadata') as VisualizationObject.IVisualizationObjectMetadata;
                this.setState({
                    metadata,
                    result: executionResult
                });
                this.props.pushData({ warnings });
                this.onLoadingChanged(false);
            }
        }, (error) => {
            if (error !== ErrorStates.PROMISE_CANCELLED) {
                this.onError(error, dataSource);
            }
        });
    }
}
