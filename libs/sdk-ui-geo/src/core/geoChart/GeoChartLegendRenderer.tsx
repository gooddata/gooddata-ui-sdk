// (C) 2020 GoodData Corporation
import React from "react";
import Measure, { ContentRect, MeasuredComponentProps } from "react-measure";
import cx from "classnames";

import { generateLegendColorData } from "./geoChartColor";
import PushpinCategoryLegend, { HEIGHT_OF_SIZE_LEGEND } from "./legends/PushpinCategoryLegend";
import PushpinSizeLegend from "./legends/PushpinSizeLegend";
import { IAvailableLegends, IGeoData } from "../../GeoChart";
import { getAvailableLegends } from "./helpers/geoChart/data";
import { IPushpinCategoryLegendItem, PositionType, Paging, ColorLegend } from "@gooddata/sdk-ui-vis-commons";
import {
    getPushpinColorLegendSize,
    getPushpinColorLegendTitle,
    isSmallPushpinSizeLegend,
    getPushpinSizeLegendTitle,
    shouldRenderCircleLegendInsidePopUp,
    shouldRenderMiddleCircle,
} from "./helpers/geoChart/responsive";

const HEIGHT_OF_COLOR_LEGEND = 210;

/**
 * @internal
 */
export interface IGeoChartLegendRendererProps {
    categoryItems?: IPushpinCategoryLegendItem[]; // used for Category legend
    format?: string;
    geoData?: IGeoData; // used for Color/Size legend
    height?: number;
    locale?: string;
    colorLegendValue: string;
    position?: PositionType;
    responsive?: boolean | "autoPositionWithPopup";
    isFluidLegend?: boolean;
    numericSymbols?: string[];
    onItemClick?: (item: IPushpinCategoryLegendItem) => void;
    contentRect?: ContentRect;
    maxRows?: number;
    name?: string;
    renderPopUp?: boolean;
    containerId?: string;
}

function getClassnames(props: IGeoChartLegendRendererProps, availableLegends: IAvailableLegends): string {
    const { position, isFluidLegend } = props;
    const { hasSizeLegend } = availableLegends;
    const isBottomPosition = isFluidLegend || position === "bottom";
    return cx("geo-legend", "s-geo-legend", "viz-legend", {
        "viz-fluid-legend-wrap": isFluidLegend,
        "viz-static-legend-wrap": !isFluidLegend,
        static: !isFluidLegend,
        "has-size-legend": hasSizeLegend,
        [`position-${position}`]: !isBottomPosition,
        // this is required in case
        // position is not BOTTOM but isFluidLegend is true
        "position-bottom": isBottomPosition,
    });
}

export default function GeoChartLegendRenderer(props: IGeoChartLegendRendererProps): JSX.Element | null {
    const { categoryItems = [], geoData = {}, height, numericSymbols = [] } = props;
    const position = props.position ?? "top";

    const availableLegends: IAvailableLegends = getAvailableLegends(categoryItems, geoData);
    const { hasCategoryLegend, hasColorLegend, hasSizeLegend } = availableLegends;
    const isLegendVisible = hasCategoryLegend || hasColorLegend || hasSizeLegend;

    if (!isLegendVisible) {
        return null;
    }

    if (hasCategoryLegend) {
        return renderCategoryAndSizeLegend(props, availableLegends);
    }

    if (hasColorLegend && hasSizeLegend && shouldShowPagingLegend(height, position)) {
        return (
            <ColorAndSizeLegendWithPaging
                {...props}
                numericSymbols={numericSymbols}
                availableLegends={availableLegends}
            />
        );
    }

    return renderColorAndSizeLegend(props, availableLegends);
}

function renderCategoryAndSizeLegend(
    props: IGeoChartLegendRendererProps,
    availableLegends: IAvailableLegends,
): JSX.Element | null {
    const { contentRect, renderPopUp } = props;
    const { hasSizeLegend } = availableLegends;
    const classNames = cx(getClassnames(props, availableLegends));
    return (
        <Measure client={true}>
            {({ measureRef, contentRect: contentRectLegend }: MeasuredComponentProps) => {
                if (shouldRenderCircleLegendInsidePopUp(contentRect?.client?.width, renderPopUp)) {
                    return (
                        <div className={classNames} ref={measureRef}>
                            {renderPushpinLegend(props, contentRectLegend, hasSizeLegend)}
                        </div>
                    );
                }

                return (
                    <div className={classNames} ref={measureRef}>
                        {renderPushpinCategoryLegend(props, contentRectLegend, hasSizeLegend)}
                        {renderPushpinSizeLegend(props, hasSizeLegend)}
                    </div>
                );
            }}
        </Measure>
    );
}

