// (C) 2007-2019 GoodData Corporation

import base from "./base.js";
import axisCustomization from "./axisCustomization.js";
import customization from "./customization.js";
import coloring from "./coloring.js";
import stacking from "./stacking.js";
import theming from "./theming.js";

export default [base, ...axisCustomization, ...customization, ...coloring, ...stacking, theming];
