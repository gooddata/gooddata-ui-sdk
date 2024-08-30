// (C) 2019-2024 GoodData Corporation
import { useState } from "react";
import {
    IAutomationMetadataObjectDefinition,
    IExportDefinitionMetadataObjectDefinition,
    IAutomationRecipient,
    FilterContextItem,
    IExportDefinitionVisualizationObjectSettings,
    isExportDefinitionVisualizationObjectRequestPayload,
    isExportDefinitionDashboardRequestPayload,
    IExportDefinitionVisualizationObjectContent,
    IInsight,
    IAutomationMetadataObject,
} from "@gooddata/sdk-model";
import parseISO from "date-fns/parseISO/index.js";
import { getUserTimezone } from "../utils/timezone.js";
import {
    useDashboardSelector,
    selectDashboardTitle,
    selectDashboardId,
    selectInsightByWidgetRef,
    selectWidgetByRef,
    isCustomWidget,
    ExtendedDashboardWidget,
} from "../../../../model/index.js";
import { Alignment, normalizeTime } from "@gooddata/sdk-ui-kit";
import { IScheduledEmailDialogProps } from "../../types.js";
import { WidgetAttachmentType } from "../types.js";
import { toModifiedISOString } from "../../DefaultScheduledEmailManagementDialog/utils.js";
import { useAttachmentDashboardFilters } from "./useAttachmentDashboardFilters.js";
import {
    getAutomationDashboardFilters,
    getAutomationVisualizationFilters,
    isCsvVisualizationAutomation,
    isCsvVisualizationExportDefinition,
    isDashboardAutomation,
    isXlsxVisualizationAutomation,
    isXlsxVisualizationExportDefinition,
    transformFilterContextToModelFilters,
} from "../utils/automationHelpers.js";
import { invariant } from "ts-invariant";

export function useEditScheduledEmail(props: IScheduledEmailDialogProps) {
    const { editSchedule, webhooks, emails, context } = props;
    const editWidgetId = (
        editSchedule?.exportDefinitions?.find((exportDefinition) =>
            isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload),
        )?.requestPayload.content as IExportDefinitionVisualizationObjectContent
    )?.widget;
    const editWidgetRef = editWidgetId ? { identifier: editWidgetId } : undefined;
    const widget = useDashboardSelector(selectWidgetByRef(context?.widgetRef ?? editWidgetRef));
    const insight = useDashboardSelector(selectInsightByWidgetRef(widget?.ref));
    const isWidget = !!widget && !!insight;

    const dashboardId = useDashboardSelector(selectDashboardId);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);

    const dashboardEditFilters = getAutomationDashboardFilters(editSchedule);
    const { areFiltersChanged, filtersToStore } = useAttachmentDashboardFilters({
        customFilters: dashboardEditFilters,
        widget,
    });

    const firstChannel = emails[0]?.id ?? webhooks[0]?.id;

    const [state, setState] = useState<IAutomationMetadataObjectDefinition>(
        editSchedule ??
            newAutomationMetadataObjectDefinition(
                isWidget
                    ? {
                          dashboardId: dashboardId!,
                          notificationChannel: firstChannel,
                          insight,
                          widget,
                          /**
                           * We always store all filters with widget attachment due to problems with
                           * construction of AFM definition on BE.
                           */
                          filters: filtersToStore,
                      }
                    : {
                          dashboardId: dashboardId!,
                          notificationChannel: firstChannel,
                          title: dashboardTitle,
                          filters: areFiltersChanged ? filtersToStore : undefined,
                      },
            ),
    );

    const [originalState] = useState(state);

    const onTitleChange = (value: string) => setState((s) => ({ ...s, title: value }));

    const onRecurrenceChange = (cronExpression: string, startDate: Date | null) => {
        setState((s) => ({
            ...s,
            schedule: {
                ...(s.schedule ?? {}),
                cron: cronExpression,
                firstRun: toModifiedISOString(startDate ?? new Date()),
            },
        }));
    };

    const onDestinationChange = (notificationChannelId: string): void => {
        setState((s) => ({ ...s, notificationChannel: notificationChannelId }));
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

    const onDashboardAttachmentsChange = (
        dashboardSelected: boolean,
        filters?: FilterContextItem[],
    ): void => {
        if (dashboardSelected) {
            const dashboardExportDefinition = newDashboardExportDefinitionMetadataObjectDefinition({
                dashboardId: dashboardId!,
                dashboardTitle,
                filters,
            });
            const dashboardExportDefinitionExists = isDashboardAutomation(state);
            const updatedExportDefinitions = dashboardExportDefinitionExists
                ? state.exportDefinitions?.map((exportDefinition) =>
                      isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload)
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
                        !isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload),
                ),
            }));
        }
    };

    const onWidgetAttachmentsChange = (
        selected: boolean,
        format: WidgetAttachmentType,
        filters?: FilterContextItem[],
    ): void => {
        const automationTypeGuard =
            format === "CSV" ? isCsvVisualizationAutomation : isXlsxVisualizationAutomation;
        const exportDefinitionTypeGuard =
            format === "CSV" ? isCsvVisualizationExportDefinition : isXlsxVisualizationExportDefinition;

        invariant(isWidget, "Widget or insight is missing in scheduling dialog context.");

        if (selected) {
            const filtersObj = filters ? { filters } : {};
            const newExportDefinition = newWidgetExportDefinitionMetadataObjectDefinition({
                insight,
                widget,
                dashboardId: dashboardId!,
                format,
                editSchedule,
                ...filtersObj,
            });

            const exportDefinitionExists = automationTypeGuard(state);
            const updatedExportDefinitions = exportDefinitionExists
                ? state.exportDefinitions?.map((exportDefinition) =>
                      exportDefinitionTypeGuard(exportDefinition) ? newExportDefinition : exportDefinition,
                  )
                : [...(state.exportDefinitions ?? []), newExportDefinition];

            setState((s) => ({
                ...s,
                exportDefinitions: updatedExportDefinitions,
            }));
        } else {
            setState((s) => ({
                ...s,
                exportDefinitions: s.exportDefinitions?.filter(
                    (exportDefinition) => !exportDefinitionTypeGuard(exportDefinition),
                ),
            }));
        }
    };

    const onWidgetAttachmentsSettingsChange = ({
        mergeHeaders,
    }: IExportDefinitionVisualizationObjectSettings) => {
        setState((s) => ({
            ...s,
            exportDefinitions: s.exportDefinitions?.map((exportDefinition) => {
                if (
                    isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload) &&
                    exportDefinition.requestPayload.format === "XLSX"
                ) {
                    return {
                        ...exportDefinition,
                        requestPayload: {
                            ...exportDefinition.requestPayload,
                            settings: {
                                ...exportDefinition.requestPayload?.settings,
                                mergeHeaders,
                            },
                        },
                    };
                } else {
                    return exportDefinition;
                }
            }),
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
        onDashboardAttachmentsChange,
        onWidgetAttachmentsChange,
        onWidgetAttachmentsSettingsChange,
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
            type: "dashboard",
            fileName: dashboardTitle,
            format: "PDF",
            content: {
                dashboard: dashboardId,
                ...filtersObj,
            },
        },
    };
}

