// (C) 2026 GoodData Corporation

import { fireEvent, render, screen, within } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

// UiTag (and indirectly UiTooltip) pulls the legacy Bubble stack which fails
// under our pnpm hoist — mock it. The dialog wiring is what we cover here;
// the Owner tag itself is exercised in the UiGranteeRow tests.
vi.mock("../../UiTooltip/UiTooltip.js", () => ({
    UiTooltip: ({ anchor }: { anchor: React.ReactNode }) => <>{anchor}</>,
}));

import { type IUiObjectShareDialogGrantee, UiObjectShareDialog } from "../UiObjectShareDialog.js";

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

describe("UiObjectShareDialog", () => {
    it("renders the dialog title with the object name interpolated", () => {
        renderWithIntl(<UiObjectShareDialog {...baseProps} />);
        expect(screen.getByRole("dialog", { name: 'Share "Customer"' })).toBeInTheDocument();
    });

    it("renders the grantees in order", () => {
        renderWithIntl(<UiObjectShareDialog {...baseProps} />);
        expect(screen.getByText("Marek Stránský")).toBeInTheDocument();
        expect(screen.getByText("Admin")).toBeInTheDocument();
        expect(screen.getByText("Jana Dvořák")).toBeInTheDocument();
    });

    it("calls onAddClick when the + Add link is activated", () => {
        const onAddClick = vi.fn();
        renderWithIntl(<UiObjectShareDialog {...baseProps} onAddClick={onAddClick} />);
        fireEvent.click(screen.getByText("Add"));
        expect(onAddClick).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when the header close button is clicked", () => {
        const onClose = vi.fn();
        renderWithIntl(<UiObjectShareDialog {...baseProps} onClose={onClose} />);
        const dialog = screen.getByRole("dialog");
        const headerClose = within(dialog).getAllByRole("button", { name: "Close" })[0];
        fireEvent.click(headerClose);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when the footer Close button is clicked", () => {
        const onClose = vi.fn();
        renderWithIntl(<UiObjectShareDialog {...baseProps} onClose={onClose} />);
        const buttons = screen.getAllByRole("button", { name: "Close" });
        fireEvent.click(buttons[buttons.length - 1]);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("propagates general access changes", () => {
        const onGeneralAccessChange = vi.fn();
        renderWithIntl(
            <UiObjectShareDialog
                {...baseProps}
                generalAccess="RESTRICTED"
                onGeneralAccessChange={onGeneralAccessChange}
            />,
        );
        fireEvent.click(screen.getByRole("radio", { name: /All workspace members/ }));
        expect(onGeneralAccessChange).toHaveBeenCalledWith("WORKSPACE");
    });

    it("forwards dataTestId to the root element", () => {
        renderWithIntl(<UiObjectShareDialog {...baseProps} dataTestId="share-dialog" />);
        expect(screen.getByTestId("share-dialog")).toBeInTheDocument();
    });
});
