// (C) 2007-2019 GoodData Corporation

import base from "./base";
import coloring from "./coloring";
import customization from "./customization";
import axisCustomization from "./axisCustomization";
import drilling from "./drilling";
import theming from "./theming";

export default [base, ...customization, ...axisCustomization, ...coloring, drilling, theming];
