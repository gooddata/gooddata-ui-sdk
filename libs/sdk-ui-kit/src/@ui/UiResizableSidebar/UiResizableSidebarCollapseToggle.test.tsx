// (C) 2026 GoodData Corporation

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IUiResizableSidebarState } from "./types.js";
import { UiResizableSidebarCollapseToggle } from "./UiResizableSidebarCollapseToggle.js";
import { UiResizableSidebarProvider } from "./UiResizableSidebarContext.js";

const state: IUiResizableSidebarState = {
    width: 230,
    expandedWidth: 230,
    min: 230,
    max: 500,
    canResize: false,
    setWidth: () => {},
    canCollapse: true,
    isCollapsed: false,
    hasRail: false,
    setCollapsed: () => {},
};

const labels = { collapseLabel: "Collapse", expandLabel: "Expand" };

// Stands in for the hidden sidebar: like UiResizableSidebar, it turns inert while collapsed.
function Inert({ isInert, children }: { isInert: boolean; children: ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        ref.current?.toggleAttribute("inert", isInert);
    }, [isInert]);
    return <div ref={ref}>{children}</div>;
}

// A sidebar toggle that turns inert while collapsed and a restore control that only exists while collapsed,
// optionally mounting a render later than the collapse.
function Toggles({
    initiallyCollapsed = false,
    lateRestore = false,
}: {
    initiallyCollapsed?: boolean;
    lateRestore?: boolean;
}) {
    const [isCollapsed, setCollapsed] = useState(initiallyCollapsed);
    const [restoreMounted, setRestoreMounted] = useState(initiallyCollapsed);
    const showRestore = isCollapsed && (!lateRestore || restoreMounted);

    return (
        <UiResizableSidebarProvider value={{ ...state, isCollapsed, setCollapsed }}>
            <Inert isInert={isCollapsed}>
                <UiResizableSidebarCollapseToggle
                    isCollapsed={isCollapsed}
                    onToggle={() => setCollapsed(!isCollapsed)}
                    dataTestId="sidebar-toggle"
                    {...labels}
                />
            </Inert>
            {showRestore ? (
                <UiResizableSidebarCollapseToggle
                    isCollapsed
                    onToggle={() => setCollapsed(false)}
                    dataTestId="restore-toggle"
                    {...labels}
                />
            ) : null}
            {lateRestore ? (
                <button type="button" data-testid="mount-restore" onClick={() => setRestoreMounted(true)} />
            ) : null}
        </UiResizableSidebarProvider>
    );
}

describe("UiResizableSidebarCollapseToggle", () => {
    const renderToggle = (isCollapsed: boolean) => {
        const onToggle = vi.fn();
        render(
            <UiResizableSidebarCollapseToggle
                isCollapsed={isCollapsed}
                onToggle={onToggle}
                collapseLabel="Collapse sidebar"
                expandLabel="Expand sidebar"
            />,
        );
        return onToggle;
    };

    it("offers to collapse an expanded sidebar", () => {
        const onToggle = renderToggle(false);
        const button = screen.getByRole("button", { name: "Collapse sidebar" });

        expect(button).toHaveAttribute("aria-expanded", "true");

        fireEvent.click(button);
        expect(onToggle).toHaveBeenCalledOnce();
    });

    it("offers to expand a collapsed sidebar", () => {
        renderToggle(true);
        const button = screen.getByRole("button", { name: "Expand sidebar" });

        expect(button).toHaveAttribute("aria-expanded", "false");
    });

    describe("focus hand-off", () => {
        it("focuses the restore control that appears after collapsing", () => {
            render(<Toggles />);

            fireEvent.click(screen.getByTestId("sidebar-toggle"));

            expect(screen.getByTestId("restore-toggle")).toHaveFocus();
        });

        it("focuses the sidebar toggle again after expanding from the restore control", () => {
            render(<Toggles initiallyCollapsed />);

            fireEvent.click(screen.getByTestId("restore-toggle"));

            expect(screen.getByTestId("sidebar-toggle")).toHaveFocus();
        });

        it("does not steal focus on mount without a preceding toggle", () => {
            render(<Toggles initiallyCollapsed />);

            expect(screen.getByTestId("restore-toggle")).not.toHaveFocus();
        });

        it("hands focus to a restore control that mounts later", () => {
            render(<Toggles lateRestore />);

            fireEvent.click(screen.getByTestId("sidebar-toggle"));
            expect(screen.queryByTestId("restore-toggle")).not.toBeInTheDocument();

            fireEvent.click(screen.getByTestId("mount-restore"));

            expect(screen.getByTestId("restore-toggle")).toHaveFocus();
        });

        it("keeps focus on a toggle that stays usable, so a later mount is not focused", () => {
            const onToggle = vi.fn();
            const single = (
                <UiResizableSidebarCollapseToggle
                    isCollapsed={false}
                    onToggle={onToggle}
                    dataTestId="single"
                    {...labels}
                />
            );
            const { rerender } = render(
                <UiResizableSidebarProvider value={state}>{single}</UiResizableSidebarProvider>,
            );

            fireEvent.click(screen.getByTestId("single"));
            rerender(
                <UiResizableSidebarProvider value={state}>
                    {single}
                    <UiResizableSidebarCollapseToggle
                        isCollapsed
                        onToggle={onToggle}
                        dataTestId="late"
                        {...labels}
                    />
                </UiResizableSidebarProvider>,
            );

            expect(screen.getByTestId("late")).not.toHaveFocus();
        });
    });
});
