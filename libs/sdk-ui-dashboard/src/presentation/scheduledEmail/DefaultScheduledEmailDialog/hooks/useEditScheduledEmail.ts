// (C) 2019-2024 GoodData Corporation
import { useState } from "react";
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IExportDefinitionMetadataObjectDefinition,
    isExportDefinitionDashboardContent,
    IAutomationRecipient,
    FilterContextItem,
} from "@gooddata/sdk-model";
import parseISO from "date-fns/parseISO/index.js";
import { getUserTimezone } from "../utils/timezone.js";
import { useDashboardSelector, selectDashboardTitle, selectDashboardId } from "../../../../model/index.js";
import { Alignment, normalizeTime } from "@gooddata/sdk-ui-kit";
import { IScheduledEmailDialogProps } from "../../types.js";
import { toModifiedISOString } from "../../DefaultScheduledEmailManagementDialog/utils.js";
import { useAttachmentDashboardFilters } from "./useAttachmentDashboardFilters.js";
import { getAutomationDashboardFilters, isDashboardAutomation } from "../utils/automationFilters.js";

export function useEditScheduledEmail(props: IScheduledEmailDialogProps) {
    const { editSchedule, webhooks } = props;
    const dashboardId = useDashboardSelector(selectDashboardId);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const dashboardEditFilters = getAutomationDashboardFilters(editSchedule);
    const { areFiltersChanged, filtersToStore } = useAttachmentDashboardFilters({
        customFilters: dashboardEditFilters,
    });

    const [state, setState] = useState<IAutomationMetadataObject | IAutomationMetadataObjectDefinition>(
        editSchedule ??
            newAutomationMetadataObjectDefinition({
                dashboardId: dashboardId!,
                dashboardTitle,
                filters: areFiltersChanged ? filtersToStore : undefined,
                webhook: webhooks[0]?.id,
            }),
    );

    const [originalState] = useState(state);

    const onTitleChange = (value: string) => setState((s) => ({ ...s, title: value }));

    const onRecurrenceChange = (cronExpression: string, startDate: Date) => {
        setState((s) => ({
            ...s,
            schedule: {
                ...(s.schedule ?? {}),
                cron: cronExpression,
                firstRun: toModifiedISOString(startDate),
            },
        }));
    };

    const onDestinationChange = (webhookId: string): void => {
        setState((s) => ({ ...s, webhook: webhookId }));
    };

    const onRecipientsChange = (updatedRecipients: IAutomationRecipient[]): void => {
        setState((s) => ({
            ...s,
            recipients: updatedRecipients,
        }));
    };

    const onSubjectChange = (value: string | number): void => {
        setState((s) => ({
            ...s,
            details: {
                ...(s.details ?? {}),
                subject: value as string,
            },
        }));
    };

    const onMessageChange = (value: string): void => {
        setState((s) => ({
            ...s,
            details: {
                ...(s.details ?? {}),
                message: value,
            },
        }));
    };

    const onAttachmentsChange = (dashboardSelected: boolean, filters?: FilterContextItem[]): void => {
        if (dashboardSelected) {
            const dashboardExportDefinition = newDashboardExportDefinitionMetadataObjectDefinition({
                dashboardId: dashboardId!,
                dashboardTitle,
                filters,
            });
            const dashboardExportDefinitionExists = isDashboardAutomation(state);
            const updatedExportDefinitions = dashboardExportDefinitionExists
                ? state.exportDefinitions?.map((exportDefinition) =>
                      isExportDefinitionDashboardContent(exportDefinition.requestPayload.content)
                          ? dashboardExportDefinition
                          : exportDefinition,
                  )
                : [...(state.exportDefinitions ?? []), dashboardExportDefinition];

            setState((s) => ({
                ...s,
                exportDefinitions: updatedExportDefinitions,
            }));
        } else {
            setState((s) => ({
                ...s,
                exportDefinitions: s.exportDefinitions?.filter(
                    (exportDefinition) =>
                        !isExportDefinitionDashboardContent(exportDefinition.requestPayload.content),
                ),
            }));
        }
    };

    return {
        originalAutomation: originalState,
        automation: state,
        onTitleChange,
        onRecurrenceChange,
        onDestinationChange,
        onRecipientsChange,
        onSubjectChange,
        onMessageChange,
        onAttachmentsChange,
    };
}

export function useScheduledEmailDialogAlignment() {
    const [alignState, setAlignState] = useState("cc cc");
    const alignPoints = [
        {
            align: alignState,
        },
    ];
    const onAlign = (alignment: Alignment) => {
        if (alignment.top < 0) {
            setAlignState("tc tc");
        } else {
            setAlignState("cc cc");
        }
    };

    return { alignPoints, onAlign };
}

function newDashboardExportDefinitionMetadataObjectDefinition({
    dashboardId,
    dashboardTitle,
    filters,
}: {
    dashboardId: string;
    dashboardTitle: string;
    filters?: FilterContextItem[];
}): IExportDefinitionMetadataObjectDefinition {
    const filtersObj = filters ? { filters } : {};

    return {
        type: "exportDefinition",
        title: dashboardTitle,
        requestPayload: {
            fileName: dashboardTitle,
            format: "PDF",
            content: {
                dashboard: dashboardId,
                ...filtersObj,
            },
        },
    };
}

function newAutomationMetadataObjectDefinition({
    dashboardId,
    dashboardTitle,
    webhook,
    filters,
}: {
    dashboardId: string;
    dashboardTitle: string;
    webhook: string;
    filters?: FilterContextItem[];
}): IAutomationMetadataObjectDefinition {
    const firstRun = parseISO(new Date().toISOString());
    const normalizedFirstRun = normalizeTime(firstRun, undefined, 60);
    const cron = getDefaultCronExpression(normalizedFirstRun);
    const filtersObj = filters ? { filters } : {};

    const automation: IAutomationMetadataObjectDefinition = {
        type: "automation",
        title: undefined,
        description: undefined,
        tags: [],
        schedule: {
            firstRun: toModifiedISOString(normalizedFirstRun),
            timezone: getUserTimezone().identifier,
            cron,
        },
        details: {
            message: "",
            subject: "",
        },
        exportDefinitions: [
            {
                type: "exportDefinition",
                title: dashboardTitle,
                requestPayload: {
                    fileName: dashboardTitle,
                    format: "PDF",
                    content: {
                        dashboard: dashboardId,
                        ...filtersObj,
                    },
                },
            },
        ],
        recipients: [],
        webhook,
    };

    return automation;
}

export function getDefaultCronExpression(date: Date) {
    return `0 0 ${date.getHours()} ? * *`;
}
