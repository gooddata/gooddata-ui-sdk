// (C) 2007-2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import noop from "lodash/noop";
import { LegendList } from "./LegendList";
import { Paging } from "./Paging";
import { BOTTOM, TOP } from "./PositionTypes";
import { calculateStaticLegend, ITEM_HEIGHT } from "./helpers";
import { IPushpinCategoryLegendItem } from "./types";

/**
 * @internal
 */
export interface IStaticLegendProps {
    containerHeight: number;
    position: string;
    series: IPushpinCategoryLegendItem[];
    enableBorderRadius?: boolean;
    shouldFillAvailableSpace?: boolean;
    onItemClick?(item: IPushpinCategoryLegendItem): void;
}

/**
 * @internal
 */
export class StaticLegend extends React.PureComponent<IStaticLegendProps> {
    public state = {
        page: 1,
    };

    public showNextPage = (): void => {
        this.setState({ page: this.state.page + 1 });
    };

    public showPrevPage = (): void => {
        this.setState({ page: this.state.page - 1 });
    };

    public renderPaging = (visibleItemsCount: number): React.ReactNode => {
        const { page } = this.state;
        const pagesCount = Math.ceil(this.props.series.length / visibleItemsCount);

        return (
            <Paging
                page={page}
                pagesCount={pagesCount}
                showNextPage={this.showNextPage}
                showPrevPage={this.showPrevPage}
            />
        );
    };

    public render(): React.ReactNode {
        const {
            enableBorderRadius,
            containerHeight,
            onItemClick = noop,
            position,
            series,
            shouldFillAvailableSpace = true,
        } = this.props;
        const { page } = this.state;

        const classNames = cx("viz-legend", "static", `position-${position}`);

        // Without paging
        if (position === TOP || position === BOTTOM) {
            return (
                <div className={classNames}>
                    <div className="series">
                        <LegendList
                            enableBorderRadius={enableBorderRadius}
                            series={series}
                            onItemClick={onItemClick}
                        />
                    </div>
                </div>
            );
        }

        const seriesCount = series.length;
        const { hasPaging, visibleItemsCount } = calculateStaticLegend(seriesCount, containerHeight);

        const start = (page - 1) * visibleItemsCount;
        const end = Math.min(visibleItemsCount * page, series.length);

        const pagedSeries = series.slice(start, end);

        const heightOfAvailableSpace = visibleItemsCount * ITEM_HEIGHT;
        const heightOfVisibleItems = Math.min(visibleItemsCount, seriesCount) * ITEM_HEIGHT;
        const seriesHeight = shouldFillAvailableSpace ? heightOfAvailableSpace : heightOfVisibleItems;

        return (
            <div className={classNames}>
                <div className="series" style={{ height: seriesHeight }}>
                    <LegendList
                        enableBorderRadius={enableBorderRadius}
                        series={pagedSeries}
                        onItemClick={onItemClick}
                    />
                </div>
                {hasPaging && this.renderPaging(visibleItemsCount)}
            </div>
        );
    }
}
