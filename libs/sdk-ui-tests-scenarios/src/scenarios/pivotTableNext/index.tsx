// (C) 2007-2026 GoodData Corporation

import { autoresize } from "./autoresize.js";
import { base } from "./base.js";
import { config } from "./config.js";
import { drilling } from "./drilling.js";
import { manualSizing } from "./manualSizing.js";
import { sorting } from "./sorting.js";
import { totals } from "./totals.js";
import { transposition } from "./transposition.js";

export const pivotTableNextScenarios = [
    base,
    autoresize,
    ...config,
    ...manualSizing,
    transposition,
    sorting,
    ...totals,
    drilling,
];
