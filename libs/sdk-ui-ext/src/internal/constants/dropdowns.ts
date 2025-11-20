// (C) 2019-2025 GoodData Corporation

import { CalculateAs, ComparisonPositionValues } from "@gooddata/sdk-ui-charts";

import { comparisonMessages, messages } from "../../locales.js";
import { IDropdownItem } from "../interfaces/Dropdown.js";

export const pushpinSizeDropdownItems: IDropdownItem[] = [
    { title: messages["autoDefault"].id, value: "default" },
    { type: "separator" },
    { title: messages["extraSmall"].id, value: "0.5x" },
    { title: messages["small"].id, value: "0.75x" },
    { title: messages["normal"].id, value: "normal" },
    { title: messages["large"].id, value: "1.25x" },
    { title: messages["extraLarge"].id, value: "1.5x" },
];

export const pushpinViewportDropdownItems: IDropdownItem[] = [
    { title: messages["areaAutoDefault"].id, value: "auto" },
    { title: messages["areaWorld"].id, value: "world" },
    { type: "header", title: "properties.viewport.area.continents" },
    { title: messages["areaContinent_af"].id, value: "continent_af" },
    { title: messages["areaContinent_na"].id, value: "continent_na" },
    { title: messages["areaContinent_sa"].id, value: "continent_sa" },
    { title: messages["areaContinent_as"].id, value: "continent_as" },
    { title: messages["areaContinent_au"].id, value: "continent_au" },
    { title: messages["areaContinent_eu"].id, value: "continent_eu" },
];

export const rotationDropdownItems: IDropdownItem[] = [
    { title: messages["autoDefault"].id, value: "auto" },
    { type: "separator" },
    { title: messages["rotation0"].id, value: "0" },
    { title: messages["rotation30"].id, value: "30" },
    { title: messages["rotation45"].id, value: "45" },
    { title: messages["rotation60"].id, value: "60" },
    { title: messages["rotation90"].id, value: "90" },
];

export const formatDropdownItems: IDropdownItem[] = [
    { title: messages["autoDefault"].id, value: "auto" },
    { type: "separator" },
    {
        title: messages["formatInherit"].id,
        value: "inherit",
        info: messages["formatInfoInherit"].id,
    },
];

export const confidenceDropdownItems: IDropdownItem[] = [
    { title: messages["forecastConfidence70"].id, value: 0.7 },
    { title: messages["forecastConfidence75"].id, value: 0.75 },
    { title: messages["forecastConfidence80"].id, value: 0.8 },
    { title: messages["forecastConfidence85"].id, value: 0.85 },
    { title: messages["forecastConfidence90"].id, value: 0.9 },
    { title: messages["forecastConfidence95"].id, value: 0.95 },
];

export const legendPositionDropdownItems: IDropdownItem[] = [
    { title: messages["autoDefault"].id, value: "auto" },
    { type: "separator" },
    { title: messages["positionUp"].id, value: "top", icon: "gd-dropdown-icon-legend-top" },
    { title: messages["positionDown"].id, value: "bottom", icon: "gd-dropdown-icon-legend-bottom" },
    { title: messages["positionRight"].id, value: "right", icon: "gd-dropdown-icon-legend-right" },
    { title: messages["positionLeft"].id, value: "left", icon: "gd-dropdown-icon-legend-left" },
];

export const orientationDropdownItems: IDropdownItem[] = [
    {
        title: messages["horizontal"].id,
        value: "horizontal",
        icon: "gd-dropdown-icon-orientation-horizontal",
    },
    { title: messages["vertical"].id, value: "vertical", icon: "gd-dropdown-icon-orientation-vertical" },
];

export const dataLabelsDropdownItems: IDropdownItem[] = [
    { title: messages["dataLabelsAuto"].id, value: "auto" },
    { type: "separator" },
    { title: messages["dataLabelsShow"].id, value: true },
    { title: messages["dataLabelsHide"].id, value: false },
];

export const dataLabelStyleDropdownItems: IDropdownItem[] = [
    { title: messages["dataLabelStyleAuto"].id, value: "auto" },
    { type: "separator" },
    { title: messages["dataLabelStyleBackplate"].id, value: "backplate" },
];

export const rowSizingDropdownItems: IDropdownItem[] = [
    { title: messages["rowHeightSmall"].id, value: "small" },
    { title: messages["rowHeightMedium"].id, value: "medium" },
    { title: messages["rowHeightLarge"].id, value: "large" },
];

export const verticalAlignmentDropdownItems: IDropdownItem[] = [
    { title: messages["verticalAlignTop"].id, value: "top" },
    { title: messages["verticalAlignMiddle"].id, value: "middle" },
    { title: messages["verticalAlignBottom"].id, value: "bottom" },
];

export const textWrappingDropdownItems: IDropdownItem[] = [
    { title: messages["textWrappingClip"].id, value: "clip" },
    { title: messages["textWrappingWrap"].id, value: "wrap" },
];

