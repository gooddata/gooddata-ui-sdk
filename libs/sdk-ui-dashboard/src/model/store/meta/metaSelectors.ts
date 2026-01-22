// (C) 2021-2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { isEqual } from "lodash-es";
import { invariant } from "ts-invariant";

import { isDashboardLayoutEmpty } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IAccessControlAware,
    type IDashboard,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilter,
    type IDashboardDateFilterConfig,
    type IDashboardDateFilterConfigItem,
    type IDashboardDefinition,
    type IDashboardLayout,
    type IDashboardObjectIdentity,
    type IDashboardTab,
    type IDashboardWidget,
    type IFilterContext,
    type IFilterContextDefinition,
    type ITempFilterContext,
    type IdentifierRef,
    type ObjRef,
    type ShareStatus,
    type UriRef,
    idRef,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilterWithDimension,
    isTempFilterContext,
    uriRef,
} from "@gooddata/sdk-model";

import { type DashboardDescriptor } from "./metaState.js";
import { selectAttributeFilterConfigsOverridesByTab } from "../tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import {
    selectDateFilterConfigOverrides,
    selectDateFilterConfigOverridesByTab,
} from "../tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import { selectDateFilterConfigsOverridesByTab } from "../tabs/dateFilterConfigs/dateFilterConfigsSelectors.js";
import {
    selectFilterContextDefinition,
    selectFilterContextDefinitionsByTab,
    selectFilterContextIdentity,
} from "../tabs/filterContext/filterContextSelectors.js";
import { selectBasicLayout, selectBasicLayoutByTab } from "../tabs/layout/layoutSelectors.js";
import { selectActiveTabLocalIdentifier, selectTabs } from "../tabs/tabsSelectors.js";
import { DEFAULT_TAB_ID, type ITabState } from "../tabs/tabsState.js";
import { type DashboardSelector, type DashboardState } from "../types.js";

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

        return state.descriptor;
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
 * Snapshot of persisted dashboard tab data relevant for dirty checking.
 */
const toFilterContextDefinition = (
    filterContext?: IFilterContext | ITempFilterContext,
): IFilterContextDefinition | undefined => {
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
    }

    const { identifier: _, ref: __, uri: ___, ...definition } = filterContext;
    return definition;
};

export const selectPersistedDashboardTabs = createSelector(selectSelf, (state): IDashboardTab[] => {
    const persistedDashboard = state.persistedDashboard;

    if (!persistedDashboard) {
        return [];
    }

    if (persistedDashboard.tabs && persistedDashboard.tabs.length > 0) {
        return persistedDashboard.tabs;
    }

    return [
        {
            localIdentifier: DEFAULT_TAB_ID,
            title: "",
            filterContext: persistedDashboard.filterContext,
            attributeFilterConfigs: persistedDashboard.attributeFilterConfigs,
            dateFilterConfig: persistedDashboard.dateFilterConfig,
            dateFilterConfigs: persistedDashboard.dateFilterConfigs,
            layout: persistedDashboard.layout,
        },
    ];
});

const selectPersistedDashboardActiveTabId = createSelector(
    selectSelf,
    selectPersistedDashboardTabs,
    selectActiveTabLocalIdentifier,
    (state, tabs, activeTabId) => {
        const persistedDashboard = state.persistedDashboard;
        if (!persistedDashboard) {
            return undefined;
        }

        if (tabs && tabs.length > 0) {
            const activeTab = activeTabId ? tabs.find((tab) => tab.localIdentifier === activeTabId) : tabs[0];
            return activeTab?.localIdentifier ?? DEFAULT_TAB_ID;
        }

        return DEFAULT_TAB_ID;
    },
);

/**
 * Returns raw persisted filter contexts keyed by tab identifier.
 *
 * @internal
 */
export const selectPersistedDashboardFilterContextsByTab: DashboardSelector<
    Record<string, IFilterContext | ITempFilterContext | undefined>
> = createSelector(selectPersistedDashboardTabs, (tabSnapshots) => {
    return tabSnapshots.reduce<Record<string, IFilterContext | ITempFilterContext | undefined>>(
        (acc, snapshot) => {
            acc[snapshot.localIdentifier] = snapshot.filterContext;
            return acc;
        },
        {},
    );
});

/**
 * Returns persisted filter context definitions keyed by tab identifier.
 *
 * @internal
 */
export const selectPersistedDashboardFilterContextDefinitionsByTab: DashboardSelector<
    Record<string, IFilterContextDefinition | undefined>
