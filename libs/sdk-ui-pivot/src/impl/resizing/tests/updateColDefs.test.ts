// (C) 2007-2021 GoodData Corporation

import {
    ColumnWidthItem,
    newAttributeColumnLocator,
    newWidthForAllColumnsForMeasure,
    newWidthForAllMeasureColumns,
    newWidthForAttributeColumn,
    newWidthForSelectedColumns,
} from "../../../columnWidths";
import { TableDescriptor } from "../../structure/tableDescriptor";
import {
    testStore,
    TwoMeasuresWithRowAttribute,
    TwoMeasuresWithTwoRowAndTwoColumnAttributes,
} from "./columnSizing.fixture";
import { MANUALLY_SIZED_MAX_WIDTH, updateColumnDefinitionsWithWidths } from "../columnSizing";
import { ReferenceData, ReferenceMd } from "@gooddata/reference-workspace";

// NOTE: the function under test mutate inputs (by design). each test must use its own instance of TableDescriptor
//  as the ColDefs has will be updated during test runs.
describe("updateColumnDefinitionsWithWidths", () => {
    it("should enrich colDefs based on column width items", () => {
        const table = TableDescriptor.for(TwoMeasuresWithTwoRowAndTwoColumnAttributes, "empty value");
        const widths: ColumnWidthItem[] = [
            newWidthForSelectedColumns(
                ReferenceMd.Amount,
                [
                    newAttributeColumnLocator(
                        ReferenceMd.ForecastCategory,
                        ReferenceData.ForecastCategory.Include.uri,
                    ),
                    newAttributeColumnLocator(ReferenceMd.Region, ReferenceData.Region.EastCoast.uri),
                ],
                200,
            ),
            newWidthForAttributeColumn(ReferenceMd.Product.Name, 300),
            newWidthForAllColumnsForMeasure(ReferenceMd.Won, 175),
        ];

        const store = testStore(table, ...widths);

        updateColumnDefinitionsWithWidths(table, store, {}, 666, false, {});

        expect(table.colDefs.leafDataColDefs).toMatchSnapshot();
        expect(table.colDefs.sliceColDefs).toMatchSnapshot();
    });

    it("should enrich colDefs when mix of manual and auto-resizing", () => {
        const table = TableDescriptor.for(TwoMeasuresWithRowAttribute, "empty value");
        const store = testStore(table, newWidthForAllMeasureColumns(200));

        // note: size of c_1 should be ignored because manual setting above (to 200) should have preference
        updateColumnDefinitionsWithWidths(
            table,
            store,
            { r_0: { width: 100 }, c_1: { width: 125 } },
            666,
            false,
            {},
        );

        expect(table.colDefs.leafDataColDefs).toMatchSnapshot();
        expect(table.colDefs.sliceColDefs).toMatchSnapshot();
    });

    it("should enrich colDefs when mix of manual and auto-resizing and grow-to-fit on", () => {
        const table = TableDescriptor.for(TwoMeasuresWithRowAttribute, "empty value");
        const store = testStore(table, newWidthForSelectedColumns(ReferenceMd.Won, [], 200));

        updateColumnDefinitionsWithWidths(table, store, { r_0: { width: 100 } }, 666, true, {
            c_0: { width: 500 },
        });

        expect(table.colDefs.leafDataColDefs).toMatchSnapshot();
        expect(table.colDefs.sliceColDefs).toMatchSnapshot();
    });

    it("should set with to default if no other size specification provided", () => {
        const table = TableDescriptor.for(TwoMeasuresWithRowAttribute, "empty value");
        const store = testStore(table);

        updateColumnDefinitionsWithWidths(table, store, {}, 666, false, {});

        expect(table.colDefs.leafDataColDefs).toMatchSnapshot();
        expect(table.colDefs.sliceColDefs).toMatchSnapshot();
    });

    it("should set maxWidth to undefined when growToFit width is bigger than MANUALLY_SIZED_MAX_WIDTH", () => {
        const table = TableDescriptor.for(TwoMeasuresWithRowAttribute, "empty value");
        const store = testStore(table);

        updateColumnDefinitionsWithWidths(table, store, {}, 100, true, {
            r_0: { width: MANUALLY_SIZED_MAX_WIDTH + 100 },
        });

        expect(table.colDefs.sliceColDefs[0]?.maxWidth).toBeUndefined();
    });
});
