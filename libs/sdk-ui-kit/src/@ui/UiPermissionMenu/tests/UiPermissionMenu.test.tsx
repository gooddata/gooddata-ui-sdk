// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { type IUiLabelsChecklistItem } from "../../UiLabelsChecklist/UiLabelsChecklist.js";
import { UiPermissionMenu } from "../UiPermissionMenu.js";

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

const renderMenu = (props: Partial<Parameters<typeof UiPermissionMenu>[0]> = {}) =>
    renderWithIntl(
        <UiPermissionMenu anchor={<button>open</button>} onPermissionChange={() => {}} {...props} />,
    );

const openMenu = () => fireEvent.click(screen.getByRole("button", { name: "open" }));

describe("UiPermissionMenu", () => {
    it("renders the three level rows as menuitemradio by default", () => {
        renderMenu({ selectedLevel: "VIEW" });
        openMenu();
        const edit = screen.getByRole("menuitemradio", { name: /Can edit & share/ });
        const share = screen.getByRole("menuitemradio", { name: /Can view & share/ });
        const view = screen.getByRole("menuitemradio", { name: "Can view" });
        expect(edit).toHaveAttribute("aria-checked", "false");
        expect(share).toHaveAttribute("aria-checked", "false");
        expect(view).toHaveAttribute("aria-checked", "true");
        expect(screen.queryByRole("menuitem", { name: /Transfer ownership/ })).not.toBeInTheDocument();
        expect(screen.queryByRole("menuitem", { name: /label access/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("menuitem", { name: /Remove access/ })).not.toBeInTheDocument();
    });

    it("emits onPermissionChange and closes when a level row is picked", () => {
        const onPermissionChange = vi.fn();
        renderMenu({ onPermissionChange });
        openMenu();
        fireEvent.click(screen.getByRole("menuitemradio", { name: /Can view & share/ }));
        expect(onPermissionChange).toHaveBeenCalledWith("SHARE");
        // Picking a level closes the menu.
        expect(screen.queryByRole("menuitemradio", { name: /Can view & share/ })).not.toBeInTheDocument();
    });

    it("emits onPermissionChange with EDIT when Can edit & share is picked", () => {
        const onPermissionChange = vi.fn();
        renderMenu({ onPermissionChange });
        openMenu();
        fireEvent.click(screen.getByRole("menuitemradio", { name: /Can edit & share/ }));
        expect(onPermissionChange).toHaveBeenCalledWith("EDIT");
    });

    it("omits the labels row unless labels are provided", () => {
        renderMenu({ onRemoveAccess: () => {} });
        openMenu();
        expect(screen.queryByRole("menuitem", { name: /label access/i })).not.toBeInTheDocument();
    });

    it("renders levels above the caller's own as disabled with the explanatory tooltip", () => {
        const onPermissionChange = vi.fn();
        renderMenu({
            selectedLevel: "VIEW",
            disabledLevels: ["SHARE", "EDIT"],
            disabledTooltip: "You can't set higher permissions for yourself.",
            onPermissionChange,
        });
        openMenu();

        const share = screen.getByRole("menuitemradio", { name: /Can view & share/ });
        // aria-disabled (not the disabled attribute) keeps the row focusable so
        // the explanatory tooltip stays keyboard-reachable.
        expect(share).toHaveAttribute("aria-disabled", "true");
        expect(screen.getByRole("menuitemradio", { name: /Can edit & share/ })).toHaveAttribute(
            "aria-disabled",
            "true",
        );

        fireEvent.click(share);
        expect(onPermissionChange).not.toHaveBeenCalled();
        expect(screen.getByRole("menuitemradio", { name: /Can view & share/ })).toBeInTheDocument();

        expect(screen.getByRole("menuitemradio", { name: "Can view" })).not.toHaveAttribute("aria-disabled");
    });

    it("swaps the disabled level's info tooltip for the disabled explanation", async () => {
        renderMenu({
            selectedLevel: "VIEW",
            disabledLevels: ["SHARE", "EDIT"],
            disabledTooltip: "You can't set higher permissions for yourself.",
        });
        openMenu();
        const infoButtons = screen.getAllByRole("button", { name: /More information about/ });
        // Real focus, so floating-ui's focus trigger fires (fireEvent.focus would bypass it).
        act(() => {
            infoButtons[0]!.focus();
        });
        expect(await screen.findByRole("tooltip")).toHaveTextContent(
            "You can't set higher permissions for yourself.",
        );
    });

    it("drills into the labels checklist and applies the selection", () => {
        const onLabelsChange = vi.fn();
        renderMenu({
            labels: LABELS,
            selectedLabelIds: ["id", "name", "email"],
            onLabelsChange,
        });
        openMenu();
        fireEvent.click(screen.getByRole("menuitem", { name: /label access/i }));
        expect(screen.queryByRole("menuitemradio", { name: "Can view" })).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("checkbox", { name: /Customer Email/ }));
        fireEvent.click(screen.getByRole("button", { name: "Apply" }));
        expect(onLabelsChange).toHaveBeenCalledWith(["id", "name"]);
    });

    it("returns from the labels checklist to the row list on Back", () => {
        renderMenu({ labels: LABELS, selectedLabelIds: ["id"], onLabelsChange: () => {} });
        openMenu();
        fireEvent.click(screen.getByRole("menuitem", { name: /label access/i }));
        fireEvent.click(screen.getByRole("button", { name: /back/i }));
        expect(screen.getByRole("menuitemradio", { name: "Can view" })).toBeInTheDocument();
        expect(screen.getByRole("menuitem", { name: /label access/i })).toBeInTheDocument();
    });

    it("hands keyboard focus into the drill-in and back to the labels row", () => {
        // The view swap unmounts the focused element; without an explicit hand-off
        // focus would drop to <body> and the next Tab would leave the popover. On
        // drill-in the checklist's Back button takes focus; on return, the labels row.
        renderMenu({ labels: LABELS, selectedLabelIds: ["id"], onLabelsChange: () => {} });
        openMenu();
        fireEvent.click(screen.getByRole("menuitem", { name: /label access/i }));
        expect(screen.getByRole("button", { name: /back/i })).toHaveFocus();
        fireEvent.click(screen.getByRole("button", { name: /back/i }));
        expect(screen.getByRole("menuitem", { name: /label access/i })).toHaveFocus();
    });

    it("shows Remove access when handler is provided", () => {
        const onRemoveAccess = vi.fn();
        renderMenu({ onRemoveAccess });
        openMenu();
        fireEvent.click(screen.getByRole("menuitem", { name: /Remove access/ }));
        expect(onRemoveAccess).toHaveBeenCalledOnce();
        expect(screen.queryByRole("menuitem", { name: /Remove access/ })).not.toBeInTheDocument();
    });

    it("forwards dataTestId", () => {
        renderMenu({ dataTestId: "perm-menu" });
        openMenu();
        expect(screen.getByTestId("perm-menu")).toBeInTheDocument();
    });

    it("renders tooltip anchors as accessible icon buttons next to level rows", () => {
        renderMenu();
        openMenu();
        const infoButtons = screen.getAllByRole("button", { name: /More information about/ });
        // One per level row (EDIT + SHARE + VIEW)
        expect(infoButtons.length).toBe(3);
        for (const btn of infoButtons) {
            // Not nested inside the menuitemradio button
            expect(btn.closest('[role="menuitemradio"]')).toBeNull();
        }
    });
});
