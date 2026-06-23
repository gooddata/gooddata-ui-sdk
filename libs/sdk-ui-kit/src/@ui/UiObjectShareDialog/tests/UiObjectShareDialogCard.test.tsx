// (C) 2026 GoodData Corporation

import { fireEvent, render, screen, within } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { type IUiObjectShareDialogGrantee, UiObjectShareDialogCard } from "../UiObjectShareDialogCard.js";

const GRANTEES: IUiObjectShareDialogGrantee[] = [
    { id: "owner", kind: "user", name: "Marek Stránský", email: "marek@example.com", isOwner: true },
    { id: "group", kind: "group", name: "Admin" },
    { id: "jana", kind: "user", name: "Jana Dvořák", email: "jana@example.com" },
];

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

const baseProps = {
    objectTitle: "Customer",
    onClose: () => {},
    grantees: GRANTEES,
    onAddClick: () => {},
    generalAccess: "RESTRICTED" as const,
    onGeneralAccessChange: () => {},
};

describe("UiObjectShareDialogCard", () => {
    it("renders the dialog title with the object name interpolated", () => {
        renderWithIntl(<UiObjectShareDialogCard {...baseProps} />);
        expect(screen.getByRole("heading", { name: 'Share "Customer"' })).toBeInTheDocument();
    });

    it("renders the grantees in order", () => {
        renderWithIntl(<UiObjectShareDialogCard {...baseProps} />);
        expect(screen.getByText("Marek Stránský")).toBeInTheDocument();
        expect(screen.getByText("Admin")).toBeInTheDocument();
        expect(screen.getByText("Jana Dvořák")).toBeInTheDocument();
    });

    it("calls onAddClick when the + Add link is activated", () => {
        const onAddClick = vi.fn();
        renderWithIntl(<UiObjectShareDialogCard {...baseProps} onAddClick={onAddClick} />);
        fireEvent.click(screen.getByText("Add"));
        expect(onAddClick).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when the header close button is clicked", () => {
        const onClose = vi.fn();
        renderWithIntl(<UiObjectShareDialogCard {...baseProps} onClose={onClose} dataTestId="card" />);
        const card = screen.getByTestId("card");
        const headerClose = within(card).getAllByRole("button", { name: "Close" })[0];
        fireEvent.click(headerClose);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when the footer Close button is clicked", () => {
        const onClose = vi.fn();
        renderWithIntl(<UiObjectShareDialogCard {...baseProps} onClose={onClose} />);
        const buttons = screen.getAllByRole("button", { name: "Close" });
        fireEvent.click(buttons[buttons.length - 1]);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("propagates general access changes", () => {
        const onGeneralAccessChange = vi.fn();
        renderWithIntl(
            <UiObjectShareDialogCard
                {...baseProps}
                generalAccess="RESTRICTED"
                onGeneralAccessChange={onGeneralAccessChange}
            />,
        );
        fireEvent.click(screen.getByRole("radio", { name: /All workspace members/ }));
        expect(onGeneralAccessChange).toHaveBeenCalledWith("WORKSPACE");
    });

    it("forwards dataTestId to the root element", () => {
        renderWithIntl(<UiObjectShareDialogCard {...baseProps} dataTestId="share-dialog" />);
        expect(screen.getByTestId("share-dialog")).toBeInTheDocument();
    });

    it("shows the error notice instead of the grantee list and access radio when error is set", () => {
        renderWithIntl(<UiObjectShareDialogCard {...baseProps} error="Could not load." />);
        // The error notice is shown...
        expect(screen.getByRole("alert")).toHaveTextContent("Could not load.");
        // ...and the empty/placeholder body is suppressed (no misleading "restricted").
        expect(screen.queryByText("Marek Stránský")).not.toBeInTheDocument();
        expect(screen.queryByRole("radio", { name: /All workspace members/ })).not.toBeInTheDocument();
        // The header title and footer Close still render so the user can dismiss.
        expect(screen.getByRole("heading", { name: 'Share "Customer"' })).toBeInTheDocument();
        expect(screen.getAllByRole("button", { name: "Close" }).length).toBeGreaterThan(0);
    });
});
