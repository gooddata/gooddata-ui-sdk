// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { type IUiLabelsChecklistItem } from "../../UiLabelsChecklist/UiLabelsChecklist.js";
import { UiGranteeRowControls } from "../UiGranteeRowControls.js";

const LABELS: IUiLabelsChecklistItem[] = [
    { id: "id", label: "Customer ID", kind: "primary", locked: true },
    { id: "name", label: "Customer Name", kind: "default" },
    { id: "email", label: "Customer Email" },
    { id: "ssn", label: "Customer SSN" },
];

const renderWithIntl = (ui: ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

const renderControls = (props: Partial<Parameters<typeof UiGranteeRowControls>[0]> = {}) =>
    renderWithIntl(
        <UiGranteeRowControls
            labels={LABELS}
            selectedLabelIds={["id", "name", "email", "ssn"]}
            permissionLevel="VIEW"
            onLabelsChange={() => {}}
            onPermissionChange={() => {}}
            {...props}
        />,
    );

const openPermissionMenu = (name: RegExp = /^Can view( & share)?$/) =>
    fireEvent.click(screen.getByRole("button", { name }));

describe("UiGranteeRowControls", () => {
    it("renders one permission dropdown hosting levels, Label access and Remove access", () => {
        renderControls({ permissionLevel: "VIEW", onRemoveAccess: () => {} });
        // Permission trigger button — the permission level; no standalone triggers.
        expect(screen.getByRole("button", { name: /^Can view$/ })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /more options/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /All labels/ })).not.toBeInTheDocument();
        openPermissionMenu();
        expect(screen.getByRole("menuitemradio", { name: /^Can edit & share$/ })).toBeInTheDocument();
        expect(screen.getByRole("menuitemradio", { name: /^Can view & share$/ })).toBeInTheDocument();
        expect(screen.getByRole("menuitemradio", { name: /^Can view$/ })).toBeInTheDocument();
        expect(screen.getByRole("menuitem", { name: /label access/i })).toBeInTheDocument();
        expect(screen.getByRole("menuitem", { name: /Remove access/i })).toBeInTheDocument();
    });

    it("renders the 'Can view & share' permission label when level is SHARE", () => {
        renderControls({ permissionLevel: "SHARE", selectedLabelIds: ["id"] });
        expect(screen.getByRole("button", { name: /^Can view & share$/ })).toBeInTheDocument();
    });

    it("renders EDIT as a selectable 'Can edit & share' dropdown with the level checked", () => {
        renderControls({ permissionLevel: "EDIT", selectedLabelIds: ["id"] });
        openPermissionMenu(/^Can edit & share$/);
        expect(screen.getByRole("menuitemradio", { name: /^Can edit & share$/ })).toBeChecked();
        expect(screen.getByRole("menuitemradio", { name: /^Can view & share$/ })).not.toBeChecked();
        expect(screen.getByRole("menuitemradio", { name: /^Can view$/ })).not.toBeChecked();
    });

    it("omits the Label access row for a label-less grantee but keeps Remove access", () => {
        renderControls({
            permissionLevel: "EDIT",
            labels: [],
            selectedLabelIds: [],
            onRemoveAccess: () => {},
        });
        openPermissionMenu(/^Can edit & share$/);
        expect(screen.queryByRole("menuitem", { name: /label access/i })).not.toBeInTheDocument();
        expect(screen.getByRole("menuitem", { name: /Remove access/i })).toBeInTheDocument();
    });

    it("shows the effective-permission warning badge only when the inherited level is higher", () => {
        const { rerender } = renderControls({ permissionLevel: "VIEW" });
        // No badge when the assigned permission is already effective.
        expect(screen.queryByRole("img", { name: /permission is inherited/i })).not.toBeInTheDocument();

        rerender(
            <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
                <UiGranteeRowControls
                    labels={LABELS}
                    selectedLabelIds={["id"]}
                    permissionLevel="VIEW"
                    effectivePermission="SHARE"
                    onLabelsChange={() => {}}
                    onPermissionChange={() => {}}
                />
            </IntlProvider>,
        );
        expect(screen.getByRole("img", { name: /permission is inherited/i })).toBeInTheDocument();
    });

    it("shows the badge for an inherited EDIT above a direct SHARE grant", () => {
        renderControls({ permissionLevel: "SHARE", effectivePermission: "EDIT", selectedLabelIds: ["id"] });
        expect(screen.getByRole("img", { name: /permission is inherited/i })).toBeInTheDocument();
    });

    it("trusts the effectivePermission contract instead of re-deriving the level ordering", () => {
        // Inheritance can decide the row without outranking anything: an inherited-only
        // grantee's whole level is inherited, so the caller sets the prop equal to the
        // displayed level and the control renders the badge without re-comparing.
        renderControls({ permissionLevel: "SHARE", effectivePermission: "SHARE", selectedLabelIds: ["id"] });
        expect(screen.getByRole("img", { name: /permission is inherited/i })).toBeInTheDocument();
    });

    it("badges an inherited-only VIEW row, which has no higher level to report", () => {
        // VIEW had no tooltip copy, so these rows silently rendered no badge at all while
        // inherited-only EDIT/SHARE rows got one.
        renderControls({ permissionLevel: "VIEW", effectivePermission: "VIEW", selectedLabelIds: ["id"] });
        // The accessible name must not claim the inherited level is HIGHER: here it is
        // equal, and the badge is shared by every inherited row.
        expect(screen.getByRole("img", { name: "Permission is inherited" })).toBeInTheDocument();
        expect(screen.queryByRole("img", { name: /higher than/i })).not.toBeInTheDocument();
    });

    it("does not render the labels picker until the menu Label access row is clicked", () => {
        renderControls({ selectedLabelIds: ["id", "name", "email", "ssn"] });
        openPermissionMenu();
        // Picker body (checklist rows) not present until drilled in.
        expect(screen.queryByRole("checkbox", { name: /Customer Email/ })).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("menuitem", { name: /label access/i }));
        expect(screen.getByRole("checkbox", { name: /Customer Email/ })).toBeInTheDocument();
    });

    it("Apply in the opened picker fires onLabelsChange with the locked primary always included", () => {
        const onLabelsChange = vi.fn();
        renderControls({ selectedLabelIds: ["id", "name", "email", "ssn"], onLabelsChange });
        openPermissionMenu();
        fireEvent.click(screen.getByRole("menuitem", { name: /label access/i }));
        // Drop two non-locked labels.
        fireEvent.click(screen.getByRole("checkbox", { name: /Customer Email/ }));
        fireEvent.click(screen.getByRole("checkbox", { name: /Customer SSN/ }));
        fireEvent.click(screen.getByRole("button", { name: "Apply" }));
        // Locked "id" stays, "name" stays, "email"/"ssn" removed.
        expect(onLabelsChange).toHaveBeenCalledWith(["id", "name"]);
    });

    it("emits onPermissionChange when a level row is picked", () => {
        const onPermissionChange = vi.fn();
        renderControls({ onPermissionChange });
        openPermissionMenu();
        fireEvent.click(screen.getByRole("menuitemradio", { name: /Can edit & share/ }));
        expect(onPermissionChange).toHaveBeenCalledWith("EDIT");
    });

    it("emits onRemoveAccess from the permission menu when picked", () => {
        const onRemoveAccess = vi.fn();
        renderControls({ onRemoveAccess });
        openPermissionMenu();
        fireEvent.click(screen.getByRole("menuitem", { name: /Remove access/ }));
        expect(onRemoveAccess).toHaveBeenCalledOnce();
    });

    it("forwards disabledLevels with the disabled tooltip to the permission menu", () => {
        const onPermissionChange = vi.fn();
        renderControls({
            permissionLevel: "SHARE",
            disabledLevels: ["EDIT"],
            disabledTooltip: "You can't set higher permissions for yourself.",
            onPermissionChange,
        });
        openPermissionMenu(/^Can view & share$/);
        const editRow = screen.getByRole("menuitemradio", { name: /^Can edit & share$/ });
        expect(editRow).toHaveAttribute("aria-disabled", "true");
        fireEvent.click(editRow);
        expect(onPermissionChange).not.toHaveBeenCalled();
    });

    it("forwards dataTestId", () => {
        renderControls({ dataTestId: "row-controls" });
        expect(screen.getByTestId("row-controls")).toBeInTheDocument();
    });
});
