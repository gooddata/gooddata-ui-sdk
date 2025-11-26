// (C) 2021-2025 GoodData Corporation

import { compact, omit } from "lodash-es";
import { batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { all, call, put, select } from "redux-saga/effects";

import { generateDateFilterLocalIdentifier } from "@gooddata/sdk-backend-base";
import {
    FilterContextItem,
    IAutomationMetadataObject,
    IExportDefinitionDashboardRequestPayload,
    IExportDefinitionVisualizationObjectRequestPayload,
    IFilter,
    IInsight,
    IInsightWidget,
    dashboardFilterLocalIdentifier,
    filterLocalIdentifier,
    filterObjRef,
    idRef,
    insightFilters,
    isAbsoluteDateFilter,
    isAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDateFilter,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
    isInsightWidget,
    isRelativeDateFilter,
} from "@gooddata/sdk-model";
import { convertError } from "@gooddata/sdk-ui";

import { loadDashboardUserAutomations, loadWorkspaceAutomationsCount } from "./loadAutomations.js";
import { loadNotificationChannels } from "./loadNotificationChannels.js";
import { dashboardFilterToFilterContextItem } from "../../../_staging/dashboard/dashboardFilterContext.js";
import { IDashboardFilter, isDashboardFilter } from "../../../types.js";
import { changeFilterContextSelection } from "../../commands/filters.js";
import { InitializeAutomations } from "../../commands/scheduledEmail.js";
import { switchDashboardTab } from "../../commands/tabs.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import {
    selectAutomationsIsInitialized,
    selectAutomationsIsLoading,
} from "../../store/automations/automationsSelectors.js";
import { automationsActions } from "../../store/automations/index.js";
import {
    selectEnableAutomations,
    selectEnableInPlatformNotifications,
    selectEnableNotificationChannelIdentifiers,
    selectEnableScheduling,
    selectExternalRecipient,
    selectFocusObject,
    selectIsReadOnly,
    selectOpenAutomationOnLoad,
} from "../../store/config/configSelectors.js";
import { selectInsightByWidgetRef } from "../../store/insights/insightsSelectors.js";
import { selectDashboardId } from "../../store/meta/metaSelectors.js";
import { notificationChannelsActions } from "../../store/notificationChannels/index.js";
import { selectCanManageWorkspace } from "../../store/permissions/permissionsSelectors.js";
import { selectFilterContextFilters } from "../../store/tabs/filterContext/filterContextSelectors.js";
import {
    selectTabLocalIdentifierByWidgetRef,
    selectWidgetByRef,
} from "../../store/tabs/layout/layoutSelectors.js";
import { selectActiveTabLocalIdentifier } from "../../store/tabs/tabsSelectors.js";
import { uiActions } from "../../store/ui/index.js";
import { selectCurrentUser } from "../../store/user/userSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../types/sagas.js";
import { changeFilterContextSelectionHandler } from "../filterContext/changeFilterContextSelectionHandler.js";
import { switchDashboardTabHandler } from "../tabs/switchDashboardTabHandler.js";

