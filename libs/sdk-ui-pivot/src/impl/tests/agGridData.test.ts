// (C) 2007-2020 GoodData Corporation

import { createIntlMock } from "@gooddata/sdk-ui";
import { createTableHeaders } from "../agGridHeaders";
import { getRow, getRowTotals } from "../agGridData";
import { DataViewFirstPage } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataFacade } from "../../../__mocks__/recordings";

const intl = createIntlMock();

describe("getRowTotals", () => {
    it("should return total rows", () => {
        const fixture = recordedDataFacade(
            ReferenceRecordings.Scenarios.PivotTable.SingleMeasureAndMultipleGrandTotals,
            DataViewFirstPage,
        );

        const tableHeaders = createTableHeaders(fixture.dataView, { makeRowGroups: false });
        expect(
            getRowTotals(fixture, [...tableHeaders.rowFields, ...tableHeaders.colFields], intl),
        ).toMatchSnapshot();
    });
    it("should return null when no totals are defined", () => {
        const fixture = recordedDataFacade(
            ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAndColumnAttributes,
            DataViewFirstPage,
        );

        const tableHeaders = createTableHeaders(fixture.dataView, { makeRowGroups: false });
        expect(getRowTotals(fixture, [...tableHeaders.rowFields, ...tableHeaders.colFields], intl)).toBe(
            null,
        );
    });
});

describe("getRow", () => {
    it("should return a grid row", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAndColumnAttributes,
            DataViewFirstPage,
        );

        const headerItems = dv.meta().allHeaders();
        const tableHeaders = createTableHeaders(dv.dataView, { makeRowGroups: false });

        expect(
            getRow(
                dv.twoDimData()[0],
                0,
                tableHeaders.colFields,
                tableHeaders.rowHeaders,
                headerItems[0],
                [],
                intl,
            ),
        ).toMatchSnapshot();
    });
    it("should return subtotal row", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresAndMultipleSubtotals,
            DataViewFirstPage,
        );

        const headerItems = dv.meta().allHeaders();
        const tableHeaders = createTableHeaders(dv.dataView, { makeRowGroups: false });

        expect(
            getRow(
                dv.twoDimData()[0],
                3,
                tableHeaders.colFields,
                tableHeaders.rowHeaders,
                headerItems[0],
                [null, null, null, "even"],
                intl,
            ),
        ).toMatchSnapshot();
    });
});
