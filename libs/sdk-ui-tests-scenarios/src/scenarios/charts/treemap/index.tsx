// (C) 2007-2026 GoodData Corporation

import { base } from "./base.js";
import { coloring } from "./coloring.js";
import { customization } from "./customization.js";
import { theming } from "./theming.js";

export const treemap = [base, ...coloring, ...customization, theming];
