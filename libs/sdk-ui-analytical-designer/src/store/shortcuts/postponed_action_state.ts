// (C) 2026 GoodData Corporation

import {
    type applyMetricOverTimePostponedShortcut,
    type applyMetricPostponedShortcut,
} from "../../actions/shortcuts_actions.js";

export type IPostponedActionState =
    | ReturnType<typeof applyMetricPostponedShortcut>
    | ReturnType<typeof applyMetricOverTimePostponedShortcut>;
