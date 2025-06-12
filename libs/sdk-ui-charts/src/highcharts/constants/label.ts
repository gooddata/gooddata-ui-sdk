// (C) 2019-2025 GoodData Corporation
import { CSSObject } from "../lib/index.js";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import { styleVariables } from "../chartTypes/_chartCreators/styles/variables.js";

export const WHITE_LABEL: CSSObject = {
    color: "#ffffff",
    textShadow: "0 0 1px #000000",
};

export const BLACK_LABEL: CSSObject = {
    color: "var(--gd-palette-complementary-9, #000)",
    textShadow: "none",
};

export const DATA_LABEL_C6: CSSObject = {
    color: `var(--gd-palette-complementary-6, ${styleVariables.gdColorStateBlank})`,
    textShadow: "none",
};

// types with label inside sections have white labels
export const whiteDataLabelTypes = [
    VisualizationTypes.PIE,
    VisualizationTypes.DONUT,
    VisualizationTypes.PYRAMID,
    VisualizationTypes.FUNNEL,
    VisualizationTypes.TREEMAP,
    VisualizationTypes.BUBBLE,
];
