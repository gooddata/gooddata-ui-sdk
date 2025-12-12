// (C) 2020-2025 GoodData Corporation

import { type ReactElement, useState } from "react";

import cx from "classnames";
import { defaultImport } from "default-import";
import ReactMeasure, { type ContentRect, type MeasuredComponentProps } from "react-measure";

import {
    type ChartFillType,
    ColorLegend,
    type IPushpinCategoryLegendItem,
    Paging,
    type PositionType,
} from "@gooddata/sdk-ui-vis-commons";

import { generateLegendColorData } from "./geoChartColor.js";
import { getAvailableLegends } from "./helpers/geoChart/data.js";
import {
    getPushpinColorLegendSize,
    getPushpinColorLegendTitle,
    getPushpinSizeLegendTitle,
    isSmallPushpinSizeLegend,
    shouldRenderCircleLegendInsidePopUp,
    shouldRenderMiddleCircle,
} from "./helpers/geoChart/responsive.js";
import { HEIGHT_OF_SIZE_LEGEND, PushpinCategoryLegend } from "./legends/PushpinCategoryLegend.js";
import { PushpinSizeLegend } from "./legends/PushpinSizeLegend.js";
import { type IAvailableLegends, type IGeoData } from "../../GeoChart.js";

const HEIGHT_OF_COLOR_LEGEND = 210;

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const Measure = defaultImport(ReactMeasure);

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
    chartFill?: ChartFillType;
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

export function GeoChartLegendRenderer(props: IGeoChartLegendRendererProps): ReactElement | null {
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
): ReactElement | null {
    const { contentRect, renderPopUp } = props;
    const { hasSizeLegend } = availableLegends;
    const classNames = cx(getClassnames(props, availableLegends));
    return (
        <Measure client>
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

function ColorAndSizeLegendWithPaging(props: IColorAndSizeLegendWithPagingProps): ReactElement {
    const [page, setPage] = useState<number>(1);

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
): ReactElement {
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
): ReactElement | null {
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
): ReactElement | null {
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
): ReactElement | null {
    if (!hasSizeLegend) {
        return null;
    }

    const { geoData, numericSymbols = [], responsive, contentRect } = props;

    if (!geoData?.size) {
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
): ReactElement | null {
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
