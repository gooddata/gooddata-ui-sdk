// (C) 2007-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import noop from "lodash/noop.js";
import isNil from "lodash/isNil.js";
import { LegendList } from "./LegendList.js";
import { ButtonsOrientationType, Paging } from "./Paging.js";
import { BOTTOM, TOP } from "./PositionTypes.js";
import { calculateStaticLegend, ITEM_HEIGHT, STATIC_PAGING_HEIGHT } from "./helpers.js";
import { IPushpinCategoryLegendItem, ItemBorderRadiusPredicate } from "./types.js";
import { LegendLabelItem } from "./LegendLabelItem.js";

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
    customComponent?: JSX.Element | null;
    onPageChanged?: (page: number) => void;
}

/**
 * @internal
 */
export class StaticLegend extends React.PureComponent<IStaticLegendProps> {
    public static defaultProps: Pick<
        IStaticLegendProps,
        "buttonOrientation" | "paginationHeight" | "onPageChanged"
    > = {
        buttonOrientation: "upDown",
        paginationHeight: STATIC_PAGING_HEIGHT,
        onPageChanged: noop,
    };

    public state = {
        page: 1,
    };

    public showNextPage = (): void => {
        const updatedPage = this.state.page + 1;
        this.props.onPageChanged!(updatedPage);
        this.setState({ page: updatedPage });
    };

    public showPrevPage = (): void => {
        const updatedPage = this.state.page - 1;
        this.props.onPageChanged!(updatedPage);
        this.setState({ page: updatedPage });
    };

    public renderPaging = (pagesCount: number): React.ReactNode => {
        const { page } = this.state;
        const { buttonOrientation } = this.props;

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

    public render() {
        const {
            enableBorderRadius,
            containerHeight,
            onItemClick = noop,
            position,
            series,
            shouldFillAvailableSpace = true,
            label,
            paginationHeight,
            customComponent,
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
        const usePaging = hasPaging || customComponent;

        const heightOfAvailableSpace = (visibleItemsCount / columnNum) * ITEM_HEIGHT;
        const heightOfVisibleItems = Math.min(visibleItemsCount / columnNum, seriesCount) * ITEM_HEIGHT;
        const seriesHeight =
            (shouldFillAvailableSpace ? heightOfAvailableSpace : heightOfVisibleItems) + labelHeight;
        const shouldDisplayCustomComponent = page === 1 && this.hasCustomComponent();
        const pagesCount = this.getPagesCount(series.length, visibleItemsCount);

        if (shouldDisplayCustomComponent) {
            return (
                <div className={classNames}>
                    <div className="series" style={{ height: seriesHeight }}>
                        {labelComponent}
                        {customComponent}
                    </div>
                    {usePaging ? this.renderPaging(pagesCount) : null}
                </div>
            );
        }

        const [start, end] = getPagingValues(
            page,
            visibleItemsCount,
            series.length,
            this.hasCustomComponent(),
        );
        const pagedSeries = series.slice(start, end);
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
                {usePaging ? this.renderPaging(pagesCount) : null}
            </div>
        );
    }

    private getPagesCount(seriesLength: number, visibleItemsCount: number) {
        const defaultPagesCount = Math.ceil(seriesLength / visibleItemsCount);
        return this.hasCustomComponent() ? defaultPagesCount + 1 : defaultPagesCount;
    }

    private hasCustomComponent() {
        return !isNil(this.props.customComponent);
    }
}

export const getPagingValues = (
    page: number,
    visibleItemsCount: number,
    seriesLength: number,
    hasCustomComponent: boolean,
): [number, number] => {
    const start = hasCustomComponent ? (page - 2) * visibleItemsCount : (page - 1) * visibleItemsCount;
    const end = hasCustomComponent
        ? Math.min(visibleItemsCount * (page - 1), seriesLength)
        : Math.min(visibleItemsCount * page, seriesLength);
    return [start, end];
};

const shouldItemsFitOneColumn = (visibleItemsCount: number, columnNum: number, pagedSeriesLength: number) =>
    visibleItemsCount / columnNum >= pagedSeriesLength;
