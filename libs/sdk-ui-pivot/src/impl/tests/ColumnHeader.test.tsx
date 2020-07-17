// (C) 2007-2018 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";

import ColumnHeader from "../ColumnHeader";
import HeaderCell from "../HeaderCell";

const getColumnHeader = (props = {}, { type = "MEASURE_COLUMN", colGroupId = "a_1234" } = {}) => {
    const extendedProps: any = {
        column: {
            addEventListener: jest.fn(),
            getSort: jest.fn(),
            getColDef: jest.fn(() => ({
                type,
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
            getColumnHeader({ enableSorting: true }, { type: "COLUMN_ATTRIBUTE_COLUMN" }),
        );
        expect(component.find(HeaderCell).props()).toHaveProperty("enableSorting", false);
    });

    it("should alignment left if this is an attribute", () => {
        const component = shallow(getColumnHeader({}, { colGroupId: "a_1234" }));
        expect(component.find(HeaderCell).props()).toHaveProperty("textAlign", "left");
    });

    it("should alignment right if this is a measure", () => {
        const component = shallow(getColumnHeader({}, { colGroupId: "m_1" }));
        expect(component.find(HeaderCell).props()).toHaveProperty("textAlign", "right");
    });
});
