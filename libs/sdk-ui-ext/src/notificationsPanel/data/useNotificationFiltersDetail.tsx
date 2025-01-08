// (C) 2024-2025 GoodData Corporation
import {
    areObjRefsEqual,
    filterObjRef,
    IAttributeFilter,
    isAttributeFilter,
    isDateFilter,
    isPositiveAttributeFilter,
    LocalIdRef,
    IAlertNotification,
    ObjRef,
    idRef,
    IInsightWidget,
    IdentifierRef,
    filterLocalIdentifier,
} from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise } from "@gooddata/sdk-ui";
import { useMemo } from "react";
import { translateAttributeFilter } from "./attributeFilterNaming.js";
import { defineMessages, useIntl } from "react-intl";
import { translateDateFilter } from "./dateFilterNaming.js";
import { IAnalyticalBackend, layoutWidgets } from "@gooddata/sdk-backend-spi";

const messages = defineMessages({
    title: {
        id: "notifications.filters.dialog.title",
    },
    dateRange: {
        id: "notifications.filters.dialog.dateRange",
    },
});

function getObjRefInScopeLocalId(attributeFilter: IAttributeFilter) {
    if (isPositiveAttributeFilter(attributeFilter)) {
        return (attributeFilter.positiveAttributeFilter.displayForm as LocalIdRef).localIdentifier;
    }
    return (attributeFilter.negativeAttributeFilter.displayForm as LocalIdRef).localIdentifier;
}

function fetchAutomation(backend: IAnalyticalBackend, workspaceId: string, automationId: string) {
    return backend.workspace(workspaceId).automations().getAutomation(automationId);
}

function fetchDashboard(backend: IAnalyticalBackend, workspaceId: string, dashboardId: string) {
    return backend.workspace(workspaceId).dashboards().getDashboardWithReferences(idRef(dashboardId));
}

function fetchLabels(backend: IAnalyticalBackend, workspaceId: string, filterDisplayFormsRefs: ObjRef[]) {
    return backend.workspace(workspaceId).attributes().getAttributeDisplayForms(filterDisplayFormsRefs);
}

export function useNotificationsFilterDetail(notification: IAlertNotification) {
    const backend = useBackendStrict(undefined, "NotificationTriggerDetails");
    const intl = useIntl();
    const automationPromise = useCancelablePromise(
        {
            promise: async () => {
                if (!notification.automationId || !notification.workspaceId) {
                    return null;
                }

                const automation = await fetchAutomation(
                    backend,
                    notification.workspaceId,
                    notification.automationId,
                );

                const automationAlert = automation?.alert;
                if (!automationAlert) {
                    return null;
                }

                const filterDisplayFormsRefs = automationAlert.execution.filters
                    .filter((f) => isAttributeFilter(f))
                    .map((filter) => {
                        const ref = filterObjRef(filter);
                        if (!ref) {
                            const attribute = automationAlert.execution.attributes.find(
                                (a) =>
                                    a.attribute.localIdentifier ===
                                    getObjRefInScopeLocalId(filter as IAttributeFilter),
                            );

                            if (!attribute) {
                                return null;
                            }

                            return attribute.attribute.displayForm;
                        }
                        return filterObjRef(filter);
                    })
                    .filter(Boolean) as ObjRef[];

                const dashboardId = automation?.dashboard;

                const dashboardPromise = dashboardId
                    ? fetchDashboard(backend, notification.workspaceId, dashboardId)
                    : Promise.resolve(null);

                const labelsPromise = fetchLabels(backend, notification.workspaceId, filterDisplayFormsRefs);

                const [dashboard, labels] = await Promise.all([dashboardPromise, labelsPromise]);

                return { automation, dashboard, labels };
            },
        },
        [notification.automationId, notification.workspaceId],
    );

    const filtersInfo = useMemo(() => {
        if (!automationPromise.result) {
            return null;
        }
        const { automation, dashboard, labels } = automationPromise.result;

        const alert = automation?.alert;
        if (!alert) {
            return [];
        }

        const widgets = dashboard?.dashboard.layout ? layoutWidgets(dashboard.dashboard.layout) : [];
        const widget = widgets.find((w) => w.identifier === automation.metadata?.widget);
        const insight = dashboard?.references.insights.find(
            (i) => i.insight.identifier === ((widget as IInsightWidget).insight as IdentifierRef).identifier,
        );
        const filtersWithoutInsightFilters = alert.execution.filters.filter((f) => {
            const insightFilter = insight?.insight.filters.find((f2) => {
                return filterLocalIdentifier(f) === filterLocalIdentifier(f2);
            });
            return !insightFilter;
        });

        return filtersWithoutInsightFilters
            .map((filter) => {
                let ref = filterObjRef(filter);
                let subtitle = "";
                let title = "";

                if (isAttributeFilter(filter)) {
                    const attribute = alert.execution.attributes.find(
                        (a) => a.attribute.localIdentifier === getObjRefInScopeLocalId(filter),
                    );
                    if (attribute) {
                        ref = attribute.attribute.displayForm;
                    }

                    subtitle = translateAttributeFilter(intl, filter);
                    title = labels.find((l) => areObjRefsEqual(l.ref, ref))?.title ?? "";
                } else if (isDateFilter(filter)) {
                    subtitle = translateDateFilter(intl, filter, "MM/dd/yyyy");
                    title = intl.formatMessage(messages.dateRange);
                } else {
                    return null;
                }

                return { title, subtitle };
            })
            .filter(Boolean) as { title: string; subtitle: string }[];
    }, [automationPromise.result, intl]);

    return { filtersInfo, automationPromise };
}
