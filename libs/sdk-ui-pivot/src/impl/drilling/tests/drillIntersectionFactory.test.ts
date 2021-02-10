// (C) 2007-2021 GoodData Corporation
import { ReferenceData } from "@gooddata/reference-workspace";
import { createTestRow, TwoMeasuresWithTwoRowAndTwoColumnAttributesDescriptor } from "./drilling.fixture";
import { createDrillIntersection } from "../drillIntersectionFactory";
import { IGridRow } from "../../data/resultTypes";
import { AnyCol } from "../../structure/tableDescriptorTypes";

describe("createDrillIntersection", () => {
    const TestTable = TwoMeasuresWithTwoRowAndTwoColumnAttributesDescriptor;
    const SliceCol = TestTable.headers.sliceCols[0];
    const LeafCol = TestTable.headers.leafDataCols[0];
    const TestRow = createTestRow(TestTable, [
        ReferenceData.ProductName.CompuSci,
        ReferenceData.Department.DirectSales,
    ]);

    function testCellEvent(col: AnyCol, row: IGridRow) {
        return {
            colDef: { colId: col.id },
            data: row,
        } as any;
    }

    it("creates drill intersection for row attribute", () => {
        expect(createDrillIntersection(testCellEvent(SliceCol, TestRow), TestTable)).toMatchSnapshot();
    });

    it("creates drill intersection for measure cell attribute", () => {
        expect(createDrillIntersection(testCellEvent(LeafCol, TestRow), TestTable)).toMatchSnapshot();
    });
});
