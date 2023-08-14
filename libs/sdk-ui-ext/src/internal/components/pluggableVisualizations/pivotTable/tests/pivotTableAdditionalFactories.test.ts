// (C) 2022 GoodData Corporation
import {
    newAttributeColumnLocator,
    newTotalColumnLocator,
    newMeasureColumnLocator,
    newWidthForAllColumnsForMeasure,
    newWidthForAllMeasureColumns,
    newWidthForAttributeColumn,
    newWidthForSelectedColumns,
    newWidthForTransposedSelectedColumns,
} from "@gooddata/sdk-ui-pivot";
import {
    factoryNotationForAllMeasureColumnWidthItem,
    factoryNotationForAttributeColumnLocator,
    factoryNotationForAttributeColumnWidthItem,
    factoryNotationForMeasureColumnWidthItem,
    factoryNotationForWeakMeasureColumnWidthItem,
    factoryNotationForTransposedMeasureColumnWidthItem,
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

        describe.each([
            ["numeric", 123],
            ["string", "auto"],
        ] as const)("with %s width value", (_, width) => {
            it("should handle item without grow to fit", () => {
                const input = newWidthForSelectedColumns("some-id", attributeLocators, width);
                const actual = factoryNotationForMeasureColumnWidthItem(input);
                expect(actual).toMatchSnapshot();
            });
            it("should handle item with grow to fit", () => {
                const input = newWidthForSelectedColumns("some-id", attributeLocators, width, true);
                const actual = factoryNotationForMeasureColumnWidthItem(input);
                expect(actual).toMatchSnapshot();
            });
        });
    });

    describe("factoryNotationForTransposedMeasureColumnWidthItem", () => {
        const measureLocators = [
            newMeasureColumnLocator("measure-id-1"),
            newMeasureColumnLocator("measure-id-2"),
        ];
        const attributeLocators = [newAttributeColumnLocator("attr-id")];
        const totalLocators = [newTotalColumnLocator("attr-id", "sum")];

        describe.each([
            ["numeric", 123],
            ["string", "auto"],
        ] as const)("with %s width value", (_, width) => {
            it("should handle item without grow to fit", () => {
                const input = newWidthForTransposedSelectedColumns(
                    [...measureLocators, ...attributeLocators],
                    width,
                );
                const actual = factoryNotationForTransposedMeasureColumnWidthItem(input);
                expect(actual).toMatchSnapshot();
            });
            it("should handle item with grow to fit", () => {
                const input = newWidthForTransposedSelectedColumns(
                    [...measureLocators, ...attributeLocators, ...totalLocators],
                    width,
                    true,
                );
                const actual = factoryNotationForTransposedMeasureColumnWidthItem(input);
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
