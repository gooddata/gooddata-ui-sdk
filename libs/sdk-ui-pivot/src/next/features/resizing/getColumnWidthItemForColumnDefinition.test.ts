// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IAttributeDescriptor,
    type IMeasureDescriptor,
    type IResultAttributeHeader,
    type IResultMeasureHeader,
    idRef,
} from "@gooddata/sdk-model";
import { type ITableColumnDefinition, type ITableValueColumnDefinition } from "@gooddata/sdk-ui";

import { getColumnWidthItemForColumnDefinition } from "./getColumnWidthItemForColumnDefinition.js";
import { newAttributeColumnLocator } from "../../types/locators.js";
import { newWidthForAllColumnsForMeasure, setNewWidthForSelectedColumns } from "../../types/resizing.js";

const ATTRIBUTE_IDENTIFIER = "region";
const ATTRIBUTE_ELEMENT_URI = "/gdc/md/demo/obj/1/elements?id=1";
const MEASURE_IDENTIFIER = "amount";

describe("getColumnWidthItemForColumnDefinition", () => {
    it("should return undefined when no width item matches", () => {
        const columnDefinition = createValueColumnDefinition({
            measureIdentifier: MEASURE_IDENTIFIER,
            attributeIdentifier: ATTRIBUTE_IDENTIFIER,
            attributeElementUri: ATTRIBUTE_ELEMENT_URI,
        });

        const nonMatchingWidthItem = newWidthForAllColumnsForMeasure("won", 300);

        const result = getColumnWidthItemForColumnDefinition(columnDefinition, [nonMatchingWidthItem]);

        expect(result).toBeUndefined();
    });

    it("should prefer exact match with explicit width over exact match with auto width", () => {
        const columnDefinition = createValueColumnDefinition({
            measureIdentifier: MEASURE_IDENTIFIER,
            attributeIdentifier: ATTRIBUTE_IDENTIFIER,
            attributeElementUri: ATTRIBUTE_ELEMENT_URI,
        });

        const exactAutoWidthItem = setNewWidthForSelectedColumns(
            [MEASURE_IDENTIFIER],
            [newAttributeColumnLocator(ATTRIBUTE_IDENTIFIER, ATTRIBUTE_ELEMENT_URI)],
            "auto",
        );
        const exactExplicitWidthItem = setNewWidthForSelectedColumns(
            [MEASURE_IDENTIFIER],
            [newAttributeColumnLocator(ATTRIBUTE_IDENTIFIER, ATTRIBUTE_ELEMENT_URI)],
            250,
        );

        const result = getColumnWidthItemForColumnDefinition(columnDefinition, [
            exactAutoWidthItem,
            exactExplicitWidthItem,
        ]);

        expect(result).toBe(exactExplicitWidthItem);
    });

    it("should prefer exact match over weak match even when weak match is explicit", () => {
        const columnDefinition = createValueColumnDefinition({
            measureIdentifier: MEASURE_IDENTIFIER,
            attributeIdentifier: ATTRIBUTE_IDENTIFIER,
            attributeElementUri: ATTRIBUTE_ELEMENT_URI,
        });

        const weakExplicitWidthItem = newWidthForAllColumnsForMeasure(MEASURE_IDENTIFIER, 300);
        const exactAutoWidthItem = setNewWidthForSelectedColumns(
            [MEASURE_IDENTIFIER],
            [newAttributeColumnLocator(ATTRIBUTE_IDENTIFIER, ATTRIBUTE_ELEMENT_URI)],
            "auto",
        );

        const result = getColumnWidthItemForColumnDefinition(columnDefinition, [
            weakExplicitWidthItem,
            exactAutoWidthItem,
        ]);

        expect(result).toBe(exactAutoWidthItem);
    });

    it("should return weak match with explicit width when exact match is missing", () => {
        const columnDefinition = createValueColumnDefinition({
            measureIdentifier: MEASURE_IDENTIFIER,
            attributeIdentifier: ATTRIBUTE_IDENTIFIER,
            attributeElementUri: ATTRIBUTE_ELEMENT_URI,
        });

        const weakExplicitWidthItem = newWidthForAllColumnsForMeasure(MEASURE_IDENTIFIER, 300);

        const result = getColumnWidthItemForColumnDefinition(columnDefinition, [weakExplicitWidthItem]);

        expect(result).toBe(weakExplicitWidthItem);
    });

    it("should keep first weak explicit match when multiple weak matches exist", () => {
        const columnDefinition = createValueColumnDefinition({
            measureIdentifier: MEASURE_IDENTIFIER,
            attributeIdentifier: ATTRIBUTE_IDENTIFIER,
            attributeElementUri: ATTRIBUTE_ELEMENT_URI,
        });

        const firstWeakExplicitWidthItem = newWidthForAllColumnsForMeasure(MEASURE_IDENTIFIER, 222);
        const secondWeakExplicitWidthItem = newWidthForAllColumnsForMeasure(MEASURE_IDENTIFIER, 333);

        const result = getColumnWidthItemForColumnDefinition(columnDefinition, [
            firstWeakExplicitWidthItem,
            secondWeakExplicitWidthItem,
        ]);

        expect(result).toBe(firstWeakExplicitWidthItem);
    });

    it("should not use weak matching for attribute columns", () => {
        const columnDefinition = createAttributeColumnDefinition(ATTRIBUTE_IDENTIFIER);
        const weakWidthItem = newWidthForAllColumnsForMeasure(MEASURE_IDENTIFIER, 200);

        const result = getColumnWidthItemForColumnDefinition(columnDefinition, [weakWidthItem]);

        expect(result).toBeUndefined();
    });
});

