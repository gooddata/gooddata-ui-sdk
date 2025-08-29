// (C) 2019-2025 GoodData Corporation
import { ITheme } from "@gooddata/sdk-model";
import { VisualizationTypes } from "@gooddata/sdk-ui";

import { styleVariables } from "../chartTypes/_chartCreators/styles/variables.js";
import { CSSObject } from "../lib/index.js";

export const getWhiteLabelStyle = (theme: ITheme): CSSObject => {
    const textShadow = theme?.chart?.dataLabel?.autoLightTextShadow ?? true;
    return {
        color: theme?.chart?.dataLabel?.autoLightTextColor ?? styleVariables.gdColorBackground,
        textShadow: textShadow ? "0 0 1px #000000" : "none",
    };
};

export const getBlackLabelStyle = (theme: ITheme): CSSObject => {
    return {
        color: theme?.chart?.dataLabel?.autoDarkTextColor ?? "var(--gd-palette-complementary-9, #000)",
        textShadow: "none",
    };
};

export const getBlackStackedLabelStyle = (theme: ITheme): CSSObject => {
    return {
        color: theme?.chart?.dataLabel?.autoDarkTextColor ?? "#000",
    };
};

export const getBackplateStackedLabelStyling = (theme: ITheme): Highcharts.YAxisStackLabelsOptions => {
    return {
        style: getBackplateLabelStyle(theme),
        backgroundColor: getBackplateLabelBackgroundColor(theme),
        borderRadius: getBackplateLabelBorderRadius(theme),
        borderColor: getBackplateLabelBorderColor(theme),
    };
};

export const getBackplateLabelStyling = (theme: ITheme): Highcharts.DataLabelsOptions => {
    return {
        style: getBackplateLabelStyle(theme),
        color: getBackplateLabelColor(theme),
        backgroundColor: getBackplateLabelBackgroundColor(theme),
        borderRadius: getBackplateLabelBorderRadius(theme),
        borderColor: getBackplateLabelBorderColor(theme),
        borderWidth: 1,
        ...((theme?.chart?.dataLabel?.backplateDropShadow ?? false)
            ? {
                  shadow: {
                      color: theme?.palette?.complementary?.c9 ?? "rgba(20, 56, 93, 0.15)",
                      offsetX: 0,
                      offsetY: 1,
                      opacity: 0.4,
                      width: 3,
                  },
              }
            : {}),
    };
};

export const getBackplateLabelStyle = (theme: ITheme): CSSObject => {
    return {
        textOutline: "none",
        color: getBackplateLabelColor(theme),
    };
};

export const getBackplateLabelColor = (theme: ITheme): string => {
    return (
        theme?.chart?.dataLabel?.backplateTextColor ??
        theme?.palette?.complementary?.c9 ??
        styleVariables.gdColorText
    );
};

const getBackplateLabelBackgroundColor = (theme: ITheme): string => {
    return (
        theme?.chart?.dataLabel?.backplateBackgroundColor ??
        theme?.palette?.complementary?.c0 ??
        styleVariables.gdColorBackground
    );
};

const getBackplateLabelBorderColor = (theme: ITheme): string => {
    return theme?.chart?.dataLabel?.backplateBorderColor ?? theme?.palette?.complementary?.c3 ?? "#dde4eb";
};

const getBackplateLabelBorderRadius = (theme: ITheme): number => {
    return theme?.chart?.dataLabel?.backplateBorderRadius ?? 2;
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
