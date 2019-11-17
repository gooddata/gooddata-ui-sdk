// (C) 2007-2019 GoodData Corporation

import base from "./base";
import axisCustomization from "./axisCustomization";
import coloring from "./coloring";
import customization from "./customization";
import drilling from "./drilling";
import stacking from "./stacking";

export default [base, axisCustomization, ...coloring, ...customization, drilling, stacking];
