// (C) 2007-2018 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";
import React from "react";

import {
    convertDrillableItemsToPredicates,
    IDrillableItem,
    OnFiredDrillEvent,
    IHeaderPredicate,
} from "@gooddata/sdk-ui";
import { IChartConfig, OnLegendReady } from "../interfaces";
import { getChartOptions } from "./_to_refactor/chartOptionsBuilder";
import { getHighchartsOptions } from "./_to_refactor/highChartsCreators";
import {
    HighChartsRenderer,
    IHighChartsRendererProps,
    renderChart as chartRenderer,
    renderLegend as legendRenderer,
} from "./HighChartsRenderer";
import buildLegendOptions from "./_to_refactor/legend/legendBuilder";
import noop from "lodash/noop";
import { IChartOptions } from "./typings/unsafe";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { ILegendOptions } from "@gooddata/sdk-ui-vis-commons";
import { validateData } from "./_to_refactor/chartLimits";

export function renderHighCharts(props: IHighChartsRendererProps): JSX.Element {
    return <HighChartsRenderer {...props} />;
}

export interface IChartTransformationProps extends WrappedComponentProps {
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

class ChartTransformationImpl extends React.Component<IChartTransformationProps, IChartTransformationState> {
    public static defaultProps = {
        drillableItems: [] as IDrillableItem[],
        renderer: renderHighCharts,
        afterRender: noop,
        onNegativeValues: null as any,
        onDrill: (): boolean => true,
        pushData: noop,
        onLegendReady: noop,
        height: undefined as number,
        width: undefined as number,
    };

    private chartOptions: IChartOptions;
    private legendOptions: ILegendOptions;

    public UNSAFE_componentWillMount(): void {
        this.assignChartOptions(this.props);
    }

    public UNSAFE_componentWillReceiveProps(nextProps: IChartTransformationProps): void {
        this.assignChartOptions(nextProps);
    }

    public getRendererProps(): Omit<IHighChartsRendererProps, "legendRenderer" | "chartRenderer"> {
        const { chartOptions, legendOptions } = this;
        const {
            dataView,
            height,
            width,
            afterRender,
            onDrill,
            onLegendReady,
            locale,
            config,
            intl,
        } = this.props;
        const drillConfig = { dataView, onDrill };
        const hcOptions = getHighchartsOptions(chartOptions, drillConfig, config, dataView.definition, intl);

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

    public assignChartOptions(props: IChartTransformationProps): IChartOptions {
        const { drillableItems, dataView, onDataTooLarge, onNegativeValues, pushData, config } = props;
        const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);

        this.chartOptions = getChartOptions(dataView, config, drillablePredicates);
        const validationResult = validateData(config.limits, this.chartOptions);

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

        this.legendOptions = buildLegendOptions(config.legend, this.chartOptions);

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

    public render(): React.ReactNode {
        if (this.state.dataTooLarge || this.state.hasNegativeValue) {
            return null;
        }
        return this.props.renderer({ ...this.getRendererProps(), chartRenderer, legendRenderer });
    }
}

export const ChartTransformation = injectIntl(ChartTransformationImpl);
