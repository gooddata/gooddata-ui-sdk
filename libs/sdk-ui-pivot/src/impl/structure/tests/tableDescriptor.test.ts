// (C) 2021 GoodData Corporation
import {
    SingleAttribute,
    SingleColumn,
    SingleMeasureWithColumnAttribute,
    SingleMeasureWithRowAttribute,
    SingleMeasureWithTwoRowAndTwoColumnAttributes,
    TwoMeasures,
} from "./table.fixture";
import { TableDescriptor } from "../tableDescriptor";
import { ScopeCol, SeriesCol } from "../tableDescriptorTypes";
import { newWidthForAttributeColumn } from "../../../columnWidths";
import { ReferenceMd } from "@gooddata/reference-workspace";

describe("TableDescriptor", () => {
    describe("isFirstCol", () => {
        it("should identify first col in row attribute only table", () => {
            expect(TableDescriptor.for(SingleAttribute, "empty value").isFirstCol("r_0")).toBeTruthy();
        });

        it("should identify first col in measure only table", () => {
            expect(TableDescriptor.for(TwoMeasures, "empty value").isFirstCol("c_0")).toBeTruthy();
        });

        it("should identify first col in table with row and measure", () => {
            expect(
                TableDescriptor.for(SingleMeasureWithRowAttribute, "empty value").isFirstCol("r_0"),
            ).toBeTruthy();
        });

        it("should identify first col in column attribute only table", () => {
            expect(TableDescriptor.for(SingleColumn, "empty value").isFirstCol("cg_0")).toBeTruthy();
        });

        it("should identify first col in table without row attribute", () => {
            expect(
                TableDescriptor.for(SingleMeasureWithColumnAttribute, "empty value").isFirstCol("g_0"),
            ).toBeTruthy();
            expect(
                TableDescriptor.for(SingleMeasureWithColumnAttribute, "empty value").isFirstCol("c_0"),
            ).toBeTruthy();
        });

        it("should identify first col in table with row and col attributes", () => {
            expect(
                TableDescriptor.for(SingleMeasureWithTwoRowAndTwoColumnAttributes, "empty value").isFirstCol(
                    "r_0",
                ),
            ).toBeTruthy();
        });
    });

    describe("hasGroupedDataCols", () => {
        it("should be true for table with column attributes", () => {
            expect(
                TableDescriptor.for(SingleMeasureWithColumnAttribute, "empty value").hasScopingCols(),
            ).toBeTruthy();
        });

        it("should be false for table without column attributes", () => {
            expect(TableDescriptor.for(SingleAttribute, "empty value").hasScopingCols()).toBeFalsy();
            expect(TableDescriptor.for(TwoMeasures, "empty value").hasScopingCols()).toBeFalsy();
            expect(
                TableDescriptor.for(SingleMeasureWithRowAttribute, "empty value").hasScopingCols(),
            ).toBeFalsy();
        });
    });

    describe("getAbsoluteLeafColIndex", () => {
        it("should return correct indexes in table with just measures", () => {
            const table = TableDescriptor.for(TwoMeasures, "empty value");
            const [firstCol, secondCol]: SeriesCol[] = table.headers.leafDataCols as any;

            expect(table.getAbsoluteLeafColIndex(firstCol)).toEqual(0);
            expect(table.getAbsoluteLeafColIndex(secondCol)).toEqual(1);
        });

        it("should return correct indexes in table with measure and row", () => {
            const table = TableDescriptor.for(SingleMeasureWithRowAttribute, "empty value");
            const [firstCol]: SeriesCol[] = table.headers.leafDataCols as any;

            expect(table.getAbsoluteLeafColIndex(table.headers.sliceCols[0])).toEqual(0);
            expect(table.getAbsoluteLeafColIndex(firstCol)).toEqual(firstCol.index + 1);
        });

        it("should return correct indexes in table with just columns", () => {
            const table = TableDescriptor.for(SingleColumn, "empty value");
            const [firstCol, secondCol]: ScopeCol[] = table.headers.leafDataCols as any;

            expect(table.getAbsoluteLeafColIndex(firstCol)).toEqual(0);
            expect(table.getAbsoluteLeafColIndex(secondCol)).toEqual(1);
        });
    });

    describe("matchAttributeWidthItem", () => {
        it("should match row attribute in pivot table", () => {
            expect(
                TableDescriptor.for(
                    SingleMeasureWithTwoRowAndTwoColumnAttributes,
                    "empty value",
                ).matchAttributeWidthItem(newWidthForAttributeColumn(ReferenceMd.Product.Name, 100)),
            ).toBeTruthy();
        });

        it("should not match column attribute in pivot table", () => {
            expect(
                TableDescriptor.for(
                    SingleMeasureWithTwoRowAndTwoColumnAttributes,
                    "empty value",
                ).matchAttributeWidthItem(newWidthForAttributeColumn(ReferenceMd.Region, 100)),
            ).toBeUndefined();
        });
    });

    describe("canTableHaveTotals", () => {
        it("should return false for table without row attribute", () => {
            expect(
                TableDescriptor.for(SingleMeasureWithColumnAttribute, "empty value").canTableHaveTotals(),
            ).toBeFalsy();
        });

        it("should return false for table without measures", () => {
            expect(TableDescriptor.for(SingleAttribute, "empty value").canTableHaveTotals()).toBeFalsy();
        });

        it("should return true for table with row and measure", () => {
            expect(
                TableDescriptor.for(SingleMeasureWithRowAttribute, "empty value").canTableHaveTotals(),
            ).toBeTruthy();
        });
    });
});
