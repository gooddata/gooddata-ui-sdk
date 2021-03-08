// (C) 2019-2021 GoodData Corporation
import Highcharts from "../lib";
import { VisualizationTypes } from "@gooddata/sdk-ui";

export const WHITE_LABEL: Highcharts.CSSObject = {
    color: "#ffffff",
    textShadow: "0 0 1px #000000",
};

export const BLACK_LABEL: Highcharts.CSSObject = {
    color: "var(--gd-palette-complementary-9, #000000)",
    textShadow: "none",
};

// types with label inside sections have white labels
export const whiteDataLabelTypes = [
    VisualizationTypes.PIE,
    VisualizationTypes.DONUT,
    VisualizationTypes.TREEMAP,
    VisualizationTypes.BUBBLE,
];
