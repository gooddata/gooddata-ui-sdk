// (C) 2020-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { FILTERS, MEASURES, STACK, VIEW } from "../../../constants/bucket.js";
import { type IRefPointFiltersBucket } from "../../../store/reference_point/reference_point_state.js";
import {
    categoriesBucketItems,
    measureBucketItems,
    stacksBucketItems,
} from "../../../tests/constants.test.helpers.js";
import { extendedRefPointFilters, filterItems } from "../../../tests/filter.test.helpers.js";
import { toRefPointItems } from "../../../tests/reference_point.test.helpers.js";
import { getInitializedState } from "../../../tests/state.test.helpers.js";
import { withData } from "../../../tests/state_builder.test.helpers.js";

import { type IHiddenItems, hiddenBucketItemsSelector } from "./hidden_bucket_items_selector.js";

const pristine = getInitializedState();

const stateWithHiddenObjects = withData(pristine, {
    referencePoint: {
        ...pristine.data.referencePoint,
        buckets: [
            { localIdentifier: MEASURES, items: measureBucketItems.slice(0, 6) },
            { localIdentifier: VIEW, items: categoriesBucketItems.slice(0, 2) },
            { localIdentifier: STACK, items: stacksBucketItems.slice(0, 1) },
        ],
        filters: {
            localIdentifier: FILTERS,
            items: [...extendedRefPointFilters.slice(3, 5), extendedRefPointFilters[7]],
        } as unknown as IRefPointFiltersBucket,
    },
    extendedReferencePoint: {
        ...pristine.data.extendedReferencePoint,
        buckets: [
            { localIdentifier: MEASURES, items: toRefPointItems(measureBucketItems.slice(0, 4)) },
            { localIdentifier: VIEW, items: [] },
            { localIdentifier: STACK, items: toRefPointItems(stacksBucketItems.slice(0, 1)) },
        ],
        filters: filterItems.slice(3, 4),
    },
});

const filters = {
    localIdentifier: FILTERS,
    items: extendedRefPointFilters,
} as unknown as IRefPointFiltersBucket;

const stateWithNoHiddenObjects = withData(pristine, {
    referencePoint: {
        ...pristine.data.referencePoint,
        buckets: [
            { localIdentifier: MEASURES, items: measureBucketItems },
            { localIdentifier: VIEW, items: categoriesBucketItems },
        ],
        filters,
    },
    extendedReferencePoint: {
        ...pristine.data.extendedReferencePoint,
        buckets: [
            { localIdentifier: MEASURES, items: toRefPointItems(measureBucketItems) },
            { localIdentifier: VIEW, items: toRefPointItems(categoriesBucketItems) },
        ],
        filters: filterItems,
    },
});

describe("hiddenBucketItemsSelector", () => {
    it("should return null when MD object is not valid", () => {
        const stateWithInvalidMdObject = withData(stateWithHiddenObjects, {
            isVisualizationMdObjectValid: false,
        });
        const hiddenItems: IHiddenItems = hiddenBucketItemsSelector(stateWithInvalidMdObject);
        expect(hiddenItems).toBeNull();
    });

    it("should return null when there are no hidden items", () => {
        const hiddenItems: IHiddenItems = hiddenBucketItemsSelector(stateWithNoHiddenObjects);
        expect(hiddenItems).toBeNull();
    });

    it("should return hidden items when there are some", () => {
        const hiddenItems: IHiddenItems = hiddenBucketItemsSelector(stateWithHiddenObjects);
        expect(hiddenItems).toStrictEqual({
            attributes: 2,
            measureValueFilters: 1,
            measures: 2,
            rankingFilter: true,
        });
    });
});
