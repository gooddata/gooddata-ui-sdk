// (C) 2007-2026 GoodData Corporation

import { uriRef } from "@gooddata/sdk-model";
import { ErrorCodes } from "@gooddata/sdk-ui";

import { type IBucketItemProps, buildBucketItem } from "../models/bucket_item.js";
import { updateBucketItemsAt } from "../store/buckets/bucket_item_address.js";
import { type IAppState } from "../store/types.js";
import {
    activityDateDataset,
    closedDateDataset,
    defaultVisualizationClasses,
    seedDateDatasetsMeta,
} from "../tests/constants.test.helpers.js";
import { withOpenAsReportUiConfig } from "../tests/extended_reference_point_builder.test.helpers.js";
import { seedMeasureDateDatasetStatus } from "../tests/measure_date_datasets.test.helpers.js";
import { withExecutionError } from "../tests/report_builder.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData, withReport } from "../tests/state_builder.test.helpers.js";
import { type ICatalogEntry } from "../typings/state_objects.js";

function cacheBucketItem(currentState: IAppState, id: string, type: string): IAppState {
    const item: ICatalogEntry = {
        id,
        type: "attribute",
        identifier: id,
        title: id,
    };
    let state = currentState;
    state = withData(state, { itemCache: { ...state.data.itemCache, [`${type}.${id}`]: item } });
    return state;
}

export function bucketsAddItem(
    currentState: IAppState,
    localIdentifier: string,
    bucketItemParams: IBucketItemProps,
): IAppState {
    let state = currentState;
    const item = buildBucketItem(bucketItemParams);
    const aggregation = bucketItemParams?.aggregation;
    const isAttribute = aggregation === "count" || aggregation === "approximate_count";
    const type = aggregation ? (isAttribute ? "attribute" : "fact") : bucketItemParams.type;
    state = cacheBucketItem(state, bucketItemParams.attribute, type);
    const buckets = state.data.buckets ?? [];
    const index = buckets.findIndex((bucket) => bucket.localIdentifier === localIdentifier);
    if (index === -1) {
        // refuse instead of wrapping -1 to the last element — a silent wrap lets
        // tests "add" items to buckets that were never in the seed (and pass by accident)
        throw new Error(`bucketsAddItem: bucket "${localIdentifier}" is not in the seeded state`);
    }
    state = withData(state, {
        buckets: updateBucketItemsAt(state.data.buckets, index, (items) => [...(items ?? []), item]),
    });
    return state;
}

export function setErrorReportNegativeValue(state: IAppState): IAppState {
    return withReport(state, {
        execution: withExecutionError(state.report.execution, { status: ErrorCodes.NEGATIVE_VALUES }),
    });
}

export function createStateWithMeasureDateDatasets(): IAppState {
    const stateWithDateDatasetMeta = seedDateDatasetsMeta(getInitializedState(), {
        items: [
            {
                identifier: "closed.dataset.dt",
                uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
                ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/15174"),
                type: "dateDataset",
                title: "Date (closed)",
                summary: "DataSet Date",
                attributes: [],
            },
        ],
    });

    const availableMeasureDatasets = [activityDateDataset, closedDateDataset];
    const stateWithMeasureDateDatasets = seedMeasureDateDatasetStatus(
        stateWithDateDatasetMeta,
        "m1",
        availableMeasureDatasets,
        0,
    );

    return withData(
        withData(stateWithMeasureDateDatasets, {
            extendedReferencePoint: withOpenAsReportUiConfig(
                stateWithMeasureDateDatasets.data.extendedReferencePoint,
                { supported: true },
            ),
        }),
        { visualizationClass: defaultVisualizationClasses[1] },
    );
}
