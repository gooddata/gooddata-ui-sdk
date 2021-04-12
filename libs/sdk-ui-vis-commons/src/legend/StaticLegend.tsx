// (C) 2007-2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import noop from "lodash/noop";
import { LegendList } from "./LegendList";
import { ButtonsOrientationType, Paging } from "./Paging";
import { BOTTOM, TOP } from "./PositionTypes";
import { calculateStaticLegend, ITEM_HEIGHT, STATIC_PAGING_HEIGHT } from "./helpers";
import { IPushpinCategoryLegendItem, ItemBorderRadiusPredicate } from "./types";
import { LegendLabelItem } from "./LegendLabelItem";

/**
 * @internal
 */
export interface IStaticLegendProps {
    containerHeight: number;
    position: string;
    series: IPushpinCategoryLegendItem[];
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    shouldFillAvailableSpace?: boolean;
    label?: string;
    buttonOrientation?: ButtonsOrientationType;
    onItemClick?(item: IPushpinCategoryLegendItem): void;
    paginationHeight?: number;
}

/**
 * @internal
 */
export class StaticLegend extends React.PureComponent<IStaticLegendProps> {
    public static defaultProps: Partial<IStaticLegendProps> = {
        buttonOrientation: "upDown",
        paginationHeight: STATIC_PAGING_HEIGHT,
    };

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
        const { buttonOrientation } = this.props;

        const pagesCount = Math.ceil(this.props.series.length / visibleItemsCount);

        return (
            <Paging
                page={page}
                pagesCount={pagesCount}
                showNextPage={this.showNextPage}
                showPrevPage={this.showPrevPage}
                buttonsOrientation={buttonOrientation}
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
            label,
            paginationHeight,
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

        const columnNum = position === "dialog" ? 2 : 1;

        const labelHeight = label ? ITEM_HEIGHT : 0;
        const labelComponent = label ? <LegendLabelItem label={label} /> : null;
        const contentHeight = containerHeight - labelHeight;

        const seriesCount = series.length;
        const { hasPaging, visibleItemsCount } = calculateStaticLegend(
            seriesCount,
            contentHeight,
            columnNum,
            paginationHeight,
        );
        const start = (page - 1) * visibleItemsCount;
        const end = Math.min(visibleItemsCount * page, series.length);

        const pagedSeries = series.slice(start, end);

        const heightOfAvailableSpace = (visibleItemsCount / columnNum) * ITEM_HEIGHT;
        const heightOfVisibleItems = Math.min(visibleItemsCount / columnNum, seriesCount) * ITEM_HEIGHT;
        const seriesHeight =
            (shouldFillAvailableSpace ? heightOfAvailableSpace : heightOfVisibleItems) + labelHeight;
        const visibleItemsFitOneColumn = shouldItemsFitOneColumn(
            visibleItemsCount,
            columnNum,
            pagedSeries.length,
        );

        const fullClassNames = cx(classNames, {
            "no-width": visibleItemsFitOneColumn,
        });

        return (
            <div className={fullClassNames}>
                <div className="series" style={{ height: seriesHeight }}>
                    {labelComponent}
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

const shouldItemsFitOneColumn = (visibleItemsCount: number, columnNum: number, pagedSeriesLength: number) =>
    visibleItemsCount / columnNum >= pagedSeriesLength;
