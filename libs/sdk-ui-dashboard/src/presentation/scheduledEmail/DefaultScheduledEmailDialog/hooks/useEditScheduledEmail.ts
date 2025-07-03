// (C) 2019-2025 GoodData Corporation
import { useCallback, useMemo, useState } from "react";
import {
    IAutomationMetadataObjectDefinition,
    IExportDefinitionMetadataObjectDefinition,
    IAutomationRecipient,
    FilterContextItem,
    IExportDefinitionVisualizationObjectSettings,
    isExportDefinitionVisualizationObjectRequestPayload,
    isExportDefinitionDashboardRequestPayload,
    IInsight,
    IAutomationMetadataObject,
    IFilter,
    INotificationChannelIdentifier,
    INotificationChannelMetadataObject,
    isAutomationUserRecipient,
    isWidget,
    isAutomationExternalUserRecipient,
    isAutomationUnknownUserRecipient,
    IAutomationVisibleFilter,
    isInsightWidget,
    DashboardAttachmentType,
    WidgetAttachmentType,
    IExportDefinitionDashboardSettings,
} from "@gooddata/sdk-model";
import {
    useDashboardSelector,
    selectDashboardTitle,
    selectDashboardId,
    ExtendedDashboardWidget,
    selectCurrentUser,
    selectTimezone,
    selectUsers,
    selectEnableExternalRecipients,
    selectDashboardHiddenFilters,
    selectAutomationCommonDateFilterId,
} from "../../../../model/index.js";
import { OldWidgetAttachmentType } from "../types.js";
import {
    areAutomationsEqual,
    convertCurrentUserToAutomationRecipient,
    convertCurrentUserToWorkspaceUser,
    convertExternalRecipientToAutomationRecipient,
    getAutomationVisualizationFilters,
    isCsvVisualizationAutomation,
    isCsvVisualizationExportDefinition,
    isDashboardAutomation,
    isXlsxVisualizationAutomation,
    isXlsxVisualizationExportDefinition,
} from "../../../../_staging/automation/index.js";
import { invariant } from "ts-invariant";
import { useIntl } from "react-intl";
import { useScheduleValidation } from "./useScheduleValidation.js";
import {
    toModifiedISOStringToTimezone,
    toNormalizedFirstRunAndCron,
    toNormalizedStartDate,
} from "../../utils/date.js";
import { isEmail } from "../../utils/validate.js";
import { getUserTimezone } from "../../utils/timezone.js";
import {
    getAppliedDashboardFilters,
    getAppliedWidgetFilters,
    getVisibleFiltersByFilters,
} from "../../../automationFilters/utils.js";

export interface IUseEditScheduledEmailProps {
    scheduledExportToEdit?: IAutomationMetadataObject;
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    maxAutomationsRecipients: number;
    widget?: ExtendedDashboardWidget;
    insight?: IInsight;
    widgetFilters?: IFilter[];
    editedAutomationFilters?: FilterContextItem[];
    dashboardFilters?: FilterContextItem[];
    setEditedAutomationFilters: (filters: FilterContextItem[]) => void;
    availableFiltersAsVisibleFilters?: IAutomationVisibleFilter[] | undefined;

    // Option to opt out of storing filters
    storeFilters?: boolean;
    setStoreFilters: (storeFilters: boolean) => void;
    enableAutomationFilterContext?: boolean;
    filtersForNewAutomation: FilterContextItem[];
    externalRecipientOverride?: string;
    enableNewScheduledExport: boolean;
}

