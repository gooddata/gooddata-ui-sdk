// (C) 2007-2021 GoodData Corporation

import { createIntlMock } from "@gooddata/sdk-ui";
import { getRow, getRowTotals } from "../rowFactory";
import { DataViewFirstPage } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataFacade } from "../../../../__mocks__/recordings";
import { TableDescriptor } from "../../structure/tableDescriptor";

const intl = createIntlMock();

describe("getRowTotals", () => {
    it("should return total rows", () => {
        const fixture = recordedDataFacade(
            ReferenceRecordings.Scenarios.PivotTable.SingleMeasureAndMultipleGrandTotals,
            DataViewFirstPage,
        );
        const tableDescriptor = TableDescriptor.for(fixture, "empty value");

        expect(getRowTotals(tableDescriptor, fixture, intl)).toMatchSnapshot();
    });
    it("should return null when no totals are defined", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAndColumnAttributes,
            DataViewFirstPage,
        );
        const tableDescriptor = TableDescriptor.for(dv, "empty value");

        expect(getRowTotals(tableDescriptor, dv, intl)).toBe(null);
    });
});

describe("getRow", () => {
    it("should return a grid row", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAndColumnAttributes,
            DataViewFirstPage,
        );
        const tableDescriptor = TableDescriptor.for(dv, "empty value");
        const headerItems = dv.meta().allHeaders();

        expect(
            getRow(tableDescriptor, dv.rawData().twoDimData()[0], 0, headerItems[0], [], intl),
        ).toMatchSnapshot();
    });
    it("should return subtotal row", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresAndMultipleSubtotals,
            DataViewFirstPage,
        );
        const tableDescriptor = TableDescriptor.for(dv, "empty value");
        const headerItems = dv.meta().allHeaders();

        expect(
            getRow(
                tableDescriptor,
                dv.rawData().twoDimData()[0],
                3,
                headerItems[0],
                [null, null, null, "even"],
                intl,
            ),
        ).toMatchSnapshot();
    });
});
