// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { type IUiLabelsChecklistItem } from "../../UiLabelsChecklist/UiLabelsChecklist.js";
import { UiMoreOptionsMenu } from "../UiMoreOptionsMenu.js";

const LABELS: IUiLabelsChecklistItem[] = [
    { id: "id", label: "Customer ID", kind: "primary", locked: true },
    { id: "name", label: "Customer Name", kind: "default" },
    { id: "email", label: "Customer Email" },
];

const renderWithIntl = (ui: ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

const renderMenu = (props: Partial<Parameters<typeof UiMoreOptionsMenu>[0]> = {}) =>
    renderWithIntl(<UiMoreOptionsMenu {...props} />);

const openMenu = () => fireEvent.click(screen.getByRole("button", { name: /more options/i }));

describe("UiMoreOptionsMenu", () => {
    it("shows Manage labels access when labels are provided", () => {
        renderMenu({ labels: LABELS, selectedLabelIds: ["id", "name", "email"] });
        openMenu();
        expect(screen.getByRole("menuitem", { name: /labels access/i })).toBeInTheDocument();
    });

    it("drills into the label checklist when Manage labels access is picked", () => {
        renderMenu({ labels: LABELS, selectedLabelIds: ["id", "name", "email"] });
        openMenu();
        expect(screen.queryByRole("checkbox", { name: /Customer Email/ })).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("menuitem", { name: /labels access/i }));
        expect(screen.getByRole("checkbox", { name: /Customer Email/ })).toBeInTheDocument();
    });

    it("commits the locked-augmented selection via onLabelsChange on Apply and closes", () => {
        const onLabelsChange = vi.fn();
        renderMenu({ labels: LABELS, selectedLabelIds: ["id", "name", "email"], onLabelsChange });
        openMenu();
        fireEvent.click(screen.getByRole("menuitem", { name: /labels access/i }));
        fireEvent.click(screen.getByRole("checkbox", { name: /Customer Email/ }));
        fireEvent.click(screen.getByRole("button", { name: "Apply" }));
        // Locked "id" stays, "name" stays, "email" removed.
        expect(onLabelsChange).toHaveBeenCalledWith(["id", "name"]);
        // Apply closes the popover, so the checklist is gone.
        expect(screen.queryByRole("checkbox", { name: /Customer Email/ })).not.toBeInTheDocument();
    });

    it("keeps staged checkbox edits when the parent re-renders while the checklist is open", () => {
        // Regression: a parent re-render must not remount the checklist (which would drop staged edits).
        const { rerender } = renderMenu({
            labels: LABELS,
            selectedLabelIds: ["id", "name", "email"],
            onLabelsChange: () => {},
        });
        openMenu();
        fireEvent.click(screen.getByRole("menuitem", { name: /labels access/i }));
        fireEvent.click(screen.getByRole("checkbox", { name: /Customer Email/ }));
        expect((screen.getByRole("checkbox", { name: /Customer Email/ }) as HTMLInputElement).checked).toBe(
            false,
        );

        // Parent re-renders with brand-new references — must NOT remount the checklist.
        rerender(
            <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
                <UiMoreOptionsMenu
                    labels={[...LABELS]}
                    selectedLabelIds={["id", "name", "email"]}
                    onLabelsChange={() => {}}
                />
            </IntlProvider>,
        );

        const email = screen.getByRole("checkbox", { name: /Customer Email/ }) as HTMLInputElement;
        expect(email.checked).toBe(false);
    });

    it("returns to the menu list when Back is pressed in the checklist", () => {
        renderMenu({ labels: LABELS, selectedLabelIds: ["id"], onTransferOwnership: () => {} });
        openMenu();
        fireEvent.click(screen.getByRole("menuitem", { name: /labels access/i }));
        expect(screen.getByRole("checkbox", { name: /Customer Email/ })).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /back/i }));
        expect(screen.queryByRole("checkbox", { name: /Customer Email/ })).not.toBeInTheDocument();
        expect(screen.getByRole("menuitem", { name: /labels access/i })).toBeInTheDocument();
        expect(screen.getByRole("menuitem", { name: /Transfer ownership/ })).toBeInTheDocument();
    });

    it("shows Transfer ownership and fires it (closing the menu) when picked", () => {
        const onTransferOwnership = vi.fn();
        renderMenu({ onTransferOwnership });
        openMenu();
        fireEvent.click(screen.getByRole("menuitem", { name: /Transfer ownership/ }));
        expect(onTransferOwnership).toHaveBeenCalledOnce();
        // Picking it closes the popover.
        expect(screen.queryByRole("menuitem", { name: /Transfer ownership/ })).not.toBeInTheDocument();
    });

    it("omits Manage labels access when no labels are provided", () => {
        renderMenu({ onTransferOwnership: () => {} });
        openMenu();
        expect(screen.queryByRole("menuitem", { name: /labels access/i })).not.toBeInTheDocument();
    });

    it("omits Transfer ownership when no handler is provided", () => {
        renderMenu({ labels: LABELS, selectedLabelIds: ["id"] });
        openMenu();
        expect(screen.queryByRole("menuitem", { name: /Transfer ownership/ })).not.toBeInTheDocument();
    });

    it("forwards dataTestId", () => {
        renderMenu({ dataTestId: "more-menu", labels: LABELS, selectedLabelIds: ["id"] });
        openMenu();
        expect(screen.getByTestId("more-menu")).toBeInTheDocument();
    });
});
