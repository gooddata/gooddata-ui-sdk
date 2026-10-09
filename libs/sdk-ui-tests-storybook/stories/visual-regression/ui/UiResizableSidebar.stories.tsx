// (C) 2026 GoodData Corporation

import { type CSSProperties, type ReactElement, type ReactNode, useMemo, useState } from "react";

import {
    type IUiResizableSidebarNavigationItem,
    type IUiResizableSidebarState,
    UI_RESIZABLE_SIDEBAR_RAIL_WIDTH,
    UiResizableSidebar,
    UiResizableSidebarCollapseToggle,
    UiResizableSidebarExpandTrigger,
    UiResizableSidebarHandle,
    UiResizableSidebarNavigation,
    UiResizableSidebarProvider,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const MIN_WIDTH = 230;
const MAX_WIDTH = 500;

const layoutStyle: CSSProperties = { display: "flex", width: 800, height: 400 };
const navigationLayoutStyle: CSSProperties = { ...layoutStyle, height: 480 };
const contentStyle: CSSProperties = { flex: "1 1 auto", padding: 10 };
const panelStyle: CSSProperties = {
    position: "relative",
    height: "100%",
    boxSizing: "border-box",
    padding: 10,
    borderRight: "1px solid var(--gd-palette-complementary-3, #dde4eb)",
    background: "var(--gd-palette-complementary-1, #f5f8fa)",
};
// No side padding: the rail is only 48px wide and the navigation rows center themselves in it.
const navigationPanelStyle: CSSProperties = { ...panelStyle, padding: "10px 0" };

// In-memory state keeps the screenshots independent of what an earlier story or run persisted.
// With a rail the sidebar collapses to the fixed rail width, otherwise it hides completely.
function useStorySidebarState(hasRail = false, initiallyCollapsed = false): IUiResizableSidebarState {
    const [width, setWidth] = useState(MIN_WIDTH);
    const [isCollapsed, setCollapsed] = useState(initiallyCollapsed);
    const collapsedWidth = hasRail ? UI_RESIZABLE_SIDEBAR_RAIL_WIDTH : 0;

    return useMemo(
        () => ({
            width: isCollapsed ? collapsedWidth : width,
            expandedWidth: width,
            min: isCollapsed ? collapsedWidth : MIN_WIDTH,
            max: isCollapsed ? collapsedWidth : MAX_WIDTH,
            canResize: !isCollapsed,
            setWidth: (next: number) => setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, next))),
            canCollapse: true,
            hasRail,
            isCollapsed,
            setCollapsed,
        }),
        [collapsedWidth, hasRail, width, isCollapsed],
    );
}

// A collapsed rail keeps only what fits, so the consumer hides the wide content itself.
function SidebarContent({
    children,
    isCollapsed,
}: {
    children?: ReactNode;
    isCollapsed?: boolean;
}): ReactElement {
    return (
        <div style={panelStyle}>
            {children}
            {isCollapsed ? null : (
                <>
                    <p>Sidebar content</p>
                    <p>Hover the right edge and drag, or focus the handle and use the arrow keys.</p>
                </>
            )}
        </div>
    );
}

const handle = <UiResizableSidebarHandle accessibilityConfig={{ ariaLabel: "Resize sidebar" }} />;

// Reads its state from the provider, like the toggle in the content area does.
function Sidebar(): ReactElement {
    return (
        <UiResizableSidebar>
            <SidebarContent />
            {handle}
        </UiResizableSidebar>
    );
}

function UiResizableSidebarTest(): ReactElement {
    const sidebar = useStorySidebarState();

    return (
        <UiResizableSidebarProvider value={sidebar}>
            <div className="screenshot-target" style={layoutStyle}>
                {sidebar.isCollapsed ? (
                    <UiResizableSidebarExpandTrigger
                        label="Expand sidebar"
                        onExpand={() => sidebar.setCollapsed(false)}
                    />
                ) : null}
                <Sidebar />
                <main style={contentStyle}>
                    <UiResizableSidebarCollapseToggle
                        isCollapsed={sidebar.isCollapsed}
                        onToggle={() => sidebar.setCollapsed(!sidebar.isCollapsed)}
                        collapseLabel="Collapse sidebar"
                        expandLabel="Expand sidebar"
                    />
                    <p>The content area follows the committed sidebar width.</p>
                </main>
            </div>
        </UiResizableSidebarProvider>
    );
}

// Rail mode: the sidebar keeps a 48px strip that carries the toggle, so nothing moves to the content.
function UiResizableSidebarRailTest(): ReactElement {
    const sidebar = useStorySidebarState(true, true);

    return (
        <UiResizableSidebarProvider value={sidebar}>
            <div className="screenshot-target" style={layoutStyle}>
                <UiResizableSidebar>
                    <SidebarContent isCollapsed={sidebar.isCollapsed}>
                        <UiResizableSidebarCollapseToggle
                            isCollapsed={sidebar.isCollapsed}
                            onToggle={() => sidebar.setCollapsed(!sidebar.isCollapsed)}
                            collapseLabel="Collapse sidebar"
                            expandLabel="Expand sidebar"
                        />
                    </SidebarContent>
                    {handle}
                </UiResizableSidebar>
                <main style={contentStyle}>
                    <p>The sidebar is collapsed to an icon rail.</p>
                </main>
            </div>
        </UiResizableSidebarProvider>
    );
}

