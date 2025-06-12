// (C) 2007-2021 GoodData Corporation

import { AnyCol } from "../../structure/tableDescriptorTypes.js";
import { IGridRow } from "../../data/resultTypes.js";
import { createTestRow, TwoMeasuresWithTwoRowAndTwoColumnAttributesDescriptor } from "./drilling.fixture.js";
import { ReferenceData } from "@gooddata/reference-workspace";
import { createDrillHeaders } from "../colDrillHeadersFactory.js";
import { describe, it, expect } from "vitest";

describe("createDrillHeaders", () => {
    const TestTable = TwoMeasuresWithTwoRowAndTwoColumnAttributesDescriptor;
    const FirstSliceCol = TestTable.headers.sliceCols[0];
    const SecondSliceCol = TestTable.headers.sliceCols[1];
    const LeafCol = TestTable.headers.leafDataCols[0];
    const FirstLevelGroupCol = TestTable.headers.rootDataCols[0].children[0];
    const SecondLevelGroupCol = TestTable.headers.rootDataCols[0].children[0].children[0];

    const Scenarios: Array<[string, AnyCol, IGridRow | undefined]> = [
        [
            "first attribute's header and descriptor from first slice column",
            FirstSliceCol,
            createTestRow(TestTable, [
                ReferenceData.ProductName.CompuSci,
                ReferenceData.Department.DirectSales,
            ]),
        ],
        [
            "second attribute's header and descriptor from second column",
            SecondSliceCol,
            createTestRow(TestTable, [
                ReferenceData.ProductName.CompuSci,
                ReferenceData.Department.DirectSales,
            ]),
        ],
        [
            "all scoping attribute's headers and descriptors and measure from measure's data col",
            LeafCol,
            undefined,
        ],
        [
            "just first level group's attribute header and descriptor from first level group",
            FirstLevelGroupCol,
            undefined,
        ],
        [
            "both parent's and second level's group attribute and descriptor from second level group",
            SecondLevelGroupCol,
            undefined,
        ],
    ];

    it.each(Scenarios)("should generate drill item containing %s", (_desc, col, row) => {
        expect(createDrillHeaders(col, row, "top", false)).toMatchSnapshot();
    });
});
