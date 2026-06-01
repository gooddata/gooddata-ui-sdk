// (C) 2026 GoodData Corporation

import { render, screen, within } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { type IUiLabelsListItem, UiLabelsList } from "../UiLabelsList.js";

const ITEMS: IUiLabelsListItem[] = [
    { id: "id", label: "Customer ID", kind: "primary" },
    { id: "name", label: "Customer Name", kind: "default" },
    { id: "email", label: "Customer Email" },
    { id: "ssn", label: "Customer SSN" },
];

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

describe("UiLabelsList", () => {
    it("renders the LABELS heading and all items in order", () => {
        renderWithIntl(<UiLabelsList items={ITEMS} />);
        expect(screen.getByText("LABELS")).toBeInTheDocument();
        const listItems = screen
            .getAllByRole("listitem")
            .map((li) => within(li).getByText(/Customer/).textContent);
        expect(listItems).toEqual(["Customer ID", "Customer Name", "Customer Email", "Customer SSN"]);
    });

    it("renders nothing in the items area when items is empty", () => {
        renderWithIntl(<UiLabelsList items={[]} />);
        expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    });

    it("forwards dataTestId", () => {
        renderWithIntl(<UiLabelsList items={ITEMS} dataTestId="my-labels-list" />);
        expect(screen.getByTestId("my-labels-list")).toBeInTheDocument();
    });
});
