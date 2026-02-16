// (C) 2024-2026 GoodData Corporation

import { base } from "./base.js";
import { coloring } from "./coloring.js";
import { customization } from "./customization.js";
import { theming } from "./theming.js";

export const repeater = [base, ...customization, ...coloring, theming];
