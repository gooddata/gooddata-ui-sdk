// (C) 2007-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import noop from "lodash/noop.js";
import { LegendList } from "./LegendList.js";
import { calculateFluidLegend } from "./helpers.js";
import { IPushpinCategoryLegendItem, ItemBorderRadiusPredicate } from "./types.js";

/**
 * @internal
 */
export interface IFluidLegendProps {
    containerWidth: number;
    series: IPushpinCategoryLegendItem[];
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    onItemClick?(item: IPushpinCategoryLegendItem): void;
}

/**
 * @internal
 */
export class FluidLegend extends React.PureComponent<IFluidLegendProps> {
    public state = {
        showAll: false,
    };

    public toggleShowAll = (): void => {
        this.setState({
            showAll: !this.state.showAll,
        });
    };

    public renderSeries = (itemWidth: number, visibleItemsCount: number): React.ReactNode => {
        const { series, onItemClick = noop, enableBorderRadius } = this.props;

        const limit = this.state.showAll ? series.length : visibleItemsCount;
        const pagedSeries = series.slice(0, limit);

        return (
            <div className="series">
                <LegendList
                    enableBorderRadius={enableBorderRadius}
                    series={pagedSeries}
                    onItemClick={onItemClick}
                    width={itemWidth}
                />
            </div>
        );
    };

    public renderPaging = (): React.ReactNode => {
        const classes = cx("gd-button-link", "gd-button-icon-only", "paging-button", {
            "gd-icon-chevron-up": this.state.showAll,
            "gd-icon-chevron-down": !this.state.showAll,
        });
        return (
            <div className="paging">
                <button className={classes} onClick={this.toggleShowAll} />
            </div>
        );
    };

    public render() {
        const { series, containerWidth } = this.props;
        const { itemWidth, hasPaging, visibleItemsCount } = calculateFluidLegend(
            series.length,
            containerWidth,
        );
        return (
            <div className="viz-legend fluid">
                {this.renderSeries(itemWidth, visibleItemsCount)}
                {hasPaging ? this.renderPaging() : null}
            </div>
        );
    }
}
