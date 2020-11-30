// (C) 2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import get from "lodash/get";
import throttle from "lodash/throttle";
import noop from "lodash/noop";
import invariant from "ts-invariant";

import { WrappedComponentProps } from "react-intl";
import Measure, { MeasuredComponentProps } from "react-measure";
import { IGeoConfig, IGeoData, IGeoLngLat } from "../../GeoChart";
import GeoChartRenderer, { IGeoChartRendererProps } from "./GeoChartRenderer";
import GeoChartLegendRenderer, { IGeoChartLegendRendererProps } from "./GeoChartLegendRenderer";
import { getAvailableLegends } from "./helpers/geoChart/data";
import {
    IntlWrapper,
    IntlTranslationsProvider,
    ITranslationsComponentProps,
    IColorAssignment,
    convertDrillableItemsToPredicates,
    IDrillConfig,
    ILoadingInjectedProps,
    IDataVisualizationProps,
} from "@gooddata/sdk-ui";
import {
    IColorStrategy,
    IPushpinCategoryLegendItem,
    LegendPosition,
    PositionType,
    shouldShowFluid,
    SupportedLegendPositions,
} from "@gooddata/sdk-ui-vis-commons";
import { isColorAssignmentItemChanged, isFluidLegendEnabled } from "./helpers/geoChart/common";
import { IColorPalette } from "@gooddata/sdk-model";

export { IGeoChartRendererProps, IGeoChartLegendRendererProps };

function renderChart(props: IGeoChartRendererProps): React.ReactElement {
    return <GeoChartRenderer {...props} />;
}

function renderLegend(props: IGeoChartLegendRendererProps): React.ReactElement {
    return (
        <IntlWrapper locale={props.locale}>
            <IntlTranslationsProvider>
                {(translationProps: ITranslationsComponentProps) => (
                    <GeoChartLegendRenderer {...props} numericSymbols={translationProps.numericSymbols} />
                )}
            </IntlTranslationsProvider>
        </IntlWrapper>
    );
}

/**
 * @internal
 */
export interface ICoreGeoChartProps extends IDataVisualizationProps {
    config?: IGeoConfig;
    height?: number;
    documentObj?: Document;
    chartRenderer?: (props: IGeoChartRendererProps) => React.ReactElement;
    legendRenderer?: (props: IGeoChartLegendRendererProps) => React.ReactElement;
    onCenterPositionChanged?: (center: IGeoLngLat) => void;
    onZoomChanged?: (zoom: number) => void;
    geoChartOptions?: IGeoChartInnerOptions;
}

/**
 * @internal
 */
export type IGeoChartInnerProps = ICoreGeoChartProps & ILoadingInjectedProps & WrappedComponentProps;

export interface IGeoChartInnerState {
    enabledLegendItems: boolean[];
    showFluidLegend: boolean;
    colorAssignmentItem: IColorAssignment[];
}
/**
 * @internal
 */
export interface IGeoChartInnerOptions {
    geoData: IGeoData;
    categoryItems: IPushpinCategoryLegendItem[];
    colorStrategy: IColorStrategy;
    colorPalette: IColorPalette;
}

const DefaultGeoConfig: IGeoConfig = {
    mapboxToken: "",
};

/**
 * Geo Chart react component
 */
export class GeoChartInner extends React.PureComponent<IGeoChartInnerProps, IGeoChartInnerState> {
    public static getDerivedStateFromProps(
        nextProps: IGeoChartInnerProps,
        prevState: IGeoChartInnerState,
    ): Partial<IGeoChartInnerState> | null {
        const { geoChartOptions } = nextProps;

        if (!geoChartOptions) {
            return null;
        }

        const { categoryItems, colorStrategy } = geoChartOptions;
        const colorAssignmentItem = colorStrategy.getColorAssignment();

        if (!isColorAssignmentItemChanged(prevState.colorAssignmentItem, colorAssignmentItem)) {
            return null;
        }

        return {
            enabledLegendItems: new Array(categoryItems.length).fill(true),
            colorAssignmentItem,
        };
    }

    private readonly throttledOnWindowResize: ReturnType<typeof throttle>;

