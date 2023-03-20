// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";

import ColumnHeader from "../ColumnHeader";
import HeaderCell from "../HeaderCell";
import { recordedDataFacade } from "../../../../../__mocks__/recordings";
import { TableDescriptor } from "../../tableDescriptor";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { DataViewFirstPage } from "@gooddata/sdk-backend-mockingbird";
import { SingleColumn } from "../../tests/table.fixture";

const fixture = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithTwoRowAndOneColumnAttributes,
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
        column: {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            getSort: jest.fn(),
            getColDef: jest.fn(() => ({
                type,
                colId: colGroupId,
                groupId: colGroupId,
                field: colGroupId,
            })),
        },
        columnGroup: {
            getColGroupDef: jest.fn(() => ({ displayName: "colGroupDisplayName" })),
            getParent: jest.fn(() => ({})),
        },
        gridOptionsWrapper: {},
        enableMenu: true,
        enableSorting: true,
        displayName: "test",
        reactContainer: null,
        showColumnMenu: jest.fn(),
        setSort: jest.fn(),
        menu: jest.fn(),
        ...props,
    };

    return <ColumnHeader {...extendedProps} />;
};

/**
 * This mock enables us to test props as parameters of the called chart function
 */
jest.mock("../HeaderCell", () => ({
    __esModule: true,
    ...jest.requireActual("../HeaderCell"),
    default: jest.fn(() => null),
}));

describe("ColumnHeader renderer", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render HeaderCell", () => {
        render(getColumnHeader());
        expect(HeaderCell).toHaveBeenCalled();
    });

    it("should pass enableSorting to HeaderCell", () => {
        render(getColumnHeader({ enableSorting: true }));
        expect(HeaderCell).toHaveBeenCalledWith(expect.objectContaining({ enableSorting: true }), {});
    });

    it("should disable sorting if ColumnHeader is displaying a column attribute (use cse of no measures)", () => {
        render(
            getColumnHeader(
                { enableSorting: true },
                { type: "COLUMN_ATTRIBUTE_COLUMN", colGroupId: "cg_0" },
                TableDescriptor.for(SingleColumn, "empty value"),
            ),
        );
        expect(HeaderCell).toHaveBeenCalledWith(expect.objectContaining({ enableSorting: false }), {});
    });

    it("should alignment left if this is an attribute", () => {
        render(getColumnHeader({}, { colGroupId: "r_0" }));
        expect(HeaderCell).toHaveBeenCalledWith(expect.objectContaining({ textAlign: "left" }), {});
    });

    it("should alignment right if this is a measure", () => {
        render(getColumnHeader({}, { colGroupId: "c_0" }));
        expect(HeaderCell).toHaveBeenCalledWith(expect.objectContaining({ textAlign: "right" }), {});
    });
});
