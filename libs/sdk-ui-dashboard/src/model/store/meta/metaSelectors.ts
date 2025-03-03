// (C) 2021-2025 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import {
    idRef,
    uriRef,
    IFilterContextDefinition,
    isTempFilterContext,
    IAccessControlAware,
    isDashboardAttributeFilter,
    IDashboardDefinition,
    IDashboardObjectIdentity,
    IDashboard,
    UriRef,
    IFilterContext,
    ITempFilterContext,
    ObjRef,
    IdentifierRef,
    ShareStatus,
    IDashboardWidget,
    IDashboardDateFilterConfig,
    isDashboardDateFilterWithDimension,
    isDashboardCommonDateFilter,
} from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import { DashboardSelector, DashboardState } from "../types.js";
import isUndefined from "lodash/isUndefined.js";
import { selectBasicLayout } from "../layout/layoutSelectors.js";
import {
    selectFilterContextAttributeFilters,
    selectFilterContextDateFilter,
    selectFilterContextDefinition,
    selectFilterContextDraggableFilters,
    selectFilterContextIdentity,
} from "../filterContext/filterContextSelectors.js";
import { isDashboardLayoutEmpty } from "@gooddata/sdk-backend-spi";
import isEqual from "lodash/isEqual.js";
import { selectDateFilterConfigOverrides } from "../dateFilterConfig/dateFilterConfigSelectors.js";
import { DashboardDescriptor } from "./metaState.js";
import { selectAttributeFilterConfigsOverrides } from "../attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectDateFilterConfigsOverrides } from "../dateFilterConfigs/dateFilterConfigsSelectors.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.meta,
);

/**
 * Selects dashboard's descriptor.
 *
 * @internal
 */
export const selectDashboardDescriptor: DashboardSelector<DashboardDescriptor> = createSelector(
    selectSelf,
    (state) => {
        invariant(state.descriptor, "attempting to access uninitialized meta state");

        return state.descriptor!;
    },
);

/**
 * Selects persisted IDashboard object - that is the IDashboard object that was used to initialize the rest
 * of the dashboard state of the dashboard component during the initial load of the dashboard.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 *
 * @internal
 */
export const selectPersistedDashboard: DashboardSelector<IDashboard | undefined> = createSelector(
    selectSelf,
    (state) => {
        return state.persistedDashboard ?? undefined;
    },
);

/**
 * Selects persisted IFilterContext/ITempFilterContext - that is the IFilterContext or ITempFilterContext that
 * was used to initialize the original filters of the dashboard component during the initial load of the
 * dashboard.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 */
export const selectPersistedDashboardFilterContext: DashboardSelector<
    IFilterContext | ITempFilterContext | undefined
> = createSelector(selectSelf, (state) => {
    return state.persistedDashboard?.filterContext ?? undefined;
});

export const selectPersistedDashboardFilterContextDateFilterConfig: DashboardSelector<
    IDashboardDateFilterConfig | undefined
