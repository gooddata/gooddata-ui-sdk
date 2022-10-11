// (C) 2007-2021 GoodData Corporation

import { DataViewFacade } from "@gooddata/sdk-ui";
import {
    SingleAttribute,
    SingleColumn,
    SingleMeasureWithColumnAttribute,
    SingleMeasureWithRowAndColumnAttributes,
    SingleMeasureWithRowAttribute,
    SingleMeasureWithTwoRowAndTwoColumnAttributes,
    TwoMeasures,
    TwoMeasuresAndGrandTotalsAndMultipleSubtotals,
    TwoMeasuresWithColumnAttribute,
} from "./table.fixture";
import { createHeadersAndColDefs } from "../tableDescriptorFactory";
import { ColDef, ColGroupDef } from "@ag-grid-community/all-modules";

describe("createTableDescriptor", () => {
    const Scenarios: Array<[string, DataViewFacade]> = [
        ["table with just column attribute", SingleColumn],
        ["table with just two measures", TwoMeasures],
        ["table with just row attribute", SingleAttribute],
        ["table without pivoting", SingleMeasureWithRowAttribute],
        ["table with single attribute pivot", SingleMeasureWithColumnAttribute],
        ["table with two measures and single attribute pivot", TwoMeasuresWithColumnAttribute],
        ["table with single row and column pivot", SingleMeasureWithRowAndColumnAttributes],
        ["table with two attribute pivot", SingleMeasureWithTwoRowAndTwoColumnAttributes],
        [
            "table with two measures, rows and cols and totals and subtotals",
            TwoMeasuresAndGrandTotalsAndMultipleSubtotals,
        ],
    ];

    it.each(Scenarios)("correctly populates fullIndexPaths for %s", (_desc, dv) => {
        const descriptor = createHeadersAndColDefs(dv, "empty value");
        const fullIndexPaths = descriptor.headers.leafDataCols.map((col) => col.fullIndexPathToHere);

        expect(fullIndexPaths).toMatchSnapshot();
    });

    it.each(Scenarios)("correctly creates colDefs for %s", (_desc, dv) => {
        const descriptor = createHeadersAndColDefs(dv, "empty value");
        const allCols: Array<ColDef | ColGroupDef> = [];

        allCols.push(...descriptor.colDefs.sliceColDefs);
        allCols.push(...descriptor.colDefs.rootDataColDefs);

        expect(allCols).toMatchSnapshot();
    });
});
