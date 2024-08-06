// (C) 2021-2024 GoodData Corporation

import { IDashboard, IAccessControlAware } from "@gooddata/sdk-model";

/**
 * @public
 */
export type DashboardDescriptor = Pick<
    IDashboard,
    | "title"
    | "description"
    | "tags"
    | "disableCrossFiltering"
    | "disableUserFilterReset"
    | "disableUserFilterSave"
    | "disableFilterViews"
> &
    IAccessControlAware;

export const EmptyDashboardDescriptor: DashboardDescriptor = {
    title: "",
    description: "",
    shareStatus: "private",
};

/**
 * @beta
 */
export interface DashboardMetaState {
    /**
     * This property contains current state of the dashboard's descriptive metadata. This descriptor can
     * be modified by the dashboard component and the new values will be used during save.
     */
    descriptor?: DashboardDescriptor;

    /**
     * This property contains the IDashboard object that is persisted on the backend and that is used
     * to derive the rest of the dashboard state in the component.
     *
     * The persisted dashboard is updated only during the initial load or during SaveDashboard or
     * SaveAsDashboard command processing (which essentially flush the current dashboard state to backend)
     */
    persistedDashboard?: IDashboard;
}

export const metaInitialState: DashboardMetaState = {
    descriptor: EmptyDashboardDescriptor,
    persistedDashboard: undefined,
};