> = createSelector(selectPersistedDashboardTabs, (tabSnapshots) => {
    return tabSnapshots.reduce<Record<string, IFilterContextDefinition | undefined>>((acc, snapshot) => {
        acc[snapshot.localIdentifier] = toFilterContextDefinition(snapshot.filterContext);
        return acc;
    }, {});
});

/**
 * Returns persisted attribute filter configs keyed by tab identifier.
 *
 * @internal
 */
export const selectPersistedDashboardAttributeFilterConfigsByTab: DashboardSelector<
    Record<string, IDashboardAttributeFilterConfig[]>
> = createSelector(selectPersistedDashboardTabs, (tabSnapshots) => {
    return tabSnapshots.reduce<Record<string, IDashboardAttributeFilterConfig[]>>((acc, snapshot) => {
        acc[snapshot.localIdentifier] = snapshot.attributeFilterConfigs ?? [];
        return acc;
    }, {});
});

/**
 * Returns persisted date filter config overrides keyed by tab identifier.
 *
 * @internal
 */
export const selectPersistedDashboardDateFilterConfigByTab: DashboardSelector<
    Record<string, IDashboardDateFilterConfig | undefined>
> = createSelector(selectPersistedDashboardTabs, (tabSnapshots) => {
    return tabSnapshots.reduce<Record<string, IDashboardDateFilterConfig | undefined>>((acc, snapshot) => {
        acc[snapshot.localIdentifier] = snapshot.dateFilterConfig ?? undefined;
        return acc;
    }, {});
});

/**
 * Returns persisted date filter configs keyed by tab identifier.
 *
 * @internal
 */
export const selectPersistedDashboardDateFilterConfigsByTab: DashboardSelector<
    Record<string, IDashboardDateFilterConfigItem[]>
> = createSelector(selectPersistedDashboardTabs, (tabSnapshots) => {
    return tabSnapshots.reduce<Record<string, IDashboardDateFilterConfigItem[]>>((acc, snapshot) => {
        acc[snapshot.localIdentifier] = snapshot.dateFilterConfigs ?? [];
        return acc;
    }, {});
});

const selectPersistedDashboardFilterContextFiltersByTab: DashboardSelector<
    Record<string, FilterContextItem[]>
> = createSelector(selectPersistedDashboardFilterContextDefinitionsByTab, (definitionsByTab) => {
    return Object.entries(definitionsByTab).reduce<Record<string, FilterContextItem[]>>(
        (acc, [identifier, definition]) => {
            acc[identifier] = definition?.filters ?? [];
            return acc;
        },
        {},
    );
});

const selectWorkingFilterContextFiltersByTab: DashboardSelector<Record<string, FilterContextItem[]>> =
    createSelector(selectFilterContextDefinitionsByTab, (definitionsByTab) => {
        return Object.entries(definitionsByTab).reduce<Record<string, FilterContextItem[]>>(
            (acc, [identifier, definition]) => {
                acc[identifier] = definition?.filters ?? [];
                return acc;
            },
            {},
        );
    });

const collectTabIdentifiers = (...maps: Array<Record<string, unknown>>): string[] => {
    const identifiers = new Set<string>();
    maps.forEach((map) => {
        Object.keys(map ?? {}).forEach((identifier) => identifiers.add(identifier));
    });

    return Array.from(identifiers);
};

const selectPersistedDashboardAttributeFiltersByTab: DashboardSelector<
    Record<string, IDashboardAttributeFilter[]>
> = createSelector(selectPersistedDashboardFilterContextFiltersByTab, (filtersByTab) => {
    return Object.entries(filtersByTab).reduce<Record<string, IDashboardAttributeFilter[]>>(
        (acc, [identifier, filters]) => {
            acc[identifier] = filters.filter(isDashboardAttributeFilter);
            return acc;
        },
        {},
    );
});

const selectWorkingAttributeFiltersByTab: DashboardSelector<Record<string, IDashboardAttributeFilter[]>> =
    createSelector(selectWorkingFilterContextFiltersByTab, (filtersByTab) => {
        return Object.entries(filtersByTab).reduce<Record<string, IDashboardAttributeFilter[]>>(
            (acc, [identifier, filters]) => {
                acc[identifier] = filters.filter(isDashboardAttributeFilter);
                return acc;
            },
            {},
        );
    });

const selectPersistedDashboardDraggableFiltersByTab: DashboardSelector<
    Record<string, Array<IDashboardDateFilter | IDashboardAttributeFilter>>
