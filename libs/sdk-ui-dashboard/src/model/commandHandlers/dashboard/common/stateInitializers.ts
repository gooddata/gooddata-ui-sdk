// (C) 2021-2025 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";
import { cloneDeep, compact, isEmpty, update } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, select } from "redux-saga/effects";

import { walkLayout } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type IDashboard,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardLayout,
    type IDashboardObjectIdentity,
    type IDashboardTab,
    type IDashboardWidget,
    type IDataSetMetadataObject,
    type IDateFilterConfig,
    type IFilterContext,
    type IFilterContextDefinition,
    type IInsight,
    type ISettings,
    type ITempFilterContext,
    type IWidget,
    type ObjRef,
    areObjRefsEqual,
    isDashboardAttributeFilter,
    isDashboardDateFilterWithDimension,
    isIdentifierRef,
    isInsightWidget,
    isObjRef,
} from "@gooddata/sdk-model";

import { EmptyDashboardLayout, dashboardInitialize } from "./dashboardInitialize.js";
import { loadAvailableDisplayFormRefs } from "./loadAvailableDisplayFormRefs.js";
import { mergedMigratedAttributeFilters } from "./migratedAttributeFilters.js";
import {
    dashboardFilterContextDefinition,
    dashboardFilterContextIdentity,
} from "../../../../_staging/dashboard/dashboardFilterContext.js";
import {
    type ValidationResult,
    mergeFilterContextFilters,
} from "../../../../_staging/dashboard/dashboardFilterContextValidation.js";
import { dashboardLayoutSanitize } from "../../../../_staging/dashboard/dashboardLayout.js";
import { createDefaultFilterContext } from "../../../../_staging/dashboard/defaultFilterContext.js";
import { type ObjRefMap } from "../../../../_staging/metadata/objRefMap.js";
import { getPrivateContext } from "../../../store/_infra/contexts.js";
import { drillActions } from "../../../store/drill/index.js";
import { insightsActions } from "../../../store/insights/index.js";
import { metaActions } from "../../../store/meta/index.js";
import { selectIsNewDashboard } from "../../../store/meta/metaSelectors.js";
import { filterContextInitialState } from "../../../store/tabs/filterContext/filterContextState.js";
import {
    DEFAULT_TAB_ID,
    type FilterContextState,
    type TabState,
    tabsActions,
} from "../../../store/tabs/index.js";
import { selectScreen } from "../../../store/tabs/layout/layoutSelectors.js";
import { layoutInitialState } from "../../../store/tabs/layout/layoutState.js";
import { uiActions } from "../../../store/ui/index.js";
import {
    type DashboardContext,
    type IDashboardWidgetOverlay,
    type PrivateDashboardContext,
} from "../../../types/commonTypes.js";
import { type ExtendedDashboardWidget } from "../../../types/layoutTypes.js";
import { resolveFilterDisplayForms } from "../../../utils/filterResolver.js";

/**
 * Processes a single tab's filterContext and returns initialized FilterContextState.
 * This includes sanitization, migration, merging with overrides, and display form resolution.
 */
