// (C) 2019-2025 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import isEqual from "lodash/isEqual.js";
import { useIntl } from "react-intl";

import {
    FilterContextItem,
    IAlertComparisonOperator,
    IAlertRelativeArithmeticOperator,
    IAlertRelativeOperator,
    IAlertTriggerMode,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IAutomationRecipient,
    IAutomationVisibleFilter,
    IInsight,
    IInsightWidget,
    INotificationChannelIdentifier,
    INotificationChannelMetadataObject,
    isAutomationExternalUserRecipient,
    isAutomationUnknownUserRecipient,
    isAutomationUserRecipient,
} from "@gooddata/sdk-model";
import { fillMissingTitles } from "@gooddata/sdk-ui";

import { useAlertValidation } from "./useAlertValidation.js";
import { useAttributeValuesFromExecResults } from "./useAttributeValuesFromExecResults.js";
import { useThresholdValue } from "./useThresholdValue.js";
import {
    convertCurrentUserToAutomationRecipient,
    convertCurrentUserToWorkspaceUser,
    convertExternalRecipientToAutomationRecipient,
} from "../../../../_staging/automation/index.js";
import {
    ExtendedDashboardWidget,
    selectAutomationCommonDateFilterId,
    selectCatalogAttributes,
    selectCatalogDateDatasets,
    selectCurrentUser,
    selectDashboardDescriptor,
    selectDashboardHiddenFilters,
    selectDashboardId,
    selectEnableAlertAttributes,
    selectEnableComparisonInAlerting,
    selectEnableExternalRecipients,
    selectExecutionResultByRef,
    selectLocale,
    selectSeparators,
    selectSettings,
    selectUsers,
    useDashboardSelector,
} from "../../../../model/index.js";
import { getAppliedWidgetFilters, getVisibleFiltersByFilters } from "../../../automationFilters/utils.js";
import { isEmail } from "../../../scheduledEmail/utils/validate.js";
import { AlertAttribute, AlertMetric, AlertMetricComparatorType } from "../../types.js";
import { createDefaultAlert } from "../utils/convertors.js";
import {
    getAlertAttribute,
    getAlertCompareOperator,
    getAlertComparison,
    getAlertMeasure,
    getAlertRelativeOperator,
    getMeasureFormatsFromExecution,
} from "../utils/getters.js";
import {
    getSupportedInsightAttributesByInsight,
    getSupportedInsightMeasuresByInsight,
} from "../utils/items.js";
import {
    transformAlertByAttribute,
    transformAlertByComparisonOperator,
    transformAlertByDestination,
    transformAlertByMetric,
    transformAlertByRelativeOperator,
    transformAlertByValue,
} from "../utils/transformation.js";

export interface IUseEditAlertProps {
    alertToEdit?: IAutomationMetadataObject;
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    maxAutomationsRecipients: number;
    widget?: ExtendedDashboardWidget;
    insight?: IInsight;
    editedAutomationFilters?: FilterContextItem[];

    setEditedAutomationFilters: (filters: FilterContextItem[]) => void;
    availableFiltersAsVisibleFilters?: IAutomationVisibleFilter[] | undefined;
    filtersForNewAutomation: FilterContextItem[];
    externalRecipientOverride?: string;
}