function createValueColumnDefinition(options: {
    measureIdentifier: string;
    attributeIdentifier: string;
    attributeElementUri: string;
}): ITableColumnDefinition {
    const { measureIdentifier, attributeIdentifier, attributeElementUri } = options;

    const columnScope: ITableValueColumnDefinition["columnScope"] = [
        {
            type: "attributeScope",
            descriptor: createAttributeDescriptor(attributeIdentifier),
            header: createAttributeHeader(attributeElementUri),
        },
        {
            type: "measureScope",
            descriptor: createMeasureDescriptor(measureIdentifier),
            header: createMeasureHeader(),
        },
    ];

    const valueColumnDefinition: ITableValueColumnDefinition = {
        type: "value",
        columnIndex: 0,
        columnHeaderIndex: 0,
        isEmpty: false,
        isTransposed: false,
        columnScope,
        measureHeader: createMeasureHeader(),
        measureDescriptor: createMeasureDescriptor(measureIdentifier),
    };

    return valueColumnDefinition;
}

function createAttributeColumnDefinition(attributeIdentifier: string): ITableColumnDefinition {
    return {
        type: "attribute",
        columnIndex: 0,
        rowHeaderIndex: 0,
        attributeDescriptor: createAttributeDescriptor(attributeIdentifier),
    };
}

function createAttributeDescriptor(attributeIdentifier: string): IAttributeDescriptor {
    return {
        attributeHeader: {
            uri: `/gdc/md/demo/obj/${attributeIdentifier}`,
            identifier: `${attributeIdentifier}.id`,
            localIdentifier: attributeIdentifier,
            ref: idRef(`${attributeIdentifier}.id`),
            name: "Region",
            formOf: {
                ref: idRef("attr.region"),
                uri: "/gdc/md/demo/obj/attr.region",
                identifier: "attr.region",
                name: "Region",
            },
            primaryLabel: idRef(`${attributeIdentifier}.id`),
        },
    };
}

function createAttributeHeader(attributeElementUri: string): IResultAttributeHeader {
    return {
        attributeHeaderItem: {
            name: "Region",
            uri: attributeElementUri,
        },
    };
}

function createMeasureDescriptor(measureIdentifier: string): IMeasureDescriptor {
    return {
        measureHeaderItem: {
            localIdentifier: measureIdentifier,
            name: "Amount",
            format: "#,##0.00",
            ref: idRef(measureIdentifier),
        },
    };
}

function createMeasureHeader(): IResultMeasureHeader {
    return {
        measureHeaderItem: {
            name: "Amount",
            order: 0,
        },
    };
}
