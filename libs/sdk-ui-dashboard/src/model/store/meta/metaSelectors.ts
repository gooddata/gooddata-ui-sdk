// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { idRef, uriRef } from "@gooddata/sdk-model";
import {
    IAccessControlAware,
    IFilterContextDefinition,
    isTempFilterContext,
} from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";
import { DashboardState } from "../types";
import { DashboardDescriptor } from "./metaState";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.meta,
);

/**
 * Selects dashboard's descriptor.
 *
 * @internal
 */
export const selectDashboardDescriptor = createSelector(selectSelf, (state) => {
    invariant(state.descriptor, "attempting to access uninitialized meta state");

    return state.descriptor!;
});

/**
 * Selects persisted IDashboard object - that is the IDashboard object that was used to initialize the rest
 * of the dashboard state of the dashboard component during the initial load of the dashboard.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 *
 * @internal
 */
export const selectPersistedDashboard = createSelector(selectSelf, (state) => {
    return state.persistedDashboard;
});

/**
 * Selects persisted IFilterContext/ITempFilterContext - that is the IFilterContext or ITempFilterContext that
 * was used to initialize the original filters of the dashboard component during the initial load of the
 * dashboard.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 */
export const selectPersistedDashboardFilterContext = createSelector(selectSelf, (state) => {
    return state.persistedDashboard?.filterContext;
});

/**
 * Selects persisted IFilterContextDefinition - that is the IFilterContext or ITempFilterContext that
 * was used to initialize the original filters of the dashboard component during the initial load of the
 * dashboard but removes ref, uri and identifier, effectively creating a clone of the stored value
 * that can be used independently.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 */
export const selectPersistedDashboardFilterContextAsFilterContextDefinition = createSelector(
    selectPersistedDashboardFilterContext,
    (filterContext): IFilterContextDefinition | undefined => {
        if (!filterContext) {
            return undefined;
        }

        if (isTempFilterContext(filterContext)) {
            const { ref: _, uri: __, ...definition } = filterContext;
            return {
                ...definition,
                title: "filterContext",
                description: "",
            };
        } else {
            const { identifier: _, ref: __, uri: ___, ...definition } = filterContext;
            return definition;
        }
    },
);

/**
 * Selects ref of the persisted dashboard object that backs and is rendered-by the dashboard component.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 *
 * @alpha
 */
export const selectDashboardRef = createSelector(selectPersistedDashboard, (state) => {
    return state?.ref;
});

/**
 * Selects identifier of the persisted dashboard object that backs and is rendered-by the dashboard component.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 *
 * @alpha
 */
export const selectDashboardId = createSelector(selectPersistedDashboard, (state) => {
    return state?.identifier;
});

/**
 * Selects URI of the persisted dashboard object that backs and is rendered-by the dashboard component.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 *
 * @alpha
 */
export const selectDashboardUri = createSelector(selectPersistedDashboard, (state) => {
    return state?.uri;
});

/**
 * Selects idRef of the persisted dashboard object that backs and is rendered-by the dashboard component.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 *
 * @alpha
 */
export const selectDashboardIdRef = createSelector(selectDashboardId, (id) => {
    return id ? idRef(id, "analyticalDashboard") : undefined;
});

/**
 * Selects uriRef of the persisted dashboard object that backs and is rendered-by the dashboard component.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 *
 * @alpha
 */
export const selectDashboardUriRef = createSelector(selectDashboardUri, (uri) => {
    return uri ? uriRef(uri) : undefined;
});

//
//
//

/**
 * Selects current dashboard title.
 *
 * @alpha
 */
export const selectDashboardTitle = createSelector(selectDashboardDescriptor, (state) => {
    return state.title;
});

/**
 * Selects current dashboard description.
 *
 * @alpha
 */
export const selectDashboardDescription = createSelector(selectDashboardDescriptor, (state) => {
    return state.description;
});

/**
 * Selects dashboard tags.
 *
 * @alpha
 */
export const selectDashboardTags = createSelector(selectDashboardDescriptor, (state) => {
    return state.tags;
});

/**
 * Selects dashboard share status.
 *
 * @alpha
 */
export const selectDashboardShareStatus = createSelector(selectDashboardDescriptor, (state) => {
    return state.shareStatus;
});

/**
 * Selects dashboard lock status.
 *
 * @alpha
 */
export const selectDashboardLockStatus = createSelector(selectDashboardDescriptor, (state) => {
    return state.isLocked;
});

/**
 * Selects complete dashboard share info.
 *
 * @alpha
 */
export const selectDashboardShareInfo = createSelector<
    DashboardState,
    DashboardDescriptor,
    IAccessControlAware
>(selectDashboardDescriptor, ({ shareStatus, isLocked }) => ({
    shareStatus,
    isLocked,
}));