export function useEditAlert(props: IUseEditAlertProps) {
    const {
        alertToEdit,
        notificationChannels,
        insight,
        widget,
        editedAutomationFilters,
        maxAutomationsRecipients,
        setEditedAutomationFilters,
        availableFiltersAsVisibleFilters,
        filtersForNewAutomation,
        externalRecipientOverride,
    } = props;
    const intl = useIntl();

    // Selectors
    const locale = useDashboardSelector(selectLocale);
    const canManageComparison = useDashboardSelector(selectEnableComparisonInAlerting);
    const catalogDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const execResult = useDashboardSelector(selectExecutionResultByRef(widget?.ref));
    const catalogAttributes = useDashboardSelector(selectCatalogAttributes);
    const currentUser = useDashboardSelector(selectCurrentUser);
    const users = useDashboardSelector(selectUsers);
    const enabledExternalRecipients = useDashboardSelector(selectEnableExternalRecipients);
    const descriptor = useDashboardSelector(selectDashboardDescriptor);
    const settings = useDashboardSelector(selectSettings);
    const canManageAttributes = useDashboardSelector(selectEnableAlertAttributes);
    const dashboardId = useDashboardSelector(selectDashboardId);
    const separators = useDashboardSelector(selectSeparators);
    const dashboardHiddenFilters = useDashboardSelector(selectDashboardHiddenFilters);
    const commonDateFilterId = useDashboardSelector(selectAutomationCommonDateFilterId);

    // Computed values
    const isNewAlert = !alertToEdit;

    const measureFormatMap = useMemo(() => {
        return getMeasureFormatsFromExecution(execResult?.executionResult);
    }, [execResult?.executionResult]);

    const supportedMeasures = useMemo(
        () =>
            getSupportedInsightMeasuresByInsight(
                insight ? fillMissingTitles(insight, locale, 9999) : insight,
                catalogDateDatasets,
                canManageComparison,
            ),
        [insight, locale, catalogDateDatasets, canManageComparison],
    );

    const supportedAttributes = useMemo(
        () => getSupportedInsightAttributesByInsight(insight, catalogDateDatasets),
        [insight, catalogDateDatasets],
    );

    const { isResultLoading, getAttributeValues, getMetricValue } =
        useAttributeValuesFromExecResults(execResult);

    // Default values
    const defaultMeasure = supportedMeasures[0];
    const defaultUser = convertCurrentUserToWorkspaceUser(users ?? [], currentUser);
    const defaultRecipient = externalRecipientOverride
        ? convertExternalRecipientToAutomationRecipient(externalRecipientOverride)
        : convertCurrentUserToAutomationRecipient(users ?? [], currentUser);
    const defaultNotificationChannelId = notificationChannels[0]?.id;

    // Local state
    const [warningMessage, setWarningMessage] = useState<string | undefined>(undefined);
    const [isTitleValid, setIsTitleValid] = useState(true);

    const [editedAutomation, setEditedAutomation] = useState<IAutomationMetadataObjectDefinition>(
        alertToEdit ??
            createDefaultAlert(
                getAppliedWidgetFilters(
                    editedAutomationFilters ?? [],
                    dashboardHiddenFilters,
                    widget!,
                    insight!,
                    commonDateFilterId,
                ),
                supportedMeasures,
                defaultMeasure,
                defaultNotificationChannelId,
                defaultRecipient,
                measureFormatMap,
                undefined,
                descriptor.evaluationFrequency
                    ? {
                          cron: descriptor.evaluationFrequency,
                          timezone: settings.alertDefault?.defaultTimezone,
                      }
                    : undefined,
                getVisibleFiltersByFilters(editedAutomationFilters, availableFiltersAsVisibleFilters, true),
                widget?.localIdentifier,
                dashboardId,
                (widget as IInsightWidget)?.title,
            ),
    );

    const [originalAutomation] = useState(editedAutomation);

    //
    // Selected values
    //
    const selectedMeasure = getAlertMeasure(supportedMeasures, editedAutomation?.alert);
    const selectedComparisonOperator = getAlertCompareOperator(editedAutomation?.alert);
    const selectedRelativeOperator = getAlertRelativeOperator(editedAutomation?.alert);
    const selectedComparator = getAlertComparison(selectedMeasure, editedAutomation?.alert);
    const [selectedAttribute, selectedValue] = getAlertAttribute(
        supportedAttributes,
        editedAutomation as IAutomationMetadataObject,
    );

    const selectedNotificationChannel = notificationChannels.find(
        (channel) => channel.id === editedAutomation.notificationChannel,
    );

    const allowExternalRecipients =
        selectedNotificationChannel?.allowedRecipients === "external" && enabledExternalRecipients;

    const allowOnlyLoggedUserRecipients = selectedNotificationChannel?.allowedRecipients === "creator";

    const { isValid: isOriginalAutomationValid } = useAlertValidation(
        originalAutomation as IAutomationMetadataObject,
    );

    //
    // Handlers
    //
    const onTitleChange = (value: string, isValid: boolean) => {
        setIsTitleValid(isValid);
        setEditedAutomation((s) => ({ ...s, title: value }));
    };

    const onMeasureChange = useCallback(
        (measure: AlertMetric) => {
            setEditedAutomation((alert) =>
                transformAlertByMetric(
                    supportedMeasures,
                    alert as IAutomationMetadataObject,
                    measure,
                    measureFormatMap,
                ),
            );
        },
        [measureFormatMap, supportedMeasures],
    );
    const onAttributeChange = useCallback(
        (
            attribute: AlertAttribute | undefined,
            value:
                | {
                      title: string;
                      value: string;
                      name: string;
                  }
                | undefined,
        ) => {
            setEditedAutomation((alert) =>
                transformAlertByAttribute(
                    supportedAttributes,
                    alert as IAutomationMetadataObject,
                    attribute,
                    value,
                ),
            );
        },
        [supportedAttributes],
    );

    const onValueChange = useCallback((value: number) => {
        setEditedAutomation((alert) => transformAlertByValue(alert as IAutomationMetadataObject, value));
    }, []);

    const onComparisonOperatorChange = useCallback(
        (measure: AlertMetric, comparisonOperator: IAlertComparisonOperator) => {
            setEditedAutomation((alert) =>
                transformAlertByComparisonOperator(
                    supportedMeasures,
                    alert as IAutomationMetadataObject,
                    measure,
                    comparisonOperator,
                ),
            );
        },
        [supportedMeasures],
    );

    const onRelativeOperatorChange = useCallback(
        (
            measure: AlertMetric,
            relativeOperator: IAlertRelativeOperator,
            arithmeticOperator: IAlertRelativeArithmeticOperator,
        ) => {
            setEditedAutomation((alert) =>
                transformAlertByRelativeOperator(
                    supportedMeasures,
                    alert as IAutomationMetadataObject,
                    measure,
                    relativeOperator,
                    arithmeticOperator,
                    measureFormatMap,
                ),
            );
        },
        [measureFormatMap, supportedMeasures],
    );

    const onComparisonTypeChange = useCallback(
        (
            measure: AlertMetric | undefined,
            relativeOperator: [IAlertRelativeOperator, IAlertRelativeArithmeticOperator] | undefined,
            comparisonType: AlertMetricComparatorType,
        ) => {
            if (!measure || !relativeOperator || !relativeOperator) {
                return;
            }
            const [relativeOperatorValue, arithmeticOperator] = relativeOperator;
            setEditedAutomation((alert) =>
                transformAlertByRelativeOperator(
                    supportedMeasures,
                    alert as IAutomationMetadataObject,
                    measure,
                    relativeOperatorValue,
                    arithmeticOperator,
                    measureFormatMap,
                    comparisonType,
                ),
            );
        },
        [measureFormatMap, supportedMeasures],
    );

    const onDestinationChange = useCallback(
        (destinationId: string) => {
            const previousDestination = notificationChannels.find(
                (channel) => alertToEdit?.notificationChannel === channel.id,
            );
            const selectedDestination = notificationChannels.find((channel) => destinationId === channel.id);

            /**
             * When allowed recipients are changed from "ALL" to "CREATOR", show warning message
             */
            const showWarningMessage =
                selectedDestination?.allowedRecipients === "creator" &&
                previousDestination?.allowedRecipients !== "creator";

            setWarningMessage(
                showWarningMessage
                    ? intl.formatMessage({ id: "insightAlert.config.warning.destination" })
                    : undefined,
            );

            /**
             * Reset recipients when new notification channel only allows the author/creator
             */
            const updatedRecipients =
                selectedDestination?.allowedRecipients === "creator"
                    ? [convertCurrentUserToAutomationRecipient(users ?? [], currentUser)]
                    : undefined;

            setEditedAutomation((alert) =>
                transformAlertByDestination(
                    alert as IAutomationMetadataObject,
                    destinationId,
                    updatedRecipients,
                ),
            );
        },
        [alertToEdit?.notificationChannel, currentUser, notificationChannels, intl, users],
    );

    const onTriggerModeChange = useCallback((triggerMode: IAlertTriggerMode) => {
        setEditedAutomation(
            (s): IAutomationMetadataObjectDefinition => ({
                ...s,
                alert: { ...s.alert!, trigger: { ...s.alert!.trigger, mode: triggerMode } },
            }),
        );
    }, []);

    const onRecipientsChange = useCallback((updatedRecipients: IAutomationRecipient[]): void => {
        setEditedAutomation((s) => ({
            ...s,
            recipients: updatedRecipients,
        }));
    }, []);

    const onFiltersChange = useCallback(
        (filters: FilterContextItem[]) => {
            setEditedAutomationFilters(filters);
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

                const updatedAutomationWithFilters = {
                    ...s,
                    alert: {
                        ...s.alert!,
                        execution: {
                            ...s.alert!.execution,
                            filters: appliedFilters,
                        },
                    },
                    metadata: {
                        ...s.metadata,
                        visibleFilters,
                    },
                };

                const updatedAutomationWithAttribute = transformAlertByAttribute(
                    supportedAttributes,
                    updatedAutomationWithFilters as IAutomationMetadataObject,
                    selectedAttribute,
                    {
                        name: selectedValue ?? "",
                        title: "",
                        value: "",
                    },
                );

                return selectedMeasure
                    ? transformAlertByMetric(
                          supportedMeasures,
                          updatedAutomationWithAttribute as IAutomationMetadataObject,
                          selectedMeasure,
                          measureFormatMap,
                      )
                    : updatedAutomationWithAttribute;
            });
        },
        [
            setEditedAutomationFilters,
            setEditedAutomation,
            availableFiltersAsVisibleFilters,
            widget,
            insight,
            dashboardHiddenFilters,
            commonDateFilterId,
            //
            selectedAttribute,
            selectedValue,
            supportedAttributes,
            //
            selectedMeasure,
            supportedMeasures,
            measureFormatMap,
        ],
    );

    const onApplyCurrentFilters = useCallback(() => {
        onFiltersChange(filtersForNewAutomation);
    }, [filtersForNewAutomation, onFiltersChange]);

    const { value, onChange, onBlur } = useThresholdValue(
        onValueChange,
        getMetricValue,
        isNewAlert,
        editedAutomation?.alert,
        selectedRelativeOperator,
        selectedMeasure,
        selectedAttribute,
        selectedValue,
    );

    const validationErrorMessage = isOriginalAutomationValid
        ? undefined
        : intl.formatMessage({ id: "insightAlert.config.invalidWidget" });

    const hasRecipients = (editedAutomation.recipients?.length ?? 0) > 0;
    const hasValidExternalRecipients = allowExternalRecipients
        ? true
        : !editedAutomation.recipients?.some(isAutomationExternalUserRecipient);

    const hasValidCreatorRecipient = allowOnlyLoggedUserRecipients
        ? editedAutomation.recipients?.length === 1 &&
          editedAutomation.recipients[0].id === defaultRecipient.id
        : true;

    const hasNoUnknownRecipients = !editedAutomation.recipients?.some(isAutomationUnknownUserRecipient);

    const respectsRecipientsLimit = (editedAutomation.recipients?.length ?? 0) <= maxAutomationsRecipients;

    const hasFilledEmails =
        selectedNotificationChannel?.destinationType === "smtp"
            ? editedAutomation.recipients?.every((recipient) =>
                  isAutomationUserRecipient(recipient) ? isEmail(recipient.email ?? "") : true,
              )
            : true;

    const isValid =
        hasRecipients &&
        respectsRecipientsLimit &&
        hasValidExternalRecipients &&
        hasValidCreatorRecipient &&
        hasNoUnknownRecipients &&
        hasFilledEmails &&
        isTitleValid;

    const isSubmitDisabled = !isValid || (alertToEdit && isEqual(originalAutomation, editedAutomation));

    return {
        onTitleChange,
        onRecipientsChange,
        onFiltersChange,
        onApplyCurrentFilters,
        onMeasureChange,
        getAttributeValues,
        onAttributeChange,
        onComparisonOperatorChange,
        onRelativeOperatorChange,
        onChange,
        onBlur,
        onComparisonTypeChange,
        onDestinationChange,
        onTriggerModeChange,
        selectedMeasure,
        supportedMeasures,
        canManageAttributes,
        selectedAttribute,
        selectedValue,
        supportedAttributes,
        catalogAttributes,
        catalogDateDatasets,
        isResultLoading,
        selectedComparisonOperator,
        selectedRelativeOperator,
        value,
        selectedComparator,
        canManageComparison,
        separators,
        warningMessage,
        defaultUser,
        originalAutomation,
        editedAutomation,
        allowOnlyLoggedUserRecipients,
        allowExternalRecipients,
        validationErrorMessage,
        isSubmitDisabled,
    };
}
