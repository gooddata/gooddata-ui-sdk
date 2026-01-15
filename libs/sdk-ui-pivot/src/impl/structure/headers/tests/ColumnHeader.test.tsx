// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { DataViewFirstPage, type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";

import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { TableDescriptor } from "../../tableDescriptor.js";
import { SingleColumn } from "../../tests/table.fixture.js";
import { ColumnHeader } from "../ColumnHeader.js";
import { HeaderCell } from "../HeaderCell.js";

const fixture = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable
        .SingleMeasureWithTwoRowAndOneColumnAttributes as ScenarioRecording,
    DataViewFirstPage,
);
const tableDescriptor = TableDescriptor.for(fixture, "empty value");

const getColumnHeader = (
    props = {},
    { type = "MEASURE_COLUMN", colGroupId = "c_0" } = {},
    table = tableDescriptor,
) => {
    const extendedProps: any = {
        getTableDescriptor: () => table,
        api: {
            refreshHeader: vi.fn(),
            setFocusedHeader: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        },
        column: {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            getSort: vi.fn(),
            getColDef: vi.fn(() => ({
                type,
                colId: colGroupId,
                groupId: colGroupId,
                field: colGroupId,
            })),
        },
        columnGroup: {
            getColGroupDef: vi.fn(() => ({ displayName: "colGroupDisplayName" })),
            getParent: vi.fn(() => ({})),
        },
        gridOptionsWrapper: {},
        enableMenu: true,
        enableSorting: true,
        displayName: "test",
        reactContainer: null,
        showColumnMenu: vi.fn(),
        setSort: vi.fn(),
        menu: vi.fn(),
        ...props,
    };

    return <ColumnHeader {...extendedProps} />;
};

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../HeaderCell", async () => ({
    ...(await vi.importActual("../HeaderCell")),
    HeaderCell: vi.fn(() => null),
}));

describe("ColumnHeader renderer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render HeaderCell", () => {
        render(getColumnHeader());
        expect(HeaderCell).toHaveBeenCalled();
    });

    it("should pass enableSorting to HeaderCell", () => {
        render(getColumnHeader({ enableSorting: true }));
        expect(HeaderCell).toHaveBeenCalledWith(expect.objectContaining({ enableSorting: true }), undefined);
    });

    it("should disable sorting if ColumnHeader is displaying a column attribute (use cse of no measures)", () => {
        render(
            getColumnHeader(
                { enableSorting: true },
                { type: "COLUMN_ATTRIBUTE_COLUMN", colGroupId: "cg_0" },
                TableDescriptor.for(SingleColumn, "empty value"),
            ),
        );
        expect(HeaderCell).toHaveBeenCalledWith(expect.objectContaining({ enableSorting: false }), undefined);
    });

    it("should alignment left if this is an attribute", () => {
        render(getColumnHeader({}, { colGroupId: "r_0" }));
        expect(HeaderCell).toHaveBeenCalledWith(expect.objectContaining({ textAlign: "left" }), undefined);
    });

    it("should alignment right if this is a measure", () => {
        render(getColumnHeader({}, { colGroupId: "c_0" }));
        expect(HeaderCell).toHaveBeenCalledWith(expect.objectContaining({ textAlign: "right" }), undefined);
    });
});
