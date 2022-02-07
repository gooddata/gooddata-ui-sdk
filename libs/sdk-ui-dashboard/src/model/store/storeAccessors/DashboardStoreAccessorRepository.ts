// (C) 2022 GoodData Corporation

import { DashboardDispatch, DashboardSelectorEvaluator, DashboardState } from "../types";
import { invariant } from "ts-invariant";
import { DashboardStoreAccessor } from "./DashboardStoreAccessor";
import { ObjRef } from "@gooddata/sdk-model";

/**
 * This singleton class serves the selector and the dispatcher properties for given dashboard {@link @gooddata/sdk-model#IdentifierRef}.
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
 *  const dashboardStoreAccessor = MultipleDashboardStoreAccessor.getInstance();
 *
 *
 *  // in the code where needed
 *  dashboardStoreAccessor.getAccessorsForDashboard(<DASHBOARD_ID>).getDispatch()(
 *      changeDateFilterSelection("relative", "GDC.time.month", "-3", "0"),
 *  );
 *
 *  // or with check if accessor is initialized already
 *  if (dashboardStoreAccessor.isAccessorInitializedForDashboard(DASHBOARD_ID)) {
 *          setSelectResult(
 *              dashboardStoreAccessor.getAccessorsForDashboard(DASHBOARD_ID).getSelector()(
 *                  selectEffectiveDateFilterOptions,
 *              ),
 *          );
 *      }
 *
 *  return (
 *      <Dashboard dashboard={"<dashboardId>"} onStateChange={dashboardStoreAccessor.getOnChangeHandlerForDashboard(DASHBOARD_ID)}/>
 *  )
 * ```
 *
 * To get latest properties, use static member function {@link DashboardStoreAccessor#getInstance}. If there is already an instance
 * created, it will return this instance and will return new instance of the {@link DashboardStoreAccessor} otherwise.
 *
 * @public
 */
export class DashboardStoreAccessorRepository {
    static dashboardAccessor: DashboardStoreAccessorRepository;

    accessors = new Map<ObjRef, DashboardStoreAccessor>();

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

    /**
     * Gets the correct {@link DashboardStoreAccessor} for given dashboard from the {@link DashboardStoreAccessorRepository#accessors} map.
     *
     * @param dashboard - an {@link @gooddata/sdk-model#IdentifierRef} of the dashboard.
     */
    getAccessorsForDashboard(dashboard: ObjRef): DashboardStoreAccessor {
        const accessor = this.accessors.get(dashboard);
        invariant(accessor, `No accessor available for dashboard ${dashboard}`);
        return accessor;
    }

    /**
     * Creates a {@link Dashboard#onStateChange} callback for given dashboard.
     *
     * @param dashboard - an {@link @gooddata/sdk-model#IdentifierRef} of the dashboard.
     */
    getOnChangeHandlerForDashboard(
        dashboard: ObjRef,
    ): (state: DashboardState, dispatch: DashboardDispatch) => void {
        return (state, dispatch) => {
            const dashboardSelect: DashboardSelectorEvaluator = (select) => select(state);

            this.setAccessorForDashboard(dashboard, dashboardSelect, dispatch);
        };
    }

    private setAccessorForDashboard(
        dashboardId: ObjRef,
        selector: DashboardSelectorEvaluator,
        dispatch: DashboardDispatch,
    ) {
        this.accessors.set(dashboardId, new DashboardStoreAccessor(selector, dispatch));
    }

    /**
     * Removes dashboard accessors from {@link DashboardStoreAccessorRepository#accessors} for the given dashboard {@link @gooddata/sdk-model#IdentifierRef}.
     *
     * @param dashboard - an {@link @gooddata/sdk-model#IdentifierRef} of the dashboard.
     */
    clearAccessorForDashboard(dashboard: ObjRef): void {
        this.accessors.delete(dashboard);
    }

    /**
     * Clears all accessors saved in {@link DashboardStoreAccessorRepository#accessors} map.
     */
    clearAllAccessors(): void {
        this.accessors.clear();
    }

    /**
     * Checks if accessors is initialized for given dashboard {@link @gooddata/sdk-model#IdentifierRef}.
     *
     * @param dashboardId - an {@link @gooddata/sdk-model#IdentifierRef} of the dashboard.
     */
    isAccessorInitializedForDashboard(dashboardId: ObjRef): boolean {
        const accessor = this.accessors.get(dashboardId);
        return !!accessor && accessor.isDashboardStoreAccessorInitialized();
    }
}
