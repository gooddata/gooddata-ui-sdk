// (C) 2026 GoodData Corporation

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";
import type { IObjectShareLabel } from "@gooddata/sdk-ui-ext";

import { catalogDetailLabelsList, catalogDetailLabelsTrigger } from "../../../automation/testIds.js";
import { TestIntlProvider } from "../../../localization/TestIntlProvider.js";
import { CatalogDetailLabels } from "../CatalogDetailLabels.js";

function label(id: string, title: string, isPrimary = false, isDefault = false): IObjectShareLabel {
    return { ref: idRef(id), id, title, isPrimary, isDefault };
}

function renderLabels(labels: IObjectShareLabel[]) {
    return render(
        <TestIntlProvider>
            <CatalogDetailLabels labels={labels} />
        </TestIntlProvider>,
    );
}

describe("CatalogDetailLabels", () => {
    it("renders nothing when there are no labels", () => {
        const { container } = renderLabels([]);

        expect(container).toBeEmptyDOMElement();
    });

    it("leads with the primary label and counts the rest as '+N more'", () => {
        renderLabels([
            label("l.name", "Customer Name"),
            label("l.id", "Customer ID", true),
            label("l.email", "Customer Email"),
        ]);

        const trigger = screen.getByTestId(catalogDetailLabelsTrigger);
        // Primary leads regardless of source order; the other two are the remainder.
        expect(trigger).toHaveTextContent("Customer ID (+2 more)");
    });

    it("omits the '+N more' suffix for a single label", () => {
        renderLabels([label("l.id", "Customer ID", true)]);

        expect(screen.getByTestId(catalogDetailLabelsTrigger)).toHaveTextContent("Customer ID");
        expect(screen.getByTestId(catalogDetailLabelsTrigger)).not.toHaveTextContent("more");
    });

    it("opens a popup listing every label on click", async () => {
        renderLabels([
            label("l.id", "Customer ID", true),
            label("l.name", "Customer Name"),
            label("l.ssn", "Customer SSN"),
        ]);

        fireEvent.click(screen.getByTestId(catalogDetailLabelsTrigger));

        const list = await screen.findByTestId(catalogDetailLabelsList);
        expect(within(list).getByText("Customer ID")).toBeInTheDocument();
        expect(within(list).getByText("Customer Name")).toBeInTheDocument();
        expect(within(list).getByText("Customer SSN")).toBeInTheDocument();
    });

    it("qualifies only the primary and the single default label", async () => {
        renderLabels([
            label("l.id", "Customer ID", true, false),
            label("l.name", "Customer Name", false, true),
            label("l.email", "Customer Email", false, false),
            label("l.ssn", "Customer SSN", false, false),
        ]);

        fireEvent.click(screen.getByTestId(catalogDetailLabelsTrigger));

        const list = await screen.findByTestId(catalogDetailLabelsList);
        // Exactly one "(Primary)" and one "(Default)" — the other labels carry no suffix.
        expect(within(list).getAllByText("(Primary)")).toHaveLength(1);
        expect(within(list).getAllByText("(Default)")).toHaveLength(1);
        expect(within(list).queryByText("Customer Email")).toBeInTheDocument();
        // The non-qualified rows render just their name (no suffix text node).
        const ssnRow = within(list).getByText("Customer SSN").closest("[class*='label-row']");
        expect(ssnRow?.textContent).toBe("Customer SSN");
    });
});
