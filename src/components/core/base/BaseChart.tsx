// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import noop = require('lodash/noop');
import isEqual = require('lodash/isEqual');
import { AFM, Execution } from '@gooddata/typings';
import { Visualization } from '@gooddata/indigo-visualizations';

import { ILoadingStateProps } from '../../../execution/Execute';

import {
    DataSourceUtils,
    createSubject
} from '@gooddata/data-layer';

import { IntlWrapper } from './IntlWrapper';
import { IEvents, ILoadingState } from '../../../interfaces/Events';
import { IDrillableItem } from '../../../interfaces/DrillEvents';
import { IDataSource } from '../../../interfaces/DataSource';
import { IVisualizationProperties } from '../../../interfaces/VisualizationProperties';
import { ChartType } from '../../../constants/visualizationTypes';
import { ErrorStates } from '../../../constants/errorStates';
import { IntlTranslationsProvider, ITranslationsComponentProps } from './TranslationsProvider';
import { IDataSourceProviderInjectedProps } from '../../afm/DataSourceProvider';
import { getVisualizationOptions } from '../../../helpers/options';
import { convertErrors, checkEmptyResult } from '../../../helpers/errorHandlers';
import { fixEmptyHeaderItems } from './utils/fixEmptyHeaderItems';
import { ISubject } from '../../../helpers/async';

export interface ILegendConfig {
    enabled?: boolean;
    position?: 'top' | 'left' | 'right' | 'bottom';
    responsive?: boolean;
}

export interface IChartConfig {
    colors?: string[];
    legend?: ILegendConfig;
    limits?: {
        series?: number,
        categories?: number
    };
}

export interface ICommonChartProps extends IEvents {
    locale?: string;
    afterRender?: Function;
    pushData?: Function;
    config?: IChartConfig;
    height?: number;
    environment?: string;
    drillableItems?: IDrillableItem[];
    resultSpec?: AFM.IResultSpec;
    visualizationProperties?: IVisualizationProperties;
}

export type IChartProps = ICommonChartProps & IDataSourceProviderInjectedProps;

export interface IChartAFMProps extends ICommonChartProps {
    projectId: string;
    afm: AFM.IAfm;
}

export interface IBaseChartProps extends IChartProps {
    type: ChartType;
    ErrorComponent?: React.ComponentType<ILoadingStateProps>;
    LoadingComponent?: React.ComponentType<ILoadingStateProps>;
    visualizationComponent?: React.ComponentClass<any>; // for testing
}

export interface IBaseChartState {
    error: {
        status: string
    };
    result: Execution.IExecutionResponses;
    isLoading: boolean;
}

export type IBaseChartDataPromise = Promise<Execution.IExecutionResponses>;

const defaultErrorHandler = (error: any) => {
    if (error && error.status !== ErrorStates.OK) {
        console.error(error); // tslint:disable-line:no-console
    }
};

export class BaseChart extends React.Component<IBaseChartProps, IBaseChartState> {
    public static defaultProps: Partial<IBaseChartProps> = {
        resultSpec: {},
        onError: defaultErrorHandler,
        ErrorComponent: null,
        LoadingComponent: null,
        onLoadingChanged: noop,
        pushData: noop,
        drillableItems: [],
        onFiredDrillEvent: noop,
        config: {},
        visualizationProperties: null,
        visualizationComponent: Visualization
    };

    private subject: ISubject<IBaseChartDataPromise>;

    constructor(props: IBaseChartProps) {
        super(props);

        this.state = {
            error: {
                status: ErrorStates.OK
            },
            result: null,
            isLoading: false
        };

        this.onLoadingChanged = this.onLoadingChanged.bind(this);
        this.onDataTooLarge = this.onDataTooLarge.bind(this);
        this.onError = this.onError.bind(this);
        this.onNegativeValues = this.onNegativeValues.bind(this);

        this.subject = createSubject<Execution.IExecutionResponses>((result) => {
            this.setState({
                result
            });
            const options = getVisualizationOptions(this.props.dataSource.getAfm());
            this.props.pushData({
                result,
                options
            });
            this.onLoadingChanged({ isLoading: false });
        }, error => this.onError(error));
    }

