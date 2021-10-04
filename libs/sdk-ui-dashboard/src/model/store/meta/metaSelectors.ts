// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { idRef, uriRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import { DashboardState } from "../types";

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
