// (C) 2026 GoodData Corporation

import { useState } from "react";

import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
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
        actionRequired: { label: "Action required" },
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

interface IRailControl {
    setRail?: (isRail: boolean) => void;
    setItems?: (items: IUiResizableSidebarNavigationItem[]) => void;
}

// Switches the rail through state, so the tree stays mounted and focus can stay inside the flyover.
function StateRail({ control }: { control: IRailControl }) {
    const [isRail, setRail] = useState(true);
    const [items, setItems] = useState(() => makeItems("localization"));
    control.setRail = setRail;
    control.setItems = setItems;

    return (
        <UiResizableSidebarProvider value={railState(isRail)}>
            <UiResizableSidebarNavigation items={items} accessibilityConfig={naming} />
        </UiResizableSidebarProvider>
    );
}

// Longer than the hover open delay of the flyover.
function waitForHover() {
    return new Promise((resolve) => setTimeout(resolve, 200));
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

    it("marks an item that requires an action with an accessible label", () => {
        render(
            <UiResizableSidebarNavigation items={makeItems("localization")} accessibilityConfig={naming} />,
        );

        const developer = screen.getByRole("link", { name: "Developer Action required" });
        expect(
            developer.querySelector(".gd-ui-kit-resizable-sidebar-navigation__action-required"),
        ).not.toBeNull();
        expect(
            screen
                .getByRole("link", { name: "Appearance" })
                .querySelector(".gd-ui-kit-resizable-sidebar-navigation__action-required"),
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
        expect(screen.getByRole("link", { name: "Developer Action required" })).toHaveFocus();

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

    it("lists only the top-level items in rail mode, with tooltips and flyovers", () => {
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
        expect(settings).toHaveAttribute("aria-expanded", "false");
        expect(settings).toHaveAttribute("aria-current", "true");
        expect(settings.closest(".gd-ui-kit-resizable-sidebar-navigation__flyover-anchor")).not.toBeNull();
        expect(
            screen.getByRole("link", { name: "Home" }).closest(".gd-ui-kit-tooltip__anchor"),
        ).not.toBeNull();
        expect(settings.querySelector(".gd-ui-kit-resizable-sidebar-navigation__sr-only")).not.toBeNull();
        expect(screen.queryByRole("link", { name: "Localization" })).toBeNull();
        expect(screen.getByRole("button", { name: "Help" }).querySelector("svg")).toBeNull();
    });

    it("keeps the action-required label in the accessible name in rail mode", () => {
        const items: IUiResizableSidebarNavigationItem[] = [
            {
                id: "alerts",
                label: "Alerts",
                icon: "alert",
                href: "/alerts",
                actionRequired: { label: "Action required" },
            },
        ];
        render(<UiResizableSidebarNavigation items={items} accessibilityConfig={naming} isRail />);

        const alerts = screen.getByRole("link", { name: "Alerts Action required" });
        expect(
            alerts.querySelector("[aria-hidden] .gd-ui-kit-resizable-sidebar-navigation__action-required"),
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
        expect(screen.queryByRole("link", { name: "Localization" })).toBeNull();

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

    it("marks a collapsed group and a rail group whose sub-page requires an action", async () => {
        const stayOnPage = (_item: unknown, event: { preventDefault: () => void }) => event.preventDefault();
        const { user, rerender } = render(
            <UiResizableSidebarNavigation
                items={makeItems("home")}
                accessibilityConfig={naming}
                onSelect={stayOnPage}
            />,
        );

        const settings = screen.getByRole("link", { name: "Settings Action required" });
        expect(
            settings.querySelector(".gd-ui-kit-resizable-sidebar-navigation__action-required"),
        ).not.toBeNull();

        await user.click(settings);
        expect(screen.getByRole("link", { name: /^Settings/ })).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByRole("link", { name: "Developer Action required" })).toBeInTheDocument();

        rerender(
            <UiResizableSidebarNavigation items={makeItems("home")} accessibilityConfig={naming} isRail />,
        );
        expect(screen.getByRole("link", { name: "Settings Action required" })).toBeInTheDocument();
    });

    describe("rail flyover", () => {
        function renderRail(onSelect = vi.fn()) {
            return {
                onSelect,
                ...render(
                    <UiResizableSidebarProvider value={railState(true)}>
                        <UiResizableSidebarNavigation
                            items={makeItems("localization")}
                            accessibilityConfig={naming}
                            onSelect={onSelect}
                        />
                    </UiResizableSidebarProvider>,
                ),
            };
        }

        it("opens on hover and lists the sub-pages of the group", async () => {
            const { user } = renderRail();

            const settings = screen.getByRole("link", { name: /^Settings/ });
            await user.hover(settings);

            const flyover = await screen.findByRole("group", { name: "Settings" });
            expect(settings).toHaveAttribute("aria-expanded", "true");
            expect(settings).toHaveAttribute("aria-controls", flyover.id);
            expect(settings).not.toHaveAttribute("aria-current");
            expect(within(flyover).getByRole("link", { name: "Localization" })).toHaveAttribute(
                "aria-current",
                "page",
            );
            expect(
                within(flyover).getByRole("link", { name: "Developer Action required" }),
            ).toBeInTheDocument();
            expect(flyover).not.toContainElement(document.activeElement as HTMLElement);
        });

        it("opens with the Right arrow key and focuses the current page", async () => {
            const { user } = renderRail();

            await user.tab();
            expect(screen.getByRole("link", { name: /^Settings/ })).toHaveFocus();

            await user.keyboard("{ArrowRight}");
            const flyover = await screen.findByRole("group", { name: "Settings" });
            expect(within(flyover).getByRole("link", { name: "Localization" })).toHaveFocus();

            await user.keyboard("{ArrowDown}");
            expect(within(flyover).getByRole("link", { name: /^Developer/ })).toHaveFocus();
            await user.keyboard("{ArrowDown}");
            expect(within(flyover).getByRole("link", { name: /^Developer/ })).toHaveFocus();
            await user.keyboard("{Home}");
            expect(within(flyover).getByRole("link", { name: "Appearance" })).toHaveFocus();
            await user.keyboard("{End}");
            expect(within(flyover).getByRole("link", { name: /^Developer/ })).toHaveFocus();
        });

        it.each(["{ArrowLeft}", "{Escape}"])("closes with %s and returns focus to the group", async (key) => {
            const { user } = renderRail();

            await user.tab();
            await user.keyboard("{ArrowRight}");
            await screen.findByRole("group", { name: "Settings" });

            await user.keyboard(key);
            expect(screen.queryByRole("group", { name: "Settings" })).toBeNull();
            expect(screen.getByRole("link", { name: /^Settings/ })).toHaveFocus();
            expect(screen.getByRole("link", { name: /^Settings/ })).toHaveAttribute("aria-expanded", "false");
        });

        it("returns focus to the group after a sub-page is chosen with the keyboard", async () => {
            const onSelect = vi.fn((_item, event: { preventDefault: () => void }) => event.preventDefault());
            const { user } = renderRail(onSelect);

            await user.tab();
            await user.keyboard("{ArrowRight}");
            await screen.findByRole("group", { name: "Settings" });

            await user.keyboard("{ArrowUp}{Enter}");
            expect(onSelect).toHaveBeenCalledWith(
                expect.objectContaining({ id: "appearance" }),
                expect.anything(),
            );
            expect(screen.queryByRole("group", { name: "Settings" })).toBeNull();
            expect(screen.getByRole("link", { name: /^Settings/ })).toHaveFocus();
        });

        it("stays open when the pointer leaves while focus is inside", async () => {
            const { user } = renderRail();

            const settings = screen.getByRole("link", { name: /^Settings/ });
            await user.hover(settings);
            await screen.findByRole("group", { name: "Settings" });
            await user.tab();
            await user.keyboard("{ArrowRight}");
            const flyover = screen.getByRole("group", { name: "Settings" });
            expect(within(flyover).getByRole("link", { name: "Localization" })).toHaveFocus();

            await user.unhover(settings);
            await user.hover(screen.getByRole("link", { name: "Home" }));
            expect(screen.getByRole("group", { name: "Settings" })).toBeInTheDocument();
            expect(within(flyover).getByRole("link", { name: "Localization" })).toHaveFocus();
        });

        it("keeps a keyboard-focused flyover when the pointer hovers another group", async () => {
            const { user } = renderRail();

            await user.tab();
            await user.keyboard("{ArrowRight}");
            const flyover = await screen.findByRole("group", { name: "Settings" });

            await user.hover(screen.getByRole("button", { name: "Help" }));
            await waitForHover();
            expect(screen.queryByRole("group", { name: "Help" })).toBeNull();
            expect(within(flyover).getByRole("link", { name: "Localization" })).toHaveFocus();
        });

        it("opens another group on hover after the focused flyover item is removed", async () => {
            const control: IRailControl = {};
            const { user } = render(<StateRail control={control} />);

            await user.tab();
            await user.keyboard("{ArrowRight}");
            await screen.findByRole("group", { name: "Settings" });

            act(() => control.setItems?.(makeItems("localization").filter((item) => item.id !== "settings")));

            await user.hover(screen.getByRole("button", { name: "Help" }));
            expect(await screen.findByRole("group", { name: "Help" })).toBeInTheDocument();
        });

        it("keeps focus in the flyover when the focused item is removed from its group", async () => {
            const control: IRailControl = {};
            const { user } = render(<StateRail control={control} />);

            await user.tab();
            await user.keyboard("{ArrowRight}");
            const flyover = await screen.findByRole("group", { name: "Settings" });

            act(() =>
                control.setItems?.(
                    makeItems("localization").map((item) => ({
                        ...item,
                        children: item.children?.filter((child) => child.id !== "localization"),
                    })),
                ),
            );

            expect(within(flyover).getByRole("link", { name: "Appearance" })).toHaveFocus();
            await user.keyboard("{Escape}");
            expect(screen.queryByRole("group", { name: "Settings" })).toBeNull();
            expect(screen.getByRole("link", { name: /^Settings/ })).toHaveFocus();
        });

        it("moves focus to the list when the open group is removed", async () => {
            const control: IRailControl = {};
            const { user } = render(<StateRail control={control} />);

            await user.tab();
            await user.keyboard("{ArrowRight}");
            await screen.findByRole("group", { name: "Settings" });

            act(() => control.setItems?.(makeItems("home").filter((item) => item.id !== "settings")));

            expect(screen.queryByRole("group", { name: "Settings" })).toBeNull();
            expect(screen.getByRole("link", { name: "Home" })).toHaveFocus();
        });

        it("closes on pointer leave after a pointer-focused item is removed", async () => {
            const control: IRailControl = {};
            const { user } = render(<StateRail control={control} />);

            const settings = screen.getByRole("link", { name: /^Settings/ });
            await user.hover(settings);
            const flyover = await screen.findByRole("group", { name: "Settings" });
            await user.pointer({
                keys: "[MouseRight]",
                target: within(flyover).getByRole("link", { name: "Localization" }),
            });
            // The pointer rests on an item that stays, so leaving the flyover dispatches events.
            await user.hover(within(flyover).getByRole("link", { name: "Appearance" }));

            act(() =>
                control.setItems?.(
                    makeItems("localization").map((item) => ({
                        ...item,
                        children: item.children?.filter((child) => child.id !== "localization"),
                    })),
                ),
            );

            await user.unhover(flyover);
            await user.hover(screen.getByRole("link", { name: "Home" }));
            await waitForHover();
            expect(screen.queryByRole("group", { name: "Settings" })).toBeNull();
        });

        it.each(["{Tab}", "{Shift>}{Tab}{/Shift}"])("closes when %s moves focus out of it", async (key) => {
            const { user } = render(
                <>
                    <button type="button">before</button>
                    <UiResizableSidebarProvider value={railState(true)}>
                        <UiResizableSidebarNavigation
                            items={makeItems("localization")}
                            accessibilityConfig={naming}
                        />
                    </UiResizableSidebarProvider>
                    <button type="button">after</button>
                </>,
            );

            screen.getByRole("link", { name: /^Settings/ }).focus();
            await user.keyboard("{ArrowRight}");
            await screen.findByRole("group", { name: "Settings" });

            await user.keyboard(key);
            await waitFor(() => expect(screen.queryByRole("group", { name: "Settings" })).toBeNull());
            expect(screen.getByRole("link", { name: /^Settings/ })).toHaveAttribute("aria-expanded", "false");
        });

        it("leaves focus alone when the pointer moves from a pointer-focused flyover to another group", async () => {
            const { user } = renderRail();

            await user.hover(screen.getByRole("link", { name: /^Settings/ }));
            const flyover = await screen.findByRole("group", { name: "Settings" });
            await user.pointer({
                keys: "[MouseRight]",
                target: within(flyover).getByRole("link", { name: "Localization" }),
            });
            await user.unhover(flyover);
            await user.hover(screen.getByRole("button", { name: "Help" }));

            expect(await screen.findByRole("group", { name: "Help" })).toBeInTheDocument();
            expect(screen.queryByRole("group", { name: "Settings" })).toBeNull();
            expect(screen.getByRole("link", { name: /^Settings/ })).not.toHaveFocus();
        });

        it("lets keys it does not handle reach document listeners", async () => {
            const keys: string[] = [];
            const recordKey = (event: KeyboardEvent) => keys.push(event.key);
            document.addEventListener("keydown", recordKey);

            try {
                const { user } = renderRail();

                await user.tab();
                await user.keyboard("{ArrowRight}");
                const flyover = await screen.findByRole("group", { name: "Settings" });
                keys.length = 0;

                await user.keyboard("{Control>}k{/Control}");
                expect(keys).toContain("k");

                await user.keyboard("{ArrowDown}");
                expect(within(flyover).getByRole("link", { name: /^Developer/ })).toHaveFocus();
                expect(keys).not.toContain("ArrowDown");
            } finally {
                document.removeEventListener("keydown", recordKey);
            }
        });

        it("does not reopen when its removed group comes back", async () => {
            const control: IRailControl = {};
            const { user } = render(<StateRail control={control} />);

            await user.tab();
            await user.keyboard("{ArrowRight}");
            await screen.findByRole("group", { name: "Settings" });

            act(() => control.setItems?.(makeItems("localization").filter((item) => item.id !== "settings")));
            act(() => control.setItems?.(makeItems("localization")));

            expect(screen.queryByRole("group", { name: "Settings" })).toBeNull();
        });

        it("stays open after a modified click on a sub-page", async () => {
            const onSelect = vi.fn();
            const { user } = renderRail(onSelect);
            // Prevents happy-dom from following the link after the component lets the click through.
            const preventNavigation = (event: Event) => event.preventDefault();
            document.addEventListener("click", preventNavigation);

            try {
                await user.tab();
                await user.keyboard("{ArrowRight}");
                const flyover = await screen.findByRole("group", { name: "Settings" });

                await user.keyboard("{Control>}");
                await user.click(within(flyover).getByRole("link", { name: "Appearance" }));
                await user.keyboard("{/Control}");

                expect(onSelect).not.toHaveBeenCalled();
                expect(screen.getByRole("group", { name: "Settings" })).toBeInTheDocument();
            } finally {
                document.removeEventListener("click", preventNavigation);
            }
        });

        it("does not reopen after a round trip out of the rail", async () => {
            const control: IRailControl = {};
            const { user } = render(<StateRail control={control} />);

            await user.tab();
            await user.keyboard("{ArrowRight}");
            await screen.findByRole("group", { name: "Settings" });

            act(() => control.setRail?.(false));
            act(() => control.setRail?.(true));

            expect(screen.queryByRole("group", { name: "Settings" })).toBeNull();
        });

        it("returns focus to the group when the list leaves the rail", async () => {
            const control: IRailControl = {};
            const { user } = render(<StateRail control={control} />);

            await user.tab();
            await user.keyboard("{ArrowRight}");
            await screen.findByRole("group", { name: "Settings" });

            act(() => control.setRail?.(false));

            expect(screen.getByRole("link", { name: /^Settings/ })).toHaveFocus();
        });

        it("closes a flyover focused by the pointer when the pointer leaves", async () => {
            const { user } = renderRail();

            await user.hover(screen.getByRole("link", { name: /^Settings/ }));
            const flyover = await screen.findByRole("group", { name: "Settings" });
            await user.pointer({
                keys: "[MouseRight]",
                target: within(flyover).getByRole("link", { name: "Localization" }),
            });
            await user.unhover(flyover);
            await user.hover(screen.getByRole("link", { name: "Home" }));
            await waitForHover();
            expect(screen.queryByRole("group", { name: "Settings" })).toBeNull();

            await user.hover(screen.getByRole("button", { name: "Help" }));
            expect(await screen.findByRole("group", { name: "Help" })).toBeInTheDocument();
        });

        it("scrolls the focused current page into a height-limited flyover", async () => {
            const rect = (top: number, bottom: number) => new DOMRect(0, top, 200, bottom - top);
            const getRect = vi
                .spyOn(HTMLElement.prototype, "getBoundingClientRect")
                .mockImplementation(function (this: HTMLElement) {
                    if (this.getAttribute("role") === "group") {
                        return rect(0, 100);
                    }
                    const scrolled = this.closest<HTMLElement>('[role="group"]')?.scrollTop ?? 0;
                    return this.getAttribute("aria-current") === "page"
                        ? rect(140 - scrolled, 180 - scrolled)
                        : rect(0, 40);
                });

            try {
                const { user } = renderRail();

                await user.tab();
                await user.keyboard("{ArrowRight}");

                const flyover = await screen.findByRole("group", { name: "Settings" });
                expect(within(flyover).getByRole("link", { name: "Localization" })).toHaveFocus();
                expect(flyover.scrollTop).toBe(80);
            } finally {
                getRect.mockRestore();
            }
        });

        it("opens with Enter on a link group instead of selecting it", async () => {
            const { user, onSelect } = renderRail();

            await user.tab();
            await user.keyboard("{Enter}");

            const flyover = await screen.findByRole("group", { name: "Settings" });
            expect(within(flyover).getByRole("link", { name: "Localization" })).toHaveFocus();
            expect(onSelect).not.toHaveBeenCalled();
        });

        it("opens with Space on a button group", async () => {
            const { user, onSelect } = renderRail();

            screen.getByRole("button", { name: "Help" }).focus();
            await user.keyboard(" ");

            const flyover = await screen.findByRole("group", { name: "Help" });
            expect(within(flyover).getByRole("link", { name: "Documentation" })).toHaveFocus();
            expect(onSelect).not.toHaveBeenCalled();
        });

        it("opens on click on the group instead of selecting it", async () => {
            const { user, onSelect } = renderRail();

            await user.click(screen.getByRole("link", { name: /^Settings/ }));

            expect(await screen.findByRole("group", { name: "Settings" })).toBeInTheDocument();
            expect(onSelect).not.toHaveBeenCalled();
        });

        it("shows the group label on keyboard focus while the flyover is closed", async () => {
            const { user } = renderRail();

            await user.tab();
            expect(await screen.findByRole("tooltip", { hidden: true })).toHaveTextContent("Settings");

            await user.keyboard("{ArrowRight}");
            await screen.findByRole("group", { name: "Settings" });
            expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
        });

        it("selects a sub-page and closes", async () => {
            const onSelect = vi.fn((_item, event: { preventDefault: () => void }) => event.preventDefault());
            const { user } = renderRail(onSelect);

            await user.tab();
            await user.keyboard("{ArrowRight}");
            const flyover = await screen.findByRole("group", { name: "Settings" });

            await user.click(within(flyover).getByRole("link", { name: "Appearance" }));
            expect(onSelect).toHaveBeenCalledWith(
                expect.objectContaining({ id: "appearance" }),
                expect.anything(),
            );
            expect(screen.queryByRole("group", { name: "Settings" })).toBeNull();
        });
    });
});
