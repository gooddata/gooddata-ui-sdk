// (C) 2026 GoodData Corporation

import { type CSSProperties, type ReactElement, type ReactNode, useMemo, useState } from "react";

import {
    type IUiResizableSidebarState,
    UI_RESIZABLE_SIDEBAR_RAIL_WIDTH,
    UiResizableSidebar,
    UiResizableSidebarCollapseToggle,
    UiResizableSidebarExpandTrigger,
    UiResizableSidebarHandle,
    UiResizableSidebarProvider,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const MIN_WIDTH = 230;
const MAX_WIDTH = 500;

const layoutStyle: CSSProperties = { display: "flex", width: 800, height: 400 };
const contentStyle: CSSProperties = { flex: "1 1 auto", padding: 10 };
const panelStyle: CSSProperties = {
    position: "relative",
    height: "100%",
    boxSizing: "border-box",
    padding: 10,
    borderRight: "1px solid var(--gd-palette-complementary-3, #dde4eb)",
    background: "var(--gd-palette-complementary-1, #f5f8fa)",
};

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
