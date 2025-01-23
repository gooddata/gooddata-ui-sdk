// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, select, put, all } from "redux-saga/effects";
import { batchActions } from "redux-batched-actions";
import { convertError } from "@gooddata/sdk-ui";
import { DashboardContext } from "../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../types/sagas.js";
import { InitializeAutomations } from "../../commands/scheduledEmail.js";
import {
    selectFocusObject,
    selectEnableAutomations,
    selectEnableInPlatformNotifications,
    selectIsReadOnly,
} from "../../store/config/configSelectors.js";
import { automationsActions } from "../../store/automations/index.js";
import { selectDashboardId } from "../../store/meta/metaSelectors.js";
import { notificationChannelsActions } from "../../store/notificationChannels/index.js";
import { loadDashboardUserAutomations, loadWorkspaceAutomationsCount } from "./loadAutomations.js";
import { loadNotificationChannels } from "./loadNotificationChannels.js";
import { selectCurrentUser } from "../../store/user/userSelectors.js";
import {
    selectAutomationsIsInitialized,
    selectAutomationsIsLoading,
} from "../../store/automations/automationsSelectors.js";
import { selectCanManageWorkspace } from "../../store/permissions/permissionsSelectors.js";
import {
    filterLocalIdentifier,
    filterObjRef,
    idRef,
    IFilter,
    IInsight,
    insightFilters,
    isAttributeFilter,
    isAbsoluteDateFilter,
    isDateFilter,
    isRelativeDateFilter,
    IInsightWidget,
    isInsightWidget,
} from "@gooddata/sdk-model";
import { changeFilterContextSelectionHandler } from "../filterContext/changeFilterContextSelectionHandler.js";
import { changeFilterContextSelection } from "../../commands/filters.js";
import { IDashboardFilter, isDashboardFilter } from "../../../types.js";
import { selectInsightByWidgetRef } from "../../store/insights/insightsSelectors.js";
import { selectWidgetByRef } from "../../store/layout/layoutSelectors.js";
import omit from "lodash/omit.js";

export function* initializeAutomationsHandler(
    ctx: DashboardContext,
    _cmd: InitializeAutomations,
): SagaIterator {
    const dashboardId: ReturnType<typeof selectDashboardId> = yield select(selectDashboardId);
    const user: ReturnType<typeof selectCurrentUser> = yield select(selectCurrentUser);
    const canManageAutomations: ReturnType<typeof selectCanManageWorkspace> = yield select(
        selectCanManageWorkspace,
    );
    const enableAutomations: ReturnType<typeof selectEnableAutomations> = yield select(
        selectEnableAutomations,
    );
    const enableInPlatformNotifications: ReturnType<typeof selectEnableInPlatformNotifications> =
        yield select(selectEnableInPlatformNotifications);
    const automationsInitialized: ReturnType<typeof selectAutomationsIsInitialized> = yield select(
        selectAutomationsIsInitialized,
    );
    const automationsIsLoading: ReturnType<typeof selectAutomationsIsLoading> = yield select(
        selectAutomationsIsLoading,
    );
    const isReadOnly: ReturnType<typeof selectIsReadOnly> = yield select(selectIsReadOnly);
    const { automationId }: ReturnType<typeof selectFocusObject> = yield select(selectFocusObject);

    if (
        !dashboardId ||
        !user ||
        !enableAutomations ||
        automationsInitialized ||
        automationsIsLoading ||
        isReadOnly
    ) {
        return;
    }

    yield put(automationsActions.setAutomationsLoading(true));

    try {
        const [automations, allAutomationsCount, notificationChannels]: [
            PromiseFnReturnType<typeof loadDashboardUserAutomations>,
            PromiseFnReturnType<typeof loadWorkspaceAutomationsCount>,
            PromiseFnReturnType<typeof loadNotificationChannels>,
        ] = yield all([
            call(loadDashboardUserAutomations, ctx, dashboardId, user.login, !canManageAutomations),
            call(loadWorkspaceAutomationsCount, ctx),
            call(loadNotificationChannels, ctx, enableInPlatformNotifications),
        ]);

        // Set filters according to provided automationId
        if (automationId) {
            const targetAutomation = automations.find((a) => a.id === automationId);
            const targetWidget = targetAutomation?.metadata?.widget;
            const targetFilters = targetAutomation?.alert?.execution?.filters.filter(isDashboardFilter);
            if (targetWidget && targetFilters) {
                const widget: ReturnType<ReturnType<typeof selectWidgetByRef>> = yield select(
                    selectWidgetByRef(idRef(targetWidget)),
                );
                const insight: ReturnType<ReturnType<typeof selectInsightByWidgetRef>> = yield select(
                    selectInsightByWidgetRef(idRef(targetWidget)),
                );

                const filtersToSet =
                    insight && isInsightWidget(widget)
                        ? getDashboardFiltersOnly(targetFilters, insight, widget)
                        : targetFilters;

                // Empty alert execution filters = reset all filters (set them to all).
                // Empty sanitized filters = keep filters as they are, do not reset them (all alert execution filters are insight specific / ignored).
                // Non-empty sanitized filters = set them (some alert execution filters are originating from the dashboard).
                if (targetFilters.length === 0 || filtersToSet.length > 0) {
                    const cmd = changeFilterContextSelection(filtersToSet, true, automationId);
                    yield call(changeFilterContextSelectionHandler, ctx, cmd);
                }
            }
        }

        yield put(
            batchActions([
                automationsActions.setAutomationsInitialized(),
                automationsActions.setAutomationsLoading(false),
                automationsActions.setUserAutomations(automations),
                automationsActions.setAllAutomationsCount(allAutomationsCount),
                notificationChannelsActions.setNotificationChannels(notificationChannels),
                notificationChannelsActions.setNotificationChannelsCount(notificationChannels.length),
            ]),
        );
    } catch (e) {
        yield put(
            batchActions([
                automationsActions.setAutomationsInitialized(),
                automationsActions.setAutomationsLoading(false),
                automationsActions.setAutomationsError(convertError(e)),
            ]),
        );
    }
}

