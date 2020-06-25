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
});
