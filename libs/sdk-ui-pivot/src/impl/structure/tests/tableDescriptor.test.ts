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
import { DataColGroup, DataColLeaf } from "../tableDescriptorTypes";
import { newWidthForAttributeColumn } from "../../../columnWidths";
import { ReferenceLdm } from "@gooddata/reference-workspace";

describe("TableDescriptor", () => {
    describe("isFirstCol", () => {
        it("should identify first col in row attribute only table", () => {
            expect(TableDescriptor.for(SingleAttribute).isFirstCol("r_0")).toBeTruthy();
        });

        it("should identify first col in measure only table", () => {
            expect(TableDescriptor.for(TwoMeasures).isFirstCol("c_0")).toBeTruthy();
        });

        it("should identify first col in table with row and measure", () => {
            expect(TableDescriptor.for(SingleMeasureWithRowAttribute).isFirstCol("r_0")).toBeTruthy();
        });

        it("should identify first col in column attribute only table", () => {
            expect(TableDescriptor.for(SingleColumn).isFirstCol("cg_0")).toBeTruthy();
        });

        it("should identify first col in table without row attribute", () => {
            expect(TableDescriptor.for(SingleMeasureWithColumnAttribute).isFirstCol("g_0")).toBeTruthy();
            expect(TableDescriptor.for(SingleMeasureWithColumnAttribute).isFirstCol("c_0")).toBeTruthy();
        });

        it("should identify first col in table with row and col attributes", () => {
            expect(
                TableDescriptor.for(SingleMeasureWithTwoRowAndTwoColumnAttributes).isFirstCol("r_0"),
            ).toBeTruthy();
        });
    });

    describe("hasGroupedDataCols", () => {
        it("should be true for table with column attributes", () => {
            expect(TableDescriptor.for(SingleMeasureWithColumnAttribute).hasGroupedDataCols()).toBeTruthy();
        });

        it("should be false for table without column attributes", () => {
            expect(TableDescriptor.for(SingleAttribute).hasGroupedDataCols()).toBeFalsy();
            expect(TableDescriptor.for(TwoMeasures).hasGroupedDataCols()).toBeFalsy();
            expect(TableDescriptor.for(SingleMeasureWithRowAttribute).hasGroupedDataCols()).toBeFalsy();
        });
    });

    describe("getAbsoluteLeafColIndex", () => {
        it("should return correct indexes in table with just measures", () => {
            const table = TableDescriptor.for(TwoMeasures);
            const [firstCol, secondCol]: DataColLeaf[] = table.headers.leafDataCols as any;

            expect(table.getAbsoluteLeafColIndex(firstCol)).toEqual(0);
            expect(table.getAbsoluteLeafColIndex(secondCol)).toEqual(1);
        });

        it("should return correct indexes in table with measure and row", () => {
            const table = TableDescriptor.for(SingleMeasureWithRowAttribute);
            const [firstCol]: DataColLeaf[] = table.headers.leafDataCols as any;

            expect(table.getAbsoluteLeafColIndex(table.headers.sliceCols[0])).toEqual(0);
            expect(table.getAbsoluteLeafColIndex(firstCol)).toEqual(firstCol.index + 1);
        });

        it("should return correct indexes in table with just columns", () => {
            const table = TableDescriptor.for(SingleColumn);
            const [firstCol, secondCol]: DataColGroup[] = table.headers.leafDataCols as any;

            expect(table.getAbsoluteLeafColIndex(firstCol)).toEqual(0);
            expect(table.getAbsoluteLeafColIndex(secondCol)).toEqual(1);
        });
    });

    describe("matchAttributeWidthItem", () => {
        it("should match row attribute in pivot table", () => {
            expect(
                TableDescriptor.for(SingleMeasureWithTwoRowAndTwoColumnAttributes).matchAttributeWidthItem(
                    newWidthForAttributeColumn(ReferenceLdm.Product.Name, 100),
                ),
            ).toBeTruthy();
        });

        it("should not match column attribute in pivot table", () => {
            expect(
                TableDescriptor.for(SingleMeasureWithTwoRowAndTwoColumnAttributes).matchAttributeWidthItem(
                    newWidthForAttributeColumn(ReferenceLdm.Region, 100),
                ),
            ).toBeUndefined();
        });
    });

    describe("canTableHaveTotals", () => {
        it("should return false for table without row attribute", () => {
            expect(TableDescriptor.for(SingleMeasureWithColumnAttribute).canTableHaveTotals()).toBeFalsy();
        });

        it("should return false for table without measures", () => {
            expect(TableDescriptor.for(SingleAttribute).canTableHaveTotals()).toBeFalsy();
        });

        it("should return true for table with row and measure", () => {
            expect(TableDescriptor.for(SingleMeasureWithRowAttribute).canTableHaveTotals()).toBeTruthy();
        });
    });
});
