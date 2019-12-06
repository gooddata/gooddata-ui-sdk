// (C) 2007-2019 GoodData Corporation

import axisCustomization from "./axisCustomization";
import base from "./base";
import coloring from "./coloring";
import customization from "./customization";
import drilling from "./stacking";
import stacking from "./drilling";

export default [base, ...axisCustomization, ...coloring, ...customization, drilling, stacking];
