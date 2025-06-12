// (C) 2022 GoodData Corporation
import {
    newAttributeColumnLocator,
    newTotalColumnLocator,
    newWidthForAllColumnsForMeasure,
    newWidthForAllMeasureColumns,
    newWidthForAttributeColumn,
    setNewWidthForSelectedColumns,
} from "@gooddata/sdk-ui-pivot";
import {
    factoryNotationForAllMeasureColumnWidthItem,
    factoryNotationForAttributeColumnLocator,
    factoryNotationForAttributeColumnWidthItem,
    factoryNotationForMeasureColumnWidthItem,
    factoryNotationForWeakMeasureColumnWidthItem,
} from "../pivotTableAdditionalFactories.js";

import { describe, it, expect } from "vitest";

describe("pivotTableAdditionalFactories", () => {
    describe("factoryNotationForAttributeColumnWidthItem", () => {
        it("should handle item without grow to fit", () => {
            const input = newWidthForAttributeColumn("some-id", 123);
            const actual = factoryNotationForAttributeColumnWidthItem(input);
            expect(actual).toMatchSnapshot();
        });
        it("should handle item with grow to fit", () => {
            const input = newWidthForAttributeColumn("some-id", 123, true);
            const actual = factoryNotationForAttributeColumnWidthItem(input);
            expect(actual).toMatchSnapshot();
        });
    });

    describe("factoryNotationForMeasureColumnWidthItem", () => {
        const attributeLocators = [newAttributeColumnLocator("attr-id")];
        const totalLocators = [newTotalColumnLocator("attr-id", "max")];

        describe.each([
            ["numeric", 123],
            ["string", "auto"],
        ] as const)("with %s width value", (_, width) => {
            it("should handle item without grow to fit", () => {
                const input = setNewWidthForSelectedColumns("some-id", attributeLocators, width);
                const actual = factoryNotationForMeasureColumnWidthItem(input);
                expect(actual).toMatchSnapshot();
            });
            it("should handle item with grow to fit", () => {
                const input = setNewWidthForSelectedColumns("some-id", attributeLocators, width, true);
                const actual = factoryNotationForMeasureColumnWidthItem(input);
                expect(actual).toMatchSnapshot();
            });
            it("should handle item with transposed metrics and without grow to fit", () => {
                const input = setNewWidthForSelectedColumns(
                    ["measure-1", "measure-2", "measure-3"],
                    [...attributeLocators, ...totalLocators],
                    width,
                    true,
                );
                const actual = factoryNotationForMeasureColumnWidthItem(input);
                expect(actual).toMatchSnapshot();
            });
            it("should handle item with transposed metrics and with grow to fit", () => {
                const input = setNewWidthForSelectedColumns(
                    ["measure-1", "measure-2"],
                    [...attributeLocators, ...totalLocators],
                    width,
                    true,
                );
                const actual = factoryNotationForMeasureColumnWidthItem(input);
                expect(actual).toMatchSnapshot();
            });
        });
    });

    describe("factoryNotationForAttributeColumnLocator", () => {
        it("should handle item without element", () => {
            const input = newAttributeColumnLocator("some-id");
            const actual = factoryNotationForAttributeColumnLocator(input);
            expect(actual).toMatchSnapshot();
        });
        it("should handle item with element", () => {
            const input = newAttributeColumnLocator("some-id", "some-element");
            const actual = factoryNotationForAttributeColumnLocator(input);
            expect(actual).toMatchSnapshot();
        });
    });

    describe("factoryNotationForWeakMeasureColumnWidthItem", () => {
        it("should handle item without grow to fit", () => {
            const input = newWidthForAllColumnsForMeasure("some-id", 123);
            const actual = factoryNotationForWeakMeasureColumnWidthItem(input);
            expect(actual).toMatchSnapshot();
        });
        it("should handle item with grow to fit", () => {
            const input = newWidthForAllColumnsForMeasure("some-id", 123, true);
            const actual = factoryNotationForWeakMeasureColumnWidthItem(input);
            expect(actual).toMatchSnapshot();
        });
    });

    describe("factoryNotationForAllMeasureColumnWidthItem", () => {
        it("should handle item without grow to fit", () => {
            const input = newWidthForAllMeasureColumns(123);
            const actual = factoryNotationForAllMeasureColumnWidthItem(input);
            expect(actual).toMatchSnapshot();
        });
        it("should handle item with grow to fit", () => {
            const input = newWidthForAllMeasureColumns(123, true);
            const actual = factoryNotationForAllMeasureColumnWidthItem(input);
            expect(actual).toMatchSnapshot();
        });
    });
});
