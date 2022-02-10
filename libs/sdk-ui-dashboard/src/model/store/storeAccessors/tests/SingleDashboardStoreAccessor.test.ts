// (C) 2022 GoodData Corporation

import { SingleDashboardStoreAccessor } from "../SingleDashboardStoreAccessor";
import { DashboardState } from "../../types";

describe("SingleDashboardStoreAccessor tests", () => {
    afterEach(() => {
        SingleDashboardStoreAccessor.getInstance().clearAccessor();
    });

    it("get SingleDashboardStoreAccessor instance", () => {
        expect(SingleDashboardStoreAccessor.getInstance()).toBeTruthy();
    });

    it("getters", () => {
        const instance = SingleDashboardStoreAccessor.getInstance();
        const onStateChangeHandler = instance.getOnChangeHandler();

        const dashboardDispatch = jest.fn();
        onStateChangeHandler({} as DashboardState, dashboardDispatch);

        expect(instance.getDashboardSelect()).toBeTruthy();
        expect(instance.getDashboardDispatch()).toBe(dashboardDispatch);
    });

    it("is initialized", () => {
        const instance = SingleDashboardStoreAccessor.getInstance();
        const onStateChangeHandler = instance.getOnChangeHandler();

        expect(instance.isAccessorInitialized()).toBe(false);

        onStateChangeHandler({} as DashboardState, jest.fn());

        expect(instance.isAccessorInitialized()).toBe(true);
    });
});
