// (C) 2007-2025 GoodData Corporation
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { FilterLabel } from "../FilterLabel.js";
import { IFilterLabelProps } from "../typings.js";
import { WithIntlForTest } from "@gooddata/sdk-ui";

const customMessages = {
    "gs.filterLabel.none": "None",
    "gs.filterLabel.all": "All",
};

function renderFilterLabel(options: IFilterLabelProps) {
    return render(
        <WithIntlForTest customLocale="en-US" customMessages={customMessages}>
            <FilterLabel {...options} />
        </WithIntlForTest>,
    );
}

describe("FilterLabel", () => {
    it("should render filter label title", () => {
        const title = "Attribute";
        renderFilterLabel({
            title,
            selectionSize: 100,
        });

        expect(screen.getByText(title)).toBeInTheDocument();
    });

    it("should render filter label title as well", () => {
        const title = "Attribute";
        renderFilterLabel({
            title,
            isAllSelected: true,
            selectionSize: 100,
            noData: true,
        });

        expect(screen.getByText(title)).toBeInTheDocument();
    });

    it("should render filter label title and selection", () => {
        const title = "Attribute";
        const selection = "A, B, C";
        renderFilterLabel({
            title,
            selection,
            selectionSize: 100,
        });
        const expectedText = `${title}: ${selection}`;

        expect(screen.getByRole("attribute-filter-label")).toHaveTextContent(expectedText);
    });

    it("should render filter label title and All", () => {
        const title = "Attribute";
        renderFilterLabel({
            title,
            isAllSelected: true,
            selectionSize: 100,
        });

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(customMessages["gs.filterLabel.all"])).toBeInTheDocument();
    });

    it("should render filter label title and None", () => {
        const title = "Attribute";
        renderFilterLabel({
            title,
            selectionSize: 0,
        });

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(customMessages["gs.filterLabel.none"])).toBeInTheDocument();
    });

    it("should render date filter selection", () => {
        const title = "Date (created)";
        const selection = "This year";
        renderFilterLabel({
            title,
            selection,
            isDate: true,
            selectionSize: 100,
        });

        expect(screen.getByRole("attribute-filter-label")).toHaveTextContent(`${title}: ${selection}`);
    });

    it("should update selection label", () => {
        const title = "Attribute name is very very long for the test purpose";
        const selection = "Item A";

        const newSelection = "Item B, Item C, Item D";

        const { rerender } = renderFilterLabel({
            title,
            selection,
            selectionSize: 100,
        });

        rerender(
            <WithIntlForTest customLocale="en-US" customMessages={customMessages}>
                <FilterLabel title={title} selection={newSelection} selectionSize={100} />
            </WithIntlForTest>,
        );

        expect(screen.getByRole("attribute-filter-label")).toHaveTextContent(`${title}: ${newSelection}`);
    });
});