/**
 * Filter out insight and alert only filters from the list of filters
 *
 * @internal
 */
function getDashboardFiltersOnly(filters: IFilter[], insight: IInsight, widget: IInsightWidget) {
    // Remove specific alert filters.
    const withoutAlertFilters = removeAlertFilters(filters);

    // Remove insight specific attribute filters from the list of filters.
    const withoutInsightAttributeFilters = removeInsightAttributeFilters(withoutAlertFilters, insight);

    // If widget has ignored date filter, remove date filter(s) - they originate from the insight, otherwise, it's the dashboard date filter, so keep it.
    const withoutInsightDateFilters = removeDateFiltersIfDateFilterIsIgnored(
        withoutInsightAttributeFilters,
        widget,
    );

    // Remove dataSet from date filters, as it's not relevant for the dashboard date filter.
    return withoutInsightDateFilters.map((f) => {
        if (isDateFilter(f)) {
            if (isRelativeDateFilter(f)) {
                return omit(f, "relativeDateFilter.dataSet");
            } else if (isAbsoluteDateFilter(f)) {
                return omit(f, "absoluteDateFilter.dataSet");
            }
        }
        return f;
    }) as IDashboardFilter[];
}

/**
 * Remove alert filters (these that are set during creation of the alert sliced by attribute) from the list of filters.
 * These filters can be recognized by the fact that they do not have filter objRef (they have localIdentifier only).
 * @internal
 */
function removeAlertFilters(filters: IFilter[]) {
    return filters?.filter((f) => {
        const objRef = filterObjRef(f);
        return !!objRef;
    });
}

/**
 * Remove insight specific attribute filters from the list of filters
 * These filters can be recognized by matching them against insight filters and their local identifiers.
 */
function removeInsightAttributeFilters(filters: IFilter[], insight: IInsight) {
    const insightAttributeFilters = insightFilters(insight).filter(isAttributeFilter);

    // Remove insight specific filters from the list of filters (by matching insight filter localIdentifier)
    return filters.filter((f) => {
        const insightFilter = insightAttributeFilters.find((f2) => {
            return filterLocalIdentifier(f) === filterLocalIdentifier(f2);
        });

        return !insightFilter;
    });
}

/**
 * Remove date filters if widget date filter is ignored.
 * If widget date filter is not ignored, date filter provided to the alert execution is the dashboard date filter.
 */
function removeDateFiltersIfDateFilterIsIgnored(filters: IFilter[], widget: IInsightWidget) {
    const isDateIgnored = !widget.dateDataSet;

    // If widget has ignored date filter, remove it
    return isDateIgnored ? filters.filter((f) => !isDateFilter(f)) : filters;
}