function* processExistingTabFilterContext(
    ctx: DashboardContext,
    tab: IDashboardTab,
    effectiveDateFilterConfig: IDateFilterConfig,
    dataSets: IDataSetMetadataObject[] | undefined,
    overrideDefaultFilters: FilterContextItem[] | undefined,
    isImmediateAttributeFilterMigrationEnabled: boolean,
    migratedAttributeFilters: IDashboardAttributeFilter[],
    originalFilterContextDefinition: IFilterContextDefinition | undefined,
    displayForms: ObjRefMap<IAttributeDisplayFormMetadataObject> | undefined,
    dashboard: IDashboard,
): SagaIterator<[FilterContextState, ValidationResult[] | undefined]> {
    // Sanitize the tab's filter context
    const sanitizedFilterContext: IFilterContext | ITempFilterContext = yield call(
        sanitizeFilterContext,
        ctx,
        tab.filterContext,
        dataSets,
        displayForms,
    );

    // Build a temporary dashboard object for this tab to use existing helper functions
    const tabAsDashboard: IDashboard = {
        ...dashboard,
        filterContext: sanitizedFilterContext,
        dateFilterConfig: tab.dateFilterConfig,
        dateFilterConfigs: tab.dateFilterConfigs,
        attributeFilterConfigs: tab.attributeFilterConfigs,
    };

    // Extract filter context definition or create a default filter context
    const originalSanitizedFilterContextDefinition = dashboardFilterContextDefinition(
        tabAsDashboard,
        effectiveDateFilterConfig,
    );
    const filterContextIdentity = dashboardFilterContextIdentity(tabAsDashboard);

    // Merge with override filters if provided
    const { mergedFilters, validationResults } = mergeFilterContextFilters(
        originalSanitizedFilterContextDefinition.filters,
        overrideDefaultFilters ?? [],
        {
            dateFilterConfig: tab.dateFilterConfig,
            dateFilterConfigs: tab.dateFilterConfigs,
            attributeFilterConfigs: tab.attributeFilterConfigs,
        },
    );

    const filterContextDefinition = overrideDefaultFilters
        ? {
              ...originalSanitizedFilterContextDefinition,
              filters: mergedFilters,
          }
        : originalSanitizedFilterContextDefinition;

    // Apply migrations if enabled
    const migratedFilterContext: IFilterContextDefinition = isImmediateAttributeFilterMigrationEnabled
        ? mergedMigratedAttributeFilters(filterContextDefinition, migratedAttributeFilters)
        : filterContextDefinition;

    const migratedOriginalFilterContext: IFilterContextDefinition =
        isImmediateAttributeFilterMigrationEnabled && originalFilterContextDefinition !== undefined
            ? originalFilterContextDefinition
            : filterContextDefinition;

    // Get display as labels for display form resolution
    const displayAsLabels = getDisplayAsLabels(tab.attributeFilterConfigs);

    // Resolve display forms for filters
    const attributeFilterDisplayForms: IAttributeDisplayFormMetadataObject[] = yield call(
        resolveFilterDisplayForms,
        ctx,
        migratedFilterContext.filters,
        displayAsLabels,
        displayForms,
    );

    // Return the complete FilterContextState for this tab
    return [
        {
            ...filterContextInitialState,
            filterContextDefinition: migratedFilterContext,
            originalFilterContextDefinition: migratedOriginalFilterContext,
            filterContextIdentity,
            attributeFilterDisplayForms,
            defaultFilterOverrides: overrideDefaultFilters,
        },
        validationResults,
    ];
}

/**
 * Returns a list of actions which when processed will initialize the essential parts of the dashboard
 * state so that it shows a new, empty dashboard.
 *
 * @param ctx - dashboard context in which the initialization is done
 *  these insights in the state; it uses the insights to perform sanitization of the dashboard layout
 * @param settings - settings currently in effect; note that this function will not create actions to store
 *  the settings in the state; it uses the settings during layout sanitization
 * @param dateFilterConfig - effective date filter config to use; note that this function will not store
 *  the date filter config anywhere; it uses the config during filter context sanitization & determining
 *  which date option is selected
 * @param displayForms - specify display forms that should be used for in-memory resolution of
 *  attribute filter display forms to metadata objects
 */
/**
 * Helper function to extract effective layout, filter context, and filter configs from a dashboard.
 * If the dashboard has tabs, it uses the active tab (or first tab) instead of root-level properties.
 */
function getEffectiveDashboardProperties<TWidget>(
    dashboard: IDashboard<TWidget>,
    enableDashboardTabs: boolean,
    activeTabLocalIdentifier?: string,
): {
    layout: IDashboardLayout<TWidget> | undefined;
} {
    // If dashboard has tabs and feature flag is enabled, use the active tab (or first tab) instead of root properties
    if (enableDashboardTabs && dashboard.tabs && dashboard.tabs.length > 0) {
        const activeTab: IDashboardTab<TWidget> | undefined = activeTabLocalIdentifier
            ? dashboard.tabs.find((tab) => tab.localIdentifier === activeTabLocalIdentifier)
            : undefined;
        const effectiveTab = activeTab ?? dashboard.tabs[0];

        return {
            layout: effectiveTab.layout,
        };
    }

    if (!dashboard.layout && !dashboard.filterContext) {
        console.error("Dashboard has no layout or filter context");
    }
    // No tabs or feature flag disabled - use root-level properties
    return {
        layout: dashboard.layout,
    };
}

