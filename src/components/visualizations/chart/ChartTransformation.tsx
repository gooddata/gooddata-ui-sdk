// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import * as invariant from 'invariant';
import noop = require('lodash/noop');
import {
    AFM,
    Execution,
    VisualizationObject
} from '@gooddata/typings';

import { getChartOptions, validateData } from './chartOptionsBuilder';
import { getHighchartsOptions } from './highChartsCreators';
import getLegend from './legend/legendBuilder';
import HighChartsRenderer, {
    IHighChartsRendererProps,
    renderLegend as legendRenderer,
    renderChart as chartRenderer
} from './HighChartsRenderer';
import { IChartConfig } from './Chart';
import { OnLegendReady } from '../../../interfaces/Events';
import { IDrillableItem } from '../../../interfaces/DrillEvents';

export function renderHighCharts(props: IHighChartsRendererProps) {
    return <HighChartsRenderer {...props} />;
}

export interface IExecutionRequest {
    afm: AFM.IAfm;
    resultSpec: AFM.IResultSpec;
}

export interface IChartTransformationProps {
    config: IChartConfig;
    drillableItems: IDrillableItem[];
    height: number;
    width: number;

    executionRequest: IExecutionRequest;
    executionResponse: Execution.IExecutionResponse;
    executionResult: Execution.IExecutionResult;
    mdObject?: VisualizationObject.IVisualizationObjectContent;

    onLegendReady: OnLegendReady;
    afterRender(): void;
    renderer(arg: IHighChartsRendererProps): JSX.Element;
    onDataTooLarge(chartOptions: any): void;
    onNegativeValues(chartOptions: any): void;
    onFiredDrillEvent(): void;
}

export interface IChartTransformationState {
    dataTooLarge: boolean;
    hasNegativeValue: boolean;
}

export default class ChartTransformation extends React.Component<IChartTransformationProps, IChartTransformationState> {
    public static defaultProps = {
        drillableItems: [] as IDrillableItem[],
        renderer: renderHighCharts,
        afterRender: noop,
        onNegativeValues: null as any,
        onFiredDrillEvent: noop,
        onLegendReady: noop,
        height: undefined as any,
        width: undefined as any
    };

    private chartOptions: any;

    public componentWillMount() {
        this.assignChartOptions(this.props);
    }

    public componentWillReceiveProps(nextProps: IChartTransformationProps) {
        this.assignChartOptions(nextProps);
    }

    public getRendererProps() {
        const { chartOptions } = this;
        const {
            executionRequest: { afm },
            height,
            width,
            afterRender,
            config,
            onFiredDrillEvent,
            onLegendReady
        } = this.props;
        const drillConfig = { afm, onFiredDrillEvent };
        const hcOptions = getHighchartsOptions(chartOptions, drillConfig);

        return {
            chartOptions,
            hcOptions,
            height,
            width,
            afterRender,
            onLegendReady,
            legend: getLegend(config.legend, chartOptions)
        };
    }

    public assignChartOptions(props: IChartTransformationProps) {
        const {
            drillableItems,
            executionRequest: { afm, resultSpec },
            executionResponse: { dimensions },
            executionResult: { data, headerItems },
            config,
            onDataTooLarge,
            onNegativeValues
        } = props;

        let multiDimensionalData = data;
        if (data[0].constructor !== Array) {
            multiDimensionalData = [data] as Execution.DataValue[][];
        }

        this.chartOptions = getChartOptions(
            afm,
            resultSpec,
            dimensions,
            multiDimensionalData as Execution.DataValue[][],
            headerItems,
            config,
            drillableItems
        );
        const validationResult = validateData(config.limits, this.chartOptions);

        if (validationResult.dataTooLarge) {
            // always force onDataTooLarge error handling
            invariant(onDataTooLarge, 'Visualization\'s onDataTooLarge callback is missing.');
            onDataTooLarge(this.chartOptions);
        } else if (validationResult.hasNegativeValue) {
            // ignore hasNegativeValue if validation already fails on dataTooLarge
            // force onNegativeValues error handling only for pie chart.
            // hasNegativeValue can be true only for pie chart.
            invariant(onNegativeValues,
                '"onNegativeValues" callback required for pie chart transformation is missing.');
            onNegativeValues(this.chartOptions);
        }
        this.setState(validationResult);

        return this.chartOptions;
    }

    public render(): JSX.Element {
        if (this.state.dataTooLarge || this.state.hasNegativeValue) {
            return null;
        }
        return this.props.renderer({ ...this.getRendererProps(), chartRenderer, legendRenderer });
    }
}
