// (C) 2020-2025 GoodData Corporation

import { PureComponent, ReactElement, Suspense, lazy } from "react";

import cx from "classnames";
import { defaultImport } from "default-import";
import noop from "lodash/noop.js";
import throttle from "lodash/throttle.js";
import { WrappedComponentProps } from "react-intl";
import ReactMeasure, { ContentRect, MeasuredComponentProps } from "react-measure";
import { invariant } from "ts-invariant";
import { v4 } from "uuid";

import { IColorPalette, ITheme } from "@gooddata/sdk-model";
import {
    IColorAssignment,
    IDataVisualizationProps,
    IDrillConfig,
    ILoadingInjectedProps,
    ITranslationsComponentProps,
    IntlTranslationsProvider,
    IntlWrapper,
    convertDrillableItemsToPredicates,
} from "@gooddata/sdk-ui";
import {
    IColorStrategy,
    ILegendDetailOptions,
    ILegendDetails,
    IPushpinCategoryLegendItem,
    LegendPosition,
    PositionType,
    SupportedLegendPositions,
    getLegendDetails as getCommonVisLegendDetails,
    shouldShowFluid,
} from "@gooddata/sdk-ui-vis-commons";

import GeoChartLegendRenderer, { IGeoChartLegendRendererProps } from "./GeoChartLegendRenderer.js";
import type { IGeoChartRendererProps } from "./GeoChartRenderer.js";
import { isColorAssignmentItemChanged, isFluidLegendEnabled } from "./helpers/geoChart/common.js";
import { getAvailableLegends } from "./helpers/geoChart/data.js";
import { getResponsiveInfo, isAutoPositionWithPopup } from "./helpers/geoChart/responsive.js";
import { IGeoConfig, IGeoData, IGeoLngLat } from "../../GeoChart.js";

export type { IGeoChartRendererProps, IGeoChartLegendRendererProps };

const GeoChartRendererLazy = lazy(() => import("./GeoChartRenderer.js"));

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const Measure = defaultImport(ReactMeasure);

function renderChart(props: IGeoChartRendererProps): ReactElement {
    return (
        <Suspense fallback={null}>
            <GeoChartRendererLazy {...props} />
        </Suspense>
    );
}

