// (C) 2020-2026 GoodData Corporation

import { type ReactElement, Suspense, lazy, useEffect, useRef, useState } from "react";

import cx from "classnames";
import { defaultImport } from "default-import";
import { throttle } from "lodash-es";
import { type WrappedComponentProps } from "react-intl";
import ReactMeasure, { type ContentRect, type MeasuredComponentProps } from "react-measure";
import { invariant } from "ts-invariant";
import { v4 } from "uuid";

import { type IColorPalette, type ITheme } from "@gooddata/sdk-model";
import {
    type IColorAssignment,
    type IDataVisualizationProps,
    type IDrillConfig,
    type ILoadingInjectedProps,
    type ITranslationsComponentProps,
    IntlTranslationsProvider,
    IntlWrapper,
    convertDrillableItemsToPredicates,
} from "@gooddata/sdk-ui";
import {
    type IColorStrategy,
    type ILegendDetailOptions,
    type ILegendDetails,
    type IPushpinCategoryLegendItem,
    LegendPosition,
    type PositionType,
    SupportedLegendPositions,
    getLegendDetails as getCommonVisLegendDetails,
    shouldShowFluid,
} from "@gooddata/sdk-ui-vis-commons";

import { type IGeoConfig, type IGeoData } from "../../GeoChart.js";
import type { IGeoLngLat } from "../../publicTypes/geoCommon.js";

import { GeoChartLegendRenderer, type IGeoChartLegendRendererProps } from "./GeoChartLegendRenderer.js";
import { type IGeoChartRendererProps } from "./GeoChartRenderer.js";
import { isColorAssignmentItemChanged, isFluidLegendEnabled } from "./helpers/geoChart/common.js";
import { getAvailableLegends } from "./helpers/geoChart/data.js";
import { getResponsiveInfo, isAutoPositionWithPopup } from "./helpers/geoChart/responsive.js";

const GeoChartRendererLazy = lazy(() =>
    import("./GeoChartRenderer.js").then((module) => ({
        default: module.GeoChartRenderer,
    })),
);

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const Measure = defaultImport(ReactMeasure);

function defaultChartRenderer(props: IGeoChartRendererProps): ReactElement {
    return (
        <Suspense fallback={null}>
            <GeoChartRendererLazy {...props} />
        </Suspense>
    );
}

