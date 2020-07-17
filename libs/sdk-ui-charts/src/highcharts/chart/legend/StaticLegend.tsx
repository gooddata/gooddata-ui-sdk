// (C) 2007-2018 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";

import LegendList from "./LegendList";
import { TOP, BOTTOM } from "./PositionTypes";
import { calculateStaticLegend, ITEM_HEIGHT } from "./helpers";

export default class StaticLegend extends React.PureComponent<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            page: 1,
        };

        this.showNextPage = this.showNextPage.bind(this);
        this.showPrevPage = this.showPrevPage.bind(this);
    }

    public showNextPage() {
        this.setState({ page: this.state.page + 1 });
    }

    public showPrevPage() {
        this.setState({ page: this.state.page - 1 });
    }

    public renderPagingButton(type: any, handler: any, disabled: any) {
        const classes = cx("gd-button-link", "gd-button-icon-only", `icon-chevron-${type}`, "paging-button");
        return <button className={classes} onClick={handler} disabled={disabled} />;
    }

    public renderPaging(visibleItemsCount: any) {
        const { page } = this.state;
        const pagesCount = Math.ceil(this.props.series.length / visibleItemsCount);

        return (
            <div className="paging">
                {this.renderPagingButton("up", this.showPrevPage, page === 1)}
                <FormattedMessage
                    id="visualizations.of"
                    values={{
                        page: <strong>{page}</strong>,
                        pagesCount,
                    }}
                />
                {this.renderPagingButton("down", this.showNextPage, page === pagesCount)}
            </div>
        );
    }

    public render() {
        const { series, chartType, onItemClick, position, containerHeight } = this.props;
        const { page } = this.state;

        const classNames = cx("viz-legend", "static", `position-${position}`);

        // Without paging
        if (position === TOP || position === BOTTOM) {
            return (
                <div className={classNames}>
                    <div className="series">
                        <LegendList chartType={chartType} series={series} onItemClick={onItemClick} />
                    </div>
                </div>
            );
        }

        const { hasPaging, visibleItemsCount } = calculateStaticLegend(series.length, containerHeight);

        const start = (page - 1) * visibleItemsCount;
        const end = Math.min(visibleItemsCount * page, series.length);

        const pagedSeries = series.slice(start, end);

        return (
            <div className={classNames}>
                <div className="series" style={{ height: visibleItemsCount * ITEM_HEIGHT }}>
                    <LegendList chartType={chartType} series={pagedSeries} onItemClick={onItemClick} />
                </div>
                {hasPaging && this.renderPaging(visibleItemsCount)}
            </div>
        );
    }
}
