// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { COMPUTED_ATTRIBUTE } from "../../constants/bucket.js";
import { newDecoratedBucketItem } from "../../models/decorated_bucket_item.js";
import { type IDecoratedMetricAttributeFilter } from "../../models/decorated_metric_attribute_filter.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";

import { isAttributeAlreadyFiltered } from "./isAttributeAlreadyFiltered.js";
import { type IMeasureAttributeFilterItem } from "./MeasureAttributeListItemOrganized.js";

const item = (overrides: Partial<IMeasureAttributeFilterItem>): IMeasureAttributeFilterItem => ({
    title: "Region",
    identifier: "region",
    type: "attribute",
    ref: idRef("region", "attribute"),
    dfUri: "region.df",
    dfRef: idRef("region.df", "displayForm"),
    primaryUri: "region.df",
    primaryRef: idRef("region.df", "displayForm"),
    ...overrides,
});

const withFilters = (attributes: ICatalogEntry[]) =>
    newDecoratedBucketItem({
        filters: attributes.map(
            (attribute): IDecoratedMetricAttributeFilter =>
                ({ attribute, original: {}, selectedElements: [] }) as IDecoratedMetricAttributeFilter,
        ),
    });

describe("isAttributeAlreadyFiltered", () => {
    it("matches a filter by the attribute ref", () => {
        const bucketItem = withFilters([{ identifier: "region", ref: idRef("region", "attribute") }]);

        expect(isAttributeAlreadyFiltered(bucketItem, item({}))).toBe(true);
        expect(
            isAttributeAlreadyFiltered(bucketItem, item({ identifier: "product", ref: idRef("product") })),
        ).toBe(false);
    });

    it("tells a computed attribute from a regular one sharing the identifier, by the typed ref", () => {
        const regular = withFilters([{ identifier: "region", ref: idRef("region", "attribute") }]);
        const computed = item({
            type: COMPUTED_ATTRIBUTE,
            ref: idRef("region", "computedAttribute"),
        });

        expect(isAttributeAlreadyFiltered(regular, computed)).toBe(false);
        expect(isAttributeAlreadyFiltered(regular, item({}))).toBe(true);
    });

    it("falls back to the identifier and kind when the filter's attribute has no ref", () => {
        const regularWithoutRef = withFilters([{ identifier: "region", type: "attribute" }]);

        expect(isAttributeAlreadyFiltered(regularWithoutRef, item({}))).toBe(true);
        expect(
            isAttributeAlreadyFiltered(
                regularWithoutRef,
                item({ type: COMPUTED_ATTRIBUTE, ref: idRef("region", "computedAttribute") }),
            ),
        ).toBe(false);
    });

    it("ignores filters without an attribute entry, such as the date filter", () => {
        const bucketItem = withFilters([undefined]);

        expect(isAttributeAlreadyFiltered(bucketItem, item({}))).toBe(false);
    });
});
