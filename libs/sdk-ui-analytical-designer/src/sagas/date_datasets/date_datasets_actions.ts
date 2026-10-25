// (C) 2020-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type ObjRef } from "@gooddata/sdk-model";

import { ActionTypeKeys } from "../../constants/actions.js";
import { type Granularity } from "../../models/granularity.js";
import {
    type IChangeBucketItemDateDatasetActionPayload,
    type IUpdateDateFilterActionPayload,
} from "../../store/bucket_filters/bucket_filters_actions.js";

export const updateDateFilter = createAction(
    ActionTypeKeys.UI_UPDATE_DATE_FILTER,
    (payload: IUpdateDateFilterActionPayload) => ({ payload }),
);

export type IUpdateDateFilterAction = ReturnType<typeof updateDateFilter>;

export const changeBucketItemDateDataset = createAction(
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_DATE_DATASET,
    (
        dateDatasetRef: ObjRef,
        bucketItemLocalIdentifier?: string, // When not provided all bucket date items are set
    ): { payload: IChangeBucketItemDateDatasetActionPayload } => ({
        payload: { dateDatasetRef, bucketItemLocalIdentifier },
    }),
);

export type IChangeBucketItemDateDatasetAction = ReturnType<typeof changeBucketItemDateDataset>;

export const changeBucketItemDateDatasetGranularity = createAction(
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_GRANULARITY,
    (localIdentifier: string, value: Granularity) => ({ payload: { localIdentifier, value } }),
);

export type IChangeBucketItemDateDatasetGranularityAction = ReturnType<
    typeof changeBucketItemDateDatasetGranularity
>;

export const loadDateDatasetsToDateDropdown = createAction(
    ActionTypeKeys.UI_LOAD_DATE_DATASETS_TO_DATE_DROPDOWN,
    (ignoreDateDataset: boolean) => ({ payload: { ignoreDateDataset } }),
);

export type ILoadDateDatasetsToDateDropdown = ReturnType<typeof loadDateDatasetsToDateDropdown>;
