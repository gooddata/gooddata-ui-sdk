// (C) 2007-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { ReferenceData } from "@gooddata/reference-workspace";

import { TwoMeasuresWithTwoRowAndTwoColumnAttributesDescriptor, createTestRow } from "./drilling.fixture.js";
import { IGridRow } from "../../data/resultTypes.js";
import { AnyCol } from "../../structure/tableDescriptorTypes.js";
import { createDrillIntersection } from "../drillIntersectionFactory.js";

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
        expect(createDrillIntersection(testCellEvent(SliceCol, TestRow), TestTable, [])).toMatchSnapshot();
    });

    it("creates drill intersection for measure cell attribute", () => {
        expect(createDrillIntersection(testCellEvent(LeafCol, TestRow), TestTable, [])).toMatchSnapshot();
    });
});
