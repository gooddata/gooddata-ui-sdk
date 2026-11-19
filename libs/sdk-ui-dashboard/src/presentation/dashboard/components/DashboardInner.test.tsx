// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { fireEvent, render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { selectLocale, selectSettings } from "../../../model/store/config/configSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";

import { DashboardInner } from "./DashboardInner.js";

const mocks = vi.hoisted(() => {
    vi.resetModules();
    return {
        settings: {} as { enableDashboardCanvasScroll?: boolean },
        isEditMode: true,
        dragScroll: vi.fn(),
        dragLayer: vi.fn(),
        initializeAutomations: vi.fn(),
    };
});

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => {
        if (selector === selectSettings) {
            return mocks.settings;
        }
        if (selector === selectIsInEditMode) {
            return mocks.isEditMode;
        }
        if (selector === selectLocale) {
            return "en-US";
        }
        return false;
    },
}));
vi.mock("../../../model/react/useDashboardAutomations/useDashboardAutomations.js", () => ({
    useDashboardAutomations: () => ({ initializeAutomations: mocks.initializeAutomations }),
}));
vi.mock("@gooddata/sdk-ui-kit", () => ({
    OverlayController: { getInstance: () => ({}) },
    OverlayControllerProvider: ({ children }: { children: ReactNode }) => children,
    ToastsCenterContextProvider: ({ children }: { children: ReactNode }) => children,
    UiResizableSidebarProvider: ({ children }: { children: ReactNode }) => children,
    ToastsCenter: () => null,
}));
vi.mock("../../localization/IntlWrapper.js", () => ({
    IntlWrapper: ({ children }: { children: ReactNode }) => (
        <IntlProvider
            locale="en-US"
            messages={{ "dashboard.content.horizontalScroll": "Scroll dashboard content horizontally" }}
        >
            {children}
        </IntlProvider>
    ),
}));
vi.mock("../../dragAndDrop/useDashboardDragScroll.js", () => ({
    useDashboardDragScroll: (...args: unknown[]) => mocks.dragScroll(...args),
}));
vi.mock("../../flexibleLayout/dragAndDrop/DragLayer.js", () => ({
    DragLayerComponent: (props: unknown) => {
        mocks.dragLayer(props);
        return null;
    },
}));
vi.mock("../../dragAndDrop/DeleteDropZone.js", () => ({ DeleteDropZone: () => null }));
vi.mock("../../dragAndDrop/FilterDeleteOverlay.js", () => ({ FilterDeleteOverlay: () => null }));
vi.mock("../../dragAndDrop/WrapCreatePanelItemWithDrag.js", () => ({
    WrapCreatePanelItemWithDrag: () => null,
}));
vi.mock("../../dragAndDrop/WrapInsightListItemWithDrag.js", () => ({
    WrapInsightListItemWithDrag: () => null,
}));
vi.mock("../../insightEditor/InsightEditorOverlay.js", () => ({ InsightEditorOverlay: () => null }));
vi.mock("../../insightEditor/InsightEditorPermissionsContext.js", () => ({
    InsightEditorPermissionsProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("../../toolbar/Toolbar.js", () => ({ Toolbar: () => null }));
vi.mock("../DashboardContent.js", () => ({ DashboardContent: () => <div>Dashboard canvas</div> }));
vi.mock("../DashboardHeader/DashboardHeader.js", () => ({ DashboardHeader: () => <div>Header</div> }));
vi.mock("../DashboardSidebar/DashboardSidebar.js", () => ({ DashboardSidebar: () => null }));
vi.mock("../DashboardSidebar/RenderModeAwareDashboardSidebar.js", () => ({
    RenderModeAwareDashboardSidebar: () => null,
}));
vi.mock("../DashboardSidebar/useResizableSidebarState.js", () => ({
    useResizableSidebarState: () => ({ canResize: false, isCollapsed: false }),
}));
vi.mock("./DashboardScreenSizeContext.js", () => ({
    DashboardScreenSizeProvider: ({ children }: { children: ReactNode }) => children,
}));

describe("DashboardInner canvas scroll feature flag", () => {
    beforeEach(() => {
        mocks.settings = {};
        mocks.isEditMode = true;
        vi.stubGlobal(
            "ResizeObserver",
            class {
                observe() {}
                disconnect() {}
            },
        );
        vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(770);
        vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(1170);
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
            new DOMRect(0, 0, 1170, 1000),
        );
    });

    it.each([undefined, false])("preserves the original structure when the flag is %s", (flag) => {
        mocks.settings.enableDashboardCanvasScroll = flag;
        const { container } = render(<DashboardInner />);

        expect(container.querySelector(".gd-dashboards-root--canvas-scroll")).toBeNull();
        expect(container.querySelector(".gd-dash-content-scroll-container")).toBeNull();
        expect(container.querySelector(".gd-dash-content-scrollbar")).toBeNull();
        expect(container.querySelector(".gd-dash-content-resize-layer")).toBeNull();
        expect(container.querySelector(".gd-dash-bottom-position-pixel")?.parentElement).toHaveClass(
            "gd-dashboard-interaction-lock__content",
        );
        expect(mocks.dragScroll.mock.lastCall?.[3]).toBe(false);
        expect(mocks.dragLayer.mock.lastCall?.[0]).toMatchObject({ enableCanvasScroll: false });
    });

    it("enables the canvas scrollbar, resize portal, and ruler geometry together", () => {
        mocks.settings.enableDashboardCanvasScroll = true;
        const { container } = render(<DashboardInner />);

        expect(container.querySelector(".gd-dashboards-root--canvas-scroll")).not.toBeNull();
        expect(container.querySelector(".gd-dash-content-scrollbar")).not.toHaveAttribute("hidden");
        expect(mocks.dragScroll.mock.lastCall?.[3]).toBe(true);
        expect(mocks.dragLayer.mock.lastCall?.[0].enableCanvasScroll).toBe(true);
        expect(mocks.dragLayer.mock.lastCall?.[0].resizeLayer).toBe(
            container.querySelector(".gd-dash-content-resize-layer"),
        );
        expect(container.querySelector(".gd-dash-bottom-position-pixel")?.parentElement?.tagName).toBe(
            "MAIN",
        );

        fireEvent.scroll(container.querySelector(".gd-dash-content-scroll-container")!, {
            target: { scrollLeft: 200 },
        });
        const header = container.querySelector<HTMLElement>(".gd-dash-header-wrapper")!;
        expect(header.style.getPropertyValue("--dgd-dashboard-content-width")).toBe("1170px");
        expect(header.style.getPropertyValue("--dgd-dashboard-content-offset")).toBe("-200px");
    });

    it("removes the scroll structure and ruler geometry when the flag is disabled", () => {
        mocks.settings.enableDashboardCanvasScroll = true;
        const { container, rerender } = render(<DashboardInner />);
        mocks.settings.enableDashboardCanvasScroll = false;
        rerender(<DashboardInner />);

        expect(container.querySelector(".gd-dash-content-scroll-container")).toBeNull();
        expect(container.querySelector(".gd-dash-content-resize-layer")).toBeNull();
        const header = container.querySelector<HTMLElement>(".gd-dash-header-wrapper")!;
        expect(header.style.getPropertyValue("--dgd-dashboard-content-width")).toBe("");
        expect(header.style.getPropertyValue("--dgd-dashboard-content-offset")).toBe("");
    });

    it("leaves view mode unchanged even when the flag is enabled", () => {
        mocks.settings.enableDashboardCanvasScroll = true;
        mocks.isEditMode = false;
        const { container } = render(<DashboardInner />);
        expect(container.querySelector(".gd-dash-content-scroll-container")).toBeNull();
        expect(container.querySelector(".gd-dash-content-resize-layer")).toBeNull();
        expect(mocks.dragScroll.mock.lastCall?.[3]).toBe(false);
    });
});
