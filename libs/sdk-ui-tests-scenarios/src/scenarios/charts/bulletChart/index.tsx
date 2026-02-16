// (C) 2007-2026 GoodData Corporation

import { axisCustomization } from "./axisCustomization.js";
import { base } from "./base.js";
import { coloring } from "./coloring.js";
import { customization } from "./customization.js";
import { drilling } from "./drilling.js";
import { responsive } from "./responsive.js";
import { theming } from "./theming.js";

export const bulletChart = [
    base,
    ...customization,
    ...axisCustomization,
    ...coloring,
    drilling,
    theming,
    ...responsive,
];
