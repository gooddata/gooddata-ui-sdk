// (C) 2022 GoodData Corporation

import { DashboardDispatch, DashboardSelectorEvaluator, DashboardState } from "../types";
import { invariant } from "ts-invariant";
import { DashboardStoreAccessor } from "./DashboardStoreAccessor";
import { idRef, ObjRef, serializeObjRef } from "@gooddata/sdk-model";

/**
 * This singleton class serves the selector and the dispatcher properties for given dashboard.
 *
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
    private static dashboardAccessor: DashboardStoreAccessorRepository;

    private accessors = new Map<string, DashboardStoreAccessor>();

    private constructor() {
        // empty on purpose to prevent incorrect use of this class
    }

    /**
     * {@link DashboardStoreAccessorRepository#getInstance} is the only correct way to get the instance of
     * the {@link DashboardStoreAccessorRepository} class.
     *
     * @Returns the existing {@link DashboardStoreAccessorRepository} or create and return new one.
     */
    static getInstance() {
        if (!DashboardStoreAccessorRepository.dashboardAccessor) {
            DashboardStoreAccessorRepository.dashboardAccessor = new DashboardStoreAccessorRepository();
        }
        return this.dashboardAccessor;
    }

    private getSerializedDashboardRef(dashboard: ObjRef | string): string {
        const dashboardRef = typeof dashboard === "string" ? idRef(dashboard) : dashboard;
        return serializeObjRef(dashboardRef);
    }

    /**
     * Gets the correct {@link DashboardStoreAccessor} for given dashboard from the accessors map.
     *
     * @param dashboard - an {@link @gooddata/sdk-model#ObjRef} of the dashboard, or its id as a string
     */
    getAccessorsForDashboard(dashboard: ObjRef | string): DashboardStoreAccessor {
        const serializedDashboardRef = this.getSerializedDashboardRef(dashboard);

        const accessor = this.accessors.get(serializedDashboardRef);
        invariant(accessor, `No accessor available for dashboard ${dashboard}`);
        return accessor;
    }

    /**
     * Creates a {@link Dashboard#onStateChange} callback for given dashboard.
     *
     * @param dashboard - an {@link @gooddata/sdk-model#ObjRef} of the dashboard, or its id as a string
     */
    getOnChangeHandlerForDashboard(
        dashboard: ObjRef | string,
    ): (state: DashboardState, dispatch: DashboardDispatch) => void {
        const serializedDashboardRef = this.getSerializedDashboardRef(dashboard);

        return (state, dispatch) => {
            const dashboardSelect: DashboardSelectorEvaluator = (select) => select(state);

            this.setAccessorForDashboard(serializedDashboardRef, dashboardSelect, dispatch);
        };
    }

    private setAccessorForDashboard(
        serializedDashboardRef: string,
        selector: DashboardSelectorEvaluator,
        dispatch: DashboardDispatch,
    ) {
        this.accessors.set(serializedDashboardRef, new DashboardStoreAccessor(selector, dispatch));
    }

    /**
     * Removes dashboard accessors from {@link DashboardStoreAccessorRepository#accessors} for the given dashboard {@link @gooddata/sdk-model#ObjRef}.
     *
     * @param dashboard - an {@link @gooddata/sdk-model#ObjRef} of the dashboard, or its id as a string
     */
    clearAccessorForDashboard(dashboard: ObjRef | string): void {
        const serializedDashboardRef = this.getSerializedDashboardRef(dashboard);
        this.accessors.delete(serializedDashboardRef);
    }

    /**
     * Clears all accessors saved in accessors map.
     */
    clearAllAccessors(): void {
        this.accessors.clear();
    }

    /**
     * Checks if accessors is initialized for given dashboard {@link @gooddata/sdk-model#ObjRef}.
     *
     * @param dashboard -an {@link @gooddata/sdk-model#ObjRef} of the dashboard, or its id as a string
     */
    isAccessorInitializedForDashboard(dashboard: ObjRef | string): boolean {
        const serializedDashboardRef = this.getSerializedDashboardRef(dashboard);
        const accessor = this.accessors.get(serializedDashboardRef);
        return !!accessor && accessor.isDashboardStoreAccessorInitialized();
    }
}