    public componentDidMount() {
        const { dataSource, resultSpec } = this.props;
        this.initDataLoading(dataSource, resultSpec);
    }

    public isDataReloadRequired(nextProps: IBaseChartProps) {
        return !DataSourceUtils.dataSourcesMatch(this.props.dataSource, nextProps.dataSource)
            || !isEqual(this.props.resultSpec, nextProps.resultSpec);
    }

    public componentWillReceiveProps(nextProps: IBaseChartProps) {
        if (this.isDataReloadRequired(nextProps)) {
            const { dataSource, resultSpec } = nextProps;
            this.initDataLoading(dataSource, resultSpec);
        }
    }

    public componentWillUnmount() {
        this.subject.unsubscribe();
        this.onLoadingChanged = noop;
        this.onError = noop;
        this.initDataLoading = noop;
    }

    public render() {
        const { result, error, isLoading } = this.state;
        const { ErrorComponent, LoadingComponent } = this.props;

        if (error && error.status !== ErrorStates.OK) {
            return ErrorComponent ? <ErrorComponent error={error} props={this.props} /> : null;
        }
        if (isLoading || !result) {
            return LoadingComponent ? <LoadingComponent props={this.props} /> : null;
        }

        const {
            afterRender,
            height,
            locale,
            config,
            type
        } = this.props;
        const {
            executionResponse,
            executionResult
        } = (result as Execution.IExecutionResponses);

        return (
            <IntlWrapper locale={locale}>
                <IntlTranslationsProvider>
                    {(translationProps: ITranslationsComponentProps) => {
                        const fixedExecutionResult = fixEmptyHeaderItems(
                            executionResult,
                            translationProps.emptyHeaderString
                        );

                        return (
                            <this.props.visualizationComponent
                                executionRequest={{
                                    afm: this.props.dataSource.getAfm(),
                                    resultSpec: this.props.resultSpec
                                }}
                                executionResponse={executionResponse.executionResponse}
                                executionResult={fixedExecutionResult.executionResult}
                                height={height}
                                config={{ ...config, type }}
                                afterRender={afterRender}
                                onDataTooLarge={this.onDataTooLarge}
                                onNegativeValues={this.onNegativeValues}
                                drillableItems={this.props.drillableItems}
                                onFiredDrillEvent={this.props.onFiredDrillEvent}
                                numericSymbols={translationProps.numericSymbols}
                            />
                        );
                    }}
                </IntlTranslationsProvider>
            </IntlWrapper>
        );
    }

    private onLoadingChanged(loadingState: ILoadingState) {
        this.props.onLoadingChanged(loadingState);
        const isLoading = loadingState.isLoading;

        if (isLoading) {
            this.props.onError({ status: ErrorStates.OK }); // reset all errors in parent on loading start
            this.setState({
                isLoading,
                error: {
                    status: ErrorStates.OK // reset local errors
                }
            });
        } else {
            this.setState({
                isLoading
            });
        }
    }
    private onError(errorCode: string) {
        const options = getVisualizationOptions(this.props.dataSource.getAfm());
        this.props.onError({
            status: errorCode,
            options
        });
        this.setState({
            error: {
                status: errorCode
            }
        });
        this.onLoadingChanged({ isLoading: false });
    }

    private onNegativeValues() {
        this.onError(ErrorStates.NEGATIVE_VALUES);
    }

    private onDataTooLarge() {
        this.onError(ErrorStates.DATA_TOO_LARGE_TO_DISPLAY);
    }

    private initDataLoading(
        dataSource: IDataSource,
        resultSpec: AFM.IResultSpec
    ) {
        this.onLoadingChanged({ isLoading: true });
        this.setState({ result: null });

        const promise = dataSource.getData(resultSpec)
            .then(checkEmptyResult)
            .catch(convertErrors);

        this.subject.next(promise);
    }
}
