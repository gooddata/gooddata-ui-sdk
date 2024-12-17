// (C) 2024 GoodData Corporation
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
} from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { useMemo } from "react";
import { translateAttributeFilter } from "./attributeFilterNaming.js";
import { defineMessages, useIntl } from "react-intl";
import { translateDateFilter } from "./dateFilterNaming.js";

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

export function useNotificationsFilterDetail(notification: IAlertNotification) {
    const workspaceId = useWorkspaceStrict(undefined, "NotificationTriggerDetails");
    const backend = useBackendStrict(undefined, "NotificationTriggerDetails");
    const intl = useIntl();
    const automationPromise = useCancelablePromise(
        {
            promise: async () => {
                if (!notification.automationId) {
                    return null;
                }
                const automation = await backend
                    .workspace(workspaceId)
                    .automations()
                    .getAutomation(notification.automationId);

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

                const labels = await backend
                    .workspace(workspaceId)
                    .attributes()
                    .getAttributeDisplayForms(filterDisplayFormsRefs);

                return { automation, labels };
            },
        },
        [notification.automationId, workspaceId],
    );

    const filtersInfo = useMemo(() => {
        if (!automationPromise.result) {
            return null;
        }
        const { automation, labels } = automationPromise.result;

        const alert = automation?.alert;
        if (!alert) {
            return [];
        }

        return alert.execution.filters
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
