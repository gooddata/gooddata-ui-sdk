// (C) 2007-2026 GoodData Corporation

import { axisCustomization } from "./axisCustomization.js";
import { base } from "./base.js";
import { coloring } from "./coloring.js";
import { customization } from "./customization.js";
import { drilling } from "./drilling.js";
import { responsive } from "./responsive.js";
import { reversedStacking } from "./reversedStacking.js";
import { stacking } from "./stacking.js";
import { theming } from "./theming.js";

export const barChart = [
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
