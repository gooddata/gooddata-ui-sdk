// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IListedDashboard, type IMetadataObject } from "@gooddata/sdk-model";

import { ActionTypeKeys } from "../constants/actions.js";
import { type IDateDatasetsMeta } from "../models/date_datasets_meta.js";
import { type IDateDatasets } from "../typings/datasets.js";
import { type ICacheItem } from "../typings/state_objects.js";

export const dateDatasetsUpdated = createAction(
    ActionTypeKeys.DATE_DATASETS_DATA,
    (dateDatasets: IDateDatasets) => ({
        payload: { dateDatasets },
    }),
);

export const changeDataset = createAction(ActionTypeKeys.UI_CHANGE_DATASET, (dataset: string) => ({
    payload: { dataset },
}));

export type IChangeDatasetAction = ReturnType<typeof changeDataset>;

export const datasetChanged = createAction(
    ActionTypeKeys.SAGA_DATASET_CHANGED,
    (dataset: string, preselect = false) => ({
        payload: { dataset, preselect },
    }),
);

export const setDateDatasetsMeta = createAction(
    ActionTypeKeys.SET_DATE_DATASETS_META,
    (dateDatasetsMeta: IDateDatasetsMeta) => ({
        payload: { dateDatasetsMeta },
    }),
);

export const updateItemCache = createAction(
    ActionTypeKeys.STORE_UPDATE_ITEM_CACHE,
    (itemCache: Record<string, ICacheItem>) => ({
        payload: { itemCache },
    }),
);

export const setDateDatasetsLoaded = createAction(
    ActionTypeKeys.SET_DATE_DATASETS_LOADED,
    (isLoaded: boolean) => ({
        payload: { isLoaded },
    }),
);

export const setDateDatasetsUpdating = createAction(
    ActionTypeKeys.SET_DATE_DATASETS_UPDATING,
    (isUpdating: boolean) => ({
        payload: { isUpdating },
    }),
);

export const setDateDatasetsDropdownLoaded = createAction(
    ActionTypeKeys.SET_DATE_DATASETS_DROPDOWN_LOADED,
    (isLoaded: boolean) => ({
        payload: { isLoaded },
    }),
);

export const updateInsightUsageOnDashboards = createAction(
    ActionTypeKeys.STORE_UPDATE_INSIGHT_USAGE_ON_DASHBOARDS,
    (usages: IMetadataObject[], dashboards: IListedDashboard[]) => ({
        payload: { usages, dashboards },
    }),
);

export const resetInsightUsageOnDashboards = createAction(ActionTypeKeys.RESET_INSIGHT_USAGE_ON_DASHBOARDS);
