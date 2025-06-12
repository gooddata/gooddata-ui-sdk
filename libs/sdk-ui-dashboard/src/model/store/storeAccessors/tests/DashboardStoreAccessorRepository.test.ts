// (C) 2022 GoodData Corporation
import { describe, it, expect, vi } from "vitest";
import { DashboardStoreAccessorRepository } from "../DashboardStoreAccessorRepository.js";
import { DashboardState } from "../../types.js";
const DASHBOARD_ID = "dashboard_id";
const DASHBOARD_ID2 = "dashboard_id2";

describe("dashboard store accessors repository", () => {
    it("accessors for dashboard initialized", () => {
        const onStateChangeCallback =
            DashboardStoreAccessorRepository.getOnChangeHandlerForDashboard(DASHBOARD_ID);

        expect(DashboardStoreAccessorRepository.isAccessorInitializedForDashboard(DASHBOARD_ID)).toBe(false);

        const dashboardDispatch = vi.fn();
        onStateChangeCallback({} as DashboardState, dashboardDispatch);

        expect(DashboardStoreAccessorRepository.isAccessorInitializedForDashboard(DASHBOARD_ID)).toBe(true);
    });

    it("get accessors for dashboard", () => {
        const onStateChangeCallback =
            DashboardStoreAccessorRepository.getOnChangeHandlerForDashboard(DASHBOARD_ID);

        const dashboardDispatch = vi.fn();
        onStateChangeCallback({} as DashboardState, dashboardDispatch);

        const accessors = DashboardStoreAccessorRepository.getAccessorsForDashboard(DASHBOARD_ID);

        expect(accessors.getDashboardSelect()).toBeTruthy();
        expect(accessors.getDashboardDispatch()).toBe(dashboardDispatch);
    });

    it("clear accessors for dashboard", () => {
        const onStateChangeCallback =
            DashboardStoreAccessorRepository.getOnChangeHandlerForDashboard(DASHBOARD_ID);

        onStateChangeCallback({} as DashboardState, vi.fn());

        const accessors = DashboardStoreAccessorRepository.getAccessorsForDashboard(DASHBOARD_ID);

        expect(accessors).toBeTruthy();

        DashboardStoreAccessorRepository.clearAccessorForDashboard(DASHBOARD_ID);
        expect(() => DashboardStoreAccessorRepository.getAccessorsForDashboard(DASHBOARD_ID)).toThrowError();
    });

    it("clear accessor repository", () => {
        const onStateChangeCallback =
            DashboardStoreAccessorRepository.getOnChangeHandlerForDashboard(DASHBOARD_ID);
        const onStateChangeCallback2 =
            DashboardStoreAccessorRepository.getOnChangeHandlerForDashboard(DASHBOARD_ID2);

        onStateChangeCallback({} as DashboardState, vi.fn());
        onStateChangeCallback2({} as DashboardState, vi.fn());

        expect(DashboardStoreAccessorRepository.getAccessorsForDashboard(DASHBOARD_ID)).toBeTruthy();
        expect(DashboardStoreAccessorRepository.getAccessorsForDashboard(DASHBOARD_ID2)).toBeTruthy();

        DashboardStoreAccessorRepository.clearAllAccessors();
        expect(() => DashboardStoreAccessorRepository.getAccessorsForDashboard(DASHBOARD_ID)).toThrowError();
        expect(() => DashboardStoreAccessorRepository.getAccessorsForDashboard(DASHBOARD_ID2)).toThrowError();
    });
});
