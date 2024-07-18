// (C) 2019-2024 GoodData Corporation
import { useState } from "react";
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IExportDefinitionMetadataObjectDefinition,
    isExportDefinitionDashboardContent,
    IAutomationRecipient,
    FilterContextItem,
    IFilter,
    isFilterContextItem,
    IExportDefinitionSettings,
} from "@gooddata/sdk-model";
import parseISO from "date-fns/parseISO/index.js";
import { getUserTimezone } from "../utils/timezone.js";
import {
    useDashboardSelector,
    selectDashboardTitle,
    selectDashboardId,
    selectAnalyticalWidgetByRef,
} from "../../../../model/index.js";
import { Alignment, normalizeTime } from "@gooddata/sdk-ui-kit";
import { IScheduledEmailDialogProps } from "../../types.js";
import { WidgetAttachmentType } from "../types.js";
import { toModifiedISOString } from "../../DefaultScheduledEmailManagementDialog/utils.js";
import { useAttachmentDashboardFilters } from "./useAttachmentDashboardFilters.js";
import {
    getAutomationDashboardFilters,
    isCsvVisualizationAutomation,
    isCsvVisualizationExportDefinition,
    isDashboardAutomation,
    isXlsxVisualizationAutomation,
    isXlsxVisualizationExportDefinition,
} from "../utils/automationHelpers.js";
import { isDashboardFilter } from "../../../../types.js";
import { filterContextItemsToDashboardFiltersByWidget } from "../../../../converters/index.js";
import { invariant } from "ts-invariant";

export function useEditScheduledEmail(props: IScheduledEmailDialogProps) {
    const { editSchedule, webhooks, context } = props;
    const widget = useDashboardSelector(selectAnalyticalWidgetByRef(context?.widgetRef));
    const dashboardId = useDashboardSelector(selectDashboardId);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const dashboardEditFilters = getAutomationDashboardFilters(editSchedule);
    const { areFiltersChanged, filtersToStore } = useAttachmentDashboardFilters({
        customFilters: dashboardEditFilters,
    });

    const [state, setState] = useState<IAutomationMetadataObject | IAutomationMetadataObjectDefinition>(
        editSchedule ??
            newAutomationMetadataObjectDefinition({
                id: widget ? widget.identifier : dashboardId!,
                title: widget ? widget.title : dashboardTitle,
                filters: areFiltersChanged ? filtersToStore : undefined,
                isWidget: !!widget,
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

    const onWidgetAttachmentsChange = (
        selected: boolean,
        format: WidgetAttachmentType,
        filters?: FilterContextItem[],
    ): void => {
        const automationTypeGuard =
            format === "CSV" ? isCsvVisualizationAutomation : isXlsxVisualizationAutomation;
        const exportDefinitionTypeGuard =
            format === "CSV" ? isCsvVisualizationExportDefinition : isXlsxVisualizationExportDefinition;

        invariant(widget, "Widget is missing in scheduling dialog context.");

        if (selected) {
            const transformedFilters = filters
                ? filterContextItemsToDashboardFiltersByWidget(filters, widget)
                : undefined;
            const filtersObj = transformedFilters ? { filters: transformedFilters } : {};
            const newExportDefinition = newWidgetExportDefinitionMetadataObjectDefinition({
                widgetId: widget.identifier,
                widgetTitle: widget.title,
                format,
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

    const onWidgetAttachmentsSettingsChange = ({ mergeHeaders }: IExportDefinitionSettings) => {
        setState((s) => ({
            ...s,
            exportDefinitions: s.exportDefinitions?.map((exportDefinition) => {
                if (isXlsxVisualizationExportDefinition(exportDefinition)) {
                    return {
                        ...exportDefinition,
                        requestPayload: {
                            ...exportDefinition.requestPayload,
                            settings: {
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
    widgetId,
    widgetTitle,
    format,
    filters,
}: {
    widgetId: string;
    widgetTitle: string;
    format: WidgetAttachmentType;
    filters?: IFilter[];
}): IExportDefinitionMetadataObjectDefinition {
    const filtersObj = filters ? { filters } : {};
    const settingsObj = format === "XLSX" ? { settings: { mergeHeaders: true } } : {};

    return {
        type: "exportDefinition",
        title: widgetTitle,
        requestPayload: {
            fileName: widgetTitle,
            format: format,
            content: {
                visualizationObject: widgetId,
                ...filtersObj,
            },
            ...settingsObj,
        },
    };
}

function newAutomationMetadataObjectDefinition({
    id,
    title,
    webhook,
    isWidget,
    filters,
}: {
    id: string;
    title: string;
    webhook: string;
    isWidget: boolean;
    filters?: FilterContextItem[] | IFilter[];
}): IAutomationMetadataObjectDefinition {
    const firstRun = parseISO(new Date().toISOString());
    const normalizedFirstRun = normalizeTime(firstRun, undefined, 60);
    const cron = getDefaultCronExpression(normalizedFirstRun);
    const exportDefinition = isWidget
        ? newWidgetExportDefinitionMetadataObjectDefinition({
              widgetId: id,
              widgetTitle: title,
              format: "XLSX", // default checked format
              filters: filters?.filter(isDashboardFilter),
          })
        : newDashboardExportDefinitionMetadataObjectDefinition({
              dashboardId: id,
              dashboardTitle: title,
              filters: filters?.filter(isFilterContextItem),
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
        webhook,
    };

    return automation;
}

export function getDefaultCronExpression(date: Date) {
    return `0 0 ${date.getHours()} ? * *`;
}
