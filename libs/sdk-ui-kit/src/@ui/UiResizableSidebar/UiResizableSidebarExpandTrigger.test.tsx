// (C) 2026 GoodData Corporation

import { useState } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IUiResizableSidebarState } from "./types.js";
import { UiResizableSidebarCollapseToggle } from "./UiResizableSidebarCollapseToggle.js";
import { UiResizableSidebarProvider } from "./UiResizableSidebarContext.js";
import { UiResizableSidebarExpandTrigger } from "./UiResizableSidebarExpandTrigger.js";

const state: IUiResizableSidebarState = {
    width: 0,
    expandedWidth: 230,
    min: 0,
    max: 0,
    canResize: false,
    setWidth: () => {},
    canCollapse: true,
    isCollapsed: true,
    hasRail: false,
    setCollapsed: () => {},
};

// A hidden sidebar: the trigger exists while collapsed, the header toggle stays mounted.
function Sidebar() {
    const [isCollapsed, setCollapsed] = useState(true);

    return (
        <UiResizableSidebarProvider value={{ ...state, isCollapsed, setCollapsed }}>
            {isCollapsed ? (
                <UiResizableSidebarExpandTrigger
                    label="Expand sidebar"
                    dataTestId="trigger"
                    onExpand={() => setCollapsed(false)}
                />
            ) : null}
            <UiResizableSidebarCollapseToggle
                isCollapsed={isCollapsed}
                onToggle={() => setCollapsed(!isCollapsed)}
                collapseLabel="Collapse sidebar"
                expandLabel="Expand sidebar"
                dataTestId="toggle"
            />
        </UiResizableSidebarProvider>
    );
}

describe("UiResizableSidebarExpandTrigger", () => {
    it("expands on click and is named for assistive technology", () => {
        const onExpand = vi.fn();
        render(<UiResizableSidebarExpandTrigger label="Expand sidebar" onExpand={onExpand} />);

        const trigger = screen.getByRole("button", { name: "Expand sidebar" });
        fireEvent.click(trigger);

        expect(onExpand).toHaveBeenCalledOnce();
    });

    it("hands focus to the sidebar toggle after expanding", () => {
        render(<Sidebar />);

        fireEvent.click(screen.getByTestId("trigger"));

        expect(screen.queryByTestId("trigger")).not.toBeInTheDocument();
        expect(screen.getByTestId("toggle")).toHaveFocus();
    });
});
