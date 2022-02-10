// (C) 2022 GoodData Corporation

import { DashboardStoreAccessorRepository } from "../DashboardStoreAccessorRepository";
import { DashboardState } from "../../types";
const DASHBOARD_ID = "dashboard_id";
const DASHBOARD_ID2 = "dashboard_id2";

describe("dashboard store accessors repository", () => {
    it("get accessors repository", () => {
        const instance = DashboardStoreAccessorRepository.getInstance();

        expect(instance).toBeTruthy();
    });

    it("accessors for dashboard initialized", () => {
        const instance = DashboardStoreAccessorRepository.getInstance();
        const onStateChangeCallback = instance.getOnChangeHandlerForDashboard(DASHBOARD_ID);

        expect(instance.isAccessorInitializedForDashboard(DASHBOARD_ID)).toBe(false);

        onStateChangeCallback({} as DashboardState, jest.fn());

        expect(instance.isAccessorInitializedForDashboard(DASHBOARD_ID)).toBe(true);
    });

    it("get accessors for dashboard", () => {
        const instance = DashboardStoreAccessorRepository.getInstance();
        const onStateChangeCallback = instance.getOnChangeHandlerForDashboard(DASHBOARD_ID);

        const dashboardDispatch = jest.fn();
        onStateChangeCallback({} as DashboardState, dashboardDispatch);

        const accessors = instance.getAccessorsForDashboard(DASHBOARD_ID);

        expect(accessors.getSelector()).toBeTruthy();
        expect(accessors.getDispatch()).toBe(dashboardDispatch);
    });

    it("clear accessors for dashboard", () => {
        const instance = DashboardStoreAccessorRepository.getInstance();
        const onStateChangeCallback = instance.getOnChangeHandlerForDashboard(DASHBOARD_ID);

        onStateChangeCallback({} as DashboardState, jest.fn());

        const accessors = instance.getAccessorsForDashboard(DASHBOARD_ID);

        expect(accessors).toBeTruthy();

        instance.clearAccessorForDashboard(DASHBOARD_ID);
        expect(() => instance.getAccessorsForDashboard(DASHBOARD_ID)).toThrowError();
    });

    it("clear accessor repository", () => {
        const instance = DashboardStoreAccessorRepository.getInstance();
        const onStateChangeCallback = instance.getOnChangeHandlerForDashboard(DASHBOARD_ID);
        const onStateChangeCallback2 = instance.getOnChangeHandlerForDashboard(DASHBOARD_ID2);

        onStateChangeCallback({} as DashboardState, jest.fn());
        onStateChangeCallback2({} as DashboardState, jest.fn());

        expect(instance.getAccessorsForDashboard(DASHBOARD_ID)).toBeTruthy();
        expect(instance.getAccessorsForDashboard(DASHBOARD_ID2)).toBeTruthy();

        instance.clearAllAccessors();
        expect(() => instance.getAccessorsForDashboard(DASHBOARD_ID)).toThrowError();
        expect(() => instance.getAccessorsForDashboard(DASHBOARD_ID2)).toThrowError();
    });
});
