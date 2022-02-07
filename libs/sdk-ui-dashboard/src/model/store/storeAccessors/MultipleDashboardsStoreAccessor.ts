// (C) 2022 GoodData Corporation

import { DashboardDispatch, DashboardSelectorEvaluator, DashboardState } from "../types";
import { invariant } from "ts-invariant";
import { DashboardStoreAccessor } from "./DashboardStoreAccessor";

/**
 * @public
 */
export class MultipleDashboardStoreAccessor {
    static dashboardAccessor: MultipleDashboardStoreAccessor;

    accessors = new Map<string, DashboardStoreAccessor>();

    static getInstance() {
        if (!MultipleDashboardStoreAccessor.dashboardAccessor) {
            MultipleDashboardStoreAccessor.dashboardAccessor = new MultipleDashboardStoreAccessor();
        }
        return this.dashboardAccessor;
    }

    getAccessorsForDashboard(dashboardId: string): DashboardStoreAccessor {
        const accessor = this.accessors.get(dashboardId);
        invariant(accessor, `No accessor available for dashboard ${dashboardId}`);
        return accessor;
    }

    getOnChangeHandlerForDashboard(
        dashboardId: string,
    ): (state: DashboardState, dispatch: DashboardDispatch) => void {
        return (state, dispatch) => {
            const dashboardSelect: DashboardSelectorEvaluator = (select) => select(state);

            this.setAccessorForDashboard(dashboardId, dashboardSelect, dispatch);
        };
    }

    setAccessorForDashboard(
        dashboardId: string,
        selector: DashboardSelectorEvaluator,
        dispatch: DashboardDispatch,
    ) {
        this.accessors.set(dashboardId, new DashboardStoreAccessor(selector, dispatch));
    }

    clearAccessorForDashboard(dashboardId: string): void {
        this.accessors.delete(dashboardId);
    }

    clearAllAccessors(): void {
        this.accessors.clear();
    }

    isAccessorInitializedForDashboard(dashboardId: string): boolean {
        const accessor = this.accessors.get(dashboardId);
        return !!accessor && accessor.isDashboardStoreAccessorInitialized();
    }
}