export const imageDropdownItems: IDropdownItem[] = [
    { title: messages["imageFit"].id, value: "fit" },
    { title: messages["imageFill"].id, value: "fill" },
];

export const totalLabelsDropdownItems: IDropdownItem[] = [
    { title: messages["totalLabelsAuto"].id, value: "auto" },
    { type: "separator" },
    { title: messages["totalLabelsShow"].id, value: true },
    { title: messages["totalLabelsHide"].id, value: false },
];

export const dataPointsDropdownLabels: IDropdownItem[] = [
    { title: messages["dataPointsAuto"].id, value: "auto" },
    { type: "separator" },
    { title: messages["dataPointsShow"].id, value: true },
    { title: messages["dataPointsHide"].id, value: false },
];

export const xAxisPositionDropdownItems: IDropdownItem[] = [
    { title: messages["autoDefault"].id, value: "auto" },
    { type: "separator" },
    {
        title: messages["axisPositionLeft"].id,
        value: "left",
        icon: "gd-dropdown-icon-axis-name-position-left",
    },
    {
        title: messages["axisPositionCenter"].id,
        value: "center",
        icon: "gd-dropdown-icon-axis-name-position-center",
    },
    {
        title: messages["axisPositionRight"].id,
        value: "right",
        icon: "gd-dropdown-icon-axis-name-position-right",
    },
];

export const yAxisPositionDropdownItems: IDropdownItem[] = [
    { title: messages["autoDefault"].id, value: "auto" },
    { type: "separator" },
    {
        title: messages["axisPositionTop"].id,
        value: "top",
        icon: "gd-dropdown-icon-axis-name-position-top",
    },
    {
        title: messages["axisPositionMiddle"].id,
        value: "middle",
        icon: "gd-dropdown-icon-axis-name-position-middle",
    },
    {
        title: messages["axisPositionBottom"].id,
        value: "bottom",
        icon: "gd-dropdown-icon-axis-name-position-bottom",
    },
];

export const metricsPositionDropdownItems: IDropdownItem[] = [
    { title: messages["metricsPositionColumns"].id, value: "columns" },
    { title: messages["metricsPositionRows"].id, value: "rows" },
];

export const columnHeadersPositionDropdownItems: IDropdownItem[] = [
    { title: messages["columnHeaderPositionTop"].id, value: "top" },
    { title: messages["columnHeaderPositionLeft"].id, value: "left" },
];

export const grandTotalsPositionDropdownItems: IDropdownItem[] = [
    { title: messages["grandTotalsPositionPinnedBottom"].id, value: "pinnedBottom" },
    { title: messages["grandTotalsPositionBottom"].id, value: "bottom" },
    { title: messages["grandTotalsPositionPinnedTop"].id, value: "pinnedTop" },
    { title: messages["grandTotalsPositionTop"].id, value: "top" },
];

export const calculationDropdownItems: IDropdownItem[] = [
    {
        title: comparisonMessages["calculatedAsChange"].id,
        value: CalculateAs.CHANGE,
        info: CalculateAs.CHANGE,
        icon: "gd-dropdown-icon-calculated-as-change",
    },
    {
        title: comparisonMessages["calculatedAsChangeDifference"].id,
        value: CalculateAs.CHANGE_DIFFERENCE,
        info: CalculateAs.CHANGE_DIFFERENCE,
        icon: "gd-dropdown-icon-calculated-as-change-difference",
    },
    {
        title: comparisonMessages["calculatedAsRatio"].id,
        value: CalculateAs.RATIO,
        info: CalculateAs.RATIO,
        icon: "gd-dropdown-icon-calculated-as-ratio",
    },
    {
        title: comparisonMessages["calculatedAsDifference"].id,
        value: CalculateAs.DIFFERENCE,
        info: CalculateAs.DIFFERENCE,
        icon: "gd-dropdown-icon-calculated-as-difference",
    },
];

export const comparisonPositionDropdownItems: IDropdownItem[] = [
    { title: messages["autoDefault"].id, value: ComparisonPositionValues.AUTO },
    { type: "separator" },
    {
        title: comparisonMessages["positionLeft"].id,
        value: ComparisonPositionValues.LEFT,
        icon: "gd-dropdown-icon-comparison-position-left",
    },
    {
        title: comparisonMessages["positionRight"].id,
        value: ComparisonPositionValues.RIGHT,
        icon: "gd-dropdown-icon-comparison-position-right",
    },
    {
        title: comparisonMessages["positionTop"].id,
        value: ComparisonPositionValues.TOP,
        icon: "gd-dropdown-icon-comparison-position-top",
    },
];

export const fillDropdownItems: IDropdownItem[] = [
    { title: messages["fillSolid"].id, value: "solid" },
    { title: messages["fillPattern"].id, value: "pattern" },
    { title: messages["fillOutline"].id, value: "outline" },
];