function newWidgetExportDefinitionMetadataObjectDefinition({
    insight,
    widget,
    dashboardId,
    format,
    filters,
    editSchedule,
}: {
    insight: IInsight;
    widget: ExtendedDashboardWidget;
    dashboardId: string;
    format: WidgetAttachmentType;
    filters?: FilterContextItem[];
    editSchedule?: IAutomationMetadataObject | IAutomationMetadataObjectDefinition;
}): IExportDefinitionMetadataObjectDefinition {
    const widgetTitle = !isCustomWidget(widget) ? widget?.title : widget?.identifier;

    const transformedFilters = transformFilterContextToModelFilters(filters, widget);
    const insightFilters = insight.insight.filters;
    const newScheduleFilters = [...insightFilters, ...transformedFilters];
    const existingScheduleFilters = [...(getAutomationVisualizationFilters(editSchedule) ?? [])];

    // in case of editing widget schedule, we never overwrite already stored filters
    const allFilters = editSchedule ? existingScheduleFilters : newScheduleFilters;

    const filtersObj = allFilters.length > 0 ? { filters: allFilters } : {};
    const settingsObj = format === "XLSX" ? { settings: { mergeHeaders: true } } : {};

    return {
        type: "exportDefinition",
        title: widgetTitle,
        requestPayload: {
            type: "visualizationObject",
            fileName: widgetTitle,
            format: format,
            content: {
                visualizationObject: insight.insight.identifier,
                widget: widget.identifier,
                dashboard: dashboardId,
                ...filtersObj,
            },
            ...settingsObj,
        },
    };
}

function newAutomationMetadataObjectDefinition({
    dashboardId,
    notificationChannel,
    title,
    insight,
    widget,
    filters,
}: {
    dashboardId: string;
    notificationChannel: string;
    title?: string;
    insight?: IInsight;
    widget?: ExtendedDashboardWidget;
    filters?: FilterContextItem[];
}): IAutomationMetadataObjectDefinition {
    const firstRun = parseISO(new Date().toISOString());
    const normalizedFirstRun = normalizeTime(firstRun, undefined, 60);
    const cron = getDefaultCronExpression(normalizedFirstRun);
    const exportDefinition =
        widget && insight
            ? newWidgetExportDefinitionMetadataObjectDefinition({
                  insight,
                  widget,
                  dashboardId,
                  format: "XLSX", // default checked format
                  filters: filters,
              })
            : newDashboardExportDefinitionMetadataObjectDefinition({
                  dashboardId,
                  dashboardTitle: title ?? "",
                  filters: filters,
              });

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
        exportDefinitions: [{ ...exportDefinition }],
        recipients: [],
        notificationChannel,
        dashboard: dashboardId,
    };

    return automation;
}

export function getDefaultCronExpression(date: Date) {
    return `0 0 ${date.getHours()} ? * *`;
}
