// (C) 2021-2022 GoodData Corporation

import {
    ObjRef,
    objRefToString,
    isDashboardAttributeFilter,
    IWidgetAlert,
    IKpiWidget,
    IAttributeDisplayFormMetadataObject,
    isKpiWidget,
} from "@gooddata/sdk-model";
import { filterContextItemsToDashboardFiltersByWidget } from "../../converters/index.js";
import isEmpty from "lodash/isEmpty.js";
import { SagaIterator } from "redux-saga";
import { select, call, SagaReturnType } from "redux-saga/effects";
import { ObjRefMap } from "../../_staging/metadata/objRefMap.js";
import { invariant } from "ts-invariant";
import { IDashboardFilter } from "../../types.js";
import { invalidQueryArguments } from "../events/general.js";
import { QueryWidgetBrokenAlerts } from "../queries/widgets.js";
import { selectAlertByWidgetRef } from "../store/alerts/alertsSelectors.js";
import { selectFilterContextFilters } from "../store/filterContext/filterContextSelectors.js";
import { selectAnalyticalWidgetByRef } from "../store/layout/layoutSelectors.js";
import { createQueryService } from "../store/_infra/queryService.js";
import { IBrokenAlertFilterBasicInfo } from "../types/alertTypes.js";
import { DashboardContext } from "../types/commonTypes.js";
import { resolveDisplayFormMetadata } from "../utils/displayFormResolver.js";
import { getBrokenAlertFiltersBasicInfo } from "../utils/alertsUtils.js";

export const QueryWidgetBrokenAlertService = createQueryService(
    "GDC.DASH/QUERY.WIDGET.BROKEN_ALERTS",
    queryService,
);

function* queryService(
    ctx: DashboardContext,
    query: QueryWidgetBrokenAlerts,
): SagaIterator<IBrokenAlertFilterBasicInfo[]> {
    const {
        payload: { widgetRef },
        correlationId,
    } = query;

    const { alert, kpiWidget }: SagaReturnType<typeof getKpiWidgetAndAlert> = yield call(
        getKpiWidgetAndAlert,
        widgetRef,
        ctx,
        correlationId,
    );

    const alertFilters = alert?.filterContext?.filters;

    // no filters -> no filters can be broken, bail early
    if (!alert || !alertFilters) {
        return [];
    }

    const displayFormsMap: SagaReturnType<typeof resolveDisplayForms> = yield call(
        resolveDisplayForms,
        alert,
        ctx,
    );
    const appliedFilters: SagaReturnType<typeof getDashboardFilters> = yield call(
        getDashboardFilters,
        kpiWidget,
    );

    return getBrokenAlertFiltersBasicInfo(alert, kpiWidget, appliedFilters, displayFormsMap);
}

interface GetKpiWidgetAndAlertResult {
    kpiWidget: IKpiWidget;
    alert: IWidgetAlert | undefined;
}

function* getKpiWidgetAndAlert(
    widgetRef: ObjRef,
    ctx: DashboardContext,
    correlationId?: string,
): SagaIterator<GetKpiWidgetAndAlertResult> {
    const widgetSelector = selectAnalyticalWidgetByRef(widgetRef);
    const kpiWidget: ReturnType<typeof widgetSelector> = yield select(widgetSelector);

    if (!kpiWidget) {
        throw invalidQueryArguments(
            ctx,
            `Widget with ref ${objRefToString(widgetRef)} does not exist on the dashboard`,
            correlationId,
        );
    }

    if (!isKpiWidget(kpiWidget)) {
        throw invalidQueryArguments(
            ctx,
            `Widget with ref ${objRefToString(
                widgetRef,
            )} is not IKpiWidget, only IKpiWidget could has alert assign.`,
            correlationId,
        );
    }

    const alertSelector = selectAlertByWidgetRef(kpiWidget.ref);
    const alert: ReturnType<typeof alertSelector> = yield select(alertSelector);

    return { alert, kpiWidget };
}

function* resolveDisplayForms(
    alert: IWidgetAlert,
    ctx: DashboardContext,
): SagaIterator<ObjRefMap<IAttributeDisplayFormMetadataObject>> {
    const displayFormIds = extractDisplayFormRefs(alert);

    const result: SagaReturnType<typeof resolveDisplayFormMetadata> = yield call(
        resolveDisplayFormMetadata,
        ctx,
        displayFormIds,
    );

    // if some display forms could not be resolved then there is something seriously wrong
    invariant(isEmpty(result.missing), "Unable resolve some AttributeDisplayForms defined by alert filters");

    return result.resolved;
}

function* getDashboardFilters(kpiWidget: IKpiWidget): SagaIterator<IDashboardFilter[]> {
    const dashboardFilters: ReturnType<typeof selectFilterContextFilters> = yield select(
        selectFilterContextFilters,
    );
    const allFilters = filterContextItemsToDashboardFiltersByWidget(dashboardFilters, kpiWidget);

    return allFilters ?? [];
}

function extractDisplayFormRefs(alert: IWidgetAlert): ObjRef[] {
    const alertFilters = alert.filterContext?.filters ?? [];

    return alertFilters.filter(isDashboardAttributeFilter).map((filter) => {
        return filter.attributeFilter.displayForm;
    });
}
