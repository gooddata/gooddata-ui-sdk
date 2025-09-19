// (C) 2021-2025 GoodData Corporation

import { PayloadAction } from "@reduxjs/toolkit";
import cloneDeep from "lodash/cloneDeep.js";
import compact from "lodash/compact.js";
import isEmpty from "lodash/isEmpty.js";
import update from "lodash/update.js";
import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, select } from "redux-saga/effects";

import { walkLayout } from "@gooddata/sdk-backend-spi";
import {
    FilterContextItem,
    IAttributeDisplayFormMetadataObject,
    IDashboard,
    IDashboardAttributeFilter,
    IDashboardAttributeFilterConfig,
    IDashboardLayout,
    IDashboardObjectIdentity,
    IDashboardWidget,
    IDataSetMetadataObject,
    IDateFilterConfig,
    IFilterContextDefinition,
    IInsight,
    ISettings,
    IWidget,
    ObjRef,
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
import { mergeFilterContextFilters } from "../../../../_staging/dashboard/dashboardFilterContextValidation.js";
import { dashboardLayoutSanitize } from "../../../../_staging/dashboard/dashboardLayout.js";
import { createDefaultFilterContext } from "../../../../_staging/dashboard/defaultFilterContext.js";
import { ObjRefMap } from "../../../../_staging/metadata/objRefMap.js";
import { getPrivateContext } from "../../../store/_infra/contexts.js";
import { attributeFilterConfigsActions } from "../../../store/attributeFilterConfigs/index.js";
import { dateFilterConfigActions } from "../../../store/dateFilterConfig/index.js";
import { dateFilterConfigsActions } from "../../../store/dateFilterConfigs/index.js";
import { drillActions } from "../../../store/drill/index.js";
import { filterContextActions } from "../../../store/filterContext/index.js";
import { insightsActions } from "../../../store/insights/index.js";
import { layoutActions } from "../../../store/layout/index.js";
import { metaActions } from "../../../store/meta/index.js";
import { selectIsNewDashboard } from "../../../store/meta/metaSelectors.js";
import { uiActions } from "../../../store/ui/index.js";
import {
    DashboardContext,
    IDashboardWidgetOverlay,
    PrivateDashboardContext,
} from "../../../types/commonTypes.js";
import { ExtendedDashboardWidget } from "../../../types/layoutTypes.js";
import { resolveFilterDisplayForms } from "../../../utils/filterResolver.js";

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
export function* actionsToInitializeNewDashboard(
    ctx: DashboardContext,
    settings: ISettings,
    dateFilterConfig: IDateFilterConfig,
    displayForms?: ObjRefMap<IAttributeDisplayFormMetadataObject>,
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

    return {
        initActions: [
            filterContextActions.setFilterContext({
                originalFilterContextDefinition,
                filterContextDefinition,
                filterContextIdentity,
                attributeFilterDisplayForms,
            }),
            layoutActions.setLayout(dashboardLayout),
            ...(dashboard
                ? [
                      metaActions.setMeta({
                          dashboard,
                          initialContent,
                      }),
                      attributeFilterConfigsActions.setAttributeFilterConfigs({
                          attributeFilterConfigs: dashboard.attributeFilterConfigs,
                      }),
                      dateFilterConfigActions.updateDateFilterConfig(dashboard.dateFilterConfig!),
                      dateFilterConfigsActions.setDateFilterConfigs({
                          dateFilterConfigs: dashboard.dateFilterConfigs,
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
              layout: (dashboard.layout as IDashboardLayout<IWidget>) ?? EmptyDashboardLayout,
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
 * @param dateFilterConfig - effective date filter config to use; note that this function will not store
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
    originalFilterContextDefinition: IFilterContextDefinition | undefined,
    migratedAttributeFilters: IDashboardAttributeFilter[],
    migratedAttributeFilterConfigs: IDashboardAttributeFilterConfig[] = [],
    dateFilterConfig: IDateFilterConfig,
    displayForms?: ObjRefMap<IAttributeDisplayFormMetadataObject>,
    persistedDashboard?: IDashboard,
): SagaIterator<Array<PayloadAction<any>>> {
    const sanitizedFilterContext = yield call(
        sanitizeFilterContext,
        ctx,
        dashboard.filterContext,
        dashboard.dataSets,
        displayForms,
    );

    const sanitizedDashboard: IDashboard<ExtendedDashboardWidget> = updateDashboard(
        {
            ...dashboard,
            layout: (dashboard.layout as IDashboardLayout<IWidget>) ?? EmptyDashboardLayout,
            filterContext: sanitizedFilterContext,
        },
        ctx.config?.overrideTitle,
        ctx.config?.hideWidgetTitles,
    );

    const privateCtx: PrivateDashboardContext = yield call(getPrivateContext);
    const customizedDashboard =
        privateCtx?.existingDashboardTransformFn?.(sanitizedDashboard) ?? sanitizedDashboard;
    const modifiedWidgets = privateCtx?.widgetsOverlayFn?.(customizedDashboard) ?? {};

    const originalSanitizedFilterContextDefinition = dashboardFilterContextDefinition(
        customizedDashboard,
        dateFilterConfig,
    );
    const filterContextIdentity = dashboardFilterContextIdentity(customizedDashboard);
    const overrideDefaultFilters = ctx.config?.overrideDefaultFilters;
    const { mergedFilters, validationResults } = mergeFilterContextFilters(
        originalSanitizedFilterContextDefinition.filters,
        overrideDefaultFilters ?? [],
        {
            dateFilterConfig: sanitizedDashboard.dateFilterConfig,
            dateFilterConfigs: sanitizedDashboard.dateFilterConfigs,
            attributeFilterConfigs: sanitizedDashboard.attributeFilterConfigs,
        },
    );

    const filterContextDefinition = overrideDefaultFilters
        ? {
              ...originalSanitizedFilterContextDefinition,
              filters: mergedFilters,
          }
        : originalSanitizedFilterContextDefinition;

    const migratedFilterContext: IFilterContextDefinition = isImmediateAttributeFilterMigrationEnabled
        ? mergedMigratedAttributeFilters(filterContextDefinition, migratedAttributeFilters)
        : filterContextDefinition;

    const migratedOriginalFilterContext: IFilterContextDefinition =
        isImmediateAttributeFilterMigrationEnabled && originalFilterContextDefinition !== undefined
            ? originalFilterContextDefinition
            : filterContextDefinition;

    const effectiveAttributeFilterConfigs = isImmediateAttributeFilterMigrationEnabled
        ? migratedAttributeFilterConfigs
        : dashboard.attributeFilterConfigs;

    const displayAsLabels = getDisplayAsLabels(effectiveAttributeFilterConfigs);

    // load DFs for both filter refs and displayAsLabels
    const attributeFilterDisplayForms = yield call(
        resolveFilterDisplayForms,
        ctx,
        migratedFilterContext.filters,
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
        customizedDashboard.layout ?? EmptyDashboardLayout,
        insights,
        settings,
    );
    return compact([
        filterContextActions.setFilterContext({
            originalFilterContextDefinition: migratedOriginalFilterContext,
            filterContextDefinition: migratedFilterContext,
            filterContextIdentity,
            attributeFilterDisplayForms,
        }),
        overrideDefaultFilters
            ? filterContextActions.setDefaultFilterOverrides(overrideDefaultFilters)
            : null,
        layoutActions.setLayout(dashboardLayout),
        metaActions.setMeta({
            dashboard: persistedDashboard ?? dashboard,
            initialContent: false,
        }),
        attributeFilterConfigsActions.setAttributeFilterConfigs({
            attributeFilterConfigs: effectiveAttributeFilterConfigs,
        }),
        dateFilterConfigActions.updateDateFilterConfig(dashboard.dateFilterConfig!),
        dateFilterConfigsActions.setDateFilterConfigs({
            dateFilterConfigs: dashboard.dateFilterConfigs,
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
