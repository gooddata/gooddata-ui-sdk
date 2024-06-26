// (C) 2019-2024 GoodData Corporation
import { useState } from "react";
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IExportDefinitionMetadataObjectDefinition,
    isExportDefinitionDashboardContent,
    IAutomationRecipient,
} from "@gooddata/sdk-model";
import parseISO from "date-fns/parseISO/index.js";
import { getUserTimezone } from "../utils/timezone.js";
import { useDashboardSelector, selectDashboardTitle, selectDashboardId } from "../../../../model/index.js";
import { Alignment, normalizeTime } from "@gooddata/sdk-ui-kit";
import { IScheduledEmailDialogProps } from "../../types.js";

export function useEditScheduledEmail(props: IScheduledEmailDialogProps) {
    const { editSchedule, webhooks } = props;
    const dashboardId = useDashboardSelector(selectDashboardId);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);

    const [state, setState] = useState<IAutomationMetadataObject | IAutomationMetadataObjectDefinition>(
        editSchedule ??
            newAutomationMetadataObjectDefinition({
                dashboardId: dashboardId!,
                dashboardTitle,
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
                firstRun: startDate.toISOString(),
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

    const onAttachmentsChange = (dashboardSelected: boolean): void => {
        const exportDefinitions = dashboardSelected
            ? [
                  ...(state.exportDefinitions ?? []),
                  newDashboardExportDefinitionMetadataObjectDefinition({
                      dashboardId: dashboardId!,
                      dashboardTitle,
                  }),
              ]
            : state.exportDefinitions?.filter((exportDefinition) =>
                  isExportDefinitionDashboardContent(exportDefinition.requestPayload.content)
                      ? exportDefinition.requestPayload.content.dashboard !== dashboardId
                      : true,
              );

        setState((s) => ({
            ...s,
            exportDefinitions,
        }));
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
}: {
    dashboardId: string;
    dashboardTitle: string;
}): IExportDefinitionMetadataObjectDefinition {
    return {
        type: "exportDefinition",
        title: dashboardTitle,
        requestPayload: {
            fileName: dashboardTitle,
            format: "PDF",
            content: {
                dashboard: dashboardId,
            },
        },
    };
}

function newAutomationMetadataObjectDefinition({
    dashboardId,
    dashboardTitle,
    webhook,
}: {
    dashboardId: string;
    dashboardTitle: string;
    webhook: string;
}): IAutomationMetadataObjectDefinition {
    const firstRun = parseISO(new Date().toISOString());
    const normalizedFirstRun = normalizeTime(firstRun);
    const cron = getDefaultCronExpression(firstRun);

    const automation: IAutomationMetadataObjectDefinition = {
        type: "automation",
        title: undefined,
        description: undefined,
        tags: [],
        schedule: {
            firstRun: normalizedFirstRun.toISOString(),
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
                title: "",
                requestPayload: {
                    fileName: dashboardTitle,
                    format: "PDF",
                    content: {
                        dashboard: dashboardId,
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
    return `0 ${date.getMinutes()} ${date.getHours()} ? * *`;
}
