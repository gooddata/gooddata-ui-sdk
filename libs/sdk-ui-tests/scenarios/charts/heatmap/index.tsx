// (C) 2007-2019 GoodData Corporation

import base from "./base.js";
import axisCustomization from "./axisCustomization.js";
import coloring from "./coloring.js";
import customization from "./customization.js";
import theming from "./theming.js";

export default [base, axisCustomization, ...coloring, ...customization, theming];
