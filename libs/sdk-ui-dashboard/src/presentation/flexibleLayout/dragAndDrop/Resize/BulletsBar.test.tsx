// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BulletsBar } from "./BulletsBar.js";

const { settings } = vi.hoisted(() => {
    vi.resetModules();
    return { settings: vi.fn() };
});

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: () => settings(),
}));
vi.mock("../../../dragAndDrop/LayoutResizeContext.js", () => ({
    useResizeWidthStatus: () => ({
        isResizingWidth: true,
        isItemNested: false,
        initialIndex: 1,
        currentIndex: 3,
    }),
}));

describe("BulletsBar canvas scrolling", () => {
    it.each([false, undefined])("preserves the original ruler when the flag is %s", (flag) => {
        settings.mockReturnValue({ enableDashboardCanvasScroll: flag });
        const { container } = render(<BulletsBar />);
        expect(container.querySelector(".gd-grid-layout-ruler-viewport")).toBeNull();
        expect(container.firstElementChild).toHaveClass("gd-grid-layout-ruler--active");
        expect(container.querySelector(".s-resize-bullet-3")).toHaveClass(
            "gd-grid-layout-ruler__bullet--active",
        );
    });

    it("clips the synchronized ruler only when the flag is on", () => {
        settings.mockReturnValue({ enableDashboardCanvasScroll: true });
        const { container } = render(<BulletsBar />);
        expect(container.firstElementChild).toHaveClass("gd-grid-layout-ruler-viewport");
        expect(container.firstElementChild?.firstElementChild).toHaveClass("gd-grid-layout-ruler--active");
    });
});
