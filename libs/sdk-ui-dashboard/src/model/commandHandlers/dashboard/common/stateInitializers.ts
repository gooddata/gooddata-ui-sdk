// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";
import update from "lodash/fp/update.js";
import isEmpty from "lodash/isEmpty.js";
import { PayloadAction } from "@reduxjs/toolkit";
import {
    areObjRefsEqual,
    IInsight,
    IDateFilterConfig,
    FilterContextItem,
    isDashboardAttributeFilter,
    IAttributeDisplayFormMetadataObject,
    IWidget,
    IDashboardLayout,
    IDashboard,
    ISettings,
    ICatalogDateDataset,
    isDashboardDateFilterWithDimension,
    ObjRef,
    isObjRef,
    isIdentifierRef,
    IDataSetMetadataObject,
} from "@gooddata/sdk-model";

import { filterContextActions } from "../../../store/filterContext/index.js";
import { createDefaultFilterContext } from "../../../../_staging/dashboard/defaultFilterContext.js";
import { layoutActions } from "../../../store/layout/index.js";
import { insightsActions } from "../../../store/insights/index.js";
import { metaActions } from "../../../store/meta/index.js";
import { uiActions } from "../../../store/ui/index.js";
import {
    dashboardFilterContextDefinition,
    dashboardFilterContextIdentity,
} from "../../../../_staging/dashboard/dashboardFilterContext.js";
import { dashboardLayoutSanitize } from "../../../../_staging/dashboard/dashboardLayout.js";
import { resolveFilterDisplayForms } from "../../../utils/filterResolver.js";
import { DashboardContext, PrivateDashboardContext } from "../../../types/commonTypes.js";
import { ObjRefMap } from "../../../../_staging/metadata/objRefMap.js";
import { ExtendedDashboardWidget } from "../../../types/layoutTypes.js";
import { getPrivateContext } from "../../../store/_infra/contexts.js";
import { loadAvailableDisplayFormRefs } from "./loadAvailableDisplayFormRefs.js";
import { attributeFilterConfigsActions } from "../../../store/attributeFilterConfigs/index.js";
import { dateFilterConfigActions } from "../../../store/dateFilterConfig/index.js";
import { dateFilterConfigsActions } from "../../../store/dateFilterConfigs/index.js";
import { drillActions } from "../../../store/drill/index.js";

export const EmptyDashboardLayout: IDashboardLayout<IWidget> = {
    type: "IDashboardLayout",
    sections: [],
};

/**
 * Returns a list of actions which when processed will initialize the essential parts of the dashboard
 * state so that it shows a new, empty dashboard.
 *
 * @param dateFilterConfig - date filter config to use for the new dashboard
 */
export function actionsToInitializeNewDashboard(
    dateFilterConfig: IDateFilterConfig,
): Array<PayloadAction<any>> {
    return [
        filterContextActions.setFilterContext({
            filterContextDefinition: createDefaultFilterContext(dateFilterConfig),
            attributeFilterDisplayForms: [],
        }),
        layoutActions.setLayout(EmptyDashboardLayout),
        insightsActions.setInsights([]),
        metaActions.setMeta({}),
        drillActions.resetCrossFiltering(),
    ];
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
    catalogDateDataSets: ICatalogDateDataset[] | null,
    dataSets: IDataSetMetadataObject[] = [],
    displayForms?: ObjRefMap<IAttributeDisplayFormMetadataObject>,
    settings?: ISettings,
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

    if (settings?.enableCriticalContentPerformanceOptimizations) {
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
        return update(
            "filters",
            (filters: FilterContextItem[]) =>
                filters.filter((filter) => {
                    return keepOnlyFiltersWithValidRef(filter, availableRefs, resolvedDataSetsIds);
                }),
            filterContext,
        );
    }

    const dataSetIds = (catalogDateDataSets || []).map((dataSet) => dataSet.dataSet.id);
    return update(
        "filters",
        (filters: FilterContextItem[]) =>
            filters.filter((filter) => {
                return keepOnlyFiltersWithValidRef(filter, availableRefs, dataSetIds);
            }),
        filterContext,
    );
}

function getDisplayAsLabels(dashboard: IDashboard): ObjRef[] {
    return (
        dashboard.attributeFilterConfigs?.reduce((labels: ObjRef[], config) => {
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
    dateFilterConfig: IDateFilterConfig,
    dateDataSets: ICatalogDateDataset[] | null,
    displayForms?: ObjRefMap<IAttributeDisplayFormMetadataObject>,
    persistedDashboard?: IDashboard,
): SagaIterator<Array<PayloadAction<any>>> {
    const sanitizedFilterContext = yield call(
        sanitizeFilterContext,
        ctx,
        dashboard.filterContext,
        dateDataSets,
        dashboard.dataSets,
        displayForms,
        settings,
    );

    const sanitizedDashboard: IDashboard<ExtendedDashboardWidget> = {
        ...dashboard,
        layout: (dashboard.layout as IDashboardLayout<IWidget>) ?? EmptyDashboardLayout,
        filterContext: sanitizedFilterContext,
    };

    const privateCtx: PrivateDashboardContext = yield call(getPrivateContext);
    const customizedDashboard =
        privateCtx?.existingDashboardTransformFn?.(sanitizedDashboard) ?? sanitizedDashboard;
    const modifiedWidgets = privateCtx?.widgetsOverlayFn?.(customizedDashboard) ?? {};

    const filterContextDefinition = dashboardFilterContextDefinition(customizedDashboard, dateFilterConfig);
    const filterContextIdentity = dashboardFilterContextIdentity(customizedDashboard);
    const displayAsLabels = getDisplayAsLabels(dashboard);
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
        customizedDashboard.layout ?? EmptyDashboardLayout,
        insights,
        settings,
    );

    return [
        filterContextActions.setFilterContext({
            originalFilterContextDefinition: filterContextDefinition,
            filterContextDefinition,
            filterContextIdentity,
            attributeFilterDisplayForms,
        }),
        layoutActions.setLayout(dashboardLayout),
        metaActions.setMeta({
            dashboard: persistedDashboard ?? dashboard,
        }),
        attributeFilterConfigsActions.setAttributeFilterConfigs({
            attributeFilterConfigs: dashboard.attributeFilterConfigs,
        }),
        dateFilterConfigActions.updateDateFilterConfig(dashboard.dateFilterConfig!),
        dateFilterConfigsActions.setDateFilterConfigs({
            dateFilterConfigs: dashboard.dateFilterConfigs,
        }),
        insightsActions.setInsights(insights),
        metaActions.setDashboardTitle(dashboard.title), // even when using persistedDashboard, use the working title of the dashboard
        uiActions.clearWidgetSelection(),
        uiActions.setWidgetsOverlay(modifiedWidgets),
        drillActions.resetCrossFiltering(),
    ];
}
