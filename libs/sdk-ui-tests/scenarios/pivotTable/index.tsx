// (C) 2007-2019 GoodData Corporation

import base from "./base.js";
import autoresize from "./autoresize.js";
import manualSizing from "./manualSizing.js";
import customization from "./customization.js";
import sorting from "./sorting.js";
import totals from "./totals.js";
import drilling from "./drilling.js";
import grouping from "./grouping.js";
import experimental from "./experimental.js";
import theming from "./theming.js";

export default [
    base,
    autoresize,
    ...manualSizing,
    customization,
    sorting,
    ...totals,
    drilling,
    grouping,
    experimental,
    theming,
];
