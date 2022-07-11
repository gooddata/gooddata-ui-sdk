// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import {
    idRef,
    uriRef,
    IFilterContextDefinition,
    isTempFilterContext,
    IAccessControlAware,
    isDashboardDateFilter,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import { DashboardState } from "../types";
import isUndefined from "lodash/isUndefined";
import { selectLayout } from "../layout/layoutSelectors";
import {
    selectFilterContextAttributeFilters,
    selectFilterContextDateFilter,
} from "../filterContext/filterContextSelectors";
import { isDashboardLayoutEmpty } from "@gooddata/sdk-backend-spi";
import isEqual from "lodash/isEqual";

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
    return state.persistedDashboard ?? undefined;
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
    return state.persistedDashboard?.filterContext ?? undefined;
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
 * @remarks
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 *
 * @public
 */
export const selectDashboardRef = createSelector(selectPersistedDashboard, (state) => {
    return state?.ref ?? undefined;
});

/**
 * Selects identifier of the persisted dashboard object that backs and is rendered-by the dashboard component.
 *
 * @remarks
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 *
 * @public
 */
export const selectDashboardId = createSelector(selectPersistedDashboard, (state) => {
    return state?.identifier ?? undefined;
});

/**
 * Selects URI of the persisted dashboard object that backs and is rendered-by the dashboard component.
 *
 * @remarks
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 *
 * @public
 */
export const selectDashboardUri = createSelector(selectPersistedDashboard, (state) => {
    return state?.uri ?? undefined;
});

/**
 * Selects idRef of the persisted dashboard object that backs and is rendered-by the dashboard component.
 *
 * @remarks
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 *
 * @public
 */
export const selectDashboardIdRef = createSelector(selectDashboardId, (id) => {
    return id ? idRef(id, "analyticalDashboard") : undefined;
});

/**
 * Selects uriRef of the persisted dashboard object that backs and is rendered-by the dashboard component.
 *
 * @remarks
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 *
 * @public
 */
export const selectDashboardUriRef = createSelector(selectDashboardUri, (uri) => {
    return uri ? uriRef(uri) : undefined;
});

/**
 * Selects a boolean indication if dashboard is new
 *
 * @internal
 */
export const selectIsNewDashboard = createSelector(selectDashboardRef, isUndefined);

//
//
//

/**
 * Selects current dashboard title.
 *
 * @public
 */
export const selectDashboardTitle = createSelector(selectDashboardDescriptor, (state) => {
    return state.title;
});

/**
 * Selects current dashboard description.
 *
 * @public
 */
export const selectDashboardDescription = createSelector(selectDashboardDescriptor, (state) => {
    return state.description;
});

/**
 * Selects dashboard tags.
 *
 * @public
 */
export const selectDashboardTags = createSelector(selectDashboardDescriptor, (state) => {
    return state.tags ?? [];
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
 * Returns whether dashboard is private.
 *
 * @alpha
 */
export const selectIsDashboardPrivate = createSelector(selectDashboardShareStatus, (status) => {
    return status === "private";
});

/**
 * Selects dashboard lock status.
 *
 * @alpha
 */
export const selectDashboardLockStatus = createSelector(selectDashboardDescriptor, (state) => {
    return state.isLocked ?? false;
});

/**
 * Selects complete dashboard share info.
 *
 * @alpha
 */
export const selectDashboardShareInfo = createSelector(
    selectDashboardDescriptor,
    ({ shareStatus, isLocked }): IAccessControlAware => ({
        shareStatus,
        isLocked,
    }),
);

//
//
//

/**
 * Selects persisted FilterContextItems - that is the FilterContextItems that were used to initialize
 * the original filters of the dashboard component during the initial load of the dashboard.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 */
const selectPersistedDashboardFilterContextFilters = createSelector(
    selectPersistedDashboardFilterContext,
    (persistedFilterContext) => {
        return persistedFilterContext?.filters;
    },
);

/**
 * Selects persisted IDashboardDateFilter - that is the IDashboardDateFilter that were used to initialize
 * the original filters of the dashboard component during the initial load of the dashboard.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 */
const selectPersistedDashboardFilterContextDateFilter = createSelector(
    selectPersistedDashboardFilterContextFilters,
    (persistedFilters) => {
        return (persistedFilters ?? []).find(isDashboardDateFilter);
    },
);

/**
 * Selects persisted IDashboardAttributeFilters - that is the IDashboardAttributeFilters that were used to initialize
 * the original filters of the dashboard component during the initial load of the dashboard.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 */
const selectPersistedDashboardFilterContextAttributeFilters = createSelector(
    selectPersistedDashboardFilterContextFilters,
    (persistedFilters) => {
        return (persistedFilters ?? []).filter(isDashboardAttributeFilter);
    },
);

/**
 * Selects persisted title - that is the title that was used to initialize the rest
 * of the dashboard state of the dashboard component during the initial load of the dashboard.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 */
const selectPersistedDashboardTitle = createSelector(selectSelf, (state) => {
    return state.persistedDashboard?.title;
});

/**
 * Selects persisted layout - that is the IDashboardLayout object that was used to initialize the rest
 * of the dashboard state of the dashboard component during the initial load of the dashboard.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 */
const selectPersistedDashboardLayout = createSelector(selectSelf, (state) => {
    return state.persistedDashboard?.layout;
});

/**
 * Selects a boolean indication if he dashboard has any changes to the dashboard filter compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsDateFilterChanged = createSelector(
    selectPersistedDashboardFilterContextDateFilter,
    selectFilterContextDateFilter,
    (persistedDateFilter, currentDateFilter) => {
        return !isEqual(persistedDateFilter, currentDateFilter);
    },
);

/**
 * Selects a boolean indication if he dashboard has any changes to the attribute filters compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsAttributeFiltersChanged = createSelector(
    selectPersistedDashboardFilterContextAttributeFilters,
    selectFilterContextAttributeFilters,
    (persistedAttributeFilters, currentAttributeFilters) => {
        return !isEqual(persistedAttributeFilters, currentAttributeFilters);
    },
);

/**
 * Selects a boolean indication if he dashboard has any changes to the any of the filters compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsFiltersChanged = createSelector(
    selectIsDateFilterChanged,
    selectIsAttributeFiltersChanged,
    (isDateFilterChanged, isAttributeFiltersChanged) => {
        return isDateFilterChanged || isAttributeFiltersChanged;
    },
);

/**
 * Selects a boolean indication if he dashboard has any changes to the title compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsTitleChanged = createSelector(
    selectPersistedDashboardTitle,
    selectDashboardTitle,
    (persistedTitle, currentTitle) => {
        return currentTitle !== persistedTitle;
    },
);

/**
 * Selects a boolean indication if he dashboard has any changes to the layout compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsLayoutChanged = createSelector(
    selectPersistedDashboardLayout,
    selectLayout,
    (persistedLayout, currentLayout) => {
        return !isEqual(currentLayout, persistedLayout);
    },
);

/**
 * Selects a boolean indication if he dashboard has any changes compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsDashboardDirty = createSelector(
    selectIsNewDashboard,
    selectLayout,
    selectIsFiltersChanged,
    selectIsTitleChanged,
    selectIsLayoutChanged,
    (isNew, layout, isFiltersChanged, isTitleChanged, isLayoutChanged) => {
        if (isNew) {
            return !isDashboardLayoutEmpty(layout);
        }

        return [isFiltersChanged, isTitleChanged, isLayoutChanged].some(Boolean);
    },
);
