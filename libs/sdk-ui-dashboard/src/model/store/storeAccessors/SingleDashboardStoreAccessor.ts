// (C) 2022 GoodData Corporation

import { DashboardStoreAccessorRepository } from "./DashboardStoreAccessorRepository.js";
import { idRef, serializeObjRef } from "@gooddata/sdk-model";
import { DashboardDispatch, DashboardSelectorEvaluator, DashboardState } from "../types.js";

/**
 * This `mocked` ID is used as a key under which is the accessor object stored in the instance of the
 * {@link DashboardStoreAccessorRepository}.
 */
const DASHBOARD = serializeObjRef(idRef("SingleDashboardStoreAccessor_mock_dashboard_id"));

/**
 * This singleton class uses {@link DashboardStoreAccessorRepository} to create a store accessor for
 * a single dashboard.
 *
 * @remarks
 * The usage of this singleton is the same as for {@link DashboardStoreAccessorRepository} except functions
 * don't accept any parameters.
 *
 * @public
 */
export class SingleDashboardStoreAccessor {
    /**
     * Returns a selector for current dashboard.
     */
    static getDashboardSelect(): DashboardSelectorEvaluator {
        return DashboardStoreAccessorRepository.getAccessorsForDashboard(DASHBOARD).getDashboardSelect();
    }

    /**
     * Returns a dispatch object for current dashboard.
     */
    static getDashboardDispatch(): DashboardDispatch {
        return DashboardStoreAccessorRepository.getAccessorsForDashboard(DASHBOARD).getDashboardDispatch();
    }

    /**
     * Creates a {@link Dashboard#onStateChange} callback for current dashboard.
     */
    static getOnChangeHandler(): (state: DashboardState, dispatch: DashboardDispatch) => void {
        return DashboardStoreAccessorRepository.getOnChangeHandlerForDashboard(DASHBOARD);
    }

    /**
     * Removes dashboard accessors from {@link DashboardStoreAccessorRepository#accessors} for current dashboard.
     */
    static clearAccessor(): void {
        DashboardStoreAccessorRepository.clearAccessorForDashboard(DASHBOARD);
    }

    /**
     * Checks if accessors is initialized for current dashboard.
     */
    static isAccessorInitialized(): boolean {
        return DashboardStoreAccessorRepository.isAccessorInitializedForDashboard(DASHBOARD);
    }
}
