// (C) 2007-2022 GoodData Corporation
import React from "react";
import Measure, { Rect } from "react-measure";
import cx from "classnames";

import isEmpty from "lodash/isEmpty";

import { FluidLegend } from "./FluidLegend";
import { StaticLegend, IStaticLegendProps } from "./StaticLegend";
import { HeatmapLegend } from "./HeatmapLegend";
import { IntlWrapper, IntlTranslationsProvider, ITranslationsComponentProps } from "@gooddata/sdk-ui";
import { IColorLegendSize, IPushpinCategoryLegendItem, ItemBorderRadiusPredicate } from "./types";
import { PopUpLegend } from "./PopUpLegend/PopUpLegend";
import { TOP, BOTTOM } from "./PositionTypes";
import { ButtonsOrientationType } from "./Paging";

const HEATMAP_LEGEND_WIDTH_BREAKPOINT = 460;

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
    series: any;
    seriesMapper?: (visibleSeries: any) => any;
    format?: string;
    locale?: string;
    showFluidLegend?: boolean;
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    onItemClick(item: any): void;
    validateOverHeight(legendClient: Rect): void;
    contentDimensions: { width: number; height: number };
    containerId?: string;
}

/**
 * @internal
 */
export class Legend extends React.PureComponent<ILegendProps> {
    public static defaultProps = {
        responsive: false,
        legendItemsEnabled: [] as any,
        height: 0,
        showFluidLegend: false,
        isLegendOverHeight: false,
        enableBorderRadius: false,
    };

    public onItemClick = (item: IPushpinCategoryLegendItem): void => {
        this.props.onItemClick(item);
    };

    public getSeries = (): any => {
        const { series, legendItemsEnabled = [], seriesMapper } = this.props;

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
    };

    public renderPopUpLegend = (): React.ReactNode => {
        const { legendLabel, maximumRows, enableBorderRadius, containerId = "" } = this.props;

        return (
            <PopUpLegend
                containerId={containerId}
                series={this.getSeries()}
                maxRows={maximumRows}
                name={legendLabel}
                enableBorderRadius={enableBorderRadius}
                onLegendItemClick={this.onItemClick}
            />
        );
    };

    public renderFluid = (): React.ReactNode => {
        const { enableBorderRadius } = this.props;

        return (
            <Measure client={true}>
                {({ measureRef, contentRect }: any) => {
                    const usedWidth = contentRect.client?.width ? Math.floor(contentRect.client.width) : 0;
                    return (
                        <div className="viz-fluid-legend-wrap" ref={measureRef}>
                            <FluidLegend
                                series={this.getSeries()}
                                enableBorderRadius={enableBorderRadius}
                                onItemClick={this.onItemClick}
                                containerWidth={usedWidth}
                            />
                        </div>
                    );
                }}
            </Measure>
        );
    };

    public renderStatic = (): React.ReactNode => {
        const { position, height, enableBorderRadius, responsive, legendLabel: label } = this.props;

        const classNames = cx("viz-static-legend-wrap", `position-${position}`);

        const buttonOrientation: ButtonsOrientationType =
            responsive === "autoPositionWithPopup" ? "leftRight" : "upDown";

        const props: IStaticLegendProps = {
            containerHeight: 0,
            series: this.getSeries(),
            onItemClick: this.onItemClick,
            position,
            enableBorderRadius,
            buttonOrientation,
            label,
        };

        return (
            <Measure client={true}>
                {({ measureRef, contentRect }: any) => {
                    const measuredHeight = contentRect.client?.height
                        ? Math.floor(contentRect.client.height)
                        : 0;
                    const usedHeight = height || measuredHeight;

                    if (!isEmpty(contentRect.client)) {
                        this.props.validateOverHeight(contentRect.client);
                    }

                    return (
                        <div className={classNames} ref={measureRef}>
                            <StaticLegend {...props} containerHeight={usedHeight} />
                        </div>
                    );
                }}
            </Measure>
        );
    };

    public render(): React.ReactNode {
        const { contentDimensions, responsive, heatmapLegend, showFluidLegend, maximumRows } = this.props;

        if (heatmapLegend) {
            return this.renderHeatmapLegend(contentDimensions);
        }

        if (responsive === "autoPositionWithPopup" && maximumRows) {
            return this.renderPopUpLegend();
        }

        const isFluidLegend = responsive === true && showFluidLegend;
        if (isFluidLegend) {
            return this.renderFluid();
        }

        return this.renderStatic();
    }

    private renderHeatmapLegend = (contentDimensions: { width: number; height: number }): React.ReactNode => {
        const { locale, format, responsive, position, legendLabel } = this.props;
        const { showFluidLegend } = this.props;
        const series = this.getSeries();
        const isFluidResponsive = Boolean(responsive === true && showFluidLegend);
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
    };
}
