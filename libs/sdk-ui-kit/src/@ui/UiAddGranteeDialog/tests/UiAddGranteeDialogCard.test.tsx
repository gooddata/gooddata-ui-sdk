// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { UiAddGranteeDialogCard } from "../UiAddGranteeDialogCard.js";

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

const baseProps = {
    objectTitle: "Customer",
    loadOptions: () => Promise.resolve({ groups: [], users: [] }),
    selectedGrantees: [] as const,
    onSelectedGranteesChange: () => {},
    onBack: () => {},
    onClose: () => {},
    onCancel: () => {},
    onShare: () => {},
};

describe("UiAddGranteeDialogCard", () => {
    it("renders the dialog title with the object name interpolated", () => {
        renderWithIntl(<UiAddGranteeDialogCard {...baseProps} />);
        expect(screen.getByRole("heading", { name: 'Share "Customer"' })).toBeInTheDocument();
    });

    it("renders the embedded grantee picker (search combobox)", () => {
        renderWithIntl(<UiAddGranteeDialogCard {...baseProps} />);
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("calls onBack when the back button is clicked", () => {
        const onBack = vi.fn();
        renderWithIntl(<UiAddGranteeDialogCard {...baseProps} onBack={onBack} />);
        fireEvent.click(screen.getByRole("button", { name: "Back" }));
        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when the X button is clicked", () => {
        const onClose = vi.fn();
        renderWithIntl(<UiAddGranteeDialogCard {...baseProps} onClose={onClose} />);
        fireEvent.click(screen.getByRole("button", { name: "Close" }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when the footer Cancel button is clicked", () => {
        const onCancel = vi.fn();
        renderWithIntl(<UiAddGranteeDialogCard {...baseProps} onCancel={onCancel} />);
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("calls onShare when the footer primary button is clicked", () => {
        const onShare = vi.fn();
        renderWithIntl(
            <UiAddGranteeDialogCard
                {...baseProps}
                onShare={onShare}
                selectedGrantees={[
                    { id: "u1", ref: idRef("u1"), kind: "user", name: "Jane", permissionLevel: "VIEW" },
                ]}
            />,
        );
        fireEvent.click(screen.getByRole("button", { name: "Add" }));
        expect(onShare).toHaveBeenCalledTimes(1);
    });

    it("disables the primary button while no grantee is picked", () => {
        renderWithIntl(<UiAddGranteeDialogCard {...baseProps} />);
        expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
    });

    it("enables the primary button once at least one grantee is picked", () => {
        renderWithIntl(
            <UiAddGranteeDialogCard
                {...baseProps}
                selectedGrantees={[
                    { id: "u1", ref: idRef("u1"), kind: "user", name: "Jane", permissionLevel: "VIEW" },
                ]}
            />,
        );
        expect(screen.getByRole("button", { name: "Add" })).toBeEnabled();
    });

    it("forwards dataTestId to the root element", () => {
        renderWithIntl(<UiAddGranteeDialogCard {...baseProps} dataTestId="add-dialog" />);
        expect(screen.getByTestId("add-dialog")).toBeInTheDocument();
    });

    it("stores a narrowed label scope on the picked grantee it belongs to", () => {
        const onSelectedGranteesChange = vi.fn();
        renderWithIntl(
            <UiAddGranteeDialogCard
                {...baseProps}
                labels={[
                    { id: "lbl.primary", label: "Country", kind: "primary", locked: true },
                    { id: "lbl.name", label: "Name" },
                ]}
                selectedGrantees={[
                    { id: "u1", ref: idRef("u1"), kind: "user", name: "Jane", permissionLevel: "VIEW" },
                    { id: "u2", ref: idRef("u2"), kind: "user", name: "Joe", permissionLevel: "EDIT" },
                ]}
                onSelectedGranteesChange={onSelectedGranteesChange}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: /^Can view$/ }));
        fireEvent.click(screen.getByRole("menuitem", { name: /label access/i }));
        fireEvent.click(screen.getByRole("checkbox", { name: /Name/ }));
        fireEvent.click(screen.getByRole("button", { name: "Apply" }));

        // Only Jane's row is re-scoped; Joe keeps the untouched default (undefined = all).
        expect(onSelectedGranteesChange).toHaveBeenCalledTimes(1);
        const next = onSelectedGranteesChange.mock.calls[0][0];
        expect(next[0].labelIds).toEqual(["lbl.primary"]);
        expect(next[1].labelIds).toBeUndefined();
    });
});
