// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import {
    getAvailableShortcutDateDatasets,
    haveDateDatasetsBeenLoaded,
} from "../store/shortcuts/shortcut_date_datasets_selectors.js";

export const shortcutMetricOverTimeSelector = createSelector(
    haveDateDatasetsBeenLoaded,
    getAvailableShortcutDateDatasets,
    (areDateDatasetsLoaded, availableDateDatasets) => ({
        areDateDatasetsLoaded,
        availableDateDatasets,
    }),
);