    public constructor(props: IGeoChartInnerProps) {
        super(props);

        const { documentObj = document } = this.props;

        this.state = {
            enabledLegendItems: [],
            showFluidLegend: shouldShowFluid(documentObj),
            colorAssignmentItem: [],
        };
        this.throttledOnWindowResize = throttle(this.onWindowResize, 100);
    }

    public componentDidMount(): void {
        this.updateConfigurationPanel(this.props.geoChartOptions);
        window.addEventListener("resize", this.throttledOnWindowResize);
    }

    public componentDidUpdate(): void {
        this.updateConfigurationPanel(this.props.geoChartOptions);
    }

    public componentWillUnmount(): void {
        this.throttledOnWindowResize.cancel();
        window.removeEventListener("resize", this.throttledOnWindowResize);
    }

    public render(): React.ReactElement {
        const { height } = this.props;
        if (height !== undefined) {
            return this.renderVisualizationContent(undefined, height);
        }

        return (
            <Measure client={true}>
                {({ measureRef, contentRect }: MeasuredComponentProps) => {
                    const { client: contentRectClient } = contentRect;
                    return this.renderVisualizationContent(
                        measureRef,
                        (contentRectClient && contentRectClient.height) ?? 0,
                    );
                }}
            </Measure>
        );
    }

    private renderVisualizationContent(
        measureRef: MeasuredComponentProps["measureRef"] | undefined,
        height: number,
    ): React.ReactElement {
        const { geoChartOptions: geoChartOptionsProp } = this.props;
        const geoChartOptions = this.syncWithLegendItemStates(geoChartOptionsProp);
        const position = this.getLegendPosition();
        const classes = this.getContainerClassName(position);
        const isLegendRenderedFirst: boolean =
            position === LegendPosition.TOP ||
            (position === LegendPosition.LEFT && !this.state.showFluidLegend);
        const legendComponent = this.renderLegend(height, position, geoChartOptions);

        return (
            <div className={classes} ref={measureRef}>
                {isLegendRenderedFirst && legendComponent}
                {this.renderChart(geoChartOptions)}
                {!isLegendRenderedFirst && legendComponent}
            </div>
        );
    }

    private syncWithLegendItemStates(
        geoChartOptions: IGeoChartInnerOptions | undefined,
    ): IGeoChartInnerOptions {
        invariant(geoChartOptions, "illegal state - trying to sync legend with no geo options");

        const { categoryItems } = geoChartOptions!;
        const { enabledLegendItems } = this.state;

        const withLegendItemStates = categoryItems.map(
            (item: IPushpinCategoryLegendItem, index: number): IPushpinCategoryLegendItem => ({
                ...item,
                isVisible: enabledLegendItems[index],
            }),
        );

        return {
            ...geoChartOptions,
            categoryItems: withLegendItemStates,
        };
    }

    private getContainerClassName(position: PositionType): string {
        const responsive = this.props.config?.legend?.responsive ?? false;

        const flexDirection = this.getFlexDirection(position);
        return cx("viz-line-family-chart-wrap", "gd-geo-component", "s-gd-geo-component", {
            "responsive-legend": responsive,
            "non-responsive-legend": !responsive,
            [`flex-direction-${flexDirection}`]: true,
            "legend-position-bottom": position === LegendPosition.BOTTOM,
        });
    }

    private getFlexDirection(position: PositionType): string {
        const responsive = this.props.config?.legend?.responsive ?? false;
        const { showFluidLegend } = this.state;
        const isFluidLegend = isFluidLegendEnabled(responsive, showFluidLegend);

        if (position === LegendPosition.TOP || position === LegendPosition.BOTTOM || isFluidLegend) {
            return "column";
        }

        return "row";
    }

    private onLegendItemClick = (item: IPushpinCategoryLegendItem): void => {
        const enabledLegendItems: boolean[] = this.state.enabledLegendItems.map(
            (legendItem: boolean, index: number): boolean => {
                if (index === item.legendIndex) {
                    return !legendItem;
                }
                return legendItem;
            },
        );
        this.setState({ enabledLegendItems });
    };

    private getLegendPosition(): PositionType {
        const position = this.props.config?.legend?.position ?? LegendPosition.TOP;
        const isSupportedLegend = SupportedLegendPositions.indexOf(position) > -1;

        return isSupportedLegend ? position : LegendPosition.TOP;
    }

