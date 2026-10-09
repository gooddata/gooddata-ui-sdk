// (C) 2026 GoodData Corporation

import { useState } from "react";

import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render } from "../../../test/render.js";

import { type IUiResizableSidebarNavigationItem, type IUiResizableSidebarState } from "./types.js";
import { UiResizableSidebarProvider } from "./UiResizableSidebarContext.js";
import { UiResizableSidebarNavigation } from "./UiResizableSidebarNavigation.js";

const settingsChildren = [
    { id: "appearance", label: "Appearance", href: "/settings/appearance" },
    { id: "localization", label: "Localization", href: "/settings/localization" },
    {
        id: "developer",
        label: "Developer",
        href: "/settings/developer",
        badge: { kind: "dot" as const, label: "Needs attention" },
    },
];

function makeItems(selectedId?: string): IUiResizableSidebarNavigationItem[] {
    const items: IUiResizableSidebarNavigationItem[] = [
        { id: "home", label: "Home", icon: "home", href: "/home" },
        { id: "workspaces", label: "Workspaces", icon: "folder", href: "/workspaces" },
        {
            id: "settings",
            label: "Settings",
            icon: "settings",
            href: "/settings",
            children: settingsChildren,
        },
        { id: "help", label: "Help", children: [{ id: "docs", label: "Documentation", href: "/docs" }] },
    ];

    return items.map((item) => ({
        ...item,
        isSelected: item.id === selectedId,
        children: item.children?.map((child) => ({ ...child, isSelected: child.id === selectedId })),
    }));
}

const naming = { ariaLabel: "Main" };

function railState(isCollapsed: boolean): IUiResizableSidebarState {
    return {
        width: isCollapsed ? 48 : 230,
        expandedWidth: 230,
        min: 230,
        max: 500,
        canResize: !isCollapsed,
        setWidth: () => {},
        canCollapse: true,
        hasRail: true,
        isCollapsed,
        setCollapsed: () => {},
    };
}

function Selectable({ initialId }: { initialId?: string }) {
    const [selectedId, setSelectedId] = useState(initialId);

    return (
        <>
            <UiResizableSidebarNavigation
                items={makeItems(selectedId)}
                accessibilityConfig={naming}
                onSelect={(item, event) => {
                    event.preventDefault();
                    setSelectedId(item.id);
                }}
            />
            <button type="button" onClick={() => setSelectedId("localization")}>
                go to localization
            </button>
        </>
    );
}

// The test helper's rerender drops its wrapper, which remounts the tree, so the rail switch lives in state.
function RailSwitch() {
    const [isRail, setRail] = useState(false);

    return (
        <UiResizableSidebarProvider value={railState(isRail)}>
            <UiResizableSidebarNavigation items={makeItems("localization")} accessibilityConfig={naming} />
            <button type="button" onClick={() => setRail(!isRail)}>
                toggle rail
            </button>
        </UiResizableSidebarProvider>
    );
}