export function* actionsToInitializeNewDashboard(
    ctx: DashboardContext,
    settings: ISettings,
    dateFilterConfig: IDateFilterConfig,
    displayForms?: ObjRefMap<IAttributeDisplayFormMetadataObject>,
    initialTabId?: string,
): SagaIterator<{
    initActions: Array<PayloadAction<any>>;
    dashboard: IDashboard | undefined;
    insights: IInsight[];
}> {
    const {
        dashboard,
        insights,
        dashboardLayout,
        modifiedWidgets,
        filterContextIdentity,
        attributeFilterDisplayForms,
        filterContextDefinition,
        originalFilterContextDefinition,
        initialContent,
    } = yield call(actionsToInitializeOrFillNewDashboard, ctx, settings, dateFilterConfig, displayForms);

    // Check if dashboard tabs feature is enabled
    const enableDashboardTabs = settings.enableDashboardTabs ?? false;

    const tabs: IDashboardTab[] = dashboard?.tabs ?? [
        {
            localIdentifier: DEFAULT_TAB_ID,
            title: "",
            filterContext: filterContextDefinition,
            dateFilterConfig: dashboard?.dateFilterConfig,
            dateFilterConfigs: [],
            attributeFilterConfigs: [],
            layout: dashboardLayout ?? EmptyDashboardLayout,
        },
    ];

    // Prepare tabs action with complete filterContext for each tab
    const tabsAction =
        enableDashboardTabs && tabs
            ? [
                  tabsActions.setTabs({
                      tabs: tabs.map((tab: IDashboardTab) => ({
                          title: tab.title,
                          localIdentifier: tab.localIdentifier,
                          filterContext: {
                              ...filterContextInitialState,
                              filterContextDefinition,
                              originalFilterContextDefinition,
                              filterContextIdentity,
                              attributeFilterDisplayForms,
                          },
                          dateFilterConfig: {
                              dateFilterConfig: tab.dateFilterConfig,
                              effectiveDateFilterConfig: dateFilterConfig,
                              isUsingDashboardOverrides: false,
                              dateFilterConfigValidationWarnings: undefined,
                          },
                          dateFilterConfigs: {
                              dateFilterConfigs: tab.dateFilterConfigs ?? [],
                          },
                          attributeFilterConfigs: {
                              attributeFilterConfigs: tab.attributeFilterConfigs ?? [],
                          },
                          layout: {
                              ...layoutInitialState,
                              layout: tab.layout ?? dashboardLayout ?? EmptyDashboardLayout,
                          },
                      })),
                      activeTabLocalIdentifier:
                          initialTabId ?? dashboard?.activeTabLocalIdentifier ?? DEFAULT_TAB_ID,
                  }),
              ]
            : [
                  // For dashboards without tabs, create a single default tab
                  tabsActions.setTabs({
                      tabs: [
                          {
                              localIdentifier: DEFAULT_TAB_ID,
                              title: "",
                              filterContext: {
                                  ...filterContextInitialState,
                                  filterContextDefinition,
                                  originalFilterContextDefinition,
                                  filterContextIdentity,
                                  attributeFilterDisplayForms,
                              },
                              layout: {
                                  ...layoutInitialState,
                                  layout: dashboardLayout ?? EmptyDashboardLayout,
                              },
                              dateFilterConfig: {
                                  dateFilterConfig: dashboard?.dateFilterConfig,
                                  effectiveDateFilterConfig: dateFilterConfig,
                                  isUsingDashboardOverrides: false,
                                  dateFilterConfigValidationWarnings: undefined,
                              },
                              dateFilterConfigs: {
                                  dateFilterConfigs: dashboard?.dateFilterConfigs ?? [],
                              },
                              attributeFilterConfigs: {
                                  attributeFilterConfigs: dashboard?.attributeFilterConfigs ?? [],
                              },
                          },
                      ],
                      activeTabLocalIdentifier: DEFAULT_TAB_ID,
                  }),
              ];

    return {
        initActions: [
            ...tabsAction,
            ...(dashboard
                ? [
                      metaActions.setMeta({
                          dashboard,
                          initialContent,
                      }),
                      metaActions.setDashboardTitle(dashboard.title),
                      uiActions.clearWidgetSelection(),
                      uiActions.setWidgetsOverlay(modifiedWidgets),
                      insightsActions.setInsights(insights),
                      drillActions.resetCrossFiltering(),
                  ]
                : [
                      metaActions.setMeta({}),
                      insightsActions.setInsights(insights),
                      drillActions.resetCrossFiltering(),
                  ]),
        ],
        dashboard: initialContent ? dashboard : undefined,
        insights: initialContent ? insights : [],
    };
}