function renderLegend(props: IGeoChartLegendRendererProps): ReactElement {
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
    chartRenderer?: (props: IGeoChartRendererProps) => ReactElement;
    legendRenderer?: (props: IGeoChartLegendRendererProps) => ReactElement;
    onCenterPositionChanged?: (center: IGeoLngLat) => void;
    onZoomChanged?: (zoom: number) => void;
    geoChartOptions?: IGeoChartInnerOptions;
    theme?: ITheme;
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
export class GeoChartInner extends PureComponent<IGeoChartInnerProps, IGeoChartInnerState> {
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
    private readonly containerId = `geo-${v4()}`;

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

    public override componentDidMount(): void {
        this.updateConfigurationPanel(this.props.geoChartOptions);
        window.addEventListener("resize", this.throttledOnWindowResize);
    }

    public override componentDidUpdate(): void {
        this.updateConfigurationPanel(this.props.geoChartOptions);
    }

    public override componentWillUnmount(): void {
        this.throttledOnWindowResize.cancel();
        window.removeEventListener("resize", this.throttledOnWindowResize);
    }

    public override render(): ReactElement {
        const { height, config } = this.props;

        if (height !== undefined && !isAutoPositionWithPopup(config?.legend?.responsive)) {
            return this.renderVisualizationContent(undefined, height);
        }

        return (
            <Measure client={true}>
                {({ measureRef, contentRect }: MeasuredComponentProps) => {
                    const { client: contentRectClient } = contentRect;
                    return this.renderVisualizationContent(
                        measureRef,
                        contentRectClient?.height ?? 0,
                        contentRect,
                    );
                }}
            </Measure>
        );
    }

    private renderVisualizationContent(
        measureRef: MeasuredComponentProps["measureRef"] | undefined,
        height: number,
        contentRect?: ContentRect,
    ): ReactElement {
        const { geoChartOptions: geoChartOptionsProp } = this.props;
        const geoChartOptions = this.syncWithLegendItemStates(geoChartOptionsProp);
        const legendDetails = this.getLegendDetails(this.getLegendPosition(), contentRect);
        const position = legendDetails ? legendDetails.position : LegendPosition["TOP"];
        const classes = this.getContainerClassName(position);
        const isLegendRenderedFirst: boolean =
            position === LegendPosition["TOP"] ||
            (position === LegendPosition["LEFT"] &&
                (!this.state.showFluidLegend || !!this.props.config?.respectLegendPosition));
        const legendComponent = this.renderLegend(height, position, geoChartOptions, contentRect);

        return (
            <div className={classes} ref={measureRef}>
                {isLegendRenderedFirst ? legendComponent : null}
                {this.renderChart(geoChartOptions)}
                {isLegendRenderedFirst ? null : legendComponent}
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
        const responsive = getResponsiveInfo(this.props?.config?.legend?.responsive) === true;

        const flexDirection = this.getFlexDirection(position);
        return cx(
            "viz-line-family-chart-wrap",
            "gd-geo-component",
            "s-gd-geo-component",
            {
                "responsive-legend": responsive,
                "non-responsive-legend": !responsive,
                [`flex-direction-${flexDirection}`]: true,
                "legend-position-bottom": position === LegendPosition["BOTTOM"],
            },
            this.containerId,
        );
    }

    private getFlexDirection(position: PositionType): string {
        const isFluidLegend = this.isFluidLegend();

        if (position === LegendPosition["TOP"] || position === LegendPosition["BOTTOM"] || isFluidLegend) {
            return "column";
        }

        return "row";
    }

    private isFluidLegend(): boolean {
        const { showFluidLegend } = this.state;
        const responsive = getResponsiveInfo(this.props?.config?.legend?.responsive);
        return isAutoPositionWithPopup(responsive)
            ? false
            : isFluidLegendEnabled(responsive, showFluidLegend);
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
        const position = this.props.config?.legend?.position ?? LegendPosition["TOP"];
        const isSupportedLegend = SupportedLegendPositions.indexOf(position) > -1;

        return isSupportedLegend ? position : LegendPosition["TOP"];
    }

    private getLegendDetails(position: PositionType, contentRect?: ContentRect): ILegendDetails | null {
        const { geoChartOptions: geoChartOptionsProp, config } = this.props;
        const geoChartOptions = this.syncWithLegendItemStates(geoChartOptionsProp);
        const { geoData } = geoChartOptions;
        const legendLabel = geoData?.segment?.name;
        const isFluidLegend = this.isFluidLegend();
        const legendDetailOptions: ILegendDetailOptions = {
            showFluidLegend: isFluidLegend,
            contentRect,
            legendLabel,
        };
        return getCommonVisLegendDetails(
            position,
            getResponsiveInfo(config?.legend?.responsive),
            legendDetailOptions,
            config?.respectLegendPosition,
        );
    }

    private getLegendProps(
        height: number,
        position: PositionType,
        geoChartOptions: IGeoChartInnerOptions,
        contentRect?: ContentRect,
    ): IGeoChartLegendRendererProps {
        const responsive = this.props.config?.legend?.responsive;
        const { locale } = this.props;
        const { enabledLegendItems } = this.state;
        const isFluidLegend = this.isFluidLegend();
        const { geoData, colorStrategy, categoryItems } = geoChartOptions;
        const { segment } = geoData;
        const colorFormat = geoData.color?.format;
        const sizeFormat = geoData.size?.format;
        const propsFromData = {
            format: colorFormat || sizeFormat,
            geoData,
        };
        const colorLegendValue: string = colorStrategy.getColorByIndex(0);
        const legendDetails = this.getLegendDetails(position, contentRect);
        let legendProps: Partial<IGeoChartLegendRendererProps> = {
            height,
            locale,
            position,
            responsive,
            isFluidLegend,
            onItemClick: this.onLegendItemClick,
            contentRect,
            containerId: this.containerId,
        };

        if (legendDetails) {
            legendProps = {
                ...legendProps,
                maxRows: legendDetails.maxRows,
                name: legendDetails.name,
                renderPopUp: legendDetails.renderPopUp,
            };
        }

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
            onError,
        } = this.props;

        invariant(dataView, "invalid state - trying to render geo chart but there is no data to visualize");

        const { geoData, colorStrategy, categoryItems } = geoChartOptions;
        const segmentIndex = geoChartOptions.geoData.segment?.index;
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
            ...(onError ? { onError } : {}),
        };

        if (segmentIndex !== undefined) {
            const selectedSegmentItems = categoryItems
                .filter((item) => item.isVisible)
                .map((item) => item.uri);
            return {
                ...chartProps,
                config: { ...config, selectedSegmentItems },
            };
        }

        return chartProps;
    }

    private renderChart = (geoChartOptions: IGeoChartInnerOptions): ReactElement => {
        const { chartRenderer = renderChart } = this.props;
        const chartProps: IGeoChartRendererProps = this.getChartProps(geoChartOptions);
        return chartRenderer(chartProps);
    };

    private renderLegend = (
        height: number,
        position: PositionType,
        geoChartOptions: IGeoChartInnerOptions,
        contentRect?: ContentRect,
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
            contentRect,
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