export function* initializeAutomationsHandler(
    ctx: DashboardContext,
    _cmd: InitializeAutomations,
): SagaIterator {
    const dashboardId: ReturnType<typeof selectDashboardId> = yield select(selectDashboardId);
    const user: ReturnType<typeof selectCurrentUser> = yield select(selectCurrentUser);
    const canManageAutomations: ReturnType<typeof selectCanManageWorkspace> =
        yield select(selectCanManageWorkspace);
    const enableAutomations: ReturnType<typeof selectEnableScheduling> =
        yield select(selectEnableAutomations);
    const enableInPlatformNotifications: ReturnType<typeof selectEnableInPlatformNotifications> =
        yield select(selectEnableInPlatformNotifications);
    const enableNotificationChannelIdentifiers: ReturnType<
        typeof selectEnableNotificationChannelIdentifiers
    > = yield select(selectEnableNotificationChannelIdentifiers);
    const automationsInitialized: ReturnType<typeof selectAutomationsIsInitialized> = yield select(
        selectAutomationsIsInitialized,
    );
    const automationsIsLoading: ReturnType<typeof selectAutomationsIsLoading> =
        yield select(selectAutomationsIsLoading);
    const isReadOnly: ReturnType<typeof selectIsReadOnly> = yield select(selectIsReadOnly);
    const { automationId }: ReturnType<typeof selectFocusObject> = yield select(selectFocusObject);
    const externalRecipient: ReturnType<typeof selectExternalRecipient> =
        yield select(selectExternalRecipient);
    const openAutomationOnLoad: ReturnType<typeof selectOpenAutomationOnLoad> =
        yield select(selectOpenAutomationOnLoad);

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
            call(
                loadDashboardUserAutomations,
                ctx,
                dashboardId,
                user.login,
                !canManageAutomations,
                externalRecipient,
            ),
            call(loadWorkspaceAutomationsCount, ctx),
            call(
                loadNotificationChannels,
                ctx,
                enableInPlatformNotifications,
                enableNotificationChannelIdentifiers,
            ),
        ]);

        // Set filters according to provided automationId
        if (automationId) {
            const targetAutomation = automations.find((a) => a.id === automationId);
            const targetWidget = targetAutomation?.metadata?.widget;

            // Switch to the tab containing the target widget if necessary
            if (targetWidget) {
                const widgetRef = idRef(targetWidget);
                const widgetTabId: ReturnType<ReturnType<typeof selectTabLocalIdentifierByWidgetRef>> =
                    yield select(selectTabLocalIdentifierByWidgetRef(widgetRef));
                const currentActiveTabId: ReturnType<typeof selectActiveTabLocalIdentifier> = yield select(
                    selectActiveTabLocalIdentifier,
                );

                // If widget is on a different tab, switch to it before continuing
                if (widgetTabId && widgetTabId !== currentActiveTabId) {
                    const switchTabCmd = switchDashboardTab(widgetTabId);
                    const switchedEvent = yield call(switchDashboardTabHandler, ctx, switchTabCmd);
                    yield dispatchDashboardEvent(switchedEvent);
                }
            }

            const insight: ReturnType<ReturnType<typeof selectInsightByWidgetRef>> = yield select(
                selectInsightByWidgetRef(targetWidget ? idRef(targetWidget) : undefined),
            );

            const filterContextFilters: ReturnType<typeof selectFilterContextFilters> =
                yield select(selectFilterContextFilters);
            const commonDateFilter = filterContextFilters.find(isDashboardCommonDateFilter);
            const commonDateFilterLocalId =
                commonDateFilter?.dateFilter.localIdentifier ?? generateDateFilterLocalIdentifier(0);

            const activeTabLocalIdentifier: ReturnType<typeof selectActiveTabLocalIdentifier> = yield select(
                selectActiveTabLocalIdentifier,
            );

            const {
                targetAlertFilters,
                targetExportDefinition,
                targetExportDefinitionFilters,
                targetExportVisibleFilters,
            } = extractRelevantFilters(targetAutomation, insight, activeTabLocalIdentifier);

            // Set filters to the dashboard based on alert execution filters
            if (targetWidget && targetAlertFilters) {
                const widget: ReturnType<ReturnType<typeof selectWidgetByRef>> = yield select(
                    selectWidgetByRef(idRef(targetWidget)),
                );
                const filtersToSet =
                    insight && isInsightWidget(widget)
                        ? getDashboardFiltersOnly(
                              targetAlertFilters,
                              commonDateFilterLocalId,
                              insight,
                              widget,
                          )
                        : targetAlertFilters;

                // Empty alert execution filters = reset all filters (set them to all).
                // Empty sanitized filters = keep filters as they are, do not reset them (all alert execution filters are insight specific / ignored).
                // Non-empty sanitized filters = set them (some alert execution filters are originating from the dashboard).
                if (targetAlertFilters.length === 0 || filtersToSet.length > 0) {
                    const cmd = changeFilterContextSelection(filtersToSet, true, automationId);
                    yield call(changeFilterContextSelectionHandler, ctx, cmd);
                }
            }

            // Set filters to the dashboard based on export definition filters
            if (targetExportDefinition && targetExportDefinitionFilters) {
                const filtersToSet =
                    targetExportDefinitionFilters?.filter((filter) => {
                        if (targetExportVisibleFilters) {
                            return targetExportVisibleFilters.some(
                                (f) => f.localIdentifier === dashboardFilterLocalIdentifier(filter),
                            );
                        }
                        return true;
                    }) ?? [];

                const sanitizedFiltersToSet = sanitizeDateFilters(filtersToSet, commonDateFilterLocalId);

                // Empty schedule execution filters = reset all filters (set them to all).
                // Empty sanitized filters = keep filters as they are, do not reset them (all schedule execution filters are ignored).
                // Non-empty sanitized filters = set them (some schedule export definition filters are originating from the dashboard).
                if (targetExportDefinitionFilters.length === 0 || sanitizedFiltersToSet.length > 0) {
                    const cmd = changeFilterContextSelection(sanitizedFiltersToSet, true, automationId);
                    yield call(changeFilterContextSelectionHandler, ctx, cmd);
                }
            }

            if (targetAutomation && openAutomationOnLoad) {
                const widgetRef = targetWidget && idRef(targetWidget);

                if (targetAutomation.alert) {
                    yield put(
                        uiActions.openAlertingDialog({
                            widgetRef: widgetRef || undefined,
                            alert: targetAutomation,
                        }),
                    );
                }

                if (targetAutomation.schedule) {
                    yield put(
                        uiActions.openScheduleEmailDialog({
                            ...(widgetRef
                                ? { widgetRef, openedFrom: "widget" }
                                : { openedFrom: "dashboard" }),
                            schedule: targetAutomation,
                        }),
                    );
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

function extractRelevantFilters(
    targetAutomation: IAutomationMetadataObject | undefined,
    insight: IInsight | undefined,
    activeTabLocalIdentifier?: string,
) {
    //alert, widget
    const targetAlertFilters = targetAutomation?.alert?.execution?.filters;
    const sanitizedTargetAlertFilters =
        // Remove filters that are applied in the insight
        targetAlertFilters && insight
            ? removeInsightAttributeFilters(targetAlertFilters, insight).filter(isDashboardFilter)
            : undefined;

    //export definition
    const targetExportDefinition = targetAutomation?.exportDefinitions?.[0];
    const targetExportDefinitionFilters = extractExportDefinitionFilters(
        targetExportDefinition?.requestPayload,
        activeTabLocalIdentifier,
    );
    const targetExportVisibleFilters = targetAutomation?.metadata?.visibleFilters;

    return {
        targetAlertFilters: sanitizedTargetAlertFilters,
        targetExportDefinition,
        targetExportDefinitionFilters,
        targetExportVisibleFilters,
    };
}

function extractExportDefinitionFilters(
    content?: IExportDefinitionVisualizationObjectRequestPayload | IExportDefinitionDashboardRequestPayload,
    activeTabLocalIdentifier?: string,
): FilterContextItem[] | undefined {
    if (isExportDefinitionDashboardRequestPayload(content)) {
        // Check if per-tab filters are provided and use the active tab's filters
        if (content.content.filtersByTab && activeTabLocalIdentifier) {
            const tabFilters = content.content.filtersByTab[activeTabLocalIdentifier];
            return tabFilters ? compact(tabFilters) : undefined;
        }

        // The filters in dashboard case may be undefined or an array depending
        // on whether they should override filter context or use live filter context.
        return content.content.filters ? compact(content.content.filters) : undefined;
    }
    if (isExportDefinitionVisualizationObjectRequestPayload(content)) {
        return compact(
            content.content.filters?.filter(isDashboardFilter).map((filter) => {
                return dashboardFilterToFilterContextItem(filter, true);
            }),
        );
    }
    return [];
}

/**
 * Sanitizes date filters by removing dataset information when needed.
 *
 * Automation filters may contain date filters with dataset information. However,
 * when applying these filters to the dashboard, the dataset needs to be removed
 * to properly match the dashboard's common date filter.
 *
 * This function removes the dataset from any date filter that matches the
 * dashboard's common date filter local identifier, or from filters that already
 * have no dataset (common date filters).
 *
 * @param filters - Filters to sanitize
 * @param commonDateFilterLocalId - Local identifier of the common date filter
 */
function sanitizeDateFilters(filters: FilterContextItem[], commonDateFilterLocalId: string | undefined) {
    return filters.map((filter) => {
        if (isDashboardDateFilter(filter)) {
            // Primary match: by local identifier
            const matchesByLocalId =
                commonDateFilterLocalId && filter.dateFilter.localIdentifier === commonDateFilterLocalId;

            // Fallback: filters without datasets are common date filters
            const isCommonFilter = !filter.dateFilter.dataSet;

            if (matchesByLocalId || isCommonFilter) {
                // Remove dataset to ensure it's treated as common date filter
                return {
                    ...filter,
                    dateFilter: {
                        ...omit(filter.dateFilter, "dataSet"),
                    },
                };
            }
        }

        return filter;
    });
}

/**
 * Filter out insight and alert only filters from the list of filters
 *
 * @param filters - Filters to process
 * @param commonDateFilterLocalId - Local identifier of the common date filter
 * @param insight - Insight to check filters against
 * @param widget - Widget to check filters against
 *
 * @internal
 */
function getDashboardFiltersOnly(
    filters: IFilter[],
    commonDateFilterLocalId: string | undefined,
    insight: IInsight,
    widget: IInsightWidget,
) {
    // Remove specific alert filters.
    const withoutAlertFilters = removeAlertFilters(filters);

    // Remove insight specific attribute filters from the list of filters.
    const withoutInsightAttributeFilters = removeInsightAttributeFilters(withoutAlertFilters, insight);

    // If widget has ignored date filter, remove date filter(s) - they originate from the insight, otherwise, it's the dashboard date filter, so keep it.
    const withoutInsightDateFilters = removeDateFiltersIfDateFilterIsIgnored(
        withoutInsightAttributeFilters,
        widget,
    );

    // Find common date filter by local id or by absence of dataset
    const dateFilters = withoutInsightDateFilters.filter(isDateFilter);
    const foundCommonFilter = dateFilters.find((f) => {
        if (isRelativeDateFilter(f)) {
            const matchesByLocalId =
                commonDateFilterLocalId && f.relativeDateFilter.localIdentifier === commonDateFilterLocalId;
            const hasNoDataset = !f.relativeDateFilter.dataSet;
            return matchesByLocalId || hasNoDataset;
        }
        const matchesByLocalId =
            commonDateFilterLocalId && f.absoluteDateFilter.localIdentifier === commonDateFilterLocalId;
        const hasNoDataset = !f.absoluteDateFilter.dataSet;
        return matchesByLocalId || hasNoDataset;
    });

    // Remove dataSet from date filters, as it's not relevant for the dashboard date filter.
    return withoutInsightDateFilters.map((f) => {
        if (f === foundCommonFilter) {
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
