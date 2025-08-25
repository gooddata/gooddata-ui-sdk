// (C) 2007-2025 GoodData Corporation

import autoresize from "./autoresize.js";
import base from "./base.js";
import drilling from "./drilling.js";
import manualSizing from "./manualSizing.js";
import sorting from "./sorting.js";
import totals from "./totals.js";
import transposition from "./transposition.js";

export default [base, autoresize, ...manualSizing, transposition, sorting, ...totals, drilling];
