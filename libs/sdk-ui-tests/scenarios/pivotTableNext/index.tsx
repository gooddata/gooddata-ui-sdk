// (C) 2007-2025 GoodData Corporation

import base from "./base.js";
import autoresize from "./autoresize.js";
import manualSizing from "./manualSizing.js";
import transposition from "./transposition.js";
import sorting from "./sorting.js";
import totals from "./totals.js";
import drilling from "./drilling.js";

export default [base, autoresize, ...manualSizing, transposition, sorting, ...totals, drilling];