export function useEditScheduledEmail(props: IUseEditScheduledEmailProps) {
    const {
        scheduledExportToEdit,
        notificationChannels,
        insight,
        widget,
        editedAutomationFilters,
        dashboardFilters,
        widgetFilters,
        maxAutomationsRecipients,
        setEditedAutomationFilters,
        availableFiltersAsVisibleFilters,
        storeFilters,
        setStoreFilters,
        enableAutomationFilterContext,
        filtersForNewAutomation,
        externalRecipientOverride,
        enableNewScheduledExport,
    } = props;

    const intl = useIntl();
    const [isCronValid, setIsCronValid] = useState(true);
    const [isTitleValid, setIsTitleValid] = useState(true);
    const [isSubjectValid, setIsSubjectValid] = useState(true);
    const [isOnMessageValid, setIsOnMessageValid] = useState(true);
    const isWidget = !!widget && !!insight;

    // Dashboard
    const dashboardId = useDashboardSelector(selectDashboardId);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const timezone = useDashboardSelector(selectTimezone);

    const areDashboardFiltersChanged = !!dashboardFilters;

    const currentUser = useDashboardSelector(selectCurrentUser);
    const users = useDashboardSelector(selectUsers);
    const defaultUser = convertCurrentUserToWorkspaceUser(users ?? [], currentUser);

    const defaultRecipient = externalRecipientOverride
        ? convertExternalRecipientToAutomationRecipient(externalRecipientOverride)
        : convertCurrentUserToAutomationRecipient(users ?? [], currentUser);
    const enabledExternalRecipients = useDashboardSelector(selectEnableExternalRecipients);

    const firstChannel = notificationChannels[0]?.id;

    const dashboardHiddenFilters = useDashboardSelector(selectDashboardHiddenFilters);
    const commonDateFilterId = useDashboardSelector(selectAutomationCommonDateFilterId);

    const effectiveWidgetFilters = enableAutomationFilterContext
        ? getAppliedWidgetFilters(
              editedAutomationFilters ?? [],
              dashboardHiddenFilters,
              widget,
              insight,
              commonDateFilterId,
          )
        : widgetFilters;

    const effectiveVisibleWidgetFilters = enableAutomationFilterContext
        ? getVisibleFiltersByFilters(editedAutomationFilters, availableFiltersAsVisibleFilters, true)
        : undefined;

    const effectiveDashboardFilters = enableAutomationFilterContext
        ? getAppliedDashboardFilters(editedAutomationFilters ?? [], dashboardHiddenFilters, storeFilters)
        : dashboardFilters;

    const effectiveVisibleDashboardFilters = enableAutomationFilterContext
        ? getVisibleFiltersByFilters(
              editedAutomationFilters ?? [],
              availableFiltersAsVisibleFilters,
              storeFilters,
          )
        : undefined;

    const [editedAutomation, setEditedAutomation] = useState<IAutomationMetadataObjectDefinition>(
        scheduledExportToEdit ??
            newAutomationMetadataObjectDefinition(
                isWidget
                    ? {
                          timezone,
                          dashboardId: dashboardId!,
                          notificationChannel: firstChannel,
                          insight,
                          widget,
                          recipient: defaultRecipient,
                          widgetFilters: effectiveWidgetFilters,
                          visibleFiltersMetadata: effectiveVisibleWidgetFilters,
                          enableNewScheduledExport,
                      }
                    : {
                          timezone,
                          dashboardId: dashboardId!,
                          notificationChannel: firstChannel,
                          title: dashboardTitle,
                          recipient: defaultRecipient,
                          dashboardFilters: effectiveDashboardFilters,
                          visibleFiltersMetadata: effectiveVisibleDashboardFilters,
                          enableNewScheduledExport,
                      },
            ),
    );

    const [originalAutomation] = useState(editedAutomation);

    const selectedAttachments = useMemo(() => {
        return (
            editedAutomation.exportDefinitions
                ?.map((exportDefinition) => exportDefinition.requestPayload.format)
                .filter(Boolean) ?? []
        );
    }, [editedAutomation.exportDefinitions]);

    const onTitleChange = (value: string, isValid: boolean) => {
        setIsTitleValid(isValid);
        setEditedAutomation((s) => ({ ...s, title: value }));
    };

    const onRecurrenceChange = (cronExpression: string, startDate: Date | null, isValid: boolean) => {
        setIsCronValid(isValid);
        setEditedAutomation((s) => ({
            ...s,
            schedule: {
                ...(s.schedule ?? {}),
                cron: cronExpression,
                firstRun: toModifiedISOStringToTimezone(startDate ?? new Date(), timezone).iso,
            },
        }));
    };

    const onDestinationChange = (notificationChannelId: string): void => {
        setEditedAutomation((s) => ({
            ...s,
            notificationChannel: notificationChannelId,
        }));
    };

    const onRecipientsChange = (updatedRecipients: IAutomationRecipient[]): void => {
        setEditedAutomation((s) => ({
            ...s,
            recipients: updatedRecipients,
        }));
    };

    const onSubjectChange = (value: string | number, isValid: boolean): void => {
        setIsSubjectValid(isValid);
        setEditedAutomation((s) => ({
            ...s,
            details: {
                ...(s.details ?? {}),
                subject: value as string,
            },
        }));
    };

    const onMessageChange = (value: string, isValid: boolean): void => {
        setIsOnMessageValid(isValid);
        setEditedAutomation((s) => ({
            ...s,
            details: {
                ...(s.details ?? {}),
                message: value,
            },
        }));
    };

    const onDashboardAttachmentsChange = (
        formats: DashboardAttachmentType[],
        dashboardFilters?: FilterContextItem[],
    ): void => {
        if (formats.length > 0) {
            // Create export definitions for all selected formats
            const exportDefinitions = formats.map((format) =>
                newDashboardExportDefinitionMetadataObjectDefinition({
                    dashboardId: dashboardId!,
                    dashboardTitle,
                    dashboardFilters: storeFilters ? dashboardFilters : undefined,
                    format,
                }),
            );
            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions,
            }));
        } else {
            // Remove all dashboard export definitions
            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: s.exportDefinitions?.filter(
                    (exportDefinition) =>
                        !isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload),
                ),
            }));
        }
    };

    const onWidgetAttachmentsChange = (formats: WidgetAttachmentType[]): void => {
        invariant(isWidget, "Widget or insight is missing in scheduling dialog context.");
        if (formats.length > 0) {
            // Create export definitions for all selected formats
            const exportDefinitions = formats.map((format) =>
                newWidgetExportDefinitionMetadataObjectDefinition({
                    insight,
                    widget,
                    dashboardId: dashboardId!,
                    format,
                    scheduledExportToEdit,
                    widgetFilters: effectiveWidgetFilters,
                }),
            );
            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions,
            }));
        } else {
            // Remove all widget export definitions
            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: [],
            }));
        }
    };

    const onDashboardAttachmentsChangeOld = (
        dashboardSelected: boolean,
        dashboardFilters?: FilterContextItem[],
    ): void => {
        if (dashboardSelected) {
            const dashboardExportDefinition = newDashboardExportDefinitionMetadataObjectDefinition({
                dashboardId: dashboardId!,
                dashboardTitle,
                dashboardFilters,
                format: "PDF",
            });
            const dashboardExportDefinitionExists = isDashboardAutomation(editedAutomation);
            const updatedExportDefinitions = dashboardExportDefinitionExists
                ? editedAutomation.exportDefinitions?.map((exportDefinition) =>
                      isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload)
                          ? dashboardExportDefinition
                          : exportDefinition,
                  )
                : [...(editedAutomation.exportDefinitions ?? []), dashboardExportDefinition];

            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: updatedExportDefinitions,
            }));
        } else {
            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: s.exportDefinitions?.filter(
                    (exportDefinition) =>
                        !isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload),
                ),
            }));
        }
    };

    const onWidgetAttachmentsChangeOld = (
        selected: boolean,
        format: OldWidgetAttachmentType,
        /**
         * This prop may be removed in the future, once all automations are using new
         * automation filter context. (enableAutomationFilterContext)
         */
        widgetFilters?: IFilter[],
    ): void => {
        const automationTypeGuard =
            format === "CSV" ? isCsvVisualizationAutomation : isXlsxVisualizationAutomation;
        const exportDefinitionTypeGuard =
            format === "CSV" ? isCsvVisualizationExportDefinition : isXlsxVisualizationExportDefinition;

        invariant(isWidget, "Widget or insight is missing in scheduling dialog context.");

        if (selected) {
            const newExportDefinition = newWidgetExportDefinitionMetadataObjectDefinition({
                insight,
                widget,
                dashboardId: dashboardId!,
                format,
                scheduledExportToEdit,
                widgetFilters: enableAutomationFilterContext ? effectiveWidgetFilters : widgetFilters,
            });

            const exportDefinitionExists = automationTypeGuard(editedAutomation);
            const updatedExportDefinitions = exportDefinitionExists
                ? editedAutomation.exportDefinitions?.map((exportDefinition) =>
                      exportDefinitionTypeGuard(exportDefinition) ? newExportDefinition : exportDefinition,
                  )
                : [...(editedAutomation.exportDefinitions ?? []), newExportDefinition];

            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: updatedExportDefinitions,
            }));
        } else {
            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: s.exportDefinitions?.filter(
                    (exportDefinition) => !exportDefinitionTypeGuard(exportDefinition),
                ),
            }));
        }
    };

    const onAttachmentsSettingsChange = ({
        mergeHeaders,
        exportInfo,
    }: IExportDefinitionVisualizationObjectSettings | IExportDefinitionDashboardSettings) => {
        setEditedAutomation((s) => ({
            ...s,
            exportDefinitions: s.exportDefinitions?.map((exportDefinition) => {
                if (exportDefinition.requestPayload.format === "XLSX") {
                    return {
                        ...exportDefinition,
                        requestPayload: {
                            ...exportDefinition.requestPayload,
                            settings: {
                                ...exportDefinition.requestPayload?.settings,
                                mergeHeaders,
                                exportInfo,
                            },
                        },
                    };
                } else {
                    return exportDefinition;
                }
            }),
        }));
    };

    const onFiltersChange = useCallback(
        (filters: FilterContextItem[], storeFiltersParam?: boolean) => {
            setEditedAutomationFilters(filters);
            const shouldStoreFilters = storeFiltersParam ?? storeFilters;

            if (!isWidget) {
                setEditedAutomation((s) => {
                    const appliedFilters = getAppliedDashboardFilters(
                        filters,
                        dashboardHiddenFilters,
                        shouldStoreFilters,
                    );
                    const visibleFilters = getVisibleFiltersByFilters(
                        filters,
                        availableFiltersAsVisibleFilters,
                        shouldStoreFilters,
                    );

                    return {
                        ...s,
                        exportDefinitions: s.exportDefinitions?.map((exportDefinition) => {
                            if (isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload)) {
                                return {
                                    ...exportDefinition,
                                    requestPayload: {
                                        ...exportDefinition.requestPayload,
                                        content: {
                                            ...exportDefinition.requestPayload.content,
                                            filters: appliedFilters,
                                        },
                                    },
                                };
                            } else {
                                return exportDefinition;
                            }
                        }),
                        metadata: {
                            ...s.metadata,
                            visibleFilters,
                        },
                    };
                });
            } else {
                if (!isInsightWidget(widget)) {
                    return;
                }

                setEditedAutomation((s) => {
                    const appliedFilters = getAppliedWidgetFilters(
                        filters,
                        dashboardHiddenFilters,
                        widget,
                        insight,
                        commonDateFilterId,
                    );
                    const visibleFilters = getVisibleFiltersByFilters(
                        filters,
                        availableFiltersAsVisibleFilters,
                        true,
                    );

                    return {
                        ...s,
                        exportDefinitions: s.exportDefinitions?.map((exportDefinition) => {
                            if (
                                isExportDefinitionVisualizationObjectRequestPayload(
                                    exportDefinition.requestPayload,
                                )
                            ) {
                                return {
                                    ...exportDefinition,
                                    requestPayload: {
                                        ...exportDefinition.requestPayload,
                                        content: {
                                            ...exportDefinition.requestPayload.content,
                                            filters: appliedFilters,
                                        },
                                    },
                                };
                            } else {
                                return exportDefinition;
                            }
                        }),
                        metadata: {
                            ...s.metadata,
                            visibleFilters,
                        },
                    };
                });
            }
        },
        [
            setEditedAutomationFilters,
            setEditedAutomation,
            dashboardHiddenFilters,
            availableFiltersAsVisibleFilters,
            storeFilters,
            widget,
            insight,
            isWidget,
            commonDateFilterId,
        ],
    );

    const onApplyCurrentFilters = useCallback(() => {
        onFiltersChange(filtersForNewAutomation ?? [], widget ? true : storeFilters);
    }, [filtersForNewAutomation, storeFilters, onFiltersChange, widget]);

    const onStoreFiltersChange = useCallback(
        (value: boolean, filters: FilterContextItem[]) => {
            setStoreFilters(value);
            onFiltersChange(filters, value);
        },
        [onFiltersChange, setStoreFilters],
    );

    const isDashboardExportSelected =
        editedAutomation.exportDefinitions?.some((exportDefinition) =>
            isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload),
        ) ?? true;

    const isCsvExportSelected =
        editedAutomation.exportDefinitions?.some((exportDefinition) => {
            if (isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload)) {
                return exportDefinition.requestPayload.format === "CSV";
            }

            return false;
        }) ?? false;

    const isXlsxExportSelected =
        editedAutomation.exportDefinitions?.some((exportDefinition) => {
            if (isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload)) {
                return exportDefinition.requestPayload.format === "XLSX";
            }

            return false;
        }) ?? false;

    const settings = {
        mergeHeaders:
            editedAutomation.exportDefinitions?.some(
                (exportDefinition) => exportDefinition.requestPayload.settings?.mergeHeaders,
            ) ?? true,
        exportInfo:
            editedAutomation.exportDefinitions?.some(
                (exportDefinition) => exportDefinition.requestPayload.settings?.exportInfo,
            ) ?? true,
    };

    const startDate = toNormalizedStartDate(
        editedAutomation.schedule?.firstRun,
        editedAutomation.schedule?.timezone,
    );

    const selectedNotificationChannel = notificationChannels.find(
        (channel) => channel.id === editedAutomation.notificationChannel,
    );
    const allowExternalRecipients =
        selectedNotificationChannel?.allowedRecipients === "external" && enabledExternalRecipients;
    const allowOnlyLoggedUserRecipients = selectedNotificationChannel?.allowedRecipients === "creator";

    const { isValid: isOriginalAutomationValid } = useScheduleValidation(originalAutomation);
    const validationErrorMessage = !isOriginalAutomationValid
        ? intl.formatMessage({ id: "dialogs.schedule.email.widgetError" })
        : undefined;

    const hasAttachments = !!editedAutomation.exportDefinitions?.length;
    const hasRecipients = (editedAutomation.recipients?.length ?? 0) > 0;
    const hasValidExternalRecipients = allowExternalRecipients
        ? true
        : !editedAutomation.recipients?.some(isAutomationExternalUserRecipient);
    const hasValidCreatorRecipient = allowOnlyLoggedUserRecipients
        ? editedAutomation.recipients?.length === 1 &&
          editedAutomation.recipients[0].id === defaultRecipient.id
        : true;
    const hasNoUnknownRecipients = !editedAutomation.recipients?.some(isAutomationUnknownUserRecipient);
    const hasDestination = !!editedAutomation.notificationChannel;
    const respectsRecipientsLimit = (editedAutomation.recipients?.length ?? 0) <= maxAutomationsRecipients;
    const hasFilledEmails =
        selectedNotificationChannel?.destinationType === "smtp"
            ? editedAutomation.recipients?.every((recipient) =>
                  isAutomationUserRecipient(recipient) ? isEmail(recipient.email ?? "") : true,
              )
            : true;

    const isValid =
        isCronValid &&
        hasRecipients &&
        respectsRecipientsLimit &&
        hasAttachments &&
        hasDestination &&
        hasValidExternalRecipients &&
        hasValidCreatorRecipient &&
        hasNoUnknownRecipients &&
        hasFilledEmails &&
        isOnMessageValid &&
        isTitleValid &&
        isSubjectValid;

    const isSubmitDisabled =
        !isValid || (scheduledExportToEdit && areAutomationsEqual(originalAutomation, editedAutomation));

    return {
        defaultUser,
        areDashboardFiltersChanged,
        originalAutomation,
        editedAutomation,
        isCronValid,
        notificationChannels,
        isDashboardExportSelected,
        isCsvExportSelected,
        isXlsxExportSelected,
        settings,
        startDate,
        allowOnlyLoggedUserRecipients,
        allowExternalRecipients,
        validationErrorMessage,
        isSubmitDisabled,
        storeFilters,
        selectedAttachments,
        onTitleChange,
        onRecurrenceChange,
        onDestinationChange,
        onRecipientsChange,
        onSubjectChange,
        onMessageChange,
        onDashboardAttachmentsChange,
        onDashboardAttachmentsChangeOld,
        onWidgetAttachmentsChange,
        onWidgetAttachmentsChangeOld,
        onAttachmentsSettingsChange,
        onFiltersChange,
        onApplyCurrentFilters,
        onStoreFiltersChange,
    };
}

