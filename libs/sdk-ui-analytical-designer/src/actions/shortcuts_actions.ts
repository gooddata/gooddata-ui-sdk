// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { ActionTypeKeys } from "../constants/actions.js";
import { type IDateDatasets } from "../typings/datasets.js";
import { type ICatalogEntry } from "../typings/state_objects.js";

export const applyAttributeShortcut = createAction(
    ActionTypeKeys.SHORTCUT_APPLY_ATTRIBUTE,
    (item: ICatalogEntry) => ({ payload: { item } }),
);

export const applyMetricShortcut = createAction(
    ActionTypeKeys.SHORTCUT_APPLY_METRIC,
    (item: ICatalogEntry) => ({ payload: item }),
);

export const applyMetricPostponedShortcut = createAction(
    ActionTypeKeys.SHORTCUT_APPLY_METRIC_POSTPONED,
    (item: ICatalogEntry) => ({ payload: item }),
);

export const applyMetricOverTimeShortcut = createAction(
    ActionTypeKeys.SHORTCUT_APPLY_METRIC_OVER_TIME,
    (item: ICatalogEntry) => ({ payload: item }),
);

export const applyMetricOverTimePostponedShortcut = createAction(
    ActionTypeKeys.SHORTCUT_APPLY_METRIC_OVER_TIME_POSTPONED,
    (item: ICatalogEntry) => ({ payload: item }),
);

export const dropCatalogItem = createAction(
    ActionTypeKeys.SHORTCUT_DROPPED_ON_METRIC_OVER_TIME,
    (catalogItem: ICatalogEntry) => ({ payload: { catalogItem } }),
);

export const loadShortcutDateDatasets = createAction(ActionTypeKeys.SHORTCUT_DATE_DATASETS_UPDATE);

export const shortcutDateDatasetsUpdated = createAction(
    ActionTypeKeys.SHORTCUT_DATE_DATASETS_UPDATED,
    (dateDataSets: IDateDatasets) => ({ payload: dateDataSets }),
);

export const shortcutDateDatasetsError = createAction(
    ActionTypeKeys.SHORTCUT_DATE_DATASETS_ERROR,
    (error: Error) => ({ payload: error }),
);

export const shortcutSetDroppedItem = createAction(
    ActionTypeKeys.SHORTCUT_SET_DROPPED_ITEM,
    (catalogItem: ICatalogEntry) => ({ payload: { catalogItem } }),
);
