// (C) 2022 GoodData Corporation

import { DashboardDispatch, DashboardSelectorEvaluator } from "../types";

/**
 * This singleton class serves the selector and the dispatcher properties of the dashboard component state.
 *
 * The {@link Dashboard} component has an optional property {@link IDashboardProps#onStateChange} through which
 * you can handle set the values for {@link DashboardDispatch} and {@link DashboardSelectorEvaluator}.
 *
 *
 * In your component using {@link Dashboard} you can create and instance of the {@link DashboardStoreAccessor} object
 * and use it like in the example below. The example shows the accessor's usage as well. There is a need to check
 * the select and dispatch object existence.
 *
 * @example
 * ```
 *  const stateAccessors = StoreAccessors.getInstance();
 *
 *  const onStateChange = (state: DashboardState, dispatch: DashboardDispatch) => {
 *      const dashboardSelect: DashboardSelectorEvaluator = (select) => select(state);
 *
 *      stateAccessors.setSelector(dashboardSelect);
 *      stateAccessors.setDispatch(dispatch);
 *  }
 *
 *  // in the code where needed
 *  stateAccessors.getSelector()?.(selectEffectiveDateFilterOptions);
 *  stateAccessors.getDispatch()?.(saveDashboardAs("Saved from exposed dispatch", false, false));
 *
 *  return (
 *      <Dashboard dashboard={"<dashboardId>"} onStateChange={onStateChange}/>
 *  )
 * ```
 *
 * To get latest properties, use static member function {@link DashboardStoreAccessor#getInstance}. If there is already an instance
 * created, it will return this instance and will return new instance of the {@link DashboardStoreAccessor} otherwise.
 *
 * @public
 */
export class DashboardStoreAccessor {
    static stateAccessor: DashboardStoreAccessor;

    selectorEvaluator: DashboardSelectorEvaluator | undefined;
    dispatch: DashboardDispatch | undefined;

    private constructor() {
        // constructor empty on purpose to prevent incorrect StoreAccessors object initialization
    }

    /**
     * @returns stateAccessor - an existing instance of StoreAccessors class. If no instance is available,
     * the new one is created.
     */
    static getInstance() {
        if (!DashboardStoreAccessor.stateAccessor) {
            DashboardStoreAccessor.stateAccessor = new DashboardStoreAccessor();
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
