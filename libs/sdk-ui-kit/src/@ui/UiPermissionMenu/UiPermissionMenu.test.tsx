// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { type IUiLabelsChecklistItem } from "../UiLabelsChecklist/UiLabelsChecklist.js";

import { UiPermissionMenu } from "./UiPermissionMenu.js";

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

    it("explains a disabled level with a tooltip over the whole row", async () => {
        renderMenu({
            selectedLevel: "VIEW",
            disabledLevels: ["SHARE", "EDIT"],
            disabledTooltip: "You can't set higher permissions for yourself.",
        });
        openMenu();
        // Real focus, so floating-ui's focus trigger fires (fireEvent.focus would bypass it).
        act(() => {
            screen.getByRole("menuitemradio", { name: /Can edit & share/ }).focus();
        });
        const tooltip = await screen.findByRole("tooltip");
        expect(tooltip).toHaveTextContent("You can't set higher permissions for yourself.");
        // The width cap lives on the content wrapper's class (see the SCSS).
        expect(tooltip.querySelector(".gd-ui-kit-permission-menu__item-tooltip")).not.toBeNull();
        // The explanation is also a persistent accessible description of the row, so
        // assistive tech gets it without the (transient) tooltip.
        expect(screen.getByRole("menuitemradio", { name: /Can edit & share/ })).toHaveAccessibleDescription(
            "You can't set higher permissions for yourself.",
        );
        expect(screen.getByRole("menuitemradio", { name: "Can view" })).not.toHaveAccessibleDescription();
    });

    it("carries no tooltip and no info button on enabled rows", async () => {
        renderMenu({ selectedLevel: "VIEW", onRemoveAccess: () => {} });
        openMenu();
        expect(screen.queryByRole("button", { name: /More information about/ })).not.toBeInTheDocument();
        act(() => {
            screen.getByRole("menuitemradio", { name: /Can edit & share/ }).focus();
        });
        // Nothing to explain on an enabled row.
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 50));
        });
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("prefers a per-level disabled tooltip over the shared one", async () => {
        renderMenu({
            selectedLevel: "EDIT",
            disabledLevels: ["SHARE", "VIEW"],
            disabledTooltip: "You can't set higher permissions for yourself.",
            disabledLevelTooltips: { SHARE: "Covered by inherited access." },
        });
        openMenu();
        const share = screen.getByRole("menuitemradio", { name: /Can view & share/ });
        const view = screen.getByRole("menuitemradio", { name: "Can view" });
        act(() => {
            share.focus();
        });
        expect(await screen.findByRole("tooltip")).toHaveTextContent("Covered by inherited access.");
        act(() => {
            share.blur();
        });
        await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
        act(() => {
            view.focus();
        });
        // No per-level entry for VIEW — falls back to the shared tooltip.
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
});