    private getLegendProps(
        height: number,
        position: PositionType,
        geoChartOptions: IGeoChartInnerOptions,
    ): IGeoChartLegendRendererProps {
        const responsive = this.props.config?.legend?.responsive ?? false;
        const { locale } = this.props;
        const { enabledLegendItems, showFluidLegend } = this.state;

        const legendProps = {
            height,
            locale,
            position,
            responsive,
            showFluidLegend,
            onItemClick: this.onLegendItemClick,
        };
        const { geoData, colorStrategy, categoryItems } = geoChartOptions;
        const { segment } = geoData;
        const colorFormat = get(geoData, "color.format");
        const sizeFormat = get(geoData, "size.format");
        const propsFromData = {
            format: colorFormat || sizeFormat,
            geoData,
        };
        const colorLegendValue: string = colorStrategy.getColorByIndex(0);

        if (segment && enabledLegendItems.length) {
            return {
                ...legendProps,
                ...propsFromData,
                categoryItems,
                colorLegendValue,
            };
        }

        return {
            ...legendProps,
            ...propsFromData,
            colorLegendValue,
        };
    }

    private getChartProps(geoChartOptions: IGeoChartInnerOptions): IGeoChartRendererProps {
        const {
            config = DefaultGeoConfig,
            dataView,
            drillableItems = [],
            afterRender = noop,
            onCenterPositionChanged = noop,
            onDrill = noop,
            onZoomChanged = noop,
            intl,
        } = this.props;

        invariant(dataView, "invalid state - trying to render geo chart but there is no data to visualize");

        const { geoData, colorStrategy, categoryItems } = geoChartOptions;
        const segmentIndex: number = get(geoChartOptions, "geoData.segment.index");
        const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);
        const drillConfig: IDrillConfig = { dataView, onDrill };

        const chartProps: IGeoChartRendererProps = {
            colorStrategy,
            config,
            dataView,
            drillableItems: drillablePredicates,
            drillConfig,
            afterRender,
            geoData,
            onCenterPositionChanged,
            onZoomChanged,
            intl,
        };

        if (segmentIndex) {
            const selectedSegmentItems: string[] = categoryItems.reduce(
                (result: string[], item: IPushpinCategoryLegendItem): string[] => {
                    if (item.isVisible) {
                        return [...result, item.uri];
                    }
                    return result;
                },
                [],
            );
            return {
                ...chartProps,
                config: { ...config, selectedSegmentItems },
            };
        }

        return chartProps;
    }

    private renderChart = (geoChartOptions: IGeoChartInnerOptions): React.ReactElement => {
        const { chartRenderer = renderChart } = this.props;
        const chartProps: IGeoChartRendererProps = this.getChartProps(geoChartOptions);
        return chartRenderer(chartProps);
    };

    private renderLegend = (
        height: number,
        position: PositionType,
        geoChartOptions: IGeoChartInnerOptions,
    ) => {
        const enabled = this.props.config?.legend?.enabled ?? true;
        const { legendRenderer = renderLegend } = this.props;

        if (!enabled) {
            return null;
        }

        const legendProps: IGeoChartLegendRendererProps = this.getLegendProps(
            height,
            position,
            geoChartOptions,
        );
        return legendRenderer(legendProps);
    };

    private onWindowResize = () => {
        const { documentObj = document } = this.props;

        this.setState({
            showFluidLegend: shouldShowFluid(documentObj),
        });
    };

    private updateConfigurationPanel(geoChartOptions: IGeoChartInnerOptions | undefined): void {
        invariant(geoChartOptions, "illegal state - updating config with no geo options");

        const { pushData } = this.props;
        const { categoryItems, geoData, colorStrategy, colorPalette } = geoChartOptions!;
        const { hasCategoryLegend, hasColorLegend, hasSizeLegend } = getAvailableLegends(
            categoryItems,
            geoData,
        );
        const isLegendVisible = hasCategoryLegend || hasColorLegend || hasSizeLegend;

        pushData?.({
            propertiesMeta: {
                // toggle legend section
                legend_enabled: isLegendVisible,
            },
            colors: {
                colorAssignments: colorStrategy.getColorAssignment(),
                colorPalette,
            },
        });
    }
}
