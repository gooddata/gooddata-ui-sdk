// (C) 2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

// UiPopover + UiTooltip pull in the legacy Bubble stack that fails under our
// pnpm hoist. Mock UiPopover with a shell that always renders its content so the
// permission menu and the ⋯ more-options menu rows are clickable; the ⋯ menu's
// "Manage labels access" → checklist drill-in is then driven by the real UiMenu
// inside. Popover open/close itself is verified visually in Storybook.
type PopoverArgs = { onClose: () => void };
type PopoverMockProps = {
    anchor: ReactElement;
    content?: ReactNode | ((args: PopoverArgs) => ReactNode);
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
};
vi.mock("../../UiPopover/UiPopover.js", () => ({
    UiPopover: ({ anchor, content, isOpen, onOpenChange }: PopoverMockProps) => {
        const onClose = () => onOpenChange?.(false);
        const renderContent = () =>
            typeof content === "function"
                ? (content as (args: PopoverArgs) => ReactNode)({ onClose })
                : content;
        const open = isOpen === undefined ? true : isOpen;
        return (
            <>
                {anchor}
                {open ? renderContent() : null}
            </>
        );
    },
}));
vi.mock("../../UiTooltip/UiTooltip.js", () => ({
    UiTooltip: ({ anchor }: { anchor: ReactNode }) => <>{anchor}</>,
}));

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

const openLabelsPicker = () => {
    fireEvent.click(screen.getByRole("menuitem", { name: /labels access/i }));
};

describe("UiGranteeRowControls", () => {
    it("renders the permission menu and the ⋯ more-options menu, not a standalone labels dropdown", () => {
        renderControls({ permissionLevel: "VIEW" });
        // Permission trigger button — the permission level.
        expect(screen.getByRole("button", { name: /^Can view$/ })).toBeInTheDocument();
        // No standalone labels trigger button.
        expect(screen.queryByRole("button", { name: /All labels/ })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /of 4/ })).not.toBeInTheDocument();
        // The permission menu carries the level rows but not labels/transfer.
        expect(screen.getByRole("menuitemradio", { name: /^Can view$/ })).toBeInTheDocument();
        // The ⋯ menu carries the Manage labels access row.
        expect(screen.getByRole("menuitem", { name: /labels access/i })).toBeInTheDocument();
    });

    it("renders the 'Can view & share' permission label when level is SHARE", () => {
        renderControls({ permissionLevel: "SHARE", selectedLabelIds: ["id"] });
        expect(screen.getByRole("button", { name: /^Can view & share$/ })).toBeInTheDocument();
    });

    it("shows the effective-permission warning badge only when effectivePermission is set", () => {
        const { rerender } = renderControls({ permissionLevel: "VIEW" });
        // No badge when the assigned permission is already effective.
        expect(screen.queryByRole("img", { name: /effective permission/i })).not.toBeInTheDocument();

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
        expect(screen.getByRole("img", { name: /effective permission/i })).toBeInTheDocument();
    });

    it("hides the badge when the assigned permission already matches the effective one", () => {
        // Guard against a non-strict-elevation input: SHARE assigned + SHARE
        // effective is not an elevation, so no warning should show.
        renderControls({ permissionLevel: "SHARE", effectivePermission: "SHARE", selectedLabelIds: ["id"] });
        expect(screen.queryByRole("img", { name: /effective permission/i })).not.toBeInTheDocument();
    });

    it("does not render the labels picker until the menu Labels row is clicked", () => {
        renderControls({ selectedLabelIds: ["id", "name", "email", "ssn"] });
        // Picker body (checklist rows) not present initially.
        expect(screen.queryByRole("checkbox", { name: /Customer Email/ })).not.toBeInTheDocument();
        openLabelsPicker();
        // Now the picker body is rendered.
        expect(screen.getByRole("checkbox", { name: /Customer Email/ })).toBeInTheDocument();
    });

    it("Apply in the opened picker fires onLabelsChange with the locked primary always included", () => {
        const onLabelsChange = vi.fn();
        renderControls({ selectedLabelIds: ["id", "name", "email", "ssn"], onLabelsChange });
        openLabelsPicker();
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
        fireEvent.click(screen.getByRole("menuitemradio", { name: /Can view & share/ }));
        expect(onPermissionChange).toHaveBeenCalledWith("SHARE");
    });

    it("emits onRemoveAccess from the permission menu when picked", () => {
        const onRemoveAccess = vi.fn();
        renderControls({ onRemoveAccess });
        fireEvent.click(screen.getByRole("menuitem", { name: /Remove access/ }));
        expect(onRemoveAccess).toHaveBeenCalledOnce();
    });

    it("exposes Transfer ownership on the ⋯ menu and fires it when picked", () => {
        const onTransferOwnership = vi.fn();
        renderControls({ onTransferOwnership });
        fireEvent.click(screen.getByRole("menuitem", { name: /Transfer ownership/ }));
        expect(onTransferOwnership).toHaveBeenCalledOnce();
    });

    it("omits the ⋯ labels row when there are no labels but keeps transfer", () => {
        renderControls({ labels: [], selectedLabelIds: [], onTransferOwnership: () => {} });
        expect(screen.queryByRole("menuitem", { name: /labels access/i })).not.toBeInTheDocument();
        expect(screen.getByRole("menuitem", { name: /Transfer ownership/ })).toBeInTheDocument();
    });

    it("does not render the ⋯ menu at all when there are no labels and no transfer", () => {
        renderControls({ labels: [], selectedLabelIds: [] });
        expect(screen.queryByRole("menuitem", { name: /labels access/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("menuitem", { name: /Transfer ownership/ })).not.toBeInTheDocument();
        // The ellipsis trigger button is absent too.
        expect(screen.queryByRole("button", { name: /More options/ })).not.toBeInTheDocument();
        // The permission trigger is still there.
        expect(screen.getByRole("button", { name: /^Can view$/ })).toBeInTheDocument();
    });

    it("forwards dataTestId", () => {
        renderControls({ dataTestId: "row-controls" });
        expect(screen.getByTestId("row-controls")).toBeInTheDocument();
    });
});
