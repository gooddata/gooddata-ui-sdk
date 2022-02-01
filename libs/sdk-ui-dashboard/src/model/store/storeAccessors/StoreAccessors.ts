// (C) 2022 GoodData Corporation

import { DashboardDispatch, DashboardSelectorEvaluator } from "../types";

/**
 * This singleton class servers the selector and the dispatcher properties of the dashboard component state.
 *
 * To get latest properties, use static member function {@link StoreAccessors#getInstance}. If there is already an instance
 * created, it will return this instance and will return new instance of the {@link StoreAccessors} otherwise.
 *
 * @public
 */
export class StoreAccessors {
    static stateAccessor: StoreAccessors;

    selectorEvaluator: DashboardSelectorEvaluator | undefined;
    dispatch: DashboardDispatch | undefined;

    /**
     * @returns stateAccessor - an existing instance of StoreAccessors class. If no instance is available,
     * the new one is created.
     */
    static getInstance() {
        if (!StoreAccessors.stateAccessor) {
            StoreAccessors.stateAccessor = new StoreAccessors();
        }
        return this.stateAccessor;
    }

    /**
     * Returns current selector for the dashboard's component state.
     */
    getSelector() {
        return this.selectorEvaluator;
    }

    /**
     * Setter for the dashboard's component state selector.
     * @param selectorEvaluator - dashboardSelectorEvaluator
     */
    setSelector(selectorEvaluator: DashboardSelectorEvaluator) {
        this.selectorEvaluator = selectorEvaluator;
    }

    /**
     * Returns current dispatch object for the dashboard component state.
     */
    getDispatch() {
        return this.dispatch;
    }

    /**
     * Setter for the dashboard's component state dispatch.
     * @param dispatch - dashboardDispatch
     */
    setDispatch(dispatch: DashboardDispatch) {
        this.dispatch = dispatch;
    }
}
