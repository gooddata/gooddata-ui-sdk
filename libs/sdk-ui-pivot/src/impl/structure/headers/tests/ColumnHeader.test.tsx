// (C) 2007-2018 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";

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

describe("ColumnHeader renderer", () => {
    it("should render HeaderCell", () => {
        const component = shallow(getColumnHeader());
        expect(component.find(HeaderCell)).toHaveLength(1);
    });

    it("should pass enableSorting to HeaderCell", () => {
        const component = shallow(getColumnHeader({ enableSorting: true }));
        expect(component.find(HeaderCell).props()).toHaveProperty("enableSorting", true);
    });

    it("should disable sorting if ColumnHeader is displaying a column attribute (use cse of no measures)", () => {
        const component = shallow(
            getColumnHeader(
                { enableSorting: true },
                { type: "COLUMN_ATTRIBUTE_COLUMN", colGroupId: "cg_0" },
                TableDescriptor.for(SingleColumn, "empty value"),
            ),
        );
        expect(component.find(HeaderCell).props()).toHaveProperty("enableSorting", false);
    });

    it("should alignment left if this is an attribute", () => {
        const component = shallow(getColumnHeader({}, { colGroupId: "r_0" }));
        expect(component.find(HeaderCell).props()).toHaveProperty("textAlign", "left");
    });

    it("should alignment right if this is a measure", () => {
        const component = shallow(getColumnHeader({}, { colGroupId: "c_0" }));
        expect(component.find(HeaderCell).props()).toHaveProperty("textAlign", "right");
    });
});
