// (C) 2007-2025 GoodData Corporation

import { base } from "./base.js";
import { coloring } from "./coloring.js";
import { customization } from "./customization.js";
import { responsive } from "./responsive.js";
import { theming } from "./theming.js";

export const donutChart = [base, ...customization, ...coloring, theming, ...responsive];
