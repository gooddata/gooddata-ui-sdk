// (C) 2022-2025 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { DashboardState } from "../../types.js";
import { SingleDashboardStoreAccessor } from "../SingleDashboardStoreAccessor.js";

describe("SingleDashboardStoreAccessor tests", () => {
    afterEach(() => {
        SingleDashboardStoreAccessor.clearAccessor();
    });

    it("getters", () => {
        const onStateChangeHandler = SingleDashboardStoreAccessor.getOnChangeHandler();

        const dashboardDispatch = vi.fn();
        onStateChangeHandler({} as DashboardState, dashboardDispatch);

        expect(SingleDashboardStoreAccessor.getDashboardSelect()).toBeTruthy();
        expect(SingleDashboardStoreAccessor.getDashboardDispatch()).toBe(dashboardDispatch);
    });

    it("is initialized", () => {
        const onStateChangeHandler = SingleDashboardStoreAccessor.getOnChangeHandler();

        expect(SingleDashboardStoreAccessor.isAccessorInitialized()).toBe(false);

        const dashboardDispatch = vi.fn();
        onStateChangeHandler({} as DashboardState, dashboardDispatch);

        expect(SingleDashboardStoreAccessor.isAccessorInitialized()).toBe(true);
    });
});
