// (C) 2007-2018 GoodData Corporation
import React from "react";
import { shallow, mount } from "enzyme";

import HeaderCell from "../HeaderCell";

describe("HeaderCell renderer", () => {
    it("should render text for the cell", () => {
        const component = shallow(<HeaderCell displayText="Header" />);
        expect(component.text()).toEqual("Header");
    });

    describe("Sorting in HeaderCell", () => {
        it("should render default sorting", () => {
            const component = mount(
                <HeaderCell displayText="Header" enableSorting={true} defaultSortDirection={"asc"} />,
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
                />,
            );
            const cellLabel = component.find(".s-header-cell-label");

            cellLabel.simulate("click");
            expect(onSortClick).toHaveBeenCalledWith("asc");
        });

        it("should call onSortChanged with next sort direction", () => {
            const onSortClick = jest.fn();
            const component = mount(
                <HeaderCell
                    displayText="Header"
                    enableSorting={true}
                    sortDirection={"asc"}
                    onSortClick={onSortClick}
                />,
            );
            const cellLabel = component.find(".s-header-cell-label");

            cellLabel.simulate("click");
            expect(onSortClick).toHaveBeenCalledWith("desc");
        });
    });
});
