// (C) 2007-2025 GoodData Corporation

import base from "./base.js";
import transposition from "./transposition.js";
import sorting from "./sorting.js";
import totals from "./totals.js";
import drilling from "./drilling.js";

export default [base, transposition, sorting, ...totals, drilling];
