// (C) 2019 GoodData Corporation
import Highcharts from "../../chartTypes/_integration/highchartsEntryPoint";
import { VisualizationTypes } from "@gooddata/sdk-ui";

export const WHITE_LABEL: Highcharts.CSSObject = {
    color: "#ffffff",
    textShadow: "0 0 1px #000000",
};

export const BLACK_LABEL: Highcharts.CSSObject = {
    color: "#000000",
    textShadow: "none",
};

// types with label inside sections have white labels
export const whiteDataLabelTypes = [
    VisualizationTypes.PIE,
    VisualizationTypes.DONUT,
    VisualizationTypes.TREEMAP,
    VisualizationTypes.BUBBLE,
];