> = createSelector(selectPersistedDashboardFilterContextFiltersByTab, (filtersByTab) => {
    return Object.entries(filtersByTab).reduce<
        Record<string, Array<IDashboardDateFilter | IDashboardAttributeFilter>>
    >((acc, [identifier, filters]) => {
        acc[identifier] = filters.filter(
            (filter) => isDashboardDateFilterWithDimension(filter) || isDashboardAttributeFilter(filter),
        );
        return acc;
    }, {});
});

const selectWorkingDraggableFiltersByTab: DashboardSelector<
    Record<string, Array<IDashboardDateFilter | IDashboardAttributeFilter>>
> = createSelector(selectWorkingFilterContextFiltersByTab, (filtersByTab) => {
    return Object.entries(filtersByTab).reduce<
        Record<string, Array<IDashboardDateFilter | IDashboardAttributeFilter>>
    >((acc, [identifier, filters]) => {
        acc[identifier] = filters.filter(
            (filter) => isDashboardDateFilterWithDimension(filter) || isDashboardAttributeFilter(filter),
        );
        return acc;
    }, {});
});

/**
 * Selects persisted filter context for the active tab (legacy selector).
 */
export const selectPersistedDashboardFilterContext: DashboardSelector<
    IFilterContext | ITempFilterContext | undefined
> = createSelector(
    selectPersistedDashboardFilterContextsByTab,
    selectPersistedDashboardActiveTabId,
    (filterContextsByTab, activeTabId) => {
        if (!filterContextsByTab || Object.keys(filterContextsByTab).length === 0) {
            return undefined;
        }

        const resolvedActiveTabId = activeTabId ?? Object.keys(filterContextsByTab)[0];
        return (
            filterContextsByTab[resolvedActiveTabId] ??
            filterContextsByTab[Object.keys(filterContextsByTab)[0]]
        );
    },
);

/**
 * Selects persisted date filter config for the active tab (legacy selector).
 *
 * @internal
 */
export const selectPersistedDashboardFilterContextDateFilterConfig: DashboardSelector<
    IDashboardDateFilterConfig | undefined
> = createSelector(
    selectPersistedDashboardDateFilterConfigByTab,
    selectPersistedDashboardActiveTabId,
    (dateFilterConfigByTab, activeTabId) => {
        if (!dateFilterConfigByTab || Object.keys(dateFilterConfigByTab).length === 0) {
            return undefined;
        }

        const resolvedActiveTabId = activeTabId ?? Object.keys(dateFilterConfigByTab)[0];
        return (
            dateFilterConfigByTab[resolvedActiveTabId] ??
            dateFilterConfigByTab[Object.keys(dateFilterConfigByTab)[0]]
        );
    },
);

/**
 * Selects persisted filter context definition for the active tab (legacy selector).
 */
export const selectPersistedDashboardFilterContextAsFilterContextDefinition: DashboardSelector<
    IFilterContextDefinition | undefined
