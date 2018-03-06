import * as React from 'react';
import noop = require('lodash/noop');

import { Visualization } from '@gooddata/indigo-visualizations';

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
    commonDefaultprops
} from './VisualizationLoadingHOC';
import { ChartPropTypes, Requireable } from '../../../proptypes/Chart';

export { Requireable };

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

export interface ICommonChartProps extends ICommonVisualizationProps {
    config?: IChartConfig;
    height?: number;
    environment?: string;
}

export type IChartProps = ICommonChartProps & IDataSourceProviderInjectedProps;

export interface IBaseChartProps extends IChartProps {
    type: ChartType;
    visualizationComponent?: React.ComponentClass<any>; // for testing
}

export class StatelessBaseChart extends React.Component<IBaseChartProps & ILoadingInjectedProps> {
    public static defaultProps: Partial<IBaseChartProps & ILoadingInjectedProps> = {
        ...commonDefaultprops,
        onDataTooLarge: noop,
        config: {},
        visualizationProperties: null,
        visualizationComponent: Visualization
    };

    public static propTypes = ChartPropTypes;

    public render(): JSX.Element {
        const {
            afterRender,
            height,
            locale,
            config,
            type,
            executionResponse,
            executionResult,
            onDataTooLarge
        } = this.props;

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
                                onDataTooLarge={onDataTooLarge}
                                onNegativeValues={this.props.onNegativeValues}
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
}

export const BaseChart = visualizationLoadingHOC(StatelessBaseChart);
