// (C) 2007-2024 GoodData Corporation

import base from "./base.js";
import autoresize from "./autoresize.js";
import manualSizing from "./manualSizing.js";
import customization from "./customization.js";
import sorting from "./sorting.js";
import totals from "./totals.js";
import drilling from "./drilling.js";
import grouping from "./grouping.js";
import theming from "./theming.js";
import transposition from "./transposition.js";

export default [
    base,
    autoresize,
    ...manualSizing,
    customization,
    sorting,
    ...totals,
    drilling,
    grouping,
    theming,
    transposition,
];