> = createSelector(
    selectPersistedDashboardFilterContextDefinitionsByTab,
    selectPersistedDashboardActiveTabId,
    (definitionsByTab, activeTabId) => {
        if (!definitionsByTab || Object.keys(definitionsByTab).length === 0) {
            return undefined;
        }

        const resolvedActiveTabId = activeTabId ?? Object.keys(definitionsByTab)[0];
        return definitionsByTab[resolvedActiveTabId] ?? definitionsByTab[Object.keys(definitionsByTab)[0]];
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
    (v) => v === undefined,
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
 * Selects whether dashboard kda is disabled.
 *
 * @public
 */
export const selectDisableDashboardKda: DashboardSelector<boolean> = createSelector(
    selectDashboardDescriptor,
    () => {
        //TODO: SHA Connect to dashboard config
        return false;
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

/**
 * Selects evaluation frequency.
 *
 * @public
 */
export const selectEvaluationFrequency: DashboardSelector<string | undefined> = createSelector(
    selectDashboardDescriptor,
    (state) => {
        return state.evaluationFrequency;
    },
);

//
//
//

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
 * Selects persisted "evaluation frequency", the value that was used to initialize the rest
 * of the dashboard state of the dashboard component during the initial load of the dashboard.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 */
const selectPersistedDashboardEvaluationFrequency = createSelector(selectSelf, (state) => {
    return state.persistedDashboard?.evaluationFrequency;
});

/**
 * Selects persisted layout by tab identifier - that is the IDashboardLayout object that was used to initialize the rest
 * of the dashboard state of the dashboard component during the initial load of the dashboard.
 *
 * Note that this may be undefined when the dashboard component works with a dashboard that has not yet
 * been persisted (typically newly created dashboard being edited).
 */
const selectPersistedDashboardLayoutByTab: DashboardSelector<
    Record<string, IDashboardLayout<IDashboardWidget> | undefined>
> = createSelector(selectPersistedDashboardTabs, (tabSnapshots) => {
    return tabSnapshots.reduce<Record<string, IDashboardLayout<IDashboardWidget> | undefined>>(
        (acc, snapshot) => {
            acc[snapshot.localIdentifier] = snapshot.layout ?? undefined;
            return acc;
        },
        {},
    );
});

/**
 * Selects a boolean indication if he dashboard has any changes to the dashboard filter compared to the persisted version (if any)
 *
 */
export const selectIsAttributeFilterConfigsChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardAttributeFilterConfigsByTab,
    selectAttributeFilterConfigsOverridesByTab,
    (persistedAttributeFilterConfigsByTab, currentAttributeFilterConfigsByTab) => {
        const tabIdentifiers = collectTabIdentifiers(
            persistedAttributeFilterConfigsByTab,
            currentAttributeFilterConfigsByTab,
        );

        return tabIdentifiers.some((tabId) => {
            const persistedConfigs = persistedAttributeFilterConfigsByTab[tabId] ?? [];
            const currentConfigs = currentAttributeFilterConfigsByTab[tabId] ?? [];

            return !isEqual(persistedConfigs, currentConfigs);
        });
    },
);

/**
 * Selects the date dataset to use for filtering metrics in section header rich text.
 *
 * @alpha
 */
export const selectSectionHeadersDateDataSet: DashboardSelector<ObjRef | undefined> = createSelector(
    selectDashboardDescriptor,
    (descriptor) => {
        return descriptor.sectionHeadersDateDataSet;
    },
);

/**
 * Selects persisted section headers date dataset - that is the value that was used to initialize
 * the dashboard state during the initial load of the dashboard.
 */
const selectPersistedDashboardSectionHeadersDateDataSet = createSelector(selectSelf, (state) => {
    return state.persistedDashboard?.sectionHeadersDateDataSet;
});

/**
 * Selects a boolean indication if the dashboard has any changes to the dashboard date filter configs compared to the persisted version (if any)
 *
 */
export const selectIsDateFilterConfigsChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardDateFilterConfigsByTab,
    selectDateFilterConfigsOverridesByTab,
    (persistedDateFilterConfigsByTab, currentDateFilterConfigsByTab) => {
        const tabIdentifiers = collectTabIdentifiers(
            persistedDateFilterConfigsByTab,
            currentDateFilterConfigsByTab,
        );

        return tabIdentifiers.some((tabId) => {
            const persistedConfigs = persistedDateFilterConfigsByTab[tabId] ?? [];
            const currentConfigs = currentDateFilterConfigsByTab[tabId] ?? [];

            return !isEqual(persistedConfigs, currentConfigs);
        });
    },
);

/**
 * Selects a boolean indication if the dashboard has any changes to the dashboard filter compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsDateFilterChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardFilterContextFiltersByTab,
    selectWorkingFilterContextFiltersByTab,
    (persistedFiltersByTab, workingFiltersByTab) => {
        const tabIdentifiers = collectTabIdentifiers(persistedFiltersByTab, workingFiltersByTab);

        return tabIdentifiers.some((tabId) => {
            const persistedFilters = persistedFiltersByTab[tabId] ?? [];
            const workingFilters = workingFiltersByTab[tabId] ?? [];
            const persistedDateFilter = persistedFilters.find(isDashboardCommonDateFilter);
            const workingDateFilter = workingFilters.find(isDashboardCommonDateFilter);

            return !isEqual(persistedDateFilter, workingDateFilter);
        });
    },
);

export const selectIsDateFilterConfigChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardDateFilterConfigByTab,
    selectDateFilterConfigOverridesByTab,
    (persistedDateFilterConfigByTab, currentDateFilterConfigByTab) => {
        const tabIdentifiers = collectTabIdentifiers(
            persistedDateFilterConfigByTab,
            currentDateFilterConfigByTab,
        );

        return tabIdentifiers.some((tabId) => {
            const persistedConfig = persistedDateFilterConfigByTab[tabId];
            const currentConfig = currentDateFilterConfigByTab[tabId];

            return !isEqual(persistedConfig, currentConfig);
        });
    },
);

/**
 * Selects a boolean indication if the dashboard has any changes to the attribute filters compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsAttributeFiltersChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardAttributeFiltersByTab,
    selectWorkingAttributeFiltersByTab,
    (persistedAttributeFiltersByTab, workingAttributeFiltersByTab) => {
        const tabIdentifiers = collectTabIdentifiers(
            persistedAttributeFiltersByTab,
            workingAttributeFiltersByTab,
        );

        return tabIdentifiers.some((tabId) => {
            const persistedFilters = persistedAttributeFiltersByTab[tabId] ?? [];
            const workingFilters = workingAttributeFiltersByTab[tabId] ?? [];

            return !isEqual(persistedFilters, workingFilters);
        });
    },
);

/**
 * Selects a boolean indication if the dashboard has any changes to the date filters with dimension compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsOtherFiltersChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardDraggableFiltersByTab,
    selectWorkingDraggableFiltersByTab,
    (persistedDraggableFiltersByTab, workingDraggableFiltersByTab) => {
        const tabIdentifiers = collectTabIdentifiers(
            persistedDraggableFiltersByTab,
            workingDraggableFiltersByTab,
        );

        return tabIdentifiers.some((tabId) => {
            const persistedFilters = persistedDraggableFiltersByTab[tabId] ?? [];
            const workingFilters = workingDraggableFiltersByTab[tabId] ?? [];

            return !isEqual(persistedFilters, workingFilters);
        });
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
 * Selects a boolean indication if the dashboard has any changes to the evaluation frequency compared to the persisted version (if any)
 *
 * @internal
 */
export const selectEvaluationFrequencyChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardEvaluationFrequency,
    selectEvaluationFrequency,
    (persistedEvaluationFrequency, currentEvaluationFrequency) => {
        return persistedEvaluationFrequency !== currentEvaluationFrequency;
    },
);

/**
 * Selects a boolean indication if the dashboard has any changes to the section headers date dataset compared to the persisted version (if any)
 *
 * @internal
 */
export const selectIsSectionHeadersDateDataSetChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardSectionHeadersDateDataSet,
    selectSectionHeadersDateDataSet,
    (persistedDateDataSet, currentDateDataSet) => {
        return !isEqual(persistedDateDataSet, currentDateDataSet);
    },
);

