// (C) 2007-2019 GoodData Corporation

import base from "./base";
import autoresize from "./autoresize";
import manualSizing from "./manualSizing";
import customization from "./customization";
import sorting from "./sorting";
import totals from "./totals";
import drilling from "./drilling";

export default [base, autoresize, ...manualSizing, customization, sorting, totals, drilling];
