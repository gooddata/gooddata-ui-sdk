// (C) 2022 GoodData Corporation

import { SingleDashboardStoreAccessor } from "../SingleDashboardStoreAccessor";
import { DashboardState } from "../../types";

describe("SingleDashboardStoreAccessor tests", () => {
    afterEach(() => {
        SingleDashboardStoreAccessor.clearAccessor();
    });

    it("getters", () => {
        const onStateChangeHandler = SingleDashboardStoreAccessor.getOnChangeHandler();

        const dashboardDispatch = jest.fn();
        onStateChangeHandler({} as DashboardState, dashboardDispatch);

        expect(SingleDashboardStoreAccessor.getDashboardSelect()).toBeTruthy();
        expect(SingleDashboardStoreAccessor.getDashboardDispatch()).toBe(dashboardDispatch);
    });

    it("is initialized", () => {
        const onStateChangeHandler = SingleDashboardStoreAccessor.getOnChangeHandler();

        expect(SingleDashboardStoreAccessor.isAccessorInitialized()).toBe(false);

        onStateChangeHandler({} as DashboardState, jest.fn());

        expect(SingleDashboardStoreAccessor.isAccessorInitialized()).toBe(true);
    });
});
