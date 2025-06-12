// (C) 2020-2022 GoodData Corporation
import React from "react";
import noop from "lodash/noop.js";
import { ContentRect } from "react-measure";
import {
    PopUpLegend,
    StaticLegend,
    LegendPosition,
    IPushpinCategoryLegendItem,
    FluidLegend,
    PositionType,
} from "@gooddata/sdk-ui-vis-commons";

export const HEIGHT_OF_SIZE_LEGEND = 161;

export interface IPushpinCategoryLegendProps {
    containerId: string;
    hasSizeLegend: boolean;
    isSizeLegendVisible?: boolean;
    contentRect: ContentRect;
    categoryItems?: IPushpinCategoryLegendItem[];
    format?: string;
    height?: number;
    locale?: string;
    position?: PositionType;
    responsive?: boolean | "autoPositionWithPopup";
    customComponent?: JSX.Element | null;
    customComponentName?: string;
    sizeLegendName?: string;
    maxRows?: number;
    name?: string;
    renderPopUp?: boolean;
    isFluidLegend?: boolean;
    onItemClick?(item: IPushpinCategoryLegendItem): void;
}

export default function PushpinCategoryLegend(props: IPushpinCategoryLegendProps): JSX.Element {
    const { contentRect, hasSizeLegend, isFluidLegend, renderPopUp, isSizeLegendVisible = true } = props;

    if (renderPopUp) {
        return <GeoPopUpLegend {...props} isSizeLegendVisible={isSizeLegendVisible} />;
    }

    return (
        <div className="s-geo-category-legend">
            {isFluidLegend
                ? renderFluidCategoryLegend(props, contentRect)
                : renderStaticCategoryLegend(props, contentRect, hasSizeLegend)}
        </div>
    );
}

function renderFluidCategoryLegend(
    props: IPushpinCategoryLegendProps,
    contentRect: ContentRect,
): JSX.Element {
    const { categoryItems, onItemClick } = props;

    const legendProps = {
        series: categoryItems ?? [],
        onItemClick,
    };

    const { client: contentRectClient } = contentRect;
    const usedWidth = contentRectClient?.width ? Math.floor(contentRectClient.width) : 0;

    return <FluidLegend {...legendProps} containerWidth={usedWidth} />;
}

function renderStaticCategoryLegend(
    props: IPushpinCategoryLegendProps,
    contentRect: ContentRect,
    hasSizeLegend: boolean,
): JSX.Element {
    const { categoryItems = [], position = "top", height, format, locale, onItemClick, responsive } = props;

    // For Geo Pushpin with position left/right
    // we set the height of series to number of actual displayed items
    // so that, size legend will be visible
    const shouldFillAvailableSpace = position !== "left" && position !== "right";

    const legendProps = {
        format,
        locale,
        position,
        responsive,
        series: categoryItems,
        shouldFillAvailableSpace,
        onItemClick,
    };

    const { client: contentRectClient } = contentRect;
    const hasSizeAndLeftRightPosition =
        hasSizeLegend && (position === LegendPosition.LEFT || position === LegendPosition.RIGHT);
    const measuredHeight = contentRectClient?.height ? Math.floor(contentRectClient.height) : 0;
    const usedHeight = (height || measuredHeight) - (hasSizeAndLeftRightPosition ? HEIGHT_OF_SIZE_LEGEND : 0);

    return <StaticLegend {...legendProps} containerHeight={usedHeight} />;
}

function GeoPopUpLegend(props: IPushpinCategoryLegendProps): JSX.Element {
    const {
        containerId,
        categoryItems = [],
        onItemClick = noop,
        name,
        maxRows,
        customComponent,
        customComponentName,
        hasSizeLegend,
        isSizeLegendVisible,
    } = props;

    return (
        <PopUpLegend
            series={categoryItems}
            onLegendItemClick={onItemClick}
            maxRows={hasSizeLegend && isSizeLegendVisible && maxRows ? maxRows - 1 : maxRows}
            name={name}
            containerId={containerId}
            customComponent={customComponent}
            customComponentName={customComponentName}
        />
    );
}
