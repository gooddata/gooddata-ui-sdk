// (C) 2022-2026 GoodData Corporation

import { type RunResult, expectSaga } from "redux-saga-test-plan";
import { put, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { type ISortItem, localIdRef, newAttributeSort } from "@gooddata/sdk-model";
import { type IBucketItem, type IReferencePoint, type ISortConfig } from "@gooddata/sdk-ui-ext/internal";

import { type IUiExtendedReferencePointChangedAction } from "../actions/report_actions.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { type IDecoratedDateDatasetItem } from "../models/date_dataset.js";
import { newDecoratedBucketItem } from "../models/decorated_bucket_item.js";
import { getDecoratedBucketItems } from "../selectors/buckets_selector.js";
import { storeAppliedChartSort, storeChartSortConfig } from "../store/chart_sort/chart_sort_actions.js";
import { getSortConfig } from "../store/chart_sort/chart_sort_selector.js";
import { type IDecoratedGranularity } from "../typings/buckets.js";

import { onUiExtendedReferencePointChanged } from "./ui_extended_reference_point_changed_sagas.js";

const genericDate: IBucketItem = {
    granularity: "GDC.time.month_in_quarter",
    dateDatasetRef: {
        uri: "/gdc/md/month/in/quarter",
    },
    localIdentifier: "generic_date",
};

const decoratedAttribute = newDecoratedBucketItem({
    attribute: { identifier: "a2" },
    localIdentifier: "a2",
});

const decoratedMeasure = newDecoratedBucketItem({
    attribute: { identifier: "m1" },
    localIdentifier: "m1",
    isMeasure: true,
});

const decoratedGenericDate = newDecoratedBucketItem({
    granularity: { dateType: "GDC.time.month_in_quarter" } as IDecoratedGranularity,
    dateDataset: { attributeTitle: "Closed" } as IDecoratedDateDatasetItem,
    localIdentifier: "generic_date",
    isDate: true,
});

const attribute: IBucketItem = {
    localIdentifier: "a2",
};

const referencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [
                {
                    localIdentifier: "m1",
                    type: "metric",
                    aggregation: null,
                    attribute: "attr",
                    showInPercent: null,
                    showOnSecondaryAxis: null,
                },
            ],
        },
        {
            localIdentifier: "view",
            items: [genericDate, attribute],
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

describe("onUiExtendedReferencePointChanged", () => {
    describe("chartSortConfig", () => {
        it("should not update chart sort if sort config is not supported", () => {
            const notSupportedSortConfig: ISortConfig = {
                availableSorts: [],
                defaultSort: [],
                supported: false,
                disabled: true,
            };
            const onUiExtendedReferencePointChangedAction: IUiExtendedReferencePointChangedAction = {
                type: ActionTypeKeys.UI_EXTENDED_REFERENCE_POINT_CHANGED,
                payload: {
                    extendedReferencePoint: referencePoint,
                    sortConfig: notSupportedSortConfig,
                },
            };

            return expectSaga(onUiExtendedReferencePointChanged, onUiExtendedReferencePointChangedAction)
                .not.call(storeChartSortConfig)
                .not.call(storeAppliedChartSort)
                .silentRun();
        });

        it("should update chart sort when reference point was changed by generic date and sort config is supported", async () => {
            const sortConfig: ISortConfig = {
                availableSorts: [
                    {
                        attributeSort: {
                            normalSortEnabled: true,
                            areaSortEnabled: true,
                        },
                        itemId: localIdRef("generic_date"),
                    },
                ],
                defaultSort: [newAttributeSort("generic_date", "asc")],
                supported: true,
                disabled: false,
            };

            const appliedSortWithGenericDateByDescOrder: ISortItem[] = [
                newAttributeSort("generic_date", "desc"),
            ];

            const onUiExtendedReferencePointChangedAction: IUiExtendedReferencePointChangedAction = {
                type: ActionTypeKeys.UI_EXTENDED_REFERENCE_POINT_CHANGED,
                payload: {
                    extendedReferencePoint: referencePoint,
                    sortConfig: {
                        ...sortConfig,
                        appliedSort: appliedSortWithGenericDateByDescOrder,
                    },
                },
            };

            const decoratedBucketItems = [decoratedMeasure, decoratedGenericDate, decoratedAttribute];

            const saga: RunResult = await expectSaga(
                onUiExtendedReferencePointChanged,
                onUiExtendedReferencePointChangedAction,
            )
                .provide([
                    [select(getDecoratedBucketItems), decoratedBucketItems],
                    [select(getSortConfig), sortConfig],
                ])
                .run();

            const expectedAppliedSortWithGenericDateByAscOrder: ISortItem[] = [
                newAttributeSort("generic_date", "asc"),
            ];

            const expectedResult: ISortConfig = {
                ...sortConfig,
                appliedSort: expectedAppliedSortWithGenericDateByAscOrder,
            };

            expect(saga.effects.put[0]).toEqual(put(storeChartSortConfig(expectedResult)));
            expect(saga.effects.put[1]).toEqual(
                put(storeAppliedChartSort(expectedAppliedSortWithGenericDateByAscOrder)),
            );
        });
    });
});
