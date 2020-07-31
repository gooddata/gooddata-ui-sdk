// (C) 2007-2018 GoodData Corporation
import React from "react";
import cx from "classnames";

import LegendList from "./LegendList";
import { calculateFluidLegend } from "./helpers";

interface IFluidLegendProps {
    onItemClick: (item: any) => void;
    chartType: string;
    series: any[];
    position: string;
    containerWidth: number;
}

interface IFluidLegendState {
    showAll: boolean;
}

export default class FluidLegend extends React.PureComponent<IFluidLegendProps, IFluidLegendState> {
    public static defaultProps: any = {
        containerWidth: null,
    };

    state: IFluidLegendState = {
        showAll: false,
    };

    public toggleShowAll = (): void => {
        this.setState({
            showAll: !this.state.showAll,
        });
    };

    public renderSeries = (itemWidth: number, visibleItemsCount: number): React.ReactNode => {
        const { series, chartType, onItemClick } = this.props;

        const limit = this.state.showAll ? series.length : visibleItemsCount;
        const pagedSeries = series.slice(0, limit);

        return (
            <div className="series">
                <LegendList
                    chartType={chartType}
                    series={pagedSeries}
                    onItemClick={onItemClick}
                    width={itemWidth}
                />
            </div>
        );
    };

    public renderPaging = (): React.ReactNode => {
        const classes = cx("gd-button-link", "gd-button-icon-only", "paging-button", {
            "icon-chevron-up": this.state.showAll,
            "icon-chevron-down": !this.state.showAll,
        });
        return (
            <div className="paging">
                <button className={classes} onClick={this.toggleShowAll} />
            </div>
        );
    };

    public render(): React.ReactNode {
        const { series, containerWidth } = this.props;
        const { itemWidth, hasPaging, visibleItemsCount } = calculateFluidLegend(
            series.length,
            containerWidth,
        );
        return (
            <div className="viz-legend fluid">
                {this.renderSeries(itemWidth, visibleItemsCount)}
                {hasPaging && this.renderPaging()}
            </div>
        );
    }
}
