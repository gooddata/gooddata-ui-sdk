// (C) 2007-2023 GoodData Corporation
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
export * from "./interfaces/index.js";
export * from "./charts/index.js";
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
    isPyramid,
    isLineChart,
    isPieChart,
    isPieOrDonutChart,
    isScatterPlot,
    isTreemap,
    isSankey,
    isDependencyWheel,
    isSankeyOrDependencyWheel,
    isWaterfall,
    updateConfigWithSettings,
} from "./highcharts/index.js";

// export the getColorMappingPredicate so that users can import it directly without having to explicitly install vis-commons
export { getColorMappingPredicate } from "@gooddata/sdk-ui-vis-commons";
