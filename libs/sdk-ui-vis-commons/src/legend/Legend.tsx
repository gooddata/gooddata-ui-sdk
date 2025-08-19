// (C) 2007-2025 GoodData Corporation
import React, { memo, useCallback } from "react";

import cx from "classnames";
import { defaultImport } from "default-import";
import isEmpty from "lodash/isEmpty.js";
import ReactMeasure, { Rect } from "react-measure";

import { ITranslationsComponentProps, IntlTranslationsProvider, IntlWrapper } from "@gooddata/sdk-ui";

import { FluidLegend } from "./FluidLegend.js";
import { HeatmapLegend } from "./HeatmapLegend.js";
import { ButtonsOrientationType } from "./Paging.js";
import { PopUpLegend } from "./PopUpLegend/PopUpLegend.js";
import { BOTTOM, TOP } from "./PositionTypes.js";
import { IStaticLegendProps, StaticLegend } from "./StaticLegend.js";
import { IColorLegendSize, ISeriesItem, ItemBorderRadiusPredicate } from "./types.js";

const HEATMAP_LEGEND_WIDTH_BREAKPOINT = 460;

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const Measure = defaultImport(ReactMeasure);

/**
 * @internal
 */
export interface ILegendProps {
    legendLabel?: string;
    maximumRows?: number;
    responsive?: boolean | "autoPositionWithPopup";
    legendItemsEnabled?: any[];
    height?: number;
    position: string;
    heatmapLegend?: boolean;
    series: ISeriesItem[];
    seriesMapper?: (visibleSeries: any) => any;
    format?: string;
    locale?: string;
    showFluidLegend?: boolean;
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    onItemClick(item: ISeriesItem): void;
    validateOverHeight(legendClient: Rect): void;
    contentDimensions: { width: number; height: number };
    containerId?: string;
}

/**
 * @internal
 */
export const Legend = memo(function Legend({
    responsive = false,
    legendItemsEnabled = [] as any,
    height = 0,
    showFluidLegend = false,
    enableBorderRadius = false,
    series,
    seriesMapper,
    onItemClick: onItemClickProp,
    legendLabel,
    maximumRows,
    containerId = "",
    position,
    heatmapLegend,
    contentDimensions,
    locale,
    format,
    validateOverHeight,
}: ILegendProps) {
    const onItemClick = useCallback(
        (item: ISeriesItem) => {
            onItemClickProp(item);
        },
        [onItemClickProp],
    );

    const getSeries = useCallback(() => {
        const seriesWithVisibility = series.map((seriesItem: any) => {
            const isVisible = legendItemsEnabled[seriesItem.legendIndex];
            return {
                ...seriesItem,
                isVisible,
            };
        });

        if (seriesMapper) {
            return seriesMapper(seriesWithVisibility);
        }

        return seriesWithVisibility;
    }, [legendItemsEnabled, series, seriesMapper]);

    const renderPopUpLegend = () => {
        return (
            <PopUpLegend
                containerId={containerId}
                series={getSeries()}
                maxRows={maximumRows}
                name={legendLabel}
                enableBorderRadius={enableBorderRadius}
                onLegendItemClick={onItemClick}
            />
        );
    };

    const renderFluid = () => {
        return (
            <Measure client={true} aria-label="Fluid legend">
                {({ measureRef, contentRect }: any) => {
                    const usedWidth = contentRect.client?.width ? Math.floor(contentRect.client.width) : 0;
                    return (
                        <div className="viz-fluid-legend-wrap" ref={measureRef}>
                            <FluidLegend
                                series={getSeries()}
                                enableBorderRadius={enableBorderRadius}
                                onItemClick={onItemClick}
                                containerWidth={usedWidth}
                            />
                        </div>
                    );
                }}
            </Measure>
        );
    };

    const renderStatic = () => {
        const classNames = cx("viz-static-legend-wrap", `position-${position}`);

        const buttonOrientation: ButtonsOrientationType =
            responsive === "autoPositionWithPopup" ? "leftRight" : "upDown";

        const propsForStaticLegend: IStaticLegendProps = {
            containerHeight: 0,
            series: getSeries(),
            onItemClick: onItemClick,
            position,
            enableBorderRadius,
            buttonOrientation,
            label: legendLabel,
        };

        return (
            <Measure client={true}>
                {({ measureRef, contentRect }: any) => {
                    const measuredHeight = contentRect.client?.height
                        ? Math.floor(contentRect.client.height)
                        : 0;
                    const usedHeight = height || measuredHeight;

                    if (!isEmpty(contentRect.client)) {
                        validateOverHeight(contentRect.client);
                    }

                    return (
                        <div className={classNames} ref={measureRef}>
                            <StaticLegend {...propsForStaticLegend} containerHeight={usedHeight} />
                        </div>
                    );
                }}
            </Measure>
        );
    };

    const renderHeatmapLegend = useCallback(
        (contentDimensions: { width: number; height: number }): React.ReactNode => {
            const series = getSeries();
            const isFluidResponsive = Boolean(responsive && showFluidLegend);
            const isPopupResponsive =
                (position === TOP || position === BOTTOM) &&
                responsive === "autoPositionWithPopup" &&
                contentDimensions.width &&
                contentDimensions.width < HEATMAP_LEGEND_WIDTH_BREAKPOINT;

            let size: IColorLegendSize = "large";
            if (isFluidResponsive) {
                size = "medium";
            }
            if (isPopupResponsive) {
                size = "small";
            }

            return (
                <IntlWrapper locale={locale}>
                    <IntlTranslationsProvider>
                        {(props: ITranslationsComponentProps) => (
                            <HeatmapLegend
                                title={legendLabel}
                                series={series}
                                format={format}
                                size={size}
                                numericSymbols={props.numericSymbols}
                                position={position}
                            />
                        )}
                    </IntlTranslationsProvider>
                </IntlWrapper>
            );
        },
        [format, getSeries, legendLabel, locale, position, responsive, showFluidLegend],
    );

    if (heatmapLegend) {
        return renderHeatmapLegend(contentDimensions);
    }

    if (responsive === "autoPositionWithPopup" && maximumRows) {
        return renderPopUpLegend();
    }

    const isFluidLegend = responsive && showFluidLegend;
    if (isFluidLegend) {
        return renderFluid();
    }

    return renderStatic();
});