// if height of color + size is bigger than container, we will show paging for legends
function shouldShowPagingLegend(height: number | undefined, legendPosition: PositionType): boolean {
    if (height !== undefined && (legendPosition === "left" || legendPosition === "right")) {
        const heightOfColorAndSizeLegend = HEIGHT_OF_COLOR_LEGEND + HEIGHT_OF_SIZE_LEGEND;
        return height < heightOfColorAndSizeLegend;
    }
    return false;
}

interface IColorAndSizeLegendWithPagingProps extends IGeoChartLegendRendererProps {
    availableLegends: IAvailableLegends;
    numericSymbols: string[];
}

function ColorAndSizeLegendWithPaging(props: IColorAndSizeLegendWithPagingProps): JSX.Element {
    const [page, setPage] = React.useState<number>(1);

    const showNextPage = (): void => setPage(2);
    const showPrevPage = (): void => setPage(1);

    const { availableLegends } = props;
    const classNames = getClassnames(props, availableLegends);
    return (
        <div className={classNames}>
            <div className="geo-legend-paging">
                {renderPushpinColorLegend(props, page === 1)}
                {renderPushpinSizeLegend(props, page === 2)}
            </div>
            <Paging page={page} pagesCount={2} showNextPage={showNextPage} showPrevPage={showPrevPage} />
        </div>
    );
}

function renderColorAndSizeLegend(
    props: IGeoChartLegendRendererProps,
    availableLegends: IAvailableLegends,
): JSX.Element {
    const { hasColorLegend, hasSizeLegend } = availableLegends;
    const classNames = getClassnames(props, availableLegends);

    return (
        <div className={classNames}>
            {renderPushpinColorLegend(props, hasColorLegend)}
            {renderPushpinSizeLegend(props, hasSizeLegend)}
        </div>
    );
}

function renderPushpinColorLegend(
    props: IGeoChartLegendRendererProps,
    hasColorLegend: boolean,
): JSX.Element | null {
    if (!hasColorLegend) {
        return null;
    }

    const {
        geoData,
        position = "top",
        responsive,
        isFluidLegend,
        colorLegendValue,
        numericSymbols = [],
        contentRect,
    } = props;

    const data = geoData!.color!.data;
    const format = geoData!.color!.format;
    const dataWithoutNull = data.filter(isFinite);
    const colorData = generateLegendColorData(dataWithoutNull, colorLegendValue);
    const width = contentRect?.client?.width;
    const size = getPushpinColorLegendSize(width, isFluidLegend, responsive);
    const title = getPushpinColorLegendTitle(geoData?.color?.name, width, responsive);

    return (
        <ColorLegend
            data={colorData}
            format={format}
            size={size}
            numericSymbols={numericSymbols}
            position={position}
            title={title}
        />
    );
}

function renderPushpinCategoryLegend(
    props: IGeoChartLegendRendererProps,
    contentRect: ContentRect,
    hasSizeLegend: boolean,
): JSX.Element | null {
    const { containerId } = props;

    if (!containerId) {
        return null;
    }

    return (
        <PushpinCategoryLegend
            {...props}
            contentRect={contentRect}
            hasSizeLegend={hasSizeLegend}
            containerId={containerId}
        />
    );
}

function renderPushpinSizeLegend(
    props: IGeoChartLegendRendererProps,
    hasSizeLegend: boolean,
    ignoreMeasureName = false,
    ignoreSmallSize = false,
): JSX.Element | null {
    if (!hasSizeLegend) {
        return null;
    }

    const { geoData, numericSymbols = [], responsive, contentRect } = props;

    if (!geoData || !geoData.size) {
        return null;
    }

    const {
        size: { data, format, name },
    } = geoData;
    const width = contentRect?.client?.width;

    const isSmall = isSmallPushpinSizeLegend(width, ignoreSmallSize, responsive);
    const title = getPushpinSizeLegendTitle(name, width, ignoreMeasureName);
    const showMiddleCircle = shouldRenderMiddleCircle(width, ignoreSmallSize);

    return (
        <PushpinSizeLegend
            format={format}
            measureName={title}
            numericSymbols={numericSymbols}
            sizes={data}
            isSmall={isSmall}
            showMiddleCircle={showMiddleCircle}
        />
    );
}

function renderPushpinLegend(
    props: IGeoChartLegendRendererProps,
    contentRect: ContentRect,
    hasSizeLegend: boolean,
): JSX.Element | null {
    const { containerId } = props;

    if (!containerId) {
        return null;
    }

    return (
        <PushpinCategoryLegend
            {...props}
            contentRect={contentRect}
            hasSizeLegend={hasSizeLegend}
            isSizeLegendVisible={false}
            containerId={containerId}
            customComponent={renderPushpinSizeLegend(props, hasSizeLegend, true, true)}
            customComponentName={props.geoData?.size?.name}
        />
    );
}