function newDashboardExportDefinitionMetadataObjectDefinition({
    dashboardId,
    dashboardTitle,
    dashboardFilters,
    format,
}: {
    dashboardId: string;
    dashboardTitle: string;
    dashboardFilters?: FilterContextItem[];
    format: DashboardAttachmentType;
}): IExportDefinitionMetadataObjectDefinition {
    const filtersObj = dashboardFilters ? { filters: dashboardFilters } : {};

    const settingsObj = format === "XLSX" ? { settings: { mergeHeaders: true, exportInfo: true } } : {};

    return {
        type: "exportDefinition",
        title: dashboardTitle,
        requestPayload: {
            type: "dashboard",
            fileName: dashboardTitle,
            format,
            content: {
                dashboard: dashboardId,
                ...filtersObj,
            },
            ...settingsObj,
        },
    };
}

function newWidgetExportDefinitionMetadataObjectDefinition({
    insight,
    widget,
    dashboardId,
    format,
    widgetFilters,
    scheduledExportToEdit,
}: {
    insight: IInsight;
    widget: ExtendedDashboardWidget;
    dashboardId: string;
    format: WidgetAttachmentType;
    widgetFilters?: IFilter[];
    scheduledExportToEdit?: IAutomationMetadataObject | IAutomationMetadataObjectDefinition;
}): IExportDefinitionMetadataObjectDefinition {
    const widgetTitle = isWidget(widget) ? widget?.title : widget?.identifier;
    const existingScheduleFilters = [...(getAutomationVisualizationFilters(scheduledExportToEdit) ?? [])];

    // in case of editing widget schedule, we never overwrite already stored filters
    const allFilters = scheduledExportToEdit ? existingScheduleFilters : widgetFilters ?? [];

    const filtersObj = allFilters.length > 0 ? { filters: allFilters } : {};
    const settingsObj = format === "XLSX" ? { settings: { mergeHeaders: true, exportInfo: true } } : {};

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
    timezone,
    dashboardId,
    notificationChannel,
    title,
    insight,
    widget,
    recipient,
    dashboardFilters,
    widgetFilters,
    visibleFiltersMetadata,
    enableNewScheduledExport,
}: {
    timezone?: string;
    dashboardId: string;
    notificationChannel: string;
    title?: string;
    insight?: IInsight;
    widget?: ExtendedDashboardWidget;
    recipient: IAutomationRecipient;
    dashboardFilters?: FilterContextItem[];
    widgetFilters?: IFilter[];
    visibleFiltersMetadata?: IAutomationVisibleFilter[];
    enableNewScheduledExport: boolean;
}): IAutomationMetadataObjectDefinition {
    const { firstRun, cron } = toNormalizedFirstRunAndCron(timezone);
    const exportDefinition =
        widget && insight
            ? newWidgetExportDefinitionMetadataObjectDefinition({
                  insight,
                  widget,
                  dashboardId,
                  format: enableNewScheduledExport ? "PNG" : "XLSX",
                  widgetFilters,
              })
            : newDashboardExportDefinitionMetadataObjectDefinition({
                  dashboardId,
                  dashboardTitle: title ?? "",
                  dashboardFilters,
                  format: "PDF",
              });

    const metadataObj = visibleFiltersMetadata
        ? {
              metadata: {
                  visibleFilters: visibleFiltersMetadata,
              },
          }
        : {};

    const automation: IAutomationMetadataObjectDefinition = {
        type: "automation",
        title: undefined,
        description: undefined,
        tags: [],
        schedule: {
            timezone: timezone ?? getUserTimezone().identifier,
            firstRun,
            cron,
        },
        details: {
            message: "",
            subject: "",
        },
        exportDefinitions: [{ ...exportDefinition }],
        recipients: [recipient],
        notificationChannel,
        dashboard: dashboardId,
        ...metadataObj,
    };

    return automation;
}