function* actionsToInitializeOrFillNewDashboard(
    ctx: DashboardContext,
    settings: ISettings,
    dateFilterConfig: IDateFilterConfig,
    displayForms?: ObjRefMap<IAttributeDisplayFormMetadataObject>,
): SagaIterator<{
    dashboard?: IDashboard<ExtendedDashboardWidget>;
    dashboardLayout?: IDashboardLayout<ExtendedDashboardWidget>;
    insights?: IInsight[];
    modifiedWidgets?: Record<string, IDashboardWidgetOverlay>;
    filterContextIdentity?: IDashboardObjectIdentity;
    attributeFilterDisplayForms?: IAttributeDisplayFormMetadataObject[];
    filterContextDefinition?: IFilterContextDefinition;
    originalFilterContextDefinition?: IFilterContextDefinition;
    initialContent?: boolean;
}> {
    const { dashboard: dashboardInitialized, insights }: SagaReturnType<typeof dashboardInitialize> =
        yield call(dashboardInitialize, ctx, ctx.config?.initialContent);

    const isRenderExportMode = ctx.config?.initialRenderMode === "export";
    const isNewDashboard = yield select(selectIsNewDashboard);
    const updatedDateFilterConfig = {
        ...dateFilterConfig,
        //NOTE: When we are in export mode and the dashboard is new, we need to set the date filter config to ALL_TIME
        // so this date filter will not affect visualisations
        ...(isRenderExportMode && isNewDashboard
            ? {
                  selectedOption: "ALL_TIME",
              }
            : {}),
    };

    const overrideDefaultFilters = ctx.config?.overrideDefaultFilters;
    const overrideFilterContext = overrideDefaultFilters
        ? {
              filters: overrideDefaultFilters,
          }
        : undefined;

    const dashboard = dashboardInitialized
        ? (updateDashboard(
              dashboardInitialized as IDashboard,
              ctx.config?.overrideTitle,
              ctx.config?.hideWidgetTitles,
          ) as IDashboard<ExtendedDashboardWidget>)
        : undefined;

    const sanitizedFilterContext = yield call(
        sanitizeFilterContext,
        ctx,
        (overrideFilterContext ??
            dashboard?.filterContext ??
            createDefaultFilterContext(updatedDateFilterConfig, true)) as IDashboard["filterContext"],
        dashboard?.dataSets,
        displayForms,
    );

    const sanitizedDashboard: IDashboard<ExtendedDashboardWidget> | null = dashboard
        ? {
              ...dashboard,
              layout: (dashboard?.layout as IDashboardLayout<IWidget>) ?? EmptyDashboardLayout,
              tabs: dashboard.tabs?.map((tab) => ({
                  ...tab,
                  layout: dashboardLayoutSanitize(tab?.layout ?? EmptyDashboardLayout, insights, settings),
              })),
              filterContext: sanitizedFilterContext,
          }
        : null;

    const privateCtx: PrivateDashboardContext = yield call(getPrivateContext);
    const customizedDashboard = sanitizedDashboard
        ? (privateCtx?.existingDashboardTransformFn?.(sanitizedDashboard) ?? sanitizedDashboard)
        : sanitizedDashboard;
    const modifiedWidgets = customizedDashboard
        ? (privateCtx?.widgetsOverlayFn?.(customizedDashboard) ?? {})
        : {};

    const filterContextDefinition = dashboardFilterContextDefinition(
        customizedDashboard,
        updatedDateFilterConfig,
        ctx.config?.overrideDefaultFilters,
    );
    const effectiveAttributeFilterConfigs = dashboard?.attributeFilterConfigs;
    const filterContextIdentity = customizedDashboard
        ? dashboardFilterContextIdentity(customizedDashboard)
        : undefined;
    const displayAsLabels = getDisplayAsLabels(effectiveAttributeFilterConfigs);
    // load DFs for both filter refs and displayAsLabels
    const attributeFilterDisplayForms = yield call(
        resolveFilterDisplayForms,
        ctx,
        filterContextDefinition.filters,
        displayAsLabels,
        displayForms,
    );

    /*
     * NOTE: cannot do without the cast here. The layout in IDashboard is parameterized with IDashboardWidget
     * which also includes KPI and Insight widget definitions = those without identity. That is however
     * not valid: any widget for a persisted dashboard must have identity.
     *
     * Also note, nested layouts are not yet supported
     */
    const dashboardLayout = dashboardLayoutSanitize(
        customizedDashboard?.layout ?? EmptyDashboardLayout,
        insights,
        settings,
    );

    return {
        dashboard,
        insights,
        modifiedWidgets,
        filterContextIdentity,
        dashboardLayout,
        attributeFilterDisplayForms,
        filterContextDefinition,
        originalFilterContextDefinition: filterContextDefinition,
        initialContent: !!ctx.config?.initialContent,
    };
}

