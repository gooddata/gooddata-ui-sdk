// (C) 2021-2022 GoodData Corporation

import { PayloadAction } from "@reduxjs/toolkit";
import {
    FilterContextItem,
    IAttributeDisplayFormMetadataObject,
    IDashboard,
    IDashboardLayout,
    IDateFilterConfig,
    isDashboardAttributeFilter,
    ISettings,
    IWidget,
} from "@gooddata/sdk-backend-spi";
import { alertsActions } from "../../../store/alerts";
import { filterContextActions } from "../../../store/filterContext";
import { createDefaultFilterContext } from "../../../../_staging/dashboard/defaultFilterContext";
import { layoutActions } from "../../../store/layout";
import { insightsActions } from "../../../store/insights";
import { metaActions } from "../../../store/meta";
import { areObjRefsEqual, IInsight } from "@gooddata/sdk-model";
import {
    dashboardFilterContextDefinition,
    dashboardFilterContextIdentity,
} from "../../../../_staging/dashboard/dashboardFilterContext";
import { dashboardLayoutSanitize } from "../../../../_staging/dashboard/dashboardLayout";
import { SagaIterator } from "redux-saga";
import { resolveFilterDisplayForms } from "../../../utils/filterResolver";
import { call } from "redux-saga/effects";
import { DashboardContext, PrivateDashboardContext } from "../../../types/commonTypes";
import { ObjRefMap } from "../../../../_staging/metadata/objRefMap";
import { ExtendedDashboardWidget } from "../../../types/layoutTypes";
import { getPrivateContext } from "../../../store/_infra/contexts";
import { loadAvailableDisplayFormRefs } from "./loadAvailableDisplayFormRefs";
import { PromiseFnReturnType } from "../../../types/sagas";
import update from "lodash/fp/update";
import isEmpty from "lodash/isEmpty";

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
        alertsActions.setAlerts([]),
        filterContextActions.setFilterContext({
            filterContextDefinition: createDefaultFilterContext(dateFilterConfig),
            attributeFilterDisplayForms: [],
        }),
        layoutActions.setLayout(EmptyDashboardLayout),
        insightsActions.setInsights([]),
        metaActions.setMeta({}),
    ];
}

function* sanitizeFilterContext(
    ctx: DashboardContext,
    filterContext: IDashboard["filterContext"],
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

    const availableRefs: PromiseFnReturnType<typeof loadAvailableDisplayFormRefs> = yield call(
        loadAvailableDisplayFormRefs,
        ctx,
        usedFilterDisplayForms,
    );

    return update(
        "filters",
        (filters: FilterContextItem[]) =>
            filters.filter((filter) => {
                if (!isDashboardAttributeFilter(filter)) {
                    return true;
                }

                return availableRefs.some((ref) => areObjRefsEqual(ref, filter.attributeFilter.displayForm));
            }),
        filterContext,
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
 * @param displayForms - specify display forms that should be used for in-memory resolution of
 *  attribute filter display forms to metadata objects
 */
export function* actionsToInitializeExistingDashboard(
    ctx: DashboardContext,
    dashboard: IDashboard,
    insights: IInsight[],
    settings: ISettings,
    dateFilterConfig: IDateFilterConfig,
    displayForms?: ObjRefMap<IAttributeDisplayFormMetadataObject>,
): SagaIterator<Array<PayloadAction<any>>> {
    const sanitizedFilterContext = yield call(sanitizeFilterContext, ctx, dashboard.filterContext);

    const sanitizedDashboard: IDashboard<ExtendedDashboardWidget> = {
        ...dashboard,
        layout: (dashboard.layout as IDashboardLayout<IWidget>) ?? EmptyDashboardLayout,
        filterContext: sanitizedFilterContext,
    };

    const privateCtx: PrivateDashboardContext = yield call(getPrivateContext);
    const customizedDashboard =
        privateCtx?.existingDashboardTransformFn?.(sanitizedDashboard) ?? sanitizedDashboard;

    const filterContextDefinition = dashboardFilterContextDefinition(customizedDashboard, dateFilterConfig);
    const filterContextIdentity = dashboardFilterContextIdentity(customizedDashboard);
    const attributeFilterDisplayForms = yield call(
        resolveFilterDisplayForms,
        ctx,
        filterContextDefinition.filters,
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
            dashboard,
        }),
    ];
}
