// (C) 2026 GoodData Corporation

import { type CSSProperties, type ReactElement, useMemo, useState } from "react";

import { FormattedMessage } from "react-intl";

import {
    DashboardSidebarChrome,
    IntlWrapper,
    SidebarCollapseToggle,
    SidebarHeaderToggle,
} from "@gooddata/sdk-ui-dashboard/internal";
import "@gooddata/sdk-ui-dashboard/styles/css/main.css";
import {
    type IUiResizableSidebarState,
    Typography,
    UI_RESIZABLE_SIDEBAR_RAIL_WIDTH,
    UiResizableSidebarProvider,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const SIDEBAR_MIN_WIDTH = 230;
const SIDEBAR_MAX_WIDTH = 500;

interface IStorySidebarOptions {
    canCollapse?: boolean;
    initiallyCollapsed?: boolean;
    /**
     * Keeps an icon rail while collapsed instead of hiding the sidebar completely.
     */
    hasRail?: boolean;
}

// In-memory state keeps the screenshots independent of what an earlier story or run persisted.
function useStorySidebarState({
    canCollapse = false,
    initiallyCollapsed = false,
    hasRail = false,
}: IStorySidebarOptions): IUiResizableSidebarState {
    const [expandedWidth, setExpandedWidth] = useState(SIDEBAR_MIN_WIDTH);
    const [isCollapsed, setCollapsed] = useState(initiallyCollapsed);

    return useMemo(() => {
        const collapsed = canCollapse && isCollapsed;
        const collapsedWidth = hasRail ? UI_RESIZABLE_SIDEBAR_RAIL_WIDTH : 0;

        return {
            width: collapsed ? collapsedWidth : expandedWidth,
            expandedWidth,
            min: collapsed ? collapsedWidth : SIDEBAR_MIN_WIDTH,
            max: collapsed ? collapsedWidth : SIDEBAR_MAX_WIDTH,
            canResize: !collapsed,
            setWidth: (next: number) =>
                setExpandedWidth(Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, next))),
            canCollapse,
            hasRail,
            isCollapsed: collapsed,
            setCollapsed,
        };
    }, [canCollapse, hasRail, expandedWidth, isCollapsed]);
}

const layoutStyle: CSSProperties = {
    display: "flex",
    height: "100vh",
    minHeight: 600,
    fontFamily: "var(--gd-font-family)",
};
const contentStyle: CSSProperties = {
    flex: "1 1 auto",
    background: "var(--gd-palette-complementary-0, #fff)",
};

/**
 * The real dashboard sidebar frame and toggles around an empty creation panel header, so only the
 * collapse and resize behavior is on show. Without a rail the collapsed sidebar hides completely and is
 * restored from the top-bar toggle; with one it keeps an icon rail where the panel toggle stays in place.
 */
function DashboardSidebarStory(options: IStorySidebarOptions): ReactElement {
    const sidebar = useStorySidebarState(options);

    return (
        <IntlWrapper>
            <UiResizableSidebarProvider value={sidebar}>
                <div className="screenshot-target" style={layoutStyle}>
                    <DashboardSidebarChrome sidebar={sidebar} hasResizeHandle>
                        <div className="configuration-panel creation-panel">
                            <div className="configuration-panel-content">
                                <div className="gd-creation-panel-header flex-panel-item-nostretch">
                                    {sidebar.canCollapse ? (
                                        <SidebarCollapseToggle
                                            isCollapsed={sidebar.isCollapsed}
                                            onToggle={() => sidebar.setCollapsed(!sidebar.isCollapsed)}
                                        />
                                    ) : null}
                                    <Typography tagName="h2">
                                        <FormattedMessage id="visualizationsList.dragToAdd" />
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </DashboardSidebarChrome>
                    <main style={contentStyle}>
                        <div className="dash-header s-top-bar">
                            <div className="dash-header-inner">
                                <SidebarHeaderToggle />
                                <div className="dash-title-wrapper">
                                    <Typography tagName="h1" className="dash-title">
                                        Dashboard title
                                    </Typography>
                                </div>
                            </div>
                        </div>
                        <p>Dashboard content. Hover the sidebar edge to resize it.</p>
                    </main>
                </div>
            </UiResizableSidebarProvider>
        </IntlWrapper>
    );
}

const screenshot = {
    readySelector: { selector: ".screenshot-target", state: State.Attached },
};

export default {
    title: "16 Dashboard/Sidebar",
};

export function Resizable() {
    return <DashboardSidebarStory />;
}
Resizable.parameters = { kind: "resizable", screenshot } satisfies IStoryParameters;

export function Collapsible() {
    return <DashboardSidebarStory canCollapse />;
}
Collapsible.parameters = { kind: "collapsible", screenshot } satisfies IStoryParameters;

export function Collapsed() {
    return <DashboardSidebarStory canCollapse initiallyCollapsed />;
}
Collapsed.parameters = { kind: "collapsed", screenshot } satisfies IStoryParameters;

export function Rail() {
    return <DashboardSidebarStory canCollapse initiallyCollapsed hasRail />;
}
Rail.parameters = { kind: "rail", screenshot } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<DashboardSidebarStory canCollapse />);
Themed.parameters = { kind: "themed", screenshot } satisfies IStoryParameters;