describe("UiResizableSidebarNavigation", () => {
    it("renders a named navigation of links and marks the selected page", () => {
        render(<UiResizableSidebarNavigation items={makeItems("workspaces")} accessibilityConfig={naming} />);

        const nav = screen.getByRole("navigation", { name: "Main" });
        expect(within(nav).getByRole("link", { name: "Workspaces" })).toHaveAttribute("aria-current", "page");
        expect(within(nav).getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
        expect(within(nav).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home");
    });

    it("renders a custom icon node", () => {
        const items: IUiResizableSidebarNavigationItem[] = [
            { id: "custom", label: "Custom", href: "/custom", icon: <i className="custom-glyph" /> },
        ];
        render(<UiResizableSidebarNavigation items={items} accessibilityConfig={naming} />);

        const link = screen.getByRole("link", { name: "Custom" });
        expect(
            link.querySelector(".gd-ui-kit-resizable-sidebar-navigation__icon .custom-glyph"),
        ).not.toBeNull();
        expect(link.querySelector("svg")).toBeNull();
    });

    it("renders an item with an empty href as a link", () => {
        const items: IUiResizableSidebarNavigationItem[] = [
            { id: "current", label: "Current", href: "" },
            {
                id: "group",
                label: "Group",
                href: "",
                children: [{ id: "page", label: "Page", href: "/page" }],
            },
        ];
        render(<UiResizableSidebarNavigation items={items} accessibilityConfig={naming} />);

        // The role query ignores an anchor with an empty href, so the elements are read from the DOM.
        const current = screen.getByText("Current").closest("a, button");
        const group = screen.getByText("Group").closest("a, button");
        expect(current?.tagName).toBe("A");
        expect(current).toHaveAttribute("href", "");
        expect(group?.tagName).toBe("A");
        expect(group).toHaveAttribute("aria-expanded", "false");
    });

    it("lists the sub-items of a group only while it is expanded", () => {
        render(<UiResizableSidebarNavigation items={makeItems("home")} accessibilityConfig={naming} />);

        const settings = screen.getByRole("link", { name: /^Settings/ });
        expect(settings).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByRole("link", { name: "Appearance" })).toBeNull();
        expect(screen.getByRole("button", { name: "Help" })).toHaveAttribute("aria-expanded", "false");
    });

    it("expands the group of the selected sub-item and highlights both levels", () => {
        render(
            <UiResizableSidebarNavigation items={makeItems("localization")} accessibilityConfig={naming} />,
        );

        const settings = screen.getByRole("link", { name: /^Settings/ });
        const localization = screen.getByRole("link", { name: "Localization" });

        expect(settings).toHaveAttribute("aria-expanded", "true");
        expect(settings).toHaveAttribute("aria-controls", localization.closest("ul")?.id);
        expect(settings).toHaveClass("gd-ui-kit-resizable-sidebar-navigation__item--active");
        expect(settings).not.toHaveAttribute("aria-current");
        expect(localization).toHaveAttribute("aria-current", "page");
        expect(localization).toHaveClass("gd-ui-kit-resizable-sidebar-navigation__item--selected");
        expect(localization).toHaveClass("gd-ui-kit-resizable-sidebar-navigation__item--child");
    });

    it("marks a group as current while its selected sub-page is not rendered", async () => {
        const { user } = render(
            <UiResizableSidebarNavigation items={makeItems("localization")} accessibilityConfig={naming} />,
        );

        const settings = screen.getByRole("link", { name: /^Settings/ });
        expect(settings).not.toHaveAttribute("aria-current");

        await user.click(settings);
        expect(settings).toHaveAttribute("aria-expanded", "false");
        expect(settings).toHaveAttribute("aria-current", "true");

        await user.click(settings);
        expect(settings).not.toHaveAttribute("aria-current");
        expect(screen.getByRole("link", { name: "Localization" })).toHaveAttribute("aria-current", "page");
    });

    it("renders the whole first character of the label when an item has no icon", () => {
        const items: IUiResizableSidebarNavigationItem[] = [
            { id: "flag", label: "🇨🇿 Czech", href: "/cz" },
            { id: "accent", label: "e\u0301tude", href: "/etude" },
            { id: "empty", label: "", href: "/empty" },
        ];
        render(<UiResizableSidebarNavigation items={items} accessibilityConfig={naming} />);

        const icons = Array.from(
            document.querySelectorAll(".gd-ui-kit-resizable-sidebar-navigation__icon"),
            (icon) => icon.textContent,
        );
        expect(icons).toEqual(["🇨🇿", "e\u0301", ""]);
    });

    it("renders the dot badge of an item with its accessible label", () => {
        render(
            <UiResizableSidebarNavigation items={makeItems("localization")} accessibilityConfig={naming} />,
        );

        const developer = screen.getByRole("link", { name: "Developer Needs attention" });
        expect(
            developer.querySelector(".gd-ui-kit-resizable-sidebar-navigation__badge--kind-dot"),
        ).not.toBeNull();
        expect(
            screen
                .getByRole("link", { name: "Appearance" })
                .querySelector(".gd-ui-kit-resizable-sidebar-navigation__badge"),
        ).toBeNull();
    });

    it("toggles a group without href by clicking it", async () => {
        const onSelect = vi.fn();
        const { user } = render(
            <UiResizableSidebarNavigation
                items={makeItems("home")}
                accessibilityConfig={naming}
                onSelect={onSelect}
            />,
        );

        await user.click(screen.getByRole("button", { name: "Help" }));
        expect(screen.getByRole("button", { name: "Help" })).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByRole("link", { name: "Documentation" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Help" }));
        expect(screen.getByRole("button", { name: "Help" })).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByRole("link", { name: "Documentation" })).toBeNull();
        expect(onSelect).not.toHaveBeenCalled();
    });

    it("selects and expands an inactive group link, and toggles an active one without selecting", async () => {
        const onSelect = vi.fn((_item, event) => event.preventDefault());
        const { user, rerender } = render(
            <UiResizableSidebarNavigation
                items={makeItems("home")}
                accessibilityConfig={naming}
                onSelect={onSelect}
            />,
        );

        await user.click(screen.getByRole("link", { name: /^Settings/ }));
        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "settings" }), expect.anything());
        expect(screen.getByRole("link", { name: /^Settings/ })).toHaveAttribute("aria-expanded", "true");

        rerender(
            <UiResizableSidebarNavigation
                items={makeItems("appearance")}
                accessibilityConfig={naming}
                onSelect={onSelect}
            />,
        );
        onSelect.mockClear();

        await user.click(screen.getByRole("link", { name: /^Settings/ }));
        expect(onSelect).not.toHaveBeenCalled();
        expect(screen.getByRole("link", { name: /^Settings/ })).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByRole("link", { name: "Appearance" })).toBeNull();
    });

    it("re-expands a manually collapsed group when the selection moves into it", async () => {
        const { user } = render(<Selectable initialId="home" />);

        await user.click(screen.getByRole("link", { name: /^Settings/ }));
        expect(screen.getByRole("link", { name: /^Settings/ })).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByRole("link", { name: /^Settings/ })).toHaveAttribute("aria-current", "page");

        await user.click(screen.getByRole("link", { name: /^Settings/ }));
        expect(screen.getByRole("link", { name: /^Settings/ })).toHaveAttribute("aria-expanded", "false");

        await user.click(screen.getByRole("button", { name: "go to localization" }));
        expect(screen.getByRole("link", { name: /^Settings/ })).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByRole("link", { name: "Localization" })).toHaveAttribute("aria-current", "page");
    });

    it("keeps one tab stop on the selected item", () => {
        render(
            <UiResizableSidebarNavigation items={makeItems("localization")} accessibilityConfig={naming} />,
        );

        expect(screen.getByRole("link", { name: "Localization" })).toHaveAttribute("tabindex", "0");
        expect(screen.getByRole("link", { name: /^Settings/ })).toHaveAttribute("tabindex", "-1");
        expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("tabindex", "-1");
    });

    it("moves focus with the arrow keys, Home and End over the listed items", async () => {
        const { user } = render(
            <UiResizableSidebarNavigation items={makeItems("localization")} accessibilityConfig={naming} />,
        );

        await user.tab();
        expect(screen.getByRole("link", { name: "Localization" })).toHaveFocus();

        await user.keyboard("{ArrowDown}");
        expect(screen.getByRole("link", { name: "Developer Needs attention" })).toHaveFocus();

        await user.keyboard("{ArrowDown}");
        expect(screen.getByRole("button", { name: "Help" })).toHaveFocus();

        await user.keyboard("{ArrowDown}");
        expect(screen.getByRole("button", { name: "Help" })).toHaveFocus();

        await user.keyboard("{Home}");
        expect(screen.getByRole("link", { name: "Home" })).toHaveFocus();

        await user.keyboard("{ArrowUp}");
        expect(screen.getByRole("link", { name: "Home" })).toHaveFocus();

        await user.keyboard("{End}");
        expect(screen.getByRole("button", { name: "Help" })).toHaveFocus();

        await user.keyboard("{ArrowUp}{ArrowUp}");
        expect(screen.getByRole("link", { name: "Localization" })).toHaveFocus();
        expect(screen.getByRole("link", { name: "Localization" })).toHaveAttribute("tabindex", "0");
        expect(screen.getByRole("link", { name: /^Settings/ })).toHaveAttribute("tabindex", "-1");
    });

    it("expands and collapses a group with the Right and Left arrow keys", async () => {
        const { user } = render(
            <UiResizableSidebarNavigation items={makeItems("home")} accessibilityConfig={naming} />,
        );

        await user.tab();
        await user.keyboard("{ArrowDown}{ArrowDown}");
        const settings = screen.getByRole("link", { name: /^Settings/ });
        expect(settings).toHaveFocus();

        await user.keyboard("{ArrowRight}");
        expect(settings).toHaveAttribute("aria-expanded", "true");
        expect(settings).toHaveFocus();

        await user.keyboard("{ArrowRight}");
        expect(screen.getByRole("link", { name: "Appearance" })).toHaveFocus();

        await user.keyboard("{ArrowLeft}");
        expect(settings).toHaveFocus();

        await user.keyboard("{ArrowLeft}");
        expect(settings).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByRole("link", { name: "Appearance" })).toBeNull();
        expect(settings).toHaveFocus();
    });

    it("keeps sub-items with the same id in different groups apart", async () => {
        const items: IUiResizableSidebarNavigationItem[] = [
            {
                id: "settings",
                label: "Settings",
                children: [{ id: "overview", label: "Settings overview", href: "/settings/overview" }],
            },
            {
                id: "workspaces",
                label: "Workspaces",
                children: [
                    {
                        id: "overview",
                        label: "Workspaces overview",
                        href: "/workspaces/overview",
                        isSelected: true,
                    },
                ],
            },
        ];
        const { user } = render(<UiResizableSidebarNavigation items={items} accessibilityConfig={naming} />);

        expect(screen.getByRole("link", { name: "Workspaces overview" })).toHaveAttribute("tabindex", "0");

        await user.click(screen.getByRole("button", { name: "Settings" }));
        expect(screen.getByRole("link", { name: "Settings overview" })).toHaveAttribute("tabindex", "-1");
        expect(screen.getByRole("link", { name: "Workspaces overview" })).toHaveAttribute("tabindex", "-1");

        await user.keyboard("{ArrowRight}");
        expect(screen.getByRole("link", { name: "Settings overview" })).toHaveFocus();

        await user.keyboard("{End}");
        expect(screen.getByRole("link", { name: "Workspaces overview" })).toHaveFocus();

        await user.keyboard("{ArrowLeft}");
        expect(screen.getByRole("button", { name: "Workspaces" })).toHaveFocus();
    });

    it("re-expands a collapsed group when the selection moves to its sub-item with a reused id", async () => {
        const makeDuplicateItems = (selectedGroupId: string): IUiResizableSidebarNavigationItem[] =>
            ["settings", "workspaces"].map((groupId) => ({
                id: groupId,
                label: groupId,
                children: [
                    {
                        id: "overview",
                        label: `${groupId} overview`,
                        href: `/${groupId}/overview`,
                        isSelected: groupId === selectedGroupId,
                    },
                ],
            }));
        const { user, rerender } = render(
            <UiResizableSidebarNavigation
                items={makeDuplicateItems("workspaces")}
                accessibilityConfig={naming}
            />,
        );

        await user.click(screen.getByRole("button", { name: "settings" }));
        await user.click(screen.getByRole("button", { name: "settings" }));
        expect(screen.getByRole("button", { name: "settings" })).toHaveAttribute("aria-expanded", "false");

        rerender(
            <UiResizableSidebarNavigation
                items={makeDuplicateItems("settings")}
                accessibilityConfig={naming}
            />,
        );

        expect(screen.getByRole("button", { name: "settings" })).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByRole("link", { name: "settings overview" })).toHaveAttribute(
            "aria-current",
            "page",
        );
    });

    it("keeps a top-level item apart from a sub-item whose ids concatenate to the same string", async () => {
        const items: IUiResizableSidebarNavigationItem[] = [
            {
                id: "settings",
                label: "Settings",
                children: [{ id: "overview", label: "Settings overview", href: "/settings/overview" }],
            },
            { id: "settings/overview", label: "Combined", href: "/combined", isSelected: true },
        ];
        const { user } = render(<UiResizableSidebarNavigation items={items} accessibilityConfig={naming} />);

        await user.tab();
        expect(screen.getByRole("link", { name: "Combined" })).toHaveFocus();

        await user.keyboard("{Home}{ArrowRight}{ArrowRight}");
        expect(screen.getByRole("link", { name: "Settings overview" })).toHaveFocus();

        await user.keyboard("{ArrowDown}");
        expect(screen.getByRole("link", { name: "Combined" })).toHaveFocus();
    });

    it("leaves arrow keys with a system modifier to the browser", async () => {
        const { user } = render(
            <UiResizableSidebarNavigation items={makeItems("localization")} accessibilityConfig={naming} />,
        );

        await user.tab();
        const localization = screen.getByRole("link", { name: "Localization" });
        expect(localization).toHaveFocus();

        await user.keyboard("{Alt>}{ArrowLeft}{ArrowUp}{Home}{/Alt}");
        await user.keyboard("{Meta>}{ArrowDown}{/Meta}");
        await user.keyboard("{Control>}{End}{/Control}");
        expect(localization).toHaveFocus();
        expect(screen.getByRole("link", { name: /^Settings/ })).toHaveAttribute("aria-expanded", "true");
    });

    it("lists only the top-level items with tooltips in rail mode", () => {
        render(
            <UiResizableSidebarProvider value={railState(true)}>
                <UiResizableSidebarNavigation
                    items={makeItems("localization")}
                    accessibilityConfig={naming}
                />
            </UiResizableSidebarProvider>,
        );

        const settings = screen.getByRole("link", { name: /^Settings/ });
        expect(settings).toHaveClass("gd-ui-kit-resizable-sidebar-navigation__item--rail");
        expect(settings).toHaveClass("gd-ui-kit-resizable-sidebar-navigation__item--active");
        expect(settings).not.toHaveAttribute("aria-expanded");
        expect(settings).toHaveAttribute("aria-current", "true");
        expect(settings.closest(".gd-ui-kit-tooltip__anchor")).not.toBeNull();
        expect(settings.querySelector(".gd-ui-kit-resizable-sidebar-navigation__sr-only")).not.toBeNull();
        expect(screen.queryByRole("link", { name: "Localization" })).toBeNull();
        expect(screen.getByRole("button", { name: "Help" }).querySelector("svg")).toBeNull();
    });

    it("keeps the badge label in the accessible name in rail mode", () => {
        const items: IUiResizableSidebarNavigationItem[] = [
            {
                id: "alerts",
                label: "Alerts",
                icon: "alert",
                href: "/alerts",
                badge: { kind: "dot", label: "Needs attention" },
            },
        ];
        render(<UiResizableSidebarNavigation items={items} accessibilityConfig={naming} isRail />);

        const alerts = screen.getByRole("link", { name: "Alerts Needs attention" });
        expect(
            alerts.querySelector("[aria-hidden] .gd-ui-kit-resizable-sidebar-navigation__badge"),
        ).toBeNull();
    });

    it("follows the provider into rail mode", () => {
        const { rerender } = render(
            <UiResizableSidebarProvider value={railState(false)}>
                <UiResizableSidebarNavigation
                    items={makeItems("localization")}
                    accessibilityConfig={naming}
                />
            </UiResizableSidebarProvider>,
        );

        expect(screen.getByRole("link", { name: "Localization" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Home" }).closest(".gd-ui-kit-tooltip__anchor")).toBeNull();

        rerender(
            <UiResizableSidebarProvider value={railState(true)}>
                <UiResizableSidebarNavigation
                    items={makeItems("localization")}
                    accessibilityConfig={naming}
                />
            </UiResizableSidebarProvider>,
        );

        expect(screen.queryByRole("link", { name: "Localization" })).toBeNull();
    });

    it("follows the provider out of rail mode and lists the active group's sub-pages again", () => {
        const { rerender } = render(
            <UiResizableSidebarProvider value={railState(true)}>
                <UiResizableSidebarNavigation
                    items={makeItems("localization")}
                    accessibilityConfig={naming}
                />
            </UiResizableSidebarProvider>,
        );

        expect(screen.queryByRole("link", { name: "Localization" })).toBeNull();

        rerender(
            <UiResizableSidebarProvider value={railState(false)}>
                <UiResizableSidebarNavigation
                    items={makeItems("localization")}
                    accessibilityConfig={naming}
                />
            </UiResizableSidebarProvider>,
        );

        expect(screen.getByRole("link", { name: /^Settings/ })).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByRole("link", { name: "Localization" })).toHaveAttribute("aria-current", "page");
    });

    it("keeps a manual collapse across a round trip through the rail", async () => {
        const { user } = render(<RailSwitch />);

        await user.click(screen.getByRole("link", { name: /^Settings/ }));
        expect(screen.getByRole("link", { name: /^Settings/ })).toHaveAttribute("aria-expanded", "false");

        await user.click(screen.getByRole("button", { name: "toggle rail" }));
        expect(screen.getByRole("link", { name: /^Settings/ })).not.toHaveAttribute("aria-expanded");

        await user.click(screen.getByRole("button", { name: "toggle rail" }));
        expect(screen.getByRole("link", { name: /^Settings/ })).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByRole("link", { name: "Localization" })).toBeNull();
    });

    it("leaves a modified click on a link to the browser", () => {
        const onSelect = vi.fn();
        // Runs after the component's handler; prevents the default so happy-dom does not leave the page.
        const defaultPrevented: boolean[] = [];
        const observeClick = (event: Event) => {
            defaultPrevented.push(event.defaultPrevented);
            event.preventDefault();
        };
        document.addEventListener("click", observeClick);

        try {
            render(
                <UiResizableSidebarNavigation
                    items={makeItems("localization")}
                    accessibilityConfig={naming}
                    onSelect={onSelect}
                />,
            );

            const settings = screen.getByRole("link", { name: /^Settings/ });
            fireEvent.click(settings, { metaKey: true });
            fireEvent.click(settings, { ctrlKey: true });
            fireEvent.click(screen.getByRole("link", { name: "Home" }), { shiftKey: true });
            fireEvent.click(screen.getByRole("link", { name: "Home" }), { altKey: true });
            expect(defaultPrevented).toEqual([false, false, false, false]);
            expect(settings).toHaveAttribute("aria-expanded", "true");
            expect(onSelect).not.toHaveBeenCalled();
        } finally {
            document.removeEventListener("click", observeClick);
        }
    });

    it("shows a sub-page badge on its collapsed group and in the rail", async () => {
        const stayOnPage = (_item: unknown, event: { preventDefault: () => void }) => event.preventDefault();
        const { user, rerender } = render(
            <UiResizableSidebarNavigation
                items={makeItems("home")}
                accessibilityConfig={naming}
                onSelect={stayOnPage}
            />,
        );

        const settings = screen.getByRole("link", { name: "Settings Needs attention" });
        expect(settings.querySelector(".gd-ui-kit-resizable-sidebar-navigation__badge")).not.toBeNull();

        await user.click(settings);
        expect(screen.getByRole("link", { name: /^Settings/ })).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByRole("link", { name: "Developer Needs attention" })).toBeInTheDocument();

        rerender(
            <UiResizableSidebarNavigation items={makeItems("home")} accessibilityConfig={naming} isRail />,
        );
        expect(screen.getByRole("link", { name: "Settings Needs attention" })).toBeInTheDocument();
    });
});
