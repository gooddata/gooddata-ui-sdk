// (C) 2007-2018 GoodData Corporation
import { AFM, Execution, VisualizationObject } from "@gooddata/typings";
import * as invariant from "invariant";
import * as React from "react";
import noop = require("lodash/noop");

import { convertDrillableItemsToPredicates } from "../../../helpers/headerPredicate";
import { getSanitizedStackingConfigFromAfm } from "../../../helpers/optionalStacking/common";
import { IChartConfig, IChartOptions } from "../../../interfaces/Config";
import { IDrillableItem } from "../../../interfaces/DrillEvents";
import { OnFiredDrillEvent, OnLegendReady } from "../../../interfaces/Events";
import { IHeaderPredicate } from "../../../interfaces/HeaderPredicate";
import { ILegendOptions } from "../typings/legend";
import { getChartOptions, validateData } from "./chartOptionsBuilder";
import { getHighchartsOptions } from "./highChartsCreators";
import HighChartsRenderer, {
    IHighChartsRendererProps,
    renderChart as chartRenderer,
    renderLegend as legendRenderer,
} from "./HighChartsRenderer";
import getLegend from "./legend/legendBuilder";

export function renderHighCharts(props: IHighChartsRendererProps) {
    return <HighChartsRenderer {...props} />;
}

export interface IExecutionRequest {
    afm: AFM.IAfm;
    resultSpec: AFM.IResultSpec;
}

export interface IChartTransformationProps {
    config: IChartConfig;
    drillableItems: Array<IDrillableItem | IHeaderPredicate>;
    height: number;
    width: number;
    locale: string;

    executionRequest: IExecutionRequest;
    executionResponse: Execution.IExecutionResponse;
    executionResult: Execution.IExecutionResult;
    mdObject?: VisualizationObject.IVisualizationObjectContent;

    onFiredDrillEvent: OnFiredDrillEvent;
    onLegendReady: OnLegendReady;

    afterRender(): void;
    pushData?(data: any): void;
    renderer(arg: IHighChartsRendererProps): JSX.Element;
    onDataTooLarge(chartOptions: any): void;
    onNegativeValues(chartOptions: any): void;
}

export interface IChartTransformationState {
    dataTooLarge: boolean;
    hasNegativeValue: boolean;
}

export default class ChartTransformation extends React.Component<
    IChartTransformationProps,
    IChartTransformationState
> {
    public static defaultProps = {
        drillableItems: [] as IDrillableItem[],
        renderer: renderHighCharts,
        afterRender: noop,
        onNegativeValues: null as any,
        onFiredDrillEvent: () => true,
        pushData: noop,
        onLegendReady: noop,
        height: undefined as number,
        width: undefined as number,
    };

    private chartOptions: IChartOptions;
    private legendOptions: ILegendOptions;

    public componentWillMount() {
        this.assignChartOptions(this.props);
    }

    public componentWillReceiveProps(nextProps: IChartTransformationProps) {
        this.assignChartOptions(nextProps);
    }

    public getRendererProps() {
        const { chartOptions, legendOptions } = this;
        const {
            executionRequest: { afm },
            height,
            width,
            afterRender,
            onFiredDrillEvent,
            onLegendReady,
            locale,
        } = this.props;

        const chartConfig = this.getChartConfig(this.props);

        const drillConfig = { afm, onFiredDrillEvent };
        const hcOptions = getHighchartsOptions(chartOptions, drillConfig, chartConfig);

        return {
            chartOptions,
            hcOptions,
            height,
            width,
            afterRender,
            onLegendReady,
            locale,
            legend: legendOptions,
        };
    }

    public assignChartOptions(props: IChartTransformationProps) {
        const {
            drillableItems,
            executionRequest: { afm, resultSpec },
            executionResponse,
            executionResult: { data, headerItems },
            onDataTooLarge,
            onNegativeValues,
            pushData,
        } = props;

        const chartConfig = this.getChartConfig(props);

        let multiDimensionalData = data;
        if (data[0].constructor !== Array) {
            multiDimensionalData = [data] as Execution.DataValue[][];
        }

        const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);

        this.chartOptions = getChartOptions(
            afm,
            resultSpec,
            executionResponse,
            multiDimensionalData as Execution.DataValue[][],
            headerItems,
            chartConfig,
            drillablePredicates,
        );
        const validationResult = validateData(chartConfig.limits, this.chartOptions);

        if (validationResult.dataTooLarge) {
            // always force onDataTooLarge error handling
            invariant(onDataTooLarge, "Visualization's onDataTooLarge callback is missing.");
            onDataTooLarge(this.chartOptions);
        } else if (validationResult.hasNegativeValue) {
            // ignore hasNegativeValue if validation already fails on dataTooLarge
            // force onNegativeValues error handling only for pie chart.
            // hasNegativeValue can be true only for pie chart.
            invariant(
                onNegativeValues,
                '"onNegativeValues" callback required for pie chart transformation is missing.',
            );
            onNegativeValues(this.chartOptions);
        }

        this.legendOptions = getLegend(chartConfig.legend, this.chartOptions);

        pushData({
            propertiesMeta: {
                legend_enabled: this.legendOptions.toggleEnabled,
            },
            colors: {
                colorAssignments: this.chartOptions.colorAssignments,
                colorPalette: this.chartOptions.colorPalette,
            },
        });

        this.setState(validationResult);

        return this.chartOptions;
    }

    public render(): JSX.Element {
        if (this.state.dataTooLarge || this.state.hasNegativeValue) {
            return null;
        }
        return this.props.renderer({ ...this.getRendererProps(), chartRenderer, legendRenderer });
    }

    private getChartConfig(props: IChartTransformationProps): IChartConfig {
        const {
            executionRequest: { afm },
            config,
        } = props;

        return getSanitizedStackingConfigFromAfm(afm, config);
    }
}
