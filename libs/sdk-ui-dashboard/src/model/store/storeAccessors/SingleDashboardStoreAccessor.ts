// (C) 2022 GoodData Corporation

import { DashboardStoreAccessorRepository } from "./DashboardStoreAccessorRepository";
import { idRef, serializeObjRef } from "@gooddata/sdk-model";
import { DashboardDispatch, DashboardSelectorEvaluator, DashboardState } from "../types";

const DASHBOARD = serializeObjRef(idRef("dashboard_id"));

/**
 * This singleton class uses {@link DashboardStoreAccessorRepository} to create a store accessor for
 * a single dashboard.
 *
 * The usage of this singleton is the same as for {@link DashboardStoreAccessorRepository} except functions
 * don't accept any parameters.
 *
 * @public
 */
export class SingleDashboardStoreAccessor {
    private static singleDashboardStoreAccessor: SingleDashboardStoreAccessor;

    private accessorRepository: DashboardStoreAccessorRepository;

    private constructor() {
        this.accessorRepository = DashboardStoreAccessorRepository.getInstance();
    }

    static getInstance(): SingleDashboardStoreAccessor {
        if (!SingleDashboardStoreAccessor.singleDashboardStoreAccessor) {
            SingleDashboardStoreAccessor.singleDashboardStoreAccessor = new SingleDashboardStoreAccessor();
        }
        return this.singleDashboardStoreAccessor;
    }

    /**
     * Returns a selector for current dashboard.
     */
    getDashboardSelect(): DashboardSelectorEvaluator {
        return this.accessorRepository.getAccessorsForDashboard(DASHBOARD).getSelector();
    }

    /**
     * Returns a dispatch object for current dashboard.
     */
    getDashboardDispatch(): DashboardDispatch {
        return this.accessorRepository.getAccessorsForDashboard(DASHBOARD).getDispatch();
    }

    /**
     * Creates a {@link Dashboard#onStateChange} callback for current dashboard.
     */
    getOnChangeHandler(): (state: DashboardState, dispatch: DashboardDispatch) => void {
        return this.accessorRepository.getOnChangeHandlerForDashboard(DASHBOARD);
    }

    /**
     * Removes dashboard accessors from {@link DashboardStoreAccessorRepository#accessors} for current dashboard.
     */
    clearAccessorForDashboard(): void {
        this.accessorRepository.clearAccessorForDashboard(DASHBOARD);
    }

    /**
     * Checks if accessors is initialized for current dashboard.
     */
    isAccessorInitializedForDashboard(): boolean {
        return this.accessorRepository.isAccessorInitializedForDashboard(DASHBOARD);
    }
}
