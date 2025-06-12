// (C) 2022 GoodData Corporation

import { DashboardDispatch, DashboardSelectorEvaluator, DashboardState } from "../types.js";
import { invariant } from "ts-invariant";
import { DashboardStoreAccessor } from "./DashboardStoreAccessor.js";
import { idRef, ObjRef, serializeObjRef } from "@gooddata/sdk-model";

/**
 * This singleton class serves the selector and the dispatcher properties for given dashboard.
 *
 * @remarks
 * The {@link Dashboard} component has an optional property {@link IDashboardProps#onStateChange} through which
 * you can handle setting of the values for {@link DashboardDispatch} and {@link DashboardSelectorEvaluator}.
 *
 *
 * In your component using {@link Dashboard} you can create an onStateChange callback for your dashboard using
 * {@link DashboardStoreAccessorRepository#getOnChangeHandlerForDashboard} and pass it to mentioned Dashboard
 * component property.
 *
 * @example
 * ```
 *  const dashboardStoreAccessors = DashboardStoreAccessorRepository.getInstance();
 *
 *
 *  // in the code where needed
 *  dashboardStoreAccessors.getAccessorsForDashboard(<DASHBOARD_ID>).getDispatch()(
 *      changeDateFilterSelection("relative", "GDC.time.month", "-3", "0"),
 *  );
 *
 *  // or with check if accessor is initialized already
 *  if (dashboardStoreAccessors.isAccessorInitializedForDashboard(DASHBOARD_ID)) {
 *          setSelectResult(
 *              dashboardStoreAccessors.getAccessorsForDashboard(DASHBOARD_ID).getSelector()(
 *                  selectEffectiveDateFilterOptions,
 *              ),
 *          );
 *      }
 *
 *  return (
 *      <Dashboard dashboard={"<dashboardId>"} onStateChange={dashboardStoreAccessors.getOnChangeHandlerForDashboard(DASHBOARD_REF)}/>
 *  )
 * ```
 *
 * To get latest properties, use static member function {@link DashboardStoreAccessor#getInstance}. If there is already an instance
 * created, it will return this instance and will return new instance of the {@link DashboardStoreAccessor} otherwise.
 *
 * @public
 */
export class DashboardStoreAccessorRepository {
    private static accessors = new Map<string, DashboardStoreAccessor>();

    private static getSerializedDashboardRef(dashboard: ObjRef | string): string {
        const dashboardRef = typeof dashboard === "string" ? idRef(dashboard) : dashboard;
        return serializeObjRef(dashboardRef);
    }

    /**
     * Gets the correct {@link DashboardStoreAccessor} for given dashboard from the accessors map.
     *
     * @param dashboard - an {@link @gooddata/sdk-model#ObjRef} of the dashboard, or its id as a string
     */
    static getAccessorsForDashboard(dashboard: ObjRef | string): DashboardStoreAccessor {
        const serializedDashboardRef = DashboardStoreAccessorRepository.getSerializedDashboardRef(dashboard);

        const accessor = this.accessors.get(serializedDashboardRef);
        invariant(accessor, `No accessor available for dashboard ${dashboard}`);
        return accessor;
    }

    /**
     * Gets the correct {@link DashboardSelectorEvaluator} for given dashboard from the accessors map.
     *
     * @param dashboard - an {@link @gooddata/sdk-model#ObjRef} of the dashboard, or its id as a string
     */
    static getDashboardSelectForDashboard(dashboard: ObjRef | string): DashboardSelectorEvaluator {
        const serializedDashboardRef = DashboardStoreAccessorRepository.getSerializedDashboardRef(dashboard);

        const selectorEvaluator = this.accessors.get(serializedDashboardRef)?.getDashboardSelect();
        invariant(selectorEvaluator, `No selector available for dashboard ${dashboard}`);
        return selectorEvaluator;
    }

    /**
     * Gets the correct {@link DashboardDispatch} for given dashboard from the accessors map.
     *
     * @param dashboard - an {@link @gooddata/sdk-model#ObjRef} of the dashboard, or its id as a string
     */
    static getDashboardDispatchForDashboard(dashboard: ObjRef | string): DashboardDispatch {
        const serializedDashboardRef = DashboardStoreAccessorRepository.getSerializedDashboardRef(dashboard);

        const dashboardDispatch = this.accessors.get(serializedDashboardRef)?.getDashboardDispatch();
        invariant(dashboardDispatch, `No selector available for dashboard ${dashboard}`);
        return dashboardDispatch;
    }

    /**
     * Creates a {@link Dashboard#onStateChange} callback for given dashboard.
     *
     * @param dashboard - an {@link @gooddata/sdk-model#ObjRef} of the dashboard, or its id as a string
     */
    static getOnChangeHandlerForDashboard(
        dashboard: ObjRef | string,
    ): (state: DashboardState, dispatch: DashboardDispatch) => void {
        const serializedDashboardRef = DashboardStoreAccessorRepository.getSerializedDashboardRef(dashboard);

        return (state, dispatch) => {
            const dashboardSelect: DashboardSelectorEvaluator = (select) => select(state);

            DashboardStoreAccessorRepository.setAccessorForDashboard(
                serializedDashboardRef,
                dashboardSelect,
                dispatch,
            );
        };
    }

    private static setAccessorForDashboard(
        serializedDashboardRef: string,
        selector: DashboardSelectorEvaluator,
        dispatch: DashboardDispatch,
    ) {
        DashboardStoreAccessorRepository.accessors.set(
            serializedDashboardRef,
            new DashboardStoreAccessor(selector, dispatch),
        );
    }

    /**
     * Removes dashboard accessors from {@link DashboardStoreAccessorRepository#accessors} for the given dashboard {@link @gooddata/sdk-model#ObjRef}.
     *
     * @param dashboard - an {@link @gooddata/sdk-model#ObjRef} of the dashboard, or its id as a string
     */
    static clearAccessorForDashboard(dashboard: ObjRef | string): void {
        const serializedDashboardRef = DashboardStoreAccessorRepository.getSerializedDashboardRef(dashboard);
        DashboardStoreAccessorRepository.accessors.delete(serializedDashboardRef);
    }

    /**
     * Clears all accessors saved in accessors map.
     */
    static clearAllAccessors(): void {
        DashboardStoreAccessorRepository.accessors.clear();
    }

    /**
     * Checks if accessors is initialized for given dashboard {@link @gooddata/sdk-model#ObjRef}.
     *
     * @param dashboard -an {@link @gooddata/sdk-model#ObjRef} of the dashboard, or its id as a string
     */
    static isAccessorInitializedForDashboard(dashboard: ObjRef | string): boolean {
        const serializedDashboardRef = this.getSerializedDashboardRef(dashboard);
        const accessor = DashboardStoreAccessorRepository.accessors.get(serializedDashboardRef);
        return !!accessor?.isDashboardStoreAccessorInitialized();
    }
}
