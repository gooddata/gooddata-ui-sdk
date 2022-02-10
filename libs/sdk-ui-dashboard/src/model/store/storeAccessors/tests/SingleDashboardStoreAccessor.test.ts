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

        onStateChangeHandler({} as DashboardState, jest.fn());

        expect(instance.getDashboardSelect()).toBeTruthy();
        expect(instance.getDashboardDispatch()).toBeTruthy();
    });

    it("is initialized", () => {
        const instance = SingleDashboardStoreAccessor.getInstance();
        const onStateChangeHandler = instance.getOnChangeHandler();

        expect(instance.isAccessorInitialized()).toBe(false);

        onStateChangeHandler({} as DashboardState, jest.fn());

        expect(instance.isAccessorInitialized()).toBe(true);
    });
});
