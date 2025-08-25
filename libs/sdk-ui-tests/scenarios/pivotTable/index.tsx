// (C) 2007-2025 GoodData Corporation

import autoresize from "./autoresize.js";
import base from "./base.js";
import customization from "./customization.js";
import drilling from "./drilling.js";
import grouping from "./grouping.js";
import manualSizing from "./manualSizing.js";
import sorting from "./sorting.js";
import theming from "./theming.js";
import totals from "./totals.js";
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
