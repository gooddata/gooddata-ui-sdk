// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    createAttributeColumnDefinition,
    createValueColumnDefinition,
} from "../../testing/columnDefinitions.test.helpers.js";
import { newAttributeColumnLocator } from "../../types/locators.js";
import { newWidthForAllColumnsForMeasure, setNewWidthForSelectedColumns } from "../../types/resizing.js";

import { getColumnWidthItemForColumnDefinition } from "./getColumnWidthItemForColumnDefinition.js";

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
