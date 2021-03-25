// (C) 2007-2019 GoodData Corporation

import base from "./base";
import axisCustomization from "./axisCustomization";
import customization from "./customization";
import coloring from "./coloring";
import stacking from "./stacking";
import theming from "./theming";

export default [base, ...axisCustomization, ...customization, ...coloring, ...stacking, theming];
