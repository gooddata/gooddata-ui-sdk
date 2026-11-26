// (C) 2026 GoodData Corporation

import { type IDataView } from "@gooddata/sdk-backend-spi";
import { type ITheme } from "@gooddata/sdk-model";
import { DefaultLocale, type ExplicitDrill, type ILocale, type OnFiredDrillEvent } from "@gooddata/sdk-ui";

import { type IChartConfig } from "../../interfaces/chartConfig.js";
import { type OnLegendReady } from "../../interfaces/chartProps.js";
import { RawChart } from "../_base/RawChart.js";

/**
 * Chart types renderable by {@link StaticDataChart}.
 *
 * @alpha
 */
export type StaticDataChartType = "bar" | "column" | "line" | "pie" | "scatter";

/**
 * Props of the {@link StaticDataChart} component.
 *
 * @alpha
 */
export interface IStaticDataChartProps {
    /**
     * Data to render, provided as a ready-made data view.
     *
     * @remarks
     * The data view carries the execution definition (buckets, attributes, measures, dimensions),
     * the dimension descriptors with header items, and the data values. It does not have to originate
     * from a live execution - it can be assembled in memory.
     */
    dataView: IDataView;

    /**
     * Type of chart to render the data as.
     */
    type: StaticDataChartType;

    /**
     * Chart configuration (legend, data labels, color palette, ...).
     */
    config?: IChartConfig;

    /**
     * Height of the chart in pixels.
     *
     * @remarks
     * When not specified, the chart measures and fills its container.
     */
    height?: number;

    /**
     * Width of the chart in pixels.
     *
     * @remarks
     * When not specified, the chart measures and fills its container.
     */
    width?: number;

    /**
     * Locale for chart texts such as legend paging or empty value labels.
     *
     * @remarks
     * Defaults to en-US.
     */
    locale?: ILocale;

    /**
     * Theme to render the chart with.
     *
     * @remarks
     * The component does not read the theme from React context; pass it explicitly when theming is desired.
     */
    theme?: ITheme;

    /**
     * Items the user can drill on.
     */
    drillableItems?: ExplicitDrill[];

    /**
     * Called when the user drills into a chart element.
     */
    onDrill?: OnFiredDrillEvent;

    /**
     * Called when the chart legend is rendered.
     */
    onLegendReady?: OnLegendReady;

    /**
     * Called after the chart rendered.
     */
    afterRender?: () => void;

    /**
     * Called when the data exceeds the chart limits (either the optional `config.limits` or the
     * hard limits of the chart type).
     *
     * @remarks
     * The chart renders empty in that case; use this callback to show a custom error state.
     */
    onDataTooLarge?: (chartOptions: unknown, errorMessage?: string) => void;

    /**
     * Called when the data contains negative values that the chart type cannot display (pie chart).
     *
     * @remarks
     * The chart renders empty in that case; use this callback to show a custom error state.
     */
    onNegativeValues?: (chartOptions: unknown) => void;
}

/**
 * StaticDataChart renders a chart from data provided up front, without an analytical backend.
 *
 * @remarks
 * Unlike {@link BarChart} and the other bucket components, which obtain their data by executing
 * against a backend, StaticDataChart accepts the finished data view directly and only visualizes it.
 * This makes it suitable for environments with no backend access at all, such as offline rendering
 * or sandboxed iframes with embedded data.
 *
 * The component is self-contained: it sets up its own intl and theme contexts, so it can be mounted
 * without any SDK providers.
 *
 * @alpha
 */
export function StaticDataChart(props: IStaticDataChartProps) {
    const {
        dataView,
        type,
        config = {},
        height,
        width,
        locale = DefaultLocale,
        theme,
        drillableItems = [],
        onDrill = () => true,
        onLegendReady = () => {},
        afterRender = () => {},
        onDataTooLarge = () => {},
        onNegativeValues = () => {},
    } = props;

    return (
        // The sized container matters: the chart measures its surroundings, and some chart
        // types (pie legend placement) render nothing inside an unsized container. Without
        // an explicit height, fill the consumer's container so the measured height resolves.
        <div style={{ height: height ?? "100%", width }}>
            <RawChart
                dataView={dataView}
                type={type}
                config={config}
                height={height}
                width={width}
                locale={locale}
                theme={theme}
                drillableItems={drillableItems}
                onDrill={onDrill}
                onLegendReady={onLegendReady}
                afterRender={afterRender}
                onDataTooLarge={onDataTooLarge}
                onNegativeValues={onNegativeValues}
            />
        </div>
    );
}