const keepOnlyFiltersWithValidRef = (
    filter: FilterContextItem,
    availableDfRefs: ObjRef[],
    validDataSetIds: string[],
) => {
    if (!isDashboardAttributeFilter(filter)) {
        if (isDashboardDateFilterWithDimension(filter)) {
            return (
                isIdentifierRef(filter.dateFilter.dataSet!) &&
                validDataSetIds.includes(filter.dateFilter.dataSet?.identifier)
            );
        }
        return true; // common date filter is kept always
    }

    return availableDfRefs.some((ref) => areObjRefsEqual(ref, filter.attributeFilter.displayForm));
};

export function loadDataSets(
    ctx: DashboardContext,
    dataSetRefs: ObjRef[],
): Promise<IDataSetMetadataObject[]> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).datasets().getDataSets(dataSetRefs);
}

function* sanitizeFilterContext(
    ctx: DashboardContext,
    filterContext: IDashboard["filterContext"],
    dataSets: IDataSetMetadataObject[] = [],
    displayForms?: ObjRefMap<IAttributeDisplayFormMetadataObject>,
): SagaIterator<IDashboard["filterContext"]> {
    // we don't need sanitize filter references, if backend guarantees consistent references
    if (!ctx.backend.capabilities.allowsInconsistentRelations) {
        return filterContext;
    }

    if (!filterContext || isEmpty(filterContext.filters)) {
        return filterContext;
    }

    const usedFilterDisplayForms = filterContext.filters
        .filter(isDashboardAttributeFilter)
        .map((f) => f.attributeFilter.displayForm);

    let availableRefs: ObjRef[];
    if (displayForms) {
        let missingRefs: ObjRef[] = [];
        const missing = usedFilterDisplayForms.filter((df) => !displayForms.get(df));
        if (missing.length) {
            missingRefs = yield call(loadAvailableDisplayFormRefs, ctx, missing);
        }
        availableRefs = usedFilterDisplayForms
            .map(
                (df) =>
                    displayForms.get(df)?.ref ||
                    missingRefs.find(
                        (ref) =>
                            isIdentifierRef(ref) && isIdentifierRef(df) && ref.identifier === df.identifier,
                    ) ||
                    null,
            )
            .filter(isObjRef);
    } else {
        availableRefs = yield call(loadAvailableDisplayFormRefs, ctx, usedFilterDisplayForms);
    }

    // full catalog may not be available here, just related datasets to the dashboard
    // -- find out if some datasets are still missing and if needed, fetch them

    // additional date filters, let them validate
    const additionalDateFilters = filterContext.filters
        .filter((filter) => !isDashboardAttributeFilter(filter))
        .filter(isDashboardDateFilterWithDimension)
        .map((filter) => filter.dateFilter.dataSet!);

    // check which are missing and load them
    const missingDataSets = additionalDateFilters
        .filter(isIdentifierRef)
        .filter((filter) => !dataSets.find((dataSet) => dataSet.id === filter.identifier));
    const loadedMissing = yield call(loadDataSets, ctx, missingDataSets);

    const resolvedDataSetsIds = [...dataSets, ...loadedMissing].map((dataSet) => dataSet.id);
    const updatedFilterContext = cloneDeep(filterContext);
    update(updatedFilterContext, "filters", (filters: FilterContextItem[]) =>
        filters.filter((filter) => {
            return keepOnlyFiltersWithValidRef(filter, availableRefs, resolvedDataSetsIds);
        }),
    );
    return updatedFilterContext;
}

