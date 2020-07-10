// (C) 2020 GoodData Corporation
import { IBucketItem } from "../../../../interfaces/Visualization";

import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import {
    invalidAttributeColumnWidthItem,
    invalidMeasureColumnWidthItem,
    invalidMeasureColumnWidthItemInvalidAttribute,
    invalidMeasureColumnWidthItemLocatorsTooShort,
    invalidMeasureColumnWidthItemTooManyLocators,
    validAttributeColumnWidthItem,
    validMeasureColumnWidthItem,
    validAllMeasureColumnWidthItem,
    validWeakMeasureColumnWidthItem,
} from "./widthItemsMock";
import { adaptReferencePointWidthItemsToPivotTable } from "../widthItemsHelpers";
import { ColumnWidthItem } from "@gooddata/sdk-ui-pivot";

describe("adaptReferencePointWidthItemsToPivotTable", () => {
    const sourceReferencePoint = referencePointMocks.simpleStackedReferencePoint;

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

    it("should remove invalid width items", async () => {
        const previousRowAttributes: IBucketItem[] = sourceReferencePoint.buckets[1].items;
        const previousColumnAttributes: IBucketItem[] = sourceReferencePoint.buckets[2].items;

        const expectedColumnWidthItems: ColumnWidthItem[] = [
            validAttributeColumnWidthItem,
            validMeasureColumnWidthItem,
        ];

        const result = adaptReferencePointWidthItemsToPivotTable(
            sourceColumnWidths,
            measures,
            rowAttributes,
            columnAttributes,
            previousRowAttributes,
            previousColumnAttributes,
            [],
        );

        expect(result).toEqual(expectedColumnWidthItems);
    });

    it("should remove invalid items and keep allMeasureColumnWidthItem", () => {
        const sourceColumnWidthsWithAllMeasure: ColumnWidthItem[] = [
            ...sourceColumnWidths,
            validAllMeasureColumnWidthItem,
        ];

        const previousRowAttributes: IBucketItem[] = sourceReferencePoint.buckets[1].items;
        const previousColumnAttributes: IBucketItem[] = sourceReferencePoint.buckets[2].items;

        const expectedColumnWidthItems: ColumnWidthItem[] = [
            validAttributeColumnWidthItem,
            validMeasureColumnWidthItem,
            validAllMeasureColumnWidthItem,
        ];

        const result = adaptReferencePointWidthItemsToPivotTable(
            sourceColumnWidthsWithAllMeasure,
            measures,
            rowAttributes,
            columnAttributes,
            previousRowAttributes,
            previousColumnAttributes,
            [],
        );

        expect(result).toEqual(expectedColumnWidthItems);
    });

    it("should keep allMeasureColumnWidthItem when some measures left", () => {
        const sourceColumnWidthsWithAllMeasure: ColumnWidthItem[] = [validAllMeasureColumnWidthItem];

        const expectedColumnWidthItems: ColumnWidthItem[] = [validAllMeasureColumnWidthItem];

        const result = adaptReferencePointWidthItemsToPivotTable(
            sourceColumnWidthsWithAllMeasure,
            measures,
            [],
            [],
            [],
            [],
            [],
        );

        expect(result).toEqual(expectedColumnWidthItems);
    });

    it("should remove allMeasureColumnWidthItem when no measures left", () => {
        const sourceColumnWidthsWithAllMeasure: ColumnWidthItem[] = [validAllMeasureColumnWidthItem];

        const expectedColumnWidthItems: ColumnWidthItem[] = [];

        const result = adaptReferencePointWidthItemsToPivotTable(
            sourceColumnWidthsWithAllMeasure,
            [],
            [],
            [],
            [],
            [],
            [],
        );

        expect(result).toEqual(expectedColumnWidthItems);
    });

    it("should keep weakMeasureColumnWidthItem when some measures left", () => {
        const sourceColumnWidthsWithWeakMeasure: ColumnWidthItem[] = [validWeakMeasureColumnWidthItem];

        const expectedColumnWidthItems: ColumnWidthItem[] = [validWeakMeasureColumnWidthItem];

        const result = adaptReferencePointWidthItemsToPivotTable(
            sourceColumnWidthsWithWeakMeasure,
            measures,
            [],
            [],
            [],
            [],
            [],
        );

        expect(result).toEqual(expectedColumnWidthItems);
    });

    it("should transform measureWidthItem to weakMeasureColumnWidthItem when first column attribute added", () => {
        const sourceColumnWidthsWithweakMeasure: ColumnWidthItem[] = [
            invalidMeasureColumnWidthItemLocatorsTooShort,
        ];

        const expectedColumnWidthItems: ColumnWidthItem[] = [validWeakMeasureColumnWidthItem];

        const result = adaptReferencePointWidthItemsToPivotTable(
            sourceColumnWidthsWithweakMeasure,
            measures,
            [],
            columnAttributes,
            [],
            [],
            [],
        );

        expect(result).toEqual(expectedColumnWidthItems);
    });
});
