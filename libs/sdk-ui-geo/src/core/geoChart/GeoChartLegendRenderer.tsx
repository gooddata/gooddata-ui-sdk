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
    responsive?: boolean;
    showFluidLegend?: boolean;
    numericSymbols?: string[];
    onItemClick?: (item: IPushpinCategoryLegendItem) => void;
}

function getClassnames(props: IGeoChartLegendRendererProps, availableLegends: IAvailableLegends): string {
    const { position, responsive, showFluidLegend } = props;
    const { hasSizeLegend } = availableLegends;

    const isFluidLegend = Boolean(responsive && showFluidLegend);
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
): JSX.Element {
    const { hasSizeLegend } = availableLegends;
    const classNames = getClassnames(props, availableLegends);

    return (
        <Measure client={true}>
            {({ measureRef, contentRect }: MeasuredComponentProps) => {
                return (
                    <div className={classNames} ref={measureRef}>
                        {renderPushpinCategoryLegend(props, contentRect, hasSizeLegend)}
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

function ColorAndSizeLegendWithPaging(props: IColorAndSizeLegendWithPagingProps): React.ReactElement {
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

function renderPushpinColorLegend(props: IGeoChartLegendRendererProps, hasColorLegend: boolean) {
    if (!hasColorLegend) {
        return null;
    }

    const {
        geoData,
        position = "top",
        responsive,
        showFluidLegend,
        colorLegendValue,
        numericSymbols = [],
    } = props;

    const data = geoData!.color!.data;
    const format = geoData!.color!.format;

    const dataWithoutNull = data.filter(isFinite);
    const colorData = generateLegendColorData(dataWithoutNull, colorLegendValue);
    const isSmall: boolean = Boolean(responsive && showFluidLegend);

    return (
        <ColorLegend
            data={colorData}
            format={format}
            size={isSmall ? "medium" : "large"}
            numericSymbols={numericSymbols}
            position={position}
        />
    );
}

function renderPushpinCategoryLegend(
    props: IGeoChartLegendRendererProps,
    contentRect: ContentRect,
    hasSizeLegend: boolean,
): JSX.Element {
    return <PushpinCategoryLegend {...props} contentRect={contentRect} hasSizeLegend={hasSizeLegend} />;
}

function renderPushpinSizeLegend(
    props: IGeoChartLegendRendererProps,
    hasSizeLegend: boolean,
): JSX.Element | null {
    if (!hasSizeLegend) {
        return null;
    }

    const { geoData, numericSymbols = [] } = props;

    if (!geoData || !geoData.size) {
        return null;
    }

    const {
        size: { data, format, name },
    } = geoData;

    return (
        <PushpinSizeLegend format={format} measureName={name} numericSymbols={numericSymbols} sizes={data} />
    );
}
