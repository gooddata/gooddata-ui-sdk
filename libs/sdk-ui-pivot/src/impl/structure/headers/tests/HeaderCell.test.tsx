// (C) 2007-2023 GoodData Corporation
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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
    const tableDescriptor = TableDescriptor.for(fixture, "empty value");
    const getTableDescriptor = () => tableDescriptor;

    it("should render text for the cell", () => {
        render(<HeaderCell displayText="Header" getTableDescriptor={getTableDescriptor} />);
        expect(screen.getByText("Header")).toBeInTheDocument();
    });

    describe("Sorting in HeaderCell", () => {
        it("should render default sorting", () => {
            render(
                <HeaderCell
                    displayText="Header"
                    enableSorting={true}
                    defaultSortDirection={"asc"}
                    getTableDescriptor={getTableDescriptor}
                />,
            );
            fireEvent.mouseEnter(screen.getByText("Header"));

            expect(document.querySelector(".s-sort-direction-arrow.s-sorted-asc")).toBeInTheDocument();
        });

        it("should call onSortChanged when clicked on label", () => {
            const onSortClick = jest.fn();
            render(
                <HeaderCell
                    displayText="Header"
                    enableSorting={true}
                    defaultSortDirection={"asc"}
                    onSortClick={onSortClick}
                    getTableDescriptor={getTableDescriptor}
                />,
            );
            fireEvent.click(screen.getByText("Header"));

            expect(onSortClick).toHaveBeenCalledWith("asc");
        });

        it("should call onSortChanged with next sort direction", () => {
            const onSortClick = jest.fn();
            render(
                <HeaderCell
                    displayText="Header"
                    enableSorting={true}
                    sortDirection={"asc"}
                    onSortClick={onSortClick}
                    getTableDescriptor={getTableDescriptor}
                />,
            );
            fireEvent.click(screen.getByText("Header"));

            expect(onSortClick).toHaveBeenCalledWith("desc");
        });
    });
});
