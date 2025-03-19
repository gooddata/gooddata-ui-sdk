// (C) 2007-2024 GoodData Corporation

import axisCustomization from "./axisCustomization.js";
import base from "./base.js";
import coloring from "./coloring.js";
import customization from "./customization.js";
import stacking from "./stacking.js";
import drilling from "./drilling.js";
import theming from "./theming.js";
import responsive from "./responsive.js";
import reversedStacking from "./reversedStacking.js";

export default [
    base,
    ...axisCustomization,
    ...coloring,
    ...customization,
    drilling,
    stacking,
    theming,
    reversedStacking,
    ...responsive,
];
