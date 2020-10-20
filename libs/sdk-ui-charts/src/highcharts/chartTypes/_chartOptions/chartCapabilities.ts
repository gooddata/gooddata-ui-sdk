// (C) 2020 GoodData Corporation
import { VisualizationTypes } from "@gooddata/sdk-ui";

export const supportedDualAxesChartTypes = [
    VisualizationTypes.COLUMN,
    VisualizationTypes.BAR,
    VisualizationTypes.BULLET,
    VisualizationTypes.LINE,
    VisualizationTypes.AREA,
    VisualizationTypes.COMBO,
    VisualizationTypes.COMBO2,
];
export const supportedTooltipFollowPointerChartTypes = [
    VisualizationTypes.COLUMN,
    VisualizationTypes.BAR,
    VisualizationTypes.BULLET,
    VisualizationTypes.COMBO,
    VisualizationTypes.COMBO2,
];
export const supportedStackingAttributesChartTypes = [
    VisualizationTypes.COLUMN,
    VisualizationTypes.BAR,
    VisualizationTypes.BULLET,
    VisualizationTypes.AREA,
    VisualizationTypes.COMBO,
    VisualizationTypes.COMBO2,
];
// types with only many measures or one measure and one attribute
export const multiMeasuresAlternatingTypes = [
    VisualizationTypes.PIE,
    VisualizationTypes.DONUT,
    VisualizationTypes.FUNNEL,
    VisualizationTypes.TREEMAP,
];
export const unsupportedNegativeValuesTypes = [
    VisualizationTypes.PIE,
    VisualizationTypes.DONUT,
    VisualizationTypes.FUNNEL,
    VisualizationTypes.TREEMAP,
];
// charts sorted by default by measure value
export const sortedByMeasureTypes = [
    VisualizationTypes.PIE,
    VisualizationTypes.DONUT,
    VisualizationTypes.FUNNEL,
];
export const unsupportedStackingTypes = [
    VisualizationTypes.LINE,
    VisualizationTypes.AREA,
    VisualizationTypes.SCATTER,
    VisualizationTypes.BUBBLE,
];
