// (C) 2007-2026 GoodData Corporation

import { axisCustomization } from "./axisCustomization.js";
import { base } from "./base.js";
import { coloring } from "./coloring.js";
import { customization } from "./customization.js";
import { singleSeries } from "./singleSeries.js";
import { theming } from "./theming.js";

export const bubbleChart = [base, ...axisCustomization, ...coloring, ...customization, singleSeries, theming];
