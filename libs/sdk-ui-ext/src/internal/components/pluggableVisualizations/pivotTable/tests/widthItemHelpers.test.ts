// (C) 2020-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";
import { type ColumnWidthItem, type MeasureGroupDimension } from "@gooddata/sdk-ui-pivot";

import {
    invalidAttributeColumnWidthItem,
    invalidMeasureColumnWidthItem,
    invalidMeasureColumnWidthItemInvalidAttribute,
    invalidMeasureColumnWidthItemLocatorsTooShort,
    invalidMeasureColumnWidthItemTooManyLocators,
    invalidMixedValueColumnWidthItem,
    invalidSliceMeasureColumnWidthItem,
    validAllMeasureColumnWidthItem,
    validAttributeColumnWidthItem,
    validMeasureColumnWidthItem,
    validMixedValuesColumnWidthItem,
    validSliceMeasureColumnWidthItem,
    validWeakMeasureColumnWidthItem,
} from "./widthItemsMock.js";
import { type IBucketFilter, type IBucketItem } from "../../../../interfaces/Visualization.js";
import { simpleStackedReferencePoint } from "../../../../tests/mocks/referencePointMocks.js";
import { adaptReferencePointWidthItemsToPivotTable } from "../widthItemsHelpers.js";

describe("adaptReferencePointWidthItemsToPivotTable", () => {
    const sourceReferencePoint = simpleStackedReferencePoint;

    const sourceColumnWidths: ColumnWidthItem[] = [
        invalidAttributeColumnWidthItem,
        invalidMeasureColumnWidthItem,
        invalidMeasureColumnWidthItemInvalidAttribute,
        invalidMeasureColumnWidthItemLocatorsTooShort,
        invalidMeasureColumnWidthItemTooManyLocators,
        validAttributeColumnWidthItem,
        validMeasureColumnWidthItem,
    ];

    const measures: IBucketItem[] = sourceReferencePoint.buckets[0].items;
    const rowAttributes: IBucketItem[] = sourceReferencePoint.buckets[1].items;
    const columnAttributes: IBucketItem[] = sourceReferencePoint.buckets[2].items;

    it("should remove invalid width items", () => {
        const previousRowAttributes: IBucketItem[] = sourceReferencePoint.buckets[1].items;
        const previousColumnAttributes: IBucketItem[] = sourceReferencePoint.buckets[2].items;

        const result = adaptReferencePointWidthItemsToPivotTable(
            sourceColumnWidths,
            measures,
            rowAttributes,
            columnAttributes,
            previousRowAttributes,
            previousColumnAttributes,
            [],
            undefined as unknown as MeasureGroupDimension,
        );

        expect(result).toEqual([validAttributeColumnWidthItem, validMeasureColumnWidthItem]);
    });

    it("should remove invalid items and keep allMeasureColumnWidthItem", () => {
        const sourceColumnWidthsWithAllMeasure: ColumnWidthItem[] = [
            ...sourceColumnWidths,
            validAllMeasureColumnWidthItem,
        ];
        const previousRowAttributes: IBucketItem[] = sourceReferencePoint.buckets[1].items;
        const previousColumnAttributes: IBucketItem[] = sourceReferencePoint.buckets[2].items;

        const result = adaptReferencePointWidthItemsToPivotTable(
            sourceColumnWidthsWithAllMeasure,
            measures,
            rowAttributes,
            columnAttributes,
            previousRowAttributes,
            previousColumnAttributes,
            [],
            undefined as unknown as MeasureGroupDimension,
        );

        expect(result).toEqual([
            validAttributeColumnWidthItem,
            validMeasureColumnWidthItem,
            validAllMeasureColumnWidthItem,
        ]);
    });

    it("should keep allMeasureColumnWidthItem when some measures left", () => {
        const sourceColumnWidthsWithAllMeasure: ColumnWidthItem[] = [validAllMeasureColumnWidthItem];

        const result = adaptReferencePointWidthItemsToPivotTable(
            sourceColumnWidthsWithAllMeasure,
            measures,
            [],
            [],
            [],
            [],
            [],
            undefined as unknown as MeasureGroupDimension,
        );

        expect(result).toEqual([validAllMeasureColumnWidthItem]);
    });

    it("should remove allMeasureColumnWidthItem when no measures left", () => {
        const sourceColumnWidthsWithAllMeasure: ColumnWidthItem[] = [validAllMeasureColumnWidthItem];

        const result = adaptReferencePointWidthItemsToPivotTable(
            sourceColumnWidthsWithAllMeasure,
            [],
            [],
            [],
            [],
            [],
            [],
            undefined as unknown as MeasureGroupDimension,
        );

        expect(result).toEqual([]);
    });

    it("should keep weakMeasureColumnWidthItem when some measures left", () => {
        const sourceColumnWidthsWithWeakMeasure: ColumnWidthItem[] = [validWeakMeasureColumnWidthItem];

        const result = adaptReferencePointWidthItemsToPivotTable(
            sourceColumnWidthsWithWeakMeasure,
            measures,
            [],
            [],
            [],
            [],
            [],
            undefined as unknown as MeasureGroupDimension,
        );

        expect(result).toEqual([validWeakMeasureColumnWidthItem]);
    });

    it("should transform measureWidthItem to weakMeasureColumnWidthItem when first column attribute added", () => {
        const sourceColumnWidthsWithWeakMeasure: ColumnWidthItem[] = [
            invalidMeasureColumnWidthItemLocatorsTooShort,
        ];

        const result = adaptReferencePointWidthItemsToPivotTable(
            sourceColumnWidthsWithWeakMeasure,
            measures,
            [],
            columnAttributes,
            [],
            [],
            [],
            undefined as unknown as MeasureGroupDimension,
        );

        expect(result).toEqual([validWeakMeasureColumnWidthItem]);
    });

    it("should remove attributeWidthItem when attribute is not located on column", () => {
        const sourceColumnWidthsWithAttributeColumn: ColumnWidthItem[] = [
            validAttributeColumnWidthItem,
            validWeakMeasureColumnWidthItem,
        ];

        const result = adaptReferencePointWidthItemsToPivotTable(
            sourceColumnWidthsWithAttributeColumn,
            measures,
            [],
            columnAttributes,
            [],
            [],
            [],
            undefined as unknown as MeasureGroupDimension,
        );

        expect(result).toEqual([validWeakMeasureColumnWidthItem]);
    });

    it("should remove attributeWidthItem when measure column is filtered out by filter", () => {
        const sourceColumnWidthsWithAttributeColumn: ColumnWidthItem[] = [validMeasureColumnWidthItem];

        const filter: IBucketFilter = {
            attribute: "a2",
            displayFormRef: uriRef("a2/df"),
            isInverted: true,
            selectedElements: [
                {
                    title: "1234",
                    uri: "/gdc/md/PROJECTID/obj/2210/elements?id=1234",
                },
            ],
            totalElementsCount: 4,
        };

        const result = adaptReferencePointWidthItemsToPivotTable(
            sourceColumnWidthsWithAttributeColumn,
            measures,
            rowAttributes,
            columnAttributes,
            [],
            [],
            [filter],
            undefined as unknown as MeasureGroupDimension,
        );

        expect(result).toEqual([]);
    });

    it("should not remove attributeWidthItem when measure column is not filtered out by filter", () => {
        const sourceColumnWidthsWithAttributeColumn: ColumnWidthItem[] = [validMeasureColumnWidthItem];

        const filter: IBucketFilter = {
            attribute: "a2",
            displayFormRef: uriRef("a2/df"),
            isInverted: false,
            selectedElements: [
                {
                    title: "1234",
                    uri: "/gdc/md/PROJECTID/obj/2210/elements?id=1234",
                },
            ],
            totalElementsCount: 4,
        };

        const result = adaptReferencePointWidthItemsToPivotTable(
            sourceColumnWidthsWithAttributeColumn,
            measures,
            rowAttributes,
            columnAttributes,
            [],
            [],
            [filter],
            undefined as unknown as MeasureGroupDimension,
        );

        expect(result).toEqual([validMeasureColumnWidthItem]);
    });
});

describe("adaptReferencePointWidthItemsToPivotTable transposed", () => {
    it("should remove invalid width items", () => {
        const sourceReferencePoint = simpleStackedReferencePoint;

        const sourceColumnWidths: ColumnWidthItem[] = [
            invalidSliceMeasureColumnWidthItem,
            invalidMixedValueColumnWidthItem,
            validSliceMeasureColumnWidthItem,
            validMixedValuesColumnWidthItem,
        ];

        const measures: IBucketItem[] = sourceReferencePoint.buckets[0].items;
        const rowAttributes: IBucketItem[] = sourceReferencePoint.buckets[1].items;
        const columnAttributes: IBucketItem[] = sourceReferencePoint.buckets[2].items;

        const result = adaptReferencePointWidthItemsToPivotTable(
            sourceColumnWidths,
            measures,
            rowAttributes,
            columnAttributes,
            [],
            [],
            [],
            undefined as unknown as MeasureGroupDimension,
        );

        expect(result).toEqual([validSliceMeasureColumnWidthItem, validMixedValuesColumnWidthItem]);
    });
});
