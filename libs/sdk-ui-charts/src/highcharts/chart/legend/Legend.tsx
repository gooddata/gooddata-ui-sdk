// (C) 2007-2019 GoodData Corporation
import React from "react";
import Measure, { Rect } from "react-measure";
import cx from "classnames";
import isEmpty from "lodash/isEmpty";
import FluidLegend from "./FluidLegend";
import StaticLegend from "./StaticLegend";
import { isComboChart, isHeatmap } from "../../utils/common";
import HeatmapLegend from "./HeatmapLegend";
import {
    ChartType,
    IntlWrapper,
    IntlTranslationsProvider,
    ITranslationsComponentProps,
} from "@gooddata/sdk-ui";
import { getComboChartSeries, transformToDualAxesSeries } from "./helpers";

export interface ILegendProps {
    responsive?: boolean;
    legendItemsEnabled?: any[];
    height?: number;
    position: string;
    chartType: ChartType;
    series: any;
    format?: string;
    locale?: string;
    showFluidLegend?: boolean;
    onItemClick(item: any): void;
    validateOverHeight(legendClient: Rect): void;
}

export interface ILegendState {
    showFluid: boolean;
}

export default class Legend extends React.PureComponent<ILegendProps, ILegendState> {
    public static defaultProps = {
        responsive: false,
        legendItemsEnabled: [] as any,
        height: 0,
        showFluidLegend: false,
        isLegendOverHeight: false,
    };

    constructor(props: ILegendProps) {
        super(props);

        this.onItemClick = this.onItemClick.bind(this);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public onItemClick(item: any): void {
        this.props.onItemClick(item);
    }

    public getSeries(): ReturnType<typeof getComboChartSeries> {
        const { series, legendItemsEnabled, chartType } = this.props;

        const seriesWithVisibility = series.map((seriesItem: any) => {
            const isVisible = legendItemsEnabled[seriesItem.legendIndex];
            return {
                ...seriesItem,
                isVisible,
            };
        });

        if (isComboChart(chartType)) {
            return getComboChartSeries(seriesWithVisibility);
        }

        return transformToDualAxesSeries(seriesWithVisibility, chartType);
    }

    public renderFluid(): React.ReactNode {
        const { chartType } = this.props;

        return (
            <Measure client={true}>
                {({ measureRef, contentRect }: any) => {
                    const usedWidth =
                        contentRect.client && contentRect.client.width
                            ? Math.floor(contentRect.client.width)
                            : 0;
                    return (
                        <div className="viz-fluid-legend-wrap" ref={measureRef}>
                            <FluidLegend
                                series={this.getSeries()}
                                chartType={chartType}
                                onItemClick={this.onItemClick}
                                containerWidth={usedWidth}
                            />
                        </div>
                    );
                }}
            </Measure>
        );
    }

    public renderStatic(): React.ReactNode {
        const { chartType, position, height, format, locale, responsive } = this.props;

        const classNames = cx("viz-static-legend-wrap", `position-${position}`);

        const props = {
            series: this.getSeries(),
            chartType,
            onItemClick: this.onItemClick,
            position,
            format,
            locale,
            responsive,
        };

        return (
            <Measure client={true}>
                {({ measureRef, contentRect }: any) => {
                    const measuredHeight =
                        contentRect.client && contentRect.client.height
                            ? Math.floor(contentRect.client.height)
                            : 0;
                    const usedHeight = height || measuredHeight;

                    if (!isEmpty(contentRect.client)) {
                        this.props.validateOverHeight(contentRect.client);
                    }

                    return (
                        <div className={classNames} ref={measureRef}>
                            <StaticLegend {...props} containerHeight={usedHeight} />
                        </div>
                    );
                }}
            </Measure>
        );
    }

    public render(): React.ReactNode {
        const { responsive } = this.props;
        const { showFluidLegend } = this.props;

        const fluidLegend = responsive && showFluidLegend;

        if (isHeatmap(this.props.chartType)) {
            return this.renderHeatmapLegend();
        }

        if (fluidLegend) {
            return this.renderFluid();
        }

        return this.renderStatic();
    }

    private renderHeatmapLegend() {
        const { locale, format, responsive, position } = this.props;
        const { showFluidLegend } = this.props;
        const series = this.getSeries();
        const isSmall = responsive && showFluidLegend;

        return (
            <IntlWrapper locale={locale}>
                <IntlTranslationsProvider>
                    {(props: ITranslationsComponentProps) => (
                        <HeatmapLegend
                            series={series}
                            format={format}
                            isSmall={isSmall}
                            numericSymbols={props.numericSymbols}
                            position={position}
                        />
                    )}
                </IntlTranslationsProvider>
            </IntlWrapper>
        );
    }
}
