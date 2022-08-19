// (C) 2007-2022 GoodData Corporation
import React from "react";
import { shallow, mount } from "enzyme";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { DataViewFirstPage } from "@gooddata/sdk-backend-mockingbird";

import HeaderCell from "../HeaderCell";
import { recordedDataFacade } from "../../../../../__mocks__/recordings";
import { TableDescriptor } from "../../tableDescriptor";

describe("HeaderCell renderer", () => {
    const fixture = recordedDataFacade(
        ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithTwoRowAndOneColumnAttributes,
        DataViewFirstPage,
    );
    const tableDescriptor = TableDescriptor.for(fixture);
    const getTableDescriptor = () => tableDescriptor;

    it("should render text for the cell", () => {
        const component = shallow(
            <HeaderCell displayText="Header" getTableDescriptor={getTableDescriptor} />,
        );
        expect(component.text()).toEqual("Header");
    });

    describe("Sorting in HeaderCell", () => {
        it("should render default sorting", () => {
            const component = mount(
                <HeaderCell
                    displayText="Header"
                    enableSorting={true}
                    defaultSortDirection={"asc"}
                    getTableDescriptor={getTableDescriptor}
                />,
            );
            const headerCellLabel = component.find(".s-header-cell-label");
            expect(headerCellLabel).toHaveLength(1);

            headerCellLabel.simulate("mouseEnter");
            expect(component.state("currentSortDirection")).toEqual("asc");
            expect(component.find(".s-sort-direction-arrow")).toHaveLength(1);
            expect(component.find(".s-sorted-asc")).toHaveLength(1);
        });

        it("should call onSortChanged when clicked on label", () => {
            const onSortClick = jest.fn();
            const component = mount(
                <HeaderCell
                    displayText="Header"
                    enableSorting={true}
                    defaultSortDirection={"asc"}
                    onSortClick={onSortClick}
                    getTableDescriptor={getTableDescriptor}
                />,
            );
            const cellLabel = component.find(".s-header-cell-label");

            cellLabel.simulate("click");
            expect(onSortClick).toHaveBeenCalledWith("asc", false);
        });

        it("should call onSortChanged with next sort direction", () => {
            const onSortClick = jest.fn();
            const component = mount(
                <HeaderCell
                    displayText="Header"
                    enableSorting={true}
                    sortDirection={"asc"}
                    onSortClick={onSortClick}
                    getTableDescriptor={getTableDescriptor}
                />,
            );
            const cellLabel = component.find(".s-header-cell-label");

            cellLabel.simulate("click");
            expect(onSortClick).toHaveBeenCalledWith("desc", false);
        });
    });
});
