// (C) 2023-2026 GoodData Corporation

import { base } from "./base.js";
import { coloring } from "./coloring.js";
import { customization } from "./customization.js";
import { theming } from "./theming.js";

export const dependencyWheelChart = [base, ...customization, ...coloring, theming];
