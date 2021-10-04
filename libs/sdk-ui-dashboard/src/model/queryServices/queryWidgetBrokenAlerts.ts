// (C) 2021 GoodData Corporation

import {
    IAttributeDisplayFormMetadataObject,
    IKpiWidget,
    isDashboardAttributeFilter,
    isKpiWidget,
    IWidgetAlert,
} from "@gooddata/sdk-backend-spi";
import { ObjRef, objRefToString } from "@gooddata/sdk-model";
import { filterContextItemsToFiltersForWidget } from "../../converters";
import isEmpty from "lodash/isEmpty";
import { SagaIterator } from "redux-saga";
import { select, call, SagaReturnType } from "redux-saga/effects";
import { ObjRefMap } from "../../_staging/metadata/objRefMap";
import invariant from "ts-invariant";
import { IDashboardFilter } from "../../types";
import { invalidQueryArguments } from "../events/general";
import { QueryWidgetBrokenAlerts } from "../queries/widgets";
import { selectAlertByWidgetRef } from "../store/alerts/alertsSelectors";
import { selectFilterContextFilters } from "../store/filterContext/filterContextSelectors";
import { selectWidgetByRef } from "../store/layout/layoutSelectors";
import { createQueryService } from "../store/_infra/queryService";
import { IBrokenAlertFilterBasicInfo } from "../types/alertTypes";
import { DashboardContext } from "../types/commonTypes";
import { resolveDisplayFormMetadata } from "../utils/displayFormResolver";
import { getBrokenAlertFiltersBasicInfo } from "../utils/alertsUtils";

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
    const widgetSelector = selectWidgetByRef(widgetRef);
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
    const allFilters = filterContextItemsToFiltersForWidget(dashboardFilters, kpiWidget);

    return allFilters ?? [];
}

function extractDisplayFormRefs(alert: IWidgetAlert): ObjRef[] {
    const alertFilters = alert.filterContext?.filters ?? [];

    return alertFilters.filter(isDashboardAttributeFilter).map((filter) => {
        return filter.attributeFilter.displayForm;
    });
}
