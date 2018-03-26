// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import noop = require('lodash/noop');

import { Visualization } from '../../visualizations/Visualization';
import { IChartConfig } from '../../visualizations/chart/Chart';

import { IntlWrapper } from './IntlWrapper';
import { ChartType } from '../../../constants/visualizationTypes';
import {
    IntlTranslationsProvider,
    ITranslationsComponentProps
} from './TranslationsProvider';
import { IDataSourceProviderInjectedProps } from '../../afm/DataSourceProvider';
import { fixEmptyHeaderItems } from './utils/fixEmptyHeaderItems';
import {
    ICommonVisualizationProps,
    visualizationLoadingHOC,
    ILoadingInjectedProps,
    commonDefaultProps
} from './VisualizationLoadingHOC';
import { ChartPropTypes, Requireable } from '../../../proptypes/Chart';
import { BaseVisualization } from './BaseVisualization';
import { OnLegendReady } from '../../../interfaces/Events';
export { Requireable };

export interface ICommonChartProps extends ICommonVisualizationProps {
    config?: IChartConfig;
    height?: number;
    environment?: string;
}

export type IChartProps = ICommonChartProps & IDataSourceProviderInjectedProps;

export interface IBaseChartProps extends IChartProps {
    type: ChartType;
    visualizationComponent?: React.ComponentClass<any>; // for testing
    onLegendReady?: OnLegendReady;
}

export class StatelessBaseChart extends BaseVisualization<IBaseChartProps & ILoadingInjectedProps, {}> {
    public static defaultProps: Partial<IBaseChartProps & ILoadingInjectedProps> = {
        ...commonDefaultProps,
        onDataTooLarge: noop,
        onLegendReady: noop,
        config: {},
        visualizationProperties: null,
        visualizationComponent: Visualization
    };

    public static propTypes = ChartPropTypes;

    public renderVisualization(): JSX.Element {
        const {
            afterRender,
            height,
            locale,
            config,
            type,
            execution,
            onDataTooLarge
        } = this.props;

        return (
            <IntlWrapper locale={locale}>
                <IntlTranslationsProvider>
                    {(translationProps: ITranslationsComponentProps) => {
                        const fixedExecutionResult = fixEmptyHeaderItems(
                            execution.executionResult,
                            translationProps.emptyHeaderString
                        );

                        return (
                            <this.props.visualizationComponent
                                executionRequest={{
                                    afm: this.props.dataSource.getAfm(),
                                    resultSpec: this.props.resultSpec
                                }}
                                executionResponse={execution.executionResponse.executionResponse}
                                executionResult={fixedExecutionResult.executionResult}
                                height={height}
                                config={{ ...config, type }}
                                afterRender={afterRender}
                                onDataTooLarge={onDataTooLarge}
                                onNegativeValues={this.props.onNegativeValues}
                                drillableItems={this.props.drillableItems}
                                onFiredDrillEvent={this.props.onFiredDrillEvent}
                                onLegendReady={this.props.onLegendReady}
                                numericSymbols={translationProps.numericSymbols}
                            />
                        );
                    }}
                </IntlTranslationsProvider>
            </IntlWrapper>
        );
    }
}

export const BaseChart = visualizationLoadingHOC(StatelessBaseChart);
