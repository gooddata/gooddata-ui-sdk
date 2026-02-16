// (C) 2007-2026 GoodData Corporation

import { axisCustomization } from "./axisCustomization.js";
import { base } from "./base.js";
import { coloring } from "./coloring.js";
import { customization } from "./customization.js";
import { stacking } from "./stacking.js";
import { theming } from "./theming.js";

export const comboChart = [base, ...axisCustomization, ...customization, ...coloring, ...stacking, theming];