function getDisplayAsLabels(attributeFilterConfigs: IDashboardAttributeFilterConfig[] | undefined): ObjRef[] {
    return (
        attributeFilterConfigs?.reduce((labels: ObjRef[], config) => {
            if (typeof config.displayAsLabel !== "undefined") {
                labels.push(config.displayAsLabel);
            }
            return labels;
        }, []) ?? []
    );
}

/**
 * Returns a list of actions which when processed will initialize filter context, layout and meta parts
 * of the state for an existing dashboard.
 *
 * This generator will perform the essential cleanup, sanitization and resolution on top of of the input
 * dashboard and use the sanitized values to initialize the state:
 *
 * -  Layout sizing sanitization happens here
 * -  Resolution of attribute filter display forms happens here (this may be async)
 *
 * @param ctx - dashboard context in which the initialization is done
 * @param dashboard - dashboard to create initialization actions for
 * @param insights - insights used on the dashboard; note that this function will not create actions to store
 *  these insights in the state; it uses the insights to perform sanitization of the dashboard layout
 * @param settings - settings currently in effect; note that this function will not create actions to store
 *  the settings in the state; it uses the settings during layout sanitization
 * @param isImmediateAttributeFilterMigrationEnabled - enables transfer of changes made to the dashboard and
 *  its filter context in view mode to the edit mode.
 * @param originalFilterContextDefinition - original filter definition that should be used instead of the
 *  one taken from the persisted dashboard ("dashboard" parameter of this function). It contains ad-hoc
 *  migrated attribute filters in state right after the migration, before potential user change to selection.
 *  If not provided, the filter context from persisted dashboard will be used.
 * @param migratedAttributeFilters - ad-hoc migrated attribute filters in view mode that must be applied to
 *  the dashboard so user can save these changes (persisted dashboard state remains as is).
 * @param migratedAttributeFilterConfigs - ad-hoc migrated attribute filter configs in view mode that must be
 *  applied to the dashboard so user can save these changes (persisted dashboard state remains as is).
 * @param effectiveDateFilterConfigMap - effective date filter config to use; note that this function will not store
 *  the date filter config anywhere; it uses the config during filter context sanitization & determining
 *  which date option is selected
 * @param dateDataSets - all catalog date datasets used to validate date filters. May not be given when
 *  catalog load is being deferred
 * @param displayForms - specify display forms that should be used for in-memory resolution of
 *  attribute filter display forms to metadata objects
 * @param persistedDashboard - dashboard to use for the persisted dashboard state slice in case it needs to be different from the dashboard param
 */