/**
 * Selects a boolean indication if the dashboard has any changes to the tabs compared to the persisted version (if any)
 * Compares only the tabs identifiers and titles.
 *
 */
const selectIsTabsChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardTabs,
    selectTabs,
    (persistedTabs, currentTabs) => {
        // Both have tabs - compare them
        // Normalize tabs for comparison - compare all common properties including filter configs
        // Layout is compared separately via selectIsLayoutChanged
        const normalizeTabsForComparison = (
            tabs: IDashboardTab<IDashboardWidget>[] | ITabState[] | undefined,
        ) => {
            if (!tabs || tabs.length === 0) {
                return [];
            }
            return tabs.map((tab) => {
                return {
                    localIdentifier: tab.localIdentifier,
                    title: tab.title,
                    // all other props are dirty checked separately
                };
            });
        };

        const normalizedPersistedTabs = normalizeTabsForComparison(persistedTabs);
        const normalizedCurrentTabs = normalizeTabsForComparison(currentTabs);

        // Compare normalized tabs arrays
        return !isEqual(normalizedPersistedTabs, normalizedCurrentTabs);
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
 * Note: This uses selectBasicLayoutByTab which filters out custom/plugin widgets to avoid false positives
 * when comparing layouts, as plugin widgets are client-side extensions that should not trigger dirty state.
 *
 * @internal
 */
export const selectIsLayoutChanged: DashboardSelector<boolean> = createSelector(
    selectPersistedDashboardLayoutByTab,
    selectBasicLayoutByTab,
    (persistedLayoutByTab, currentLayoutByTab) => {
        const tabIdentifiers = collectTabIdentifiers(persistedLayoutByTab, currentLayoutByTab);

        return tabIdentifiers.some((tabId) => {
            const persistedLayout = persistedLayoutByTab[tabId] ?? [];
            const currentLayout = currentLayoutByTab[tabId] ?? [];

            return !isEqual(persistedLayout, currentLayout);
        });
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
    selectEvaluationFrequencyChanged,
    selectIsSectionHeadersDateDataSetChanged,
    selectIsTabsChanged,
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
        isEvaluationFrequencyChanged,
        isSectionHeadersDateDataSetChanged,
        isTabsChanged,
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
            isEvaluationFrequencyChanged,
            isSectionHeadersDateDataSetChanged,
            isTabsChanged,
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
        selectTabs,
        (
            persistedDashboard,
            dashboardDescriptor,
            filterContextDefinition,
            filterContextIdentity,
            layout,
            dateFilterConfig,
            tabs,
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
                ...(tabs ? { tabs: tabs as any } : {}),
                ...pluginsProp,
            };
        },
    );
