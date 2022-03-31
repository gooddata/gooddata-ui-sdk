// (C) 2007-2022 GoodData Corporation
/**
 * This package provides a set of React-based chart visualizations that you can use to visualize your data.
 *
 * @remarks
 * These include bar charts, pie charts, line charts, and more.
 * For a table visualization, see the `@gooddata/sdk-ui-pivot` package.
 * For map-based charts, see the `@gooddata/sdk-ui-geo` package.
 *
 * @packageDocumentation
 */
export * from "./interfaces";
export * from "./charts";
export {
    ColorUtils,
    TOP,
    BOTTOM,
    MIDDLE,
    isAreaChart,
    isBarChart,
    isBubbleChart,
    isBulletChart,
    isColumnChart,
    isComboChart,
    isDonutChart,
    isHeatmap,
    isFunnel,
    isLineChart,
    isPieChart,
    isPieOrDonutChart,
    isScatterPlot,
    isTreemap,
    updateConfigWithSettings,
} from "./highcharts";

// export the getColorMappingPredicate so that users can import it directly without having to explicitly install vis-commons
export { getColorMappingPredicate } from "@gooddata/sdk-ui-vis-commons";