export function* actionsToInitializeExistingDashboard(
    ctx: DashboardContext,
    dashboard: IDashboard,
    insights: IInsight[],
    settings: ISettings,
    isImmediateAttributeFilterMigrationEnabled: boolean,
    originalFilterContextDefinition: Record<string, IFilterContextDefinition | undefined> | undefined,

    migratedAttributeFilters: Record<string, IDashboardAttributeFilter[]> | undefined,
    migratedAttributeFilterConfigs: Record<string, IDashboardAttributeFilterConfig[]>,
    effectiveDateFilterConfigMap: Record<string, IDateFilterConfig>,
    tabsDateFilterConfigSource: Record<string, "dashboard" | "workspace">,
    displayForms?: ObjRefMap<IAttributeDisplayFormMetadataObject>,
    persistedDashboard?: IDashboard,
    activeTabLocalIdentifier?: string,
): SagaIterator<Array<PayloadAction<any>>> {
    // Check if dashboard tabs feature is enabled
    const enableDashboardTabs = settings.enableDashboardTabs ?? false;

    const effectiveActiveTabId =
        activeTabLocalIdentifier ?? dashboard.tabs?.[0]?.localIdentifier ?? DEFAULT_TAB_ID;

    const effectiveProps = getEffectiveDashboardProperties(
        dashboard,
        enableDashboardTabs,
        effectiveActiveTabId,
    );

    const sanitizedDashboard: IDashboard<ExtendedDashboardWidget> = updateDashboard(
        {
            ...dashboard,
            layout: (effectiveProps.layout as IDashboardLayout<IWidget>) ?? EmptyDashboardLayout,
        } as IDashboard,
        ctx.config?.overrideTitle,
        ctx.config?.hideWidgetTitles,
    ) as IDashboard<ExtendedDashboardWidget>;

    const privateCtx: PrivateDashboardContext = yield call(getPrivateContext);
    const customizedDashboard =
        privateCtx?.existingDashboardTransformFn?.(sanitizedDashboard) ?? sanitizedDashboard;
    const modifiedWidgets = privateCtx?.widgetsOverlayFn?.(customizedDashboard) ?? {};

    /*
     * NOTE: cannot do without the cast here. The layout in IDashboard is parameterized with IDashboardWidget
     * which also includes KPI and Insight widget definitions = those without identity. That is however
     * not valid: any widget for a persisted dashboard must have identity.
     *
     * Also note, nested layouts are not yet supported
     */
    const dashboardLayout = dashboardLayoutSanitize(
        customizedDashboard.layout ?? EmptyDashboardLayout,
        insights,
        settings,
    );

    const screen: SagaReturnType<typeof selectScreen> = yield select(selectScreen);

    // Process tabs with complete filterContext initialization for each tab
    let tabsAction = null;
    const validationResults: ValidationResult[] = [];
    if (enableDashboardTabs && customizedDashboard?.tabs && customizedDashboard.tabs.length > 0) {
        // Process each tab to build complete TabState with filterContext
        const processedTabs: TabState[] = [];

        for (const tab of customizedDashboard.tabs as IDashboardTab<IDashboardWidget>[]) {
            const isActiveTab = tab.localIdentifier === effectiveActiveTabId;
            // Override default filters are only applied to the active tab
            const overrideDefaultFilters =
                isActiveTab && ctx.config?.overrideDefaultFilters
                    ? ctx.config?.overrideDefaultFilters
                    : undefined;
            // Process this tab's filterContext
            const [tabFilterContext, tabValidationResults]: SagaReturnType<
                typeof processExistingTabFilterContext
            > = yield call(
                processExistingTabFilterContext,
                ctx,
                tab,
                effectiveDateFilterConfigMap[tab.localIdentifier],
                dashboard.dataSets,
                overrideDefaultFilters,
                isImmediateAttributeFilterMigrationEnabled,
                migratedAttributeFilters?.[tab.localIdentifier] ?? [],
                originalFilterContextDefinition?.[tab.localIdentifier],
                displayForms,
                dashboard,
            );
            validationResults.push(...(tabValidationResults ?? []));

            const effectiveAttributeFilterConfigs = isImmediateAttributeFilterMigrationEnabled
                ? (migratedAttributeFilterConfigs?.[tab.localIdentifier] ?? [])
                : (tab.attributeFilterConfigs ?? []);

            // Sanitize this tab's layout
            const tabLayout = dashboardLayoutSanitize(
                (tab.layout ?? EmptyDashboardLayout) as IDashboardLayout<IWidget>,
                insights,
                settings,
            );

            // Build complete TabState with all nested states
            const tabState: TabState = {
                ...tab,
                filterContext: tabFilterContext,
                dateFilterConfig: {
                    dateFilterConfig: tab.dateFilterConfig,
                    effectiveDateFilterConfig: effectiveDateFilterConfigMap[tab.localIdentifier],
                    isUsingDashboardOverrides:
                        tabsDateFilterConfigSource[tab.localIdentifier] === "dashboard",
                },
                dateFilterConfigs: tab.dateFilterConfigs
                    ? {
                          dateFilterConfigs: tab.dateFilterConfigs,
                      }
                    : undefined,
                attributeFilterConfigs: {
                    attributeFilterConfigs: effectiveAttributeFilterConfigs,
                },
                layout: {
                    ...layoutInitialState,
                    layout: tabLayout,
                    screen, // Preserve only screen from current state
                },
            };

            processedTabs.push(tabState);
        }
        tabsAction = tabsActions.setTabs({
            tabs: processedTabs,
            activeTabLocalIdentifier: effectiveActiveTabId,
        });
    } else {
        // For dashboards without tabs, create a single default tab with the filterContext
        const tabForProcessing: IDashboardTab = {
            localIdentifier: DEFAULT_TAB_ID,
            title: "",
            filterContext: dashboard.filterContext,
            dateFilterConfig: dashboard.dateFilterConfig,
            dateFilterConfigs: dashboard.dateFilterConfigs,
            attributeFilterConfigs: dashboard.attributeFilterConfigs,
            layout: dashboard.layout ?? EmptyDashboardLayout,
        };

        const tabIdentifier = dashboard.tabs?.[0]?.localIdentifier ?? DEFAULT_TAB_ID;

        const [tabFilterContext, tabValidationResults]: SagaReturnType<
            typeof processExistingTabFilterContext
        > = yield call(
            processExistingTabFilterContext,
            ctx,
            tabForProcessing,
            effectiveDateFilterConfigMap[tabIdentifier],
            dashboard.dataSets,
            ctx.config?.overrideDefaultFilters,
            isImmediateAttributeFilterMigrationEnabled,
            migratedAttributeFilters?.[tabIdentifier] ?? [],
            originalFilterContextDefinition?.[tabIdentifier],
            displayForms,
            dashboard,
        );
        validationResults.push(...(tabValidationResults ?? []));

        const effectiveAttributeFilterConfigs = isImmediateAttributeFilterMigrationEnabled
            ? (migratedAttributeFilterConfigs?.[tabIdentifier] ?? [])
            : dashboard.attributeFilterConfigs;

        const defaultTab: TabState = {
            localIdentifier: tabIdentifier,
            title: "",
            filterContext: tabFilterContext,
            dateFilterConfig: {
                dateFilterConfig: dashboard.dateFilterConfig,
                effectiveDateFilterConfig: effectiveDateFilterConfigMap[tabIdentifier],
                isUsingDashboardOverrides: tabsDateFilterConfigSource[tabIdentifier] === "dashboard",
            },
            layout: {
                ...layoutInitialState,
                layout: dashboardLayout ?? EmptyDashboardLayout,
                screen, // Preserve only screen from current state
            },
            dateFilterConfigs: dashboard.dateFilterConfigs
                ? {
                      dateFilterConfigs: dashboard.dateFilterConfigs,
                  }
                : undefined,
            attributeFilterConfigs: effectiveAttributeFilterConfigs
                ? {
                      attributeFilterConfigs: effectiveAttributeFilterConfigs,
                  }
                : undefined,
        };

        tabsAction = tabsActions.setTabs({
            tabs: [defaultTab],
            activeTabLocalIdentifier: tabIdentifier,
        });
    }

    return compact([
        tabsAction,
        metaActions.setMeta({
            dashboard: persistedDashboard ?? dashboard,
            initialContent: false,
        }),
        insightsActions.setInsights(insights),
        metaActions.setDashboardTitle(dashboard.title), // even when using persistedDashboard, use the working title of the dashboard
        uiActions.clearWidgetSelection(),
        uiActions.setWidgetsOverlay(modifiedWidgets),
        validationResults.length > 0 ? uiActions.setIncompatibleDefaultFiltersOverrideMessage() : null,
        drillActions.resetCrossFiltering(),
    ]);
}

type Writeable<T extends { [x: string]: any }, K extends string> = {
    [P in K]: T[P];
};

function updateDashboard<Widget extends IDashboardWidget>(
    ds: IDashboard<Widget>,
    title?: string,
    hideWidgetTitles?: boolean,
) {
    let dashboard = ds;

    // Rewrite dashboard title if it was set in the metadata
    if (title) {
        dashboard = {
            ...dashboard,
            title,
        };
    }

    // Hide widget titles if it was set in the metadata
    if (dashboard.layout && hideWidgetTitles) {
        walkLayout<Widget>(dashboard.layout, {
            widgetCallback: (widget) => {
                if (isInsightWidget(widget)) {
                    const wd = widget as Writeable<IDashboardWidget, "configuration">;
                    wd.configuration = {
                        ...widget.configuration,
                        hideTitle: true,
                    };
                }
            },
        });
    }

    return dashboard;
}
