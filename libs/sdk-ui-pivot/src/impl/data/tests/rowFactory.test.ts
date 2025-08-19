// (C) 2007-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { DataViewFirstPage, ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { createIntlMock } from "@gooddata/sdk-ui";

import { recordedDataFacade } from "../../../../__mocks__/recordings.js";
import { TableDescriptor } from "../../structure/tableDescriptor.js";
import { getRow, getRowTotals } from "../rowFactory.js";

const intl = createIntlMock();

describe("getRowTotals", () => {
    it("should return total rows", () => {
        const fixture = recordedDataFacade(
            ReferenceRecordings.Scenarios.PivotTable.SingleMeasureAndMultipleGrandTotals as ScenarioRecording,
            DataViewFirstPage,
        );
        const tableDescriptor = TableDescriptor.for(fixture, "empty value");

        expect(getRowTotals(tableDescriptor, fixture, intl)).toMatchSnapshot();
    });
    it("should return null when no totals are defined", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.PivotTable
                .SingleMeasureWithRowAndColumnAttributes as ScenarioRecording,
            DataViewFirstPage,
        );
        const tableDescriptor = TableDescriptor.for(dv, "empty value");

        expect(getRowTotals(tableDescriptor, dv, intl)).toBe(null);
    });
});

describe("getRow", () => {
    it("should return a grid row", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.PivotTable
                .SingleMeasureWithRowAndColumnAttributes as ScenarioRecording,
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
            ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresAndMultipleSubtotals as ScenarioRecording,
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