// Rendered without a provider, so the state is passed explicitly.
const HIDDEN_STATE: IUiResizableSidebarState = {
    width: 0,
    expandedWidth: MIN_WIDTH,
    min: 0,
    max: 0,
    canResize: false,
    setWidth: () => {},
    canCollapse: true,
    hasRail: false,
    isCollapsed: true,
    setCollapsed: () => {},
};

function UiResizableSidebarHiddenTest(): ReactElement {
    return (
        <div className="screenshot-target" style={layoutStyle}>
            <UiResizableSidebarExpandTrigger label="Expand sidebar" onExpand={() => {}} />
            <UiResizableSidebar state={HIDDEN_STATE}>
                <SidebarContent />
                {handle}
            </UiResizableSidebar>
            <main style={contentStyle}>
                <p>The sidebar is collapsed to a fully hidden state.</p>
            </main>
        </div>
    );
}

const SETTINGS_PAGES = [
    { id: "appearance", label: "Appearance & behavior", href: "#appearance" },
    { id: "localization", label: "Localization & Formats", href: "#localization" },
    { id: "developer", label: "Developer", href: "#developer" },
    {
        id: "alerts",
        label: "Alerts & exports",
        href: "#alerts",
        badge: { kind: "dot" as const, label: "Needs attention" },
    },
    { id: "sql", label: "SQL generation", href: "#sql" },
    { id: "earlyAccess", label: "Early access", href: "#early-access" },
];

function makeNavigationItems(selectedId: string): IUiResizableSidebarNavigationItem[] {
    const items: IUiResizableSidebarNavigationItem[] = [
        { id: "home", label: "Getting started", icon: "home", href: "#home" },
        { id: "workspaces", label: "Workspaces", icon: "folder", href: "#workspaces" },
        { id: "users", label: "Users & groups", icon: "users", href: "#users" },
        { id: "settings", label: "Settings", icon: "settings", href: "#settings", children: SETTINGS_PAGES },
    ];

    return items.map((item) => ({
        ...item,
        isSelected: item.id === selectedId,
        children: item.children?.map((child) => ({ ...child, isSelected: child.id === selectedId })),
    }));
}

// The selection lives in the story so the links route here instead of following their hash.
function NavigationPanel({ initialSelectedId }: { initialSelectedId: string }): ReactElement {
    const [selectedId, setSelectedId] = useState(initialSelectedId);
    const items = useMemo(() => makeNavigationItems(selectedId), [selectedId]);

    return (
        <UiResizableSidebarNavigation
            items={items}
            accessibilityConfig={{ ariaLabel: "Main" }}
            onSelect={(item, event) => {
                event.preventDefault();
                setSelectedId(item.id);
            }}
        />
    );
}

function UiResizableSidebarNavigationTest({
    hasRail = false,
    initiallyCollapsed = false,
    selectedId = "workspaces",
}: {
    hasRail?: boolean;
    initiallyCollapsed?: boolean;
    selectedId?: string;
}): ReactElement {
    const sidebar = useStorySidebarState(hasRail, initiallyCollapsed);

    return (
        <UiResizableSidebarProvider value={sidebar}>
            <div className="screenshot-target" style={navigationLayoutStyle}>
                <UiResizableSidebar>
                    <div style={navigationPanelStyle}>
                        <UiResizableSidebarCollapseToggle
                            isCollapsed={sidebar.isCollapsed}
                            onToggle={() => sidebar.setCollapsed(!sidebar.isCollapsed)}
                            collapseLabel="Collapse sidebar"
                            expandLabel="Expand sidebar"
                        />
                        <NavigationPanel initialSelectedId={selectedId} />
                    </div>
                    {handle}
                </UiResizableSidebar>
                <main style={contentStyle}>
                    <p>Arrow keys move between the items; Right and Left expand and collapse a group.</p>
                </main>
            </div>
        </UiResizableSidebarProvider>
    );
}

export default {
    title: "15 Ui/UiResizableSidebar",
};

export function Default() {
    return <UiResizableSidebarTest />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Hidden() {
    return <UiResizableSidebarHiddenTest />;
}
Hidden.parameters = {
    kind: "hidden",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Rail() {
    return <UiResizableSidebarRailTest />;
}
Rail.parameters = {
    kind: "rail",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiResizableSidebarTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Navigation() {
    return <UiResizableSidebarNavigationTest />;
}
Navigation.parameters = {
    kind: "navigation",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function NavigationSubpageSelected() {
    return <UiResizableSidebarNavigationTest selectedId="localization" />;
}
NavigationSubpageSelected.parameters = {
    kind: "navigation subpage selected",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function NavigationRail() {
    return <UiResizableSidebarNavigationTest hasRail initiallyCollapsed selectedId="localization" />;
}
NavigationRail.parameters = {
    kind: "navigation rail",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const NavigationThemed = () =>
    wrapWithTheme(<UiResizableSidebarNavigationTest selectedId="localization" />);
NavigationThemed.parameters = {
    kind: "navigation themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