function defaultLegendRenderer(props: IGeoChartLegendRendererProps): ReactElement {
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
 * Geo Chart react component.
 *
 * Renders the map itself (through `chartRenderer`) together with its legend (through `legendRenderer`),
 * laid out according to the resolved legend position, and keeps the visibility of the individual legend
 * items in sync with the chart. It is the innermost piece of the core geo chart: it expects an already
 * resolved data view and the derived {@link IGeoChartInnerOptions} in its props, so it neither triggers
 * an execution nor validates the data on its own.
 *
 * @param props - {@link IGeoChartInnerProps}; on top of the core geo chart props (`config`, `dataView`,
 *  `height`, `documentObj`, `chartRenderer`, `legendRenderer`, the `onCenterPositionChanged` /
 *  `onZoomChanged` / `onDrill` / `pushData` callbacks) it requires `geoChartOptions` prepared by
 *  `GeoChartOptionsWrapper` and `intl` injected by the wrapping HOC.
 *
 * @internal
 */
export function GeoChartInner(props: IGeoChartInnerProps): ReactElement {
    const { config, geoChartOptions: geoChartOptionsProp, height } = props;

    // lazily initialized so that v4() is called just once per instance and not on every render
    const [containerId] = useState(() => `geo-${v4()}`);

    // keeps the latest documentObj available to the throttled resize handler without re-creating it;
    // written in an effect so that a render discarded by React cannot mutate it
    const documentObjRef = useRef<Document | undefined>(props.documentObj);
    useEffect(() => {
        documentObjRef.current = props.documentObj;
    });

    const [state, setState] = useState<IGeoChartInnerState>(() => ({
        enabledLegendItems: [],
        showFluidLegend: shouldShowFluid(props.documentObj ?? document),
        colorAssignmentItem: [],
    }));

    // replacement of getDerivedStateFromProps: adjusting the state during render is the sanctioned way
    // of keeping the state in sync with the props; the value merged here is used by this very render
    let currentState = state;
    if (geoChartOptionsProp) {
        const { categoryItems, colorStrategy } = geoChartOptionsProp;
        const colorAssignmentItem = colorStrategy.getColorAssignment();

        if (isColorAssignmentItemChanged(state.colorAssignmentItem, colorAssignmentItem)) {
            const enabledLegendItems = new Array<boolean>(categoryItems.length).fill(true);
            currentState = { ...state, enabledLegendItems, colorAssignmentItem };
            setState((prev) => ({ ...prev, enabledLegendItems, colorAssignmentItem }));
        }
    }

    const { enabledLegendItems, showFluidLegend } = currentState;

    const updateConfigurationPanel = (geoChartOptions: IGeoChartInnerOptions | undefined): void => {
        invariant(geoChartOptions, "illegal state - updating config with no geo options");

        const { pushData } = props;
        const { categoryItems, geoData, colorStrategy, colorPalette } = geoChartOptions;
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
    };

    // runs after every commit, matching the original componentDidMount + componentDidUpdate
    useEffect(() => {
        updateConfigurationPanel(geoChartOptionsProp);
    });

    // the throttled handler is created inside the effect so that it is guaranteed to live exactly as long as
    // the registered listener does - unlike a useMemo cache, which React may throw away at any time
    useEffect(() => {
        const throttledOnWindowResize = throttle(() => {
            setState((prev) => ({
                ...prev,
                showFluidLegend: shouldShowFluid(documentObjRef.current ?? document),
            }));
        }, 100);

        window.addEventListener("resize", throttledOnWindowResize);

        return () => {
            throttledOnWindowResize.cancel();
            window.removeEventListener("resize", throttledOnWindowResize);
        };
    }, []);

    const responsiveInfo = getResponsiveInfo(config?.legend?.responsive);
    const isFluidLegend = isAutoPositionWithPopup(responsiveInfo)
        ? false
        : isFluidLegendEnabled(responsiveInfo, showFluidLegend);

    const syncWithLegendItemStates = (
        geoChartOptions: IGeoChartInnerOptions | undefined,
    ): IGeoChartInnerOptions => {
        invariant(geoChartOptions, "illegal state - trying to sync legend with no geo options");

        const { categoryItems } = geoChartOptions;

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
    };

    const getFlexDirection = (position: PositionType): string => {
        if (position === LegendPosition["TOP"] || position === LegendPosition["BOTTOM"] || isFluidLegend) {
            return "column";
        }

        return "row";
    };

    const getContainerClassName = (position: PositionType): string => {
        const responsive = getResponsiveInfo(config?.legend?.responsive) === true;

        const flexDirection = getFlexDirection(position);
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
            containerId,
        );
    };

    const onLegendItemClick = (item: IPushpinCategoryLegendItem): void => {
        setState((prev) => ({
            ...prev,
            enabledLegendItems: prev.enabledLegendItems.map((legendItem: boolean, index: number): boolean => {
                if (index === item.legendIndex) {
                    return !legendItem;
                }
                return legendItem;
            }),
        }));
    };

    const getLegendPosition = (): PositionType => {
        const position = config?.legend?.position ?? LegendPosition["TOP"];
        const isSupportedLegend = SupportedLegendPositions.indexOf(position) > -1;

        return isSupportedLegend ? position : LegendPosition["TOP"];
    };

    const getLegendDetails = (position: PositionType, contentRect?: ContentRect): ILegendDetails | null => {
        const geoChartOptions = syncWithLegendItemStates(geoChartOptionsProp);
        const { geoData } = geoChartOptions;
        const legendLabel = geoData?.segment?.name;
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
    };

    const getLegendProps = (
        height: number,
        position: PositionType,
        geoChartOptions: IGeoChartInnerOptions,
        contentRect?: ContentRect,
    ): IGeoChartLegendRendererProps => {
        const responsive = config?.legend?.responsive;
        const { locale } = props;
        const { geoData, colorStrategy, categoryItems } = geoChartOptions;
        const { segment } = geoData;
        const colorFormat = geoData.color?.format;
        const sizeFormat = geoData.size?.format;
        const propsFromData = {
            format: colorFormat || sizeFormat,
            geoData,
        };
        const colorLegendValue: string = colorStrategy.getColorByIndex(0);
        const legendDetails = getLegendDetails(position, contentRect);
        let legendProps: Partial<IGeoChartLegendRendererProps> = {
            height,
            locale,
            position,
            responsive,
            isFluidLegend,
            onItemClick: onLegendItemClick,
            contentRect,
            containerId,
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
    };

    const getChartProps = (geoChartOptions: IGeoChartInnerOptions): IGeoChartRendererProps => {
        const {
            config: configWithDefault = DefaultGeoConfig,
            dataView,
            drillableItems = [],
            afterRender = () => {},
            onCenterPositionChanged = () => {},
            onDrill = () => {},
            onZoomChanged = () => {},
            intl,
            onError,
        } = props;

        invariant(dataView, "invalid state - trying to render geo chart but there is no data to visualize");

        const { geoData, colorStrategy, categoryItems } = geoChartOptions;
        const segmentIndex = geoChartOptions.geoData.segment?.index;
        const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);
        const drillConfig: IDrillConfig = { dataView, onDrill };

        const chartProps: IGeoChartRendererProps = {
            colorStrategy,
            config: configWithDefault,
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
                config: { ...configWithDefault, selectedSegmentItems },
            };
        }

        return chartProps;
    };

    const renderChart = (geoChartOptions: IGeoChartInnerOptions): ReactElement => {
        const { chartRenderer = defaultChartRenderer } = props;
        const chartProps: IGeoChartRendererProps = getChartProps(geoChartOptions);
        return chartRenderer(chartProps);
    };

    const renderLegend = (
        height: number,
        position: PositionType,
        geoChartOptions: IGeoChartInnerOptions,
        contentRect?: ContentRect,
    ) => {
        const enabled = config?.legend?.enabled ?? true;
        const { legendRenderer = defaultLegendRenderer } = props;

        if (!enabled) {
            return null;
        }

        const legendProps: IGeoChartLegendRendererProps = getLegendProps(
            height,
            position,
            geoChartOptions,
            contentRect,
        );
        return legendRenderer(legendProps);
    };

    const renderVisualizationContent = (
        measureRef: MeasuredComponentProps["measureRef"] | undefined,
        height: number,
        contentRect?: ContentRect,
    ): ReactElement => {
        const geoChartOptions = syncWithLegendItemStates(geoChartOptionsProp);
        const legendDetails = getLegendDetails(getLegendPosition(), contentRect);
        const position = legendDetails ? legendDetails.position : LegendPosition["TOP"];
        const classes = getContainerClassName(position);
        const isLegendRenderedFirst: boolean =
            position === LegendPosition["TOP"] ||
            (position === LegendPosition["LEFT"] && (!showFluidLegend || !!config?.respectLegendPosition));
        const legendComponent = renderLegend(height, position, geoChartOptions, contentRect);

        return (
            <div className={classes} ref={measureRef}>
                {isLegendRenderedFirst ? legendComponent : null}
                {renderChart(geoChartOptions)}
                {isLegendRenderedFirst ? null : legendComponent}
            </div>
        );
    };

    if (height !== undefined && !isAutoPositionWithPopup(config?.legend?.responsive)) {
        return renderVisualizationContent(undefined, height);
    }

    return (
        <Measure client>
            {({ measureRef, contentRect }: MeasuredComponentProps) => {
                const { client: contentRectClient } = contentRect;
                return renderVisualizationContent(measureRef, contentRectClient?.height ?? 0, contentRect);
            }}
        </Measure>
    );
}
