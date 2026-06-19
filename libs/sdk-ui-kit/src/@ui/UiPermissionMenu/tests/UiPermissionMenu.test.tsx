// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

// UiPopover + UiTooltip pull in the legacy Bubble stack that fails under
// our pnpm hoist. Mock both — popover is verified visually in Storybook,
// here we only test the menu body's selection / action wiring.
vi.mock("../../UiPopover/UiPopover.js", () => ({
    UiPopover: ({ content }: { content: (args: { onClose: () => void }) => React.ReactNode }) => (
        <div data-testid="popover-shell">{content({ onClose: closeSpy })}</div>
    ),
}));
vi.mock("../../UiTooltip/UiTooltip.js", () => ({
    UiTooltip: ({ anchor }: { anchor: React.ReactNode }) => <>{anchor}</>,
}));

const closeSpy = vi.fn();

import { UiPermissionMenu } from "../UiPermissionMenu.js";

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

const renderMenu = (props: Partial<Parameters<typeof UiPermissionMenu>[0]> = {}) => {
    closeSpy.mockClear();
    return renderWithIntl(
        <UiPermissionMenu anchor={<button>open</button>} onPermissionChange={() => {}} {...props} />,
    );
};

describe("UiPermissionMenu", () => {
    it("renders the two level rows as menuitemradio by default", () => {
        renderMenu({ selectedLevel: "VIEW" });
        const share = screen.getByRole("menuitemradio", { name: /Can view & share/ });
        const view = screen.getByRole("menuitemradio", { name: "Can view" });
        expect(share).toBeInTheDocument();
        expect(view).toBeInTheDocument();
        expect(share).toHaveAttribute("aria-checked", "false");
        expect(view).toHaveAttribute("aria-checked", "true");
        expect(screen.queryByRole("menuitem", { name: /Transfer ownership/ })).not.toBeInTheDocument();
        expect(screen.queryByRole("menuitem", { name: /labels access/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("menuitem", { name: /Remove access/ })).not.toBeInTheDocument();
    });

    it("emits onPermissionChange and closes when a level row is picked", () => {
        const onPermissionChange = vi.fn();
        renderMenu({ onPermissionChange });
        fireEvent.click(screen.getByRole("menuitemradio", { name: /Can view & share/ }));
        expect(onPermissionChange).toHaveBeenCalledWith("SHARE");
        expect(closeSpy).toHaveBeenCalledOnce();
    });

    it("never renders the Labels or Transfer ownership rows", () => {
        // Those moved to UiMoreOptionsMenu — the permission menu must not carry them.
        renderMenu({ onRemoveAccess: () => {} });
        expect(screen.queryByRole("menuitem", { name: /labels access/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("menuitem", { name: /Transfer ownership/ })).not.toBeInTheDocument();
    });

    it("shows Remove access when handler is provided", () => {
        const onRemoveAccess = vi.fn();
        renderMenu({ onRemoveAccess });
        fireEvent.click(screen.getByRole("menuitem", { name: /Remove access/ }));
        expect(onRemoveAccess).toHaveBeenCalledOnce();
        expect(closeSpy).toHaveBeenCalledOnce();
    });

    it("forwards dataTestId", () => {
        renderMenu({ dataTestId: "perm-menu" });
        expect(screen.getByTestId("perm-menu")).toBeInTheDocument();
    });

    it("renders tooltip anchors as accessible icon buttons next to level rows", () => {
        renderMenu();
        const infoButtons = screen.getAllByRole("button", { name: /More information about/ });
        // One per level row (SHARE + VIEW)
        expect(infoButtons.length).toBe(2);
        for (const btn of infoButtons) {
            // Not nested inside the menuitemradio button
            expect(btn.closest('[role="menuitemradio"]')).toBeNull();
        }
    });
});
