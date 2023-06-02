// (C) 2020-2023 GoodData Corporation
import { VisualizationTypes } from "@gooddata/sdk-ui";

export const supportedDualAxesChartTypes = [
    VisualizationTypes.COLUMN,
    VisualizationTypes.BAR,
    VisualizationTypes.BULLET,
    VisualizationTypes.LINE,
    VisualizationTypes.AREA,
    VisualizationTypes.COMBO,
    VisualizationTypes.COMBO2,
    VisualizationTypes.WATERFALL,
];
export const supportedTooltipFollowPointerChartTypes = [
    VisualizationTypes.COLUMN,
    VisualizationTypes.BAR,
    VisualizationTypes.BULLET,
    VisualizationTypes.COMBO,
    VisualizationTypes.COMBO2,
    VisualizationTypes.WATERFALL,
];
export const supportedStackingAttributesChartTypes = [
    VisualizationTypes.COLUMN,
    VisualizationTypes.BAR,
    VisualizationTypes.BULLET,
    VisualizationTypes.AREA,
    VisualizationTypes.COMBO,
    VisualizationTypes.COMBO2,
    VisualizationTypes.WATERFALL,
];
// types with only many measures or one measure and one attribute
export const multiMeasuresAlternatingTypes = [
    VisualizationTypes.PIE,
    VisualizationTypes.DONUT,
    VisualizationTypes.FUNNEL,
    VisualizationTypes.PYRAMID,
    VisualizationTypes.TREEMAP,
    VisualizationTypes.WATERFALL,
];
export const unsupportedNegativeValuesTypes = [
    VisualizationTypes.PIE,
    VisualizationTypes.DONUT,
    VisualizationTypes.FUNNEL,
    VisualizationTypes.PYRAMID,
    VisualizationTypes.TREEMAP,
    VisualizationTypes.SANKEY,
    VisualizationTypes.DEPENDENCY_WHEEL,
];
export const showingNameInLegendWhenViewByPresent = [
    VisualizationTypes.PIE,
    VisualizationTypes.DONUT,
    VisualizationTypes.FUNNEL,
    VisualizationTypes.PYRAMID,
];
export const unsupportedStackingTypes = [
    VisualizationTypes.LINE,
    VisualizationTypes.AREA,
    VisualizationTypes.SCATTER,
    VisualizationTypes.BUBBLE,
];
