// (C) 2007-2018 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import * as invariant from "invariant";
import * as React from "react";

import {
    convertDrillableItemsToPredicates,
    IDrillableItem,
    OnFiredDrillEvent,
    IHeaderPredicate,
} from "@gooddata/sdk-ui";
import { OnLegendReady } from "../../charts/chartProps";
import { IChartConfig, IChartOptions } from "../Config";
import { ILegendOptions } from "../typings/legend";
import { getSanitizedStackingConfig } from "../utils/optionalStacking/common";
import { getChartOptions, validateData } from "./chartOptionsBuilder";
import { getHighchartsOptions } from "./highChartsCreators";
import HighChartsRenderer, {
    IHighChartsRendererProps,
    renderChart as chartRenderer,
    renderLegend as legendRenderer,
} from "./HighChartsRenderer";
import getLegend from "./legend/legendBuilder";
import noop = require("lodash/noop");

export function renderHighCharts(props: IHighChartsRendererProps) {
    return <HighChartsRenderer {...props} />;
}

export interface IChartTransformationProps {
    config: IChartConfig;
    drillableItems: Array<IDrillableItem | IHeaderPredicate>;
    height: number;
    width: number;
    locale: string;

    dataView: IDataView;

    onDrill: OnFiredDrillEvent;
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
        onDrill: () => true,
        pushData: noop,
        onLegendReady: noop,
        height: undefined as number,
        width: undefined as number,
    };

    private chartOptions: IChartOptions;
    private legendOptions: ILegendOptions;

    public UNSAFE_componentWillMount() {
        this.assignChartOptions(this.props);
    }

    public UNSAFE_componentWillReceiveProps(nextProps: IChartTransformationProps) {
        this.assignChartOptions(nextProps);
    }

    public getRendererProps() {
        const { chartOptions, legendOptions } = this;
        const { dataView, height, width, afterRender, onDrill, onLegendReady, locale } = this.props;

        const chartConfig = this.getChartConfig(this.props);

        const drillConfig = { dataView, onDrill };
        const hcOptions = getHighchartsOptions(chartOptions, drillConfig, chartConfig, dataView.definition);

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
        const { drillableItems, dataView, onDataTooLarge, onNegativeValues, pushData } = props;

        const chartConfig = this.getChartConfig(props);
        const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);

        this.chartOptions = getChartOptions(dataView, chartConfig, drillablePredicates);
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
        const { dataView, config } = props;

        return getSanitizedStackingConfig(dataView.definition, config);
    }
}
