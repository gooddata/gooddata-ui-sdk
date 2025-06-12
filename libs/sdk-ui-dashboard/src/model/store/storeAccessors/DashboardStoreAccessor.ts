// (C) 2022 GoodData Corporation

import { DashboardDispatch, DashboardSelectorEvaluator, DashboardState } from "../types.js";
import { invariant } from "ts-invariant";

/**
 * This class serves the selector and the dispatcher properties of the dashboard component state.
 *
 * @remarks
 * The {@link Dashboard} component has an optional property {@link IDashboardProps#onStateChange} through which
 * you can handle set the values for {@link DashboardDispatch} and {@link DashboardSelectorEvaluator}.
 *
 *
 * In your component using {@link Dashboard} you can create and instance of the {@link DashboardStoreAccessor} object
 * and use it like in the example below. The example shows the accessor's usage as well. There is a need to check
 * the select and dispatch object existence.
 *
 * See {@link DashboardStoreAccessorRepository} on possible way how to use the store accessor.
 *
 * To get latest properties, use static member function {@link DashboardStoreAccessor#getInstance}. If there is already an instance
 * created, it will return this instance and will return new instance of the {@link DashboardStoreAccessor} otherwise.
 *
 * @public
 */
export class DashboardStoreAccessor {
    selectorEvaluator: DashboardSelectorEvaluator | undefined;
    dispatch: DashboardDispatch | undefined;

    constructor(selector: DashboardSelectorEvaluator, dispatch: DashboardDispatch) {
        this.selectorEvaluator = selector;
        this.dispatch = dispatch;
    }

    /**
     * Returns current selector for the dashboard's component state.
     */
    getDashboardSelect = (): DashboardSelectorEvaluator => {
        invariant(this.selectorEvaluator, "DashboardStoreAccessor selectorEvaluator is not initialized");
        return this.selectorEvaluator;
    };

    /**
     * Setter for the dashboard's component state selector.
     * @param selectorEvaluator - dashboardSelectorEvaluator
     */
    private setSelector = (selectorEvaluator: DashboardSelectorEvaluator): void => {
        this.selectorEvaluator = selectorEvaluator;
    };

    /**
     * Returns current dispatch object for the dashboard component state.
     */
    getDashboardDispatch = (): DashboardDispatch => {
        invariant(this.dispatch, "DashboardStoreAccessor dispatch is not initialized");
        return this.dispatch;
    };

    /**
     * Setter for the dashboard's component state dispatch.
     * @param dispatch - dashboardDispatch
     */
    private setDispatch = (dispatch: DashboardDispatch): void => {
        this.dispatch = dispatch;
    };

    /**
     * Checks if {@link DashboardStoreAccessor} is fully initialized.
     */
    isDashboardStoreAccessorInitialized = (): boolean => {
        return !!this.selectorEvaluator && !!this.dispatch;
    };

    /**
     * Callback to be passed as {@link Dashboard} component {@link Dashboard#onStateChange} property to set
     * {@link DashboardStoreAccessor#selectorEvaluator} and {@link DashboardStoreAccessor#dispatch} to handle Dashboard component state from outside of the
     * component.
     *
     * @param state - {@link DashboardState} object.
     * @param dispatch - {@link DashboardDispatch} object.
     */
    setSelectAndDispatch = (state: DashboardState, dispatch: DashboardDispatch): void => {
        const dashboardSelect: DashboardSelectorEvaluator = (select) => select(state);

        this.setSelector(dashboardSelect);
        this.setDispatch(dispatch);
    };
}
