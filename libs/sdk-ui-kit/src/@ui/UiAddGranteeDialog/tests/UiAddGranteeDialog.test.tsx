// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { UiAddGranteeDialog } from "../UiAddGranteeDialog.js";

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

const baseProps = {
    isOpen: true,
    objectTitle: "Customer",
    searchQuery: "",
    onSearchQueryChange: () => {},
    onBack: () => {},
    onClose: () => {},
    onCancel: () => {},
    onAdd: () => {},
};

describe("UiAddGranteeDialog", () => {
    it("renders the dialog title with the object name interpolated", () => {
        renderWithIntl(<UiAddGranteeDialog {...baseProps} />);
        expect(screen.getByRole("dialog", { name: 'Share "Customer"' })).toBeInTheDocument();
    });

    it("renders the empty placeholder when no grantee is selected", () => {
        renderWithIntl(<UiAddGranteeDialog {...baseProps} />);
        expect(screen.getByText("No user or group selected")).toBeInTheDocument();
    });

    it("renders the selectedGrantee slot when provided", () => {
        renderWithIntl(<UiAddGranteeDialog {...baseProps} selectedGrantee={<div>Jane Doe</div>} />);
        expect(screen.getByText("Jane Doe")).toBeInTheDocument();
        expect(screen.queryByText("No user or group selected")).not.toBeInTheDocument();
    });

    it("forwards search query edits", () => {
        const onSearchQueryChange = vi.fn();
        renderWithIntl(<UiAddGranteeDialog {...baseProps} onSearchQueryChange={onSearchQueryChange} />);
        fireEvent.change(screen.getByRole("searchbox"), { target: { value: "jane" } });
        expect(onSearchQueryChange).toHaveBeenCalledWith("jane");
    });

    it("calls onBack when the back button is clicked", () => {
        const onBack = vi.fn();
        renderWithIntl(<UiAddGranteeDialog {...baseProps} onBack={onBack} />);
        fireEvent.click(screen.getByRole("button", { name: "Back" }));
        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when the X button is clicked", () => {
        const onClose = vi.fn();
        renderWithIntl(<UiAddGranteeDialog {...baseProps} onClose={onClose} />);
        fireEvent.click(screen.getByRole("button", { name: "Close" }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when the footer Cancel button is clicked", () => {
        const onCancel = vi.fn();
        renderWithIntl(<UiAddGranteeDialog {...baseProps} onCancel={onCancel} />);
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("calls onAdd when the footer Add button is clicked", () => {
        const onAdd = vi.fn();
        renderWithIntl(<UiAddGranteeDialog {...baseProps} onAdd={onAdd} />);
        fireEvent.click(screen.getByRole("button", { name: "Add" }));
        expect(onAdd).toHaveBeenCalledTimes(1);
    });

    it("disables the Add button when isAddDisabled is true", () => {
        renderWithIntl(<UiAddGranteeDialog {...baseProps} isAddDisabled />);
        expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
    });

    it("forwards dataTestId to the root element", () => {
        renderWithIntl(<UiAddGranteeDialog {...baseProps} dataTestId="add-dialog" />);
        expect(screen.getByTestId("add-dialog")).toBeInTheDocument();
    });
});
