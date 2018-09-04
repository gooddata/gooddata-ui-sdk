// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import * as Measure from 'react-measure';
import * as cx from 'classnames';

import FluidLegend from './FluidLegend';
import StaticLegend from './StaticLegend';
import { ChartType } from '../../../../constants/visualizationTypes';
import { isHeatmap } from '../../utils/common';
import HeatmapLegend from './HeatmapLegend';
import { IntlWrapper } from '../../../core/base/IntlWrapper';
import { IntlTranslationsProvider, ITranslationsComponentProps } from '../../../core/base/TranslationsProvider';

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
}

export interface ILegendState {
    showFluid: boolean;
}

export default class Legend extends React.PureComponent<ILegendProps, ILegendState> {
    public static defaultProps = {
        responsive: false,
        legendItemsEnabled: [] as any,
        height: 0,
        showFluidLegend: false
    };

    constructor(props: ILegendProps) {
        super(props);

        this.onItemClick = this.onItemClick.bind(this);
    }

    public onItemClick(item: any) {
        this.props.onItemClick(item);
    }

    public getSeries() {
        const { series, legendItemsEnabled } = this.props;

        const seriesWithVisibility = series.map((seriesItem: any) => {
            const isVisible = legendItemsEnabled[seriesItem.legendIndex];
            return {
                ...seriesItem,
                isVisible
            };
        });
        return seriesWithVisibility;
    }

    public renderFluid() {
        const { chartType } = this.props;

        return (
            <Measure>
                {({ width }: any) => (
                    <div className="viz-fluid-legend-wrap">
                        <FluidLegend
                            series={this.getSeries()}
                            chartType={chartType}
                            onItemClick={this.onItemClick}
                            containerWidth={width}
                        />
                    </div>
                )}
            </Measure>
        );
    }

    public renderStatic() {
        const { chartType, position, height, format, locale, responsive } = this.props;

        const classNames = cx('viz-static-legend-wrap', `position-${position}`);

        const props = {
            series: this.getSeries(),
            chartType,
            onItemClick: this.onItemClick,
            position,
            format,
            locale,
            responsive
        };

        return (
            <Measure>
                {(dimensions: any) => (
                    <div className={classNames}>
                        <StaticLegend
                            {...props}
                            containerHeight={height || dimensions.height}
                        />
                    </div>
                )}
            </Measure>
        );
    }

    public render() {
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
