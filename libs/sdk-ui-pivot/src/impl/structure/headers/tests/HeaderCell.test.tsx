// (C) 2007-2025 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { DataViewFirstPage, ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";

import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { TableDescriptor } from "../../tableDescriptor.js";
import HeaderCell from "../HeaderCell.js";

describe("HeaderCell renderer", () => {
    const fixture = recordedDataFacade(
        ReferenceRecordings.Scenarios.PivotTable
            .SingleMeasureWithTwoRowAndOneColumnAttributes as ScenarioRecording,
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

        it("should call onSortClick when clicked on label", () => {
            const onSortClick = vi.fn();
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

            expect(onSortClick).toHaveBeenCalled();
        });
    });
});