> = createSelector(selectSelf, (state) => {
    return state.persistedDashboard?.dateFilterConfig ?? undefined;
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
export const selectPersistedDashboardFilterContextAsFilterContextDefinition: DashboardSelector<
    IFilterContextDefinition | undefined
> = createSelector(
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
export const selectDashboardRef: DashboardSelector<ObjRef | undefined> = createSelector(
    selectPersistedDashboard,
    (state) => {
        return state?.ref ?? undefined;
    },
);

/**
 * Selects identifier of the persisted dashboard object that backs and is rendered-by the dashboard component.
 *
 * @remarks
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 *
 * @public
 */
export const selectDashboardId: DashboardSelector<string | undefined> = createSelector(
    selectPersistedDashboard,
    (state) => {
        return state?.identifier ?? undefined;
    },
);

/**
 * Selects URI of the persisted dashboard object that backs and is rendered-by the dashboard component.
 *
 * @remarks
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 *
 * @public
 */
export const selectDashboardUri: DashboardSelector<string | undefined> = createSelector(
    selectPersistedDashboard,
    (state) => {
        return state?.uri ?? undefined;
    },
);

/**
 * Selects idRef of the persisted dashboard object that backs and is rendered-by the dashboard component.
 *
 * @remarks
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 *
 * @public
 */
export const selectDashboardIdRef: DashboardSelector<IdentifierRef | undefined> = createSelector(
    selectDashboardId,
    (id) => {
        return id ? idRef(id, "analyticalDashboard") : undefined;
    },
);

/**
 * Selects uriRef of the persisted dashboard object that backs and is rendered-by the dashboard component.
 *
 * @remarks
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 *
 * @public
 */
export const selectDashboardUriRef: DashboardSelector<UriRef | undefined> = createSelector(
    selectDashboardUri,
    (uri) => {
        return uri ? uriRef(uri) : undefined;
    },
);

/**
 * Selects a boolean indication if dashboard is new
 *
 * @internal
 */
export const selectIsNewDashboard: DashboardSelector<boolean> = createSelector(
    selectDashboardRef,
    isUndefined,
);

/**
 * Selects a boolean indication if dashboard is dynamically filled, that mean that the dashboard is filled
 * with widgets and layout dynamically from initial content
 *
 * @internal
 */
export const selectIsNewDashboardWithContent: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => {
        return !state.persistedDashboard && (state.initialContent ?? false);
    },
);

//
//
//

/**
 * Selects current dashboard title.
 *
 * @public
 */
export const selectDashboardTitle: DashboardSelector<string> = createSelector(
    selectDashboardDescriptor,
    (state) => {
        return state.title;
    },
);

/**
 * Selects current dashboard description.
 *
 * @public
 */
export const selectDashboardDescription: DashboardSelector<string> = createSelector(
    selectDashboardDescriptor,
    (state) => {
        return state.description;
    },
);

/**
 * Selects dashboard tags.
 *
 * @public
 */
export const selectDashboardTags: DashboardSelector<string[]> = createSelector(
    selectDashboardDescriptor,
    (state) => {
        return state.tags ?? [];
    },
);

/**
 * Selects dashboard share status.
 *
 * @alpha
 */
export const selectDashboardShareStatus: DashboardSelector<ShareStatus> = createSelector(
    selectDashboardDescriptor,
    (state) => {
        return state.shareStatus;
    },
);

/**
 * Returns whether dashboard is private.
 *
 * @alpha
 */
export const selectIsDashboardPrivate: DashboardSelector<boolean> = createSelector(
    selectDashboardShareStatus,
    (status) => {
        return status === "private";
    },
);

/**
 * Selects dashboard lock status.
 *
 * @alpha
 */
export const selectDashboardLockStatus: DashboardSelector<boolean> = createSelector(
    selectDashboardDescriptor,
    (state) => {
        return state.isLocked ?? false;
    },
);

/**
 * Selects complete dashboard share info.
 *
 * @alpha
 */
export const selectDashboardShareInfo: DashboardSelector<IAccessControlAware> = createSelector(
    selectDashboardDescriptor,
    ({ shareStatus, isLocked }): IAccessControlAware => ({
        shareStatus,
        isLocked,
    }),
);

/**
 * Selects whether dashboard cross filtering is disabled.
 *
 * @public
 */
export const selectDisableDashboardCrossFiltering: DashboardSelector<boolean> = createSelector(
    selectDashboardDescriptor,
    (state) => {
        return state.disableCrossFiltering ?? false;
    },
);

/**
 * Selects whether user filter reset is disabled.
 *
 * @public
 */
export const selectDisableDashboardUserFilterReset: DashboardSelector<boolean> = createSelector(
    selectDashboardDescriptor,
    (state) => {
        return state.disableUserFilterReset ?? false;
    },
);

/**
 * Selects whether user filter save is disabled.
 *
 * @public
 */
export const selectDisableDashboardUserFilterSave: DashboardSelector<boolean> = createSelector(
    selectDashboardDescriptor,
    (state) => {
        return state.disableUserFilterSave ?? false;
    },
);

/**
 * Selects whether filter views are disabled.
 *
 * @public
 */
export const selectDisableFilterViews: DashboardSelector<boolean> = createSelector(
    selectDashboardDescriptor,
    (state) => {
        return state.disableFilterViews ?? false;
    },
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
        return (persistedFilters ?? []).find(isDashboardCommonDateFilter);
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
 * Selects persisted draggable filters (date filters with dimension and attribute filters) - that is the filters that were used to initialize
 * the original filters of the dashboard component during the initial load of the dashboard.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 */
const selectPersistedDashboardFilterContextDraggableFilters = createSelector(
    selectPersistedDashboardFilterContextFilters,
    (persistedFilters) => {
        return (persistedFilters ?? []).filter(
            (f) => isDashboardDateFilterWithDimension(f) || isDashboardAttributeFilter(f),
        );
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
 * Selects persisted "disableCrossFiltering", the value that was used to initialize the rest
 * of the dashboard state of the dashboard component during the initial load of the dashboard.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 */
const selectPersistedDashboardDisableCrossFiltering = createSelector(selectSelf, (state) => {
    return state.persistedDashboard?.disableCrossFiltering;
});

/**
 * Selects persisted "disableUserFilterReset", the value that was used to initialize the rest
 * of the dashboard state of the dashboard component during the initial load of the dashboard.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 */
const selectPersistedDashboardDisableUserFilterReset = createSelector(selectSelf, (state) => {
    return state.persistedDashboard?.disableUserFilterReset;
});

/**
 * Selects persisted "disableUserFilterSave", the value that was used to initialize the rest
 * of the dashboard state of the dashboard component during the initial load of the dashboard.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 */
const selectPersistedDashboardDisableUserFilterSave = createSelector(selectSelf, (state) => {
    return state.persistedDashboard?.disableUserFilterSave;
});

/**
 * Selects persisted "disable filter views", the value that was used to initialize the rest
 * of the dashboard state of the dashboard component during the initial load of the dashboard.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 */
const selectPersistedDashboardDisableFilterViews = createSelector(selectSelf, (state) => {
    return state.persistedDashboard?.disableFilterViews;
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
 * Selects persisted attribute filter configs - that is the attribute filter configs array object that was used to initialize the rest
 * of the dashboard state of the dashboard component during the initial load of the dashboard.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 */
const selectPersistedDashboardAttributeFilterConfigs = createSelector(selectSelf, (state) => {
    return state.persistedDashboard?.attributeFilterConfigs || [];
});

/**
 * Selects a boolean indication if he dashboard has any changes to the dashboard filter compared to the persisted version (if any)
 *
 */
export const selectIsAttributeFilterConfigsChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardAttributeFilterConfigs,
    selectAttributeFilterConfigsOverrides,
    (persistedAttributeFilterConfigs, currentAttributeFilterConfigs) => {
        return !isEqual(persistedAttributeFilterConfigs, currentAttributeFilterConfigs);
    },
);

/**
 * Selects persisted attribute filter configs - that is the attribute filter configs array object that was used to initialize the rest
 * of the dashboard state of the dashboard component during the initial load of the dashboard.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 */
const selectPersistedDashboardDateFilterConfigs = createSelector(selectSelf, (state) => {
    return state.persistedDashboard?.dateFilterConfigs || [];
});

/**
 * Selects a boolean indication if the dashboard has any changes to the dashboard date filter configs compared to the persisted version (if any)
 *
 */
export const selectIsDateFilterConfigsChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardDateFilterConfigs,
    selectDateFilterConfigsOverrides,
    (persistedDateFilterConfigs, currentDateFilterConfigs) => {
        return !isEqual(persistedDateFilterConfigs, currentDateFilterConfigs);
    },
);

/**
 * Selects a boolean indication if the dashboard has any changes to the dashboard filter compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsDateFilterChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardFilterContextDateFilter,
    selectFilterContextDateFilter,
    (persistedDateFilter, currentDateFilter) => {
        return !isEqual(persistedDateFilter, currentDateFilter);
    },
);

export const selectIsDateFilterConfigChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardFilterContextDateFilterConfig,
    selectDateFilterConfigOverrides,
    (persistedDateFilterConfig, currentDateFilterConfig) => {
        return !isEqual(persistedDateFilterConfig, currentDateFilterConfig);
    },
);

/**
 * Selects a boolean indication if the dashboard has any changes to the attribute filters compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsAttributeFiltersChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardFilterContextAttributeFilters,
    selectFilterContextAttributeFilters,
    (persistedAttributeFilters, currentAttributeFilters) => {
        return !isEqual(persistedAttributeFilters, currentAttributeFilters);
    },
);

/**
 * Selects a boolean indication if the dashboard has any changes to the date filters with dimension compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsOtherFiltersChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardFilterContextDraggableFilters,
    selectFilterContextDraggableFilters,
    (persistedFilters, currentFilters) => {
        return !isEqual(persistedFilters, currentFilters);
    },
);

/**
 * Selects a boolean indication if the dashboard has any changes to any of the filters compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsFiltersChanged: DashboardSelector<boolean> = createSelector(
    selectIsDateFilterChanged,
    selectIsOtherFiltersChanged,
    selectIsAttributeFilterConfigsChanged,
    selectIsDateFilterConfigsChanged,
    (
        isCommonDateFilterChanged,
        isOtherFiltersChanged,
        isAttributeFilterConfigsChanged,
        isDateFilterConfigsChanged,
    ) => {
        return (
            isCommonDateFilterChanged ||
            isOtherFiltersChanged ||
            isAttributeFilterConfigsChanged ||
            isDateFilterConfigsChanged
        );
    },
);

/**
 * Selects a boolean indication if the dashboard has any changes to the cross filtering compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsDisableCrossFilteringChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardDisableCrossFiltering,
    selectDisableDashboardCrossFiltering,
    (persistedDisableCrossFiltering = false, currentDisableCrossFiltering) => {
        return persistedDisableCrossFiltering !== currentDisableCrossFiltering;
    },
);

/**
 * Selects a boolean indication if the dashboard has any changes to the user filter reset compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsDisableUserFilterResetChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardDisableUserFilterReset,
    selectDisableDashboardUserFilterReset,
    (persistedDisableUserFilterReset = false, currentDisableUserFilterReset) => {
        return persistedDisableUserFilterReset !== currentDisableUserFilterReset;
    },
);

/**
 * Selects a boolean indication if the dashboard has any changes to the cross filtering compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsDisableUserFilterSaveChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardDisableUserFilterSave,
    selectDisableDashboardUserFilterSave,
    (persistedDisabledUserFilterSave = false, currentDisableUserFilterSave) => {
        return persistedDisabledUserFilterSave !== currentDisableUserFilterSave;
    },
);

/**
 * Selects a boolean indication if the dashboard has any changes to the filter views toggle compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsDisableFilterViewsChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardDisableFilterViews,
    selectDisableFilterViews,
    (persistedDisableFilterViews = false, currentDisableFilterViews) => {
        return persistedDisableFilterViews !== currentDisableFilterViews;
    },
);

/**
 * Selects a boolean indication if he dashboard has any changes to the title compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsTitleChanged: DashboardSelector<boolean> = createSelector(
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
export const selectIsLayoutChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardLayout,
    selectBasicLayout,
    (persistedLayout, currentLayout) => {
        return !isEqual(currentLayout, persistedLayout);
    },
);

/**
 * Selects a boolean indication if he dashboard has any changes compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsDashboardDirty: DashboardSelector<boolean> = createSelector(
    selectIsNewDashboard,
    selectBasicLayout,
    selectIsFiltersChanged,
    selectIsTitleChanged,
    selectIsLayoutChanged,
    selectIsDateFilterConfigChanged,
    selectIsDisableCrossFilteringChanged,
    selectIsDisableUserFilterResetChanged,
    selectIsDisableUserFilterSaveChanged,
    selectIsDisableFilterViewsChanged,
    (
        isNew,
        layout,
        isFiltersChanged,
        isTitleChanged,
        isLayoutChanged,
        isDateFilterConfigChanged,
        isDisableCrossFilteringChanged,
        isDisableUserFilterResetChanged,
        isDisableUserFilterSaveChanged,
        isDisableFilterViewsChanged,
    ) => {
        if (isNew) {
            return !isDashboardLayoutEmpty(layout);
        }

        return [
            isFiltersChanged,
            isTitleChanged,
            isLayoutChanged,
            isDateFilterConfigChanged,
            isDisableCrossFilteringChanged,
            isDisableUserFilterResetChanged,
            isDisableUserFilterSaveChanged,
            isDisableFilterViewsChanged,
        ].some(Boolean);
    },
);

/**
 * @internal
 */
export const selectDashboardWorkingDefinition: DashboardSelector<IDashboardDefinition<IDashboardWidget>> =
    createSelector(
        selectPersistedDashboard,
        selectDashboardDescriptor,
        selectFilterContextDefinition,
        selectFilterContextIdentity,
        selectBasicLayout,
        selectDateFilterConfigOverrides,
        (
            persistedDashboard,
            dashboardDescriptor,
            filterContextDefinition,
            filterContextIdentity,
            layout,
            dateFilterConfig,
        ): IDashboardDefinition => {
            const dashboardIdentity: Partial<IDashboardObjectIdentity> = {
                ref: persistedDashboard?.ref,
                uri: persistedDashboard?.uri,
                identifier: persistedDashboard?.identifier,
            };

            const pluginsProp = persistedDashboard?.plugins ? { plugins: persistedDashboard.plugins } : {};

            return {
                type: "IDashboard",
                ...dashboardDescriptor,
                ...dashboardIdentity,
                filterContext: {
                    ...filterContextIdentity,
                    ...filterContextDefinition,
                },
                layout,
                dateFilterConfig,
                ...pluginsProp,
            };
        },
    );
