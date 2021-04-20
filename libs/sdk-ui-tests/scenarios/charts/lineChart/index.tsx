// (C) 2007-2019 GoodData Corporation

import base from "./base";
import axisCustomization from "./axisCustomization";
import coloring from "./coloring";
import customization from "./customization";
import theming from "./theming";
import responsive from "./responsive";

export default [base, ...axisCustomization, ...coloring, ...customization, theming, ...responsive];
