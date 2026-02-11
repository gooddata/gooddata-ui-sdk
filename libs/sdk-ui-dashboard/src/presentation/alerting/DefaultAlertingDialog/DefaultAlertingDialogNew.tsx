// (C) 2019-2026 GoodData Corporation

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import cx from "classnames";
import { FormattedMessage, defineMessage, useIntl } from "react-intl";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";
import {
    ValidationContextStore,
    convertError,
    createInvalidDatapoint,
    createInvalidNode,
    useValidationContextValue,
} from "@gooddata/sdk-ui";
import {
    Button,
    ConfirmDialogBase,
    ContentDivider,
    Hyperlink,
    Message,
    Overlay,
    OverlayController,
    OverlayControllerProvider,
    ScrollablePanel,
    UiIcon,
    UiIconButton,
    UiTooltip,
    useId,
} from "@gooddata/sdk-ui-kit";

import { AlertingDialogHeader } from "./AlertingDialogHeader.js";
import { AlertAttributeSelect } from "./components/AlertAttributeSelect.js";
import { AlertComparisonOperatorSelect } from "./components/AlertComparisonOperatorSelect.js";
//
//
import { AlertComparisonPeriodSelect } from "./components/AlertComparisonPeriodSelect.js";
import { AlertDestinationSelect } from "./components/AlertDestinationSelect.js";
import { AlertGranularitySelect } from "./components/AlertGranularitySelect.js";
import { AlertMeasureSelect } from "./components/AlertMeasureSelect.js";
import { AlertSensitivitySelect } from "./components/AlertSensitivitySelect.js";
import { AlertThresholdInput } from "./components/AlertThresholdInput.js";
import { AlertTriggerModeSelect } from "./components/AlertTriggerModeSelect.js";
import { ALERTING_DIALOG_ID } from "./constants.js";
import { DefaultLoadingAlertingDialog } from "./DefaultLoadingAlertingDialog.js";
import { useEditAlert } from "./hooks/useEditAlert.js";
import { useSaveAlertToBackend } from "./hooks/useSaveAlertToBackend.js";
import { getDescription, getValueSuffix } from "./utils/getters.js";
import { isAnomalyDetection, isChangeOrDifferenceOperator } from "./utils/guards.js";
import { isMobileView } from "./utils/responsive.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useEnableAlertingAutomationFilterContext } from "../../../model/react/useDashboardAlerting/useEnableAutomationFilterContext.js";
import {
    selectEnableAlertOncePerInterval,
    selectEnableAnomalyDetectionAlert,
    selectEnableAutomationManagement,
    selectExternalRecipient,
    selectIsWhiteLabeled,
    selectLocale,
} from "../../../model/store/config/configSelectors.js";
import { selectEntitlementMaxAutomationRecipients } from "../../../model/store/entitlements/entitlementsSelectors.js";
import { selectCanUseAiAssistant } from "../../../model/store/permissions/permissionsSelectors.js";
import { selectIsAutomationDialogSecondaryTitleVisible } from "../../../model/store/topBar/topBarSelectors.js";
import { selectExecutionTimestamp } from "../../../model/store/ui/uiSelectors.js";
import { getWidgetTitle } from "../../../model/utils/dashboardItemUtils.js";
import { ApplyCurrentFiltersConfirmDialog } from "../../automationFilters/components/ApplyLatestFiltersConfirmDialog.js";
import { AutomationFiltersSelect } from "../../automationFilters/components/AutomationFiltersSelect.js";
import { useValidateExistingAutomationFilters } from "../../automationFilters/hooks/useValidateExistingAutomationFilters.js";
import { useAutomationFiltersSelect } from "../../automationFilters/useAutomationFiltersSelect.js";
import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../constants/zIndex.js";
import { IntlWrapper } from "../../localization/IntlWrapper.js";
import { RecipientsSelect } from "../../scheduledEmail/DefaultScheduledEmailDialog/components/RecipientsSelect/RecipientsSelect.js";
import { DEFAULT_MAX_RECIPIENTS } from "../../scheduledEmail/DefaultScheduledEmailDialog/constants.js";
import { DeleteAlertConfirmDialog } from "../DefaultAlertingManagementDialog/components/DeleteAlertConfirmDialog.js";
import { type IAlertingDialogProps } from "../types.js";
import { AlertTriggerIntervalSelect } from "./components/AlertTriggerIntervalSelect.js";

const OVERLAY_POSITION_TYPE = "sameAsTarget";
const CLOSE_ON_PARENT_SCROLL = true;

const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

export function AlertingDialogRenderer({
    alertToEdit,
    users,
    usersError,
    notificationChannels,
    insight,
    widget,
    onCancel,
    onDeleteSuccess,
    onDeleteError,
    onError,
    onSuccess,
    onSaveError,
    onSaveSuccess,
}: IAlertingDialogProps) {
    const intl = useIntl();

    const dialogTitleRef = useRef<HTMLInputElement | null>(null);

    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);
    const externalRecipientOverride = useDashboardSelector(selectExternalRecipient);
    const isSecondaryTitleVisible = useDashboardSelector(selectIsAutomationDialogSecondaryTitleVisible);
    const enableAutomationManagement = useDashboardSelector(selectEnableAutomationManagement);
    const enableAnomalyDetectionAlert = useDashboardSelector(selectEnableAnomalyDetectionAlert);
    const enableAiAssistant = useDashboardSelector(selectCanUseAiAssistant);
    const enableAlertOncePerInterval = useDashboardSelector(selectEnableAlertOncePerInterval);

    const [alertToDelete, setAlertToDelete] = useState<IAutomationMetadataObject | null>(null);

    const handleAlertDeleteSuccess = (alert: IAutomationMetadataObject) => {
        onDeleteSuccess?.(alert);
        setAlertToDelete(null);
    };

    const { maxAutomationsRecipients, isExecutionTimestampMode, enableAutomationFilterContext } =
        useDefaultAlertingDialogData();

    const {
        editedAutomationFilters,
        setEditedAutomationFilters,
        availableFilters,
        availableFiltersAsVisibleFilters,
        filtersForNewAutomation,
    } = useAutomationFiltersSelect({
        automationToEdit: alertToEdit,
        widget,
    });

    const {
        onTitleChange,
        onRecipientsChange,
        onFiltersChange,
        onApplyCurrentFilters,
        onMeasureChange,
        getAttributeValues,
        onAttributeChange,
        onComparisonOperatorChange,
        onRelativeOperatorChange,
        onAnomalyDetectionChange,
        onChange,
        onBlur,
        onComparisonTypeChange,
        onDestinationChange,
        onTriggerModeChange,
        onTriggerIntervalChange,
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
        selectedAiOperator,
        value,
        selectedComparator,
        selectedSensitivity,
        onSensitivityChange,
        selectedGranularity,
        onGranularityChange,
        canManageComparison,
        separators,
        defaultUser,
        originalAutomation,
        editedAutomation,
        allowOnlyLoggedUserRecipients,
        allowExternalRecipients,
        warningMessage,
        validationErrorMessage,
        isSubmitDisabled,
        isParentValid,
        thresholdErrorMessage,
        allowHourlyRecurrence,
    } = useEditAlert({
        insight,
        widget,
        alertToEdit,
        editedAutomationFilters,
        maxAutomationsRecipients,
        availableFiltersAsVisibleFilters,
        setEditedAutomationFilters,
        notificationChannels,
        filtersForNewAutomation,
        externalRecipientOverride,
    });

    const { isValid } = useValidateExistingAutomationFilters({
        automationToEdit: alertToEdit,
        widget,
        insight,
        enableAutomationFilterContext,
    });
    const [isApplyCurrentFiltersDialogOpen, setIsApplyCurrentFiltersDialogOpen] = useState(!isValid);

    const { isSavingAlert, handleCreateAlert, handleUpdateAlert } = useSaveAlertToBackend({
        onCreateSuccess: (alert) => {
            onSuccess?.(alert);
        },
        onCreateError: (err) => {
            onError?.(convertError(err));
        },
        onUpdateSuccess: (alert) => {
            onSaveSuccess?.(alert);
        },
        onUpdateError: (err) => {
            onSaveError?.(convertError(err));
        },
    });

    const handleSaveAlert = () => {
        if (!editedAutomation) {
            return;
        }

        const title = getDescription(
            intl,
            supportedMeasures,
            editedAutomation as IAutomationMetadataObject,
            separators,
        );
        const sanitizedAutomation = editedAutomation.title
            ? editedAutomation
            : {
                  ...editedAutomation,
                  title,
              };
        if (alertToEdit) {
            handleUpdateAlert(sanitizedAutomation);
        } else {
            handleCreateAlert(sanitizedAutomation);
        }
    };

    const validationContextValue = useValidationContextValue(createInvalidNode({ id: "AlertingDialog" }));
    const { setInvalidDatapoints, getInvalidDatapoints } = validationContextValue;
    const invalidDatapoint = getInvalidDatapoints()[0];

    useEffect(() => {
        setInvalidDatapoints(() => [
            !!validationErrorMessage && createInvalidDatapoint({ message: validationErrorMessage }),
        ]);
    }, [validationErrorMessage, setInvalidDatapoints]);

    const helpTextId = isMobileView()
        ? defineMessage({ id: "dialogs.alerting.footer.title.short" }).id
        : defineMessage({ id: "dialogs.alerting.footer.title" }).id;

    const titleElementId = useId();

    const { secondaryTitle, secondaryTitleIcon } = useMemo(() => {
        return {
            secondaryTitle: getWidgetTitle(widget),
            secondaryTitleIcon: (
                <UiIcon
                    type="visualization"
                    size={16}
                    color="complementary-6"
                    accessibilityConfig={{
                        ariaLabel: intl.formatMessage({
                            id: "dialogs.automation.icon.ariaLabel.sourceVisualization",
                        }),
                    }}
                />
            ),
        };
    }, [widget, intl]);

    if (isApplyCurrentFiltersDialogOpen && enableAutomationFilterContext) {
        return (
            <ApplyCurrentFiltersConfirmDialog
                automationType="alert"
                onCancel={() => onCancel?.()}
                onEdit={() => {
                    onApplyCurrentFilters();
                    setIsApplyCurrentFiltersDialogOpen(false);
                }}
            />
        );
    }

    return (
        <>
            <Overlay
                className="gd-notifications-channels-dialog-overlay"
                isModal
                positionType="fixed"
                ensureVisibility
            >
                <OverlayControllerProvider overlayController={overlayController}>
                    <ValidationContextStore value={validationContextValue}>
                        <ConfirmDialogBase
                            className={cx(
                                "gd-notifications-channels-dialog s-gd-notifications-channels-dialog",
                                {
                                    "gd-dialog--wide gd-notifications-channels-dialog--wide":
                                        enableAutomationManagement,
                                },
                            )}
                            isPositive
                            cancelButtonText={intl.formatMessage({ id: "cancel" })}
                            submitButtonText={
                                alertToEdit
                                    ? intl.formatMessage({ id: `save` })
                                    : intl.formatMessage({ id: `create` })
                            }
                            accessibilityConfig={{
                                closeButton: {
                                    ariaLabel: intl.formatMessage({ id: "dialogs.alert.closeLabel" }),
                                },
                                titleElementId,
                                dialogId: ALERTING_DIALOG_ID,
                            }}
                            showProgressIndicator={isSavingAlert}
                            returnFocusAfterClose={!enableAutomationManagement}
                            footerLeftRenderer={() => (
                                <AlertingDialogFooter
                                    isWhiteLabeled={isWhiteLabeled}
                                    helpTextId={helpTextId}
                                    alertToEdit={alertToEdit}
                                    isSavingAlert={isSavingAlert}
                                    onDeleteClick={() =>
                                        setAlertToDelete(alertToEdit as IAutomationMetadataObject)
                                    }
                                />
                            )}
                            isSubmitDisabled={isSubmitDisabled || isSavingAlert || isExecutionTimestampMode}
                            submitButtonTooltipText={
                                isExecutionTimestampMode
                                    ? intl.formatMessage({
                                          id: "dialogs.alert.save.executionTimestampMode",
                                      })
                                    : undefined
                            }
                            initialFocus={dialogTitleRef}
                            submitOnEnterKey={false}
                            onCancel={onCancel}
                            onSubmit={handleSaveAlert}
                            headline={undefined}
                            headerLeftButtonRenderer={() => (
                                <AlertingDialogHeader
                                    title={editedAutomation?.title ?? ""}
                                    onChange={onTitleChange}
                                    onCancel={onCancel}
                                    placeholder={intl.formatMessage({
                                        id: "dialogs.alert.title.placeholder",
                                    })}
                                    ref={dialogTitleRef}
                                    secondaryTitle={secondaryTitle}
                                    secondaryTitleIcon={secondaryTitleIcon}
                                    isSecondaryTitleVisible={
                                        isSecondaryTitleVisible ? isParentValid : undefined
                                    }
                                />
                            )}
                        >
                            <h2 className={"sr-only"} id={titleElementId}>
                                {intl.formatMessage({ id: "dialogs.alert.accessibility.label.title" })}
                            </h2>
                            <ScrollablePanel
                                className={cx("gd-notifications-channel-dialog-content-wrapper", {
                                    "gd-notification-channel-dialog-with-automation-filters":
                                        enableAutomationFilterContext,
                                })}
                            >
                                <div className="gd-divider-with-margin" />
                                {enableAutomationFilterContext ? (
                                    <>
                                        <AutomationFiltersSelect
                                            availableFilters={availableFilters}
                                            selectedFilters={editedAutomationFilters}
                                            onFiltersChange={onFiltersChange}
                                            storeFilters
                                            onStoreFiltersChange={() => {}}
                                            isDashboardAutomation={false}
                                            overlayPositionType={OVERLAY_POSITION_TYPE}
                                            disableDateFilters={isAnomalyDetection(editedAutomation?.alert)}
                                        />
                                        <ContentDivider className="gd-divider-with-margin" />
                                    </>
                                ) : null}
                                <FormFieldGroup label={<FormattedMessage id="insightAlert.config.when" />}>
                                    <FormField
                                        label={intl.formatMessage({ id: "insightAlert.config.metric" })}
                                        htmlFor="alert.measure"
                                    >
                                        <AlertMeasureSelect
                                            selectedMeasure={selectedMeasure}
                                            onMeasureChange={onMeasureChange}
                                            measures={supportedMeasures}
                                            overlayPositionType={OVERLAY_POSITION_TYPE}
                                            id="alert.measure"
                                            closeOnParentScroll={CLOSE_ON_PARENT_SCROLL}
                                        />
                                    </FormField>
                                    {Boolean(canManageAttributes) &&
                                        supportedAttributes.filter((a) => a.type === "attribute").length >
                                            0 && (
                                            <FormField
                                                label={<FormattedMessage id="insightAlert.config.for" />}
                                                htmlFor="alert.attribute"
                                            >
                                                <AlertAttributeSelect
                                                    id="alert.attribute"
                                                    selectedAttribute={selectedAttribute}
                                                    selectedValue={selectedValue}
                                                    onAttributeChange={onAttributeChange}
                                                    attributes={supportedAttributes}
                                                    catalogAttributes={catalogAttributes}
                                                    catalogDateDatasets={catalogDateDatasets}
                                                    getAttributeValues={getAttributeValues}
                                                    isResultLoading={isResultLoading}
                                                    showLabel={false}
                                                    closeOnParentScroll={CLOSE_ON_PARENT_SCROLL}
                                                />
                                            </FormField>
                                        )}
                                    <FormField
                                        label={<FormattedMessage id="insightAlert.config.condition" />}
                                        htmlFor="alert.condition"
                                    >
                                        <AlertComparisonOperatorSelect
                                            id="alert.condition"
                                            measure={selectedMeasure}
                                            enableAnomalyDetectionAlert={
                                                enableAnomalyDetectionAlert ? enableAiAssistant : false
                                            }
                                            selectedComparisonOperator={selectedComparisonOperator}
                                            selectedRelativeOperator={selectedRelativeOperator}
                                            selectedAiOperator={selectedAiOperator}
                                            onAnomalyDetectionChange={onAnomalyDetectionChange}
                                            onComparisonOperatorChange={onComparisonOperatorChange}
                                            onRelativeOperatorChange={onRelativeOperatorChange}
                                            overlayPositionType={OVERLAY_POSITION_TYPE}
                                            closeOnParentScroll={CLOSE_ON_PARENT_SCROLL}
                                        />
                                    </FormField>
                                    {!isAnomalyDetection(editedAutomation?.alert) && (
                                        <FormField
                                            label={<FormattedMessage id="insightAlert.config.threshold" />}
                                            htmlFor="alert.value"
                                        >
                                            <AlertThresholdInput
                                                id="alert.value"
                                                value={value}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                suffix={getValueSuffix(editedAutomation?.alert)}
                                                errorMessage={thresholdErrorMessage}
                                            />
                                        </FormField>
                                    )}
                                    {isChangeOrDifferenceOperator(editedAutomation?.alert) && (
                                        <FormField
                                            label={<FormattedMessage id="insightAlert.config.comparison" />}
                                            htmlFor="alert.comparison"
                                        >
                                            <AlertComparisonPeriodSelect
                                                id="alert.comparison"
                                                measure={selectedMeasure}
                                                alert={editedAutomation as IAutomationMetadataObject}
                                                selectedComparison={selectedComparator?.comparator}
                                                onComparisonChange={(comparisonType) => {
                                                    onComparisonTypeChange(
                                                        selectedMeasure,
                                                        selectedRelativeOperator,
                                                        comparisonType,
                                                    );
                                                }}
                                                overlayPositionType={OVERLAY_POSITION_TYPE}
                                                canManageComparison={canManageComparison}
                                                closeOnParentScroll={CLOSE_ON_PARENT_SCROLL}
                                            />
                                        </FormField>
                                    )}
                                    {isAnomalyDetection(editedAutomation?.alert) && (
                                        <>
                                            <FormField
                                                label={
                                                    <FormattedMessage id="insightAlert.config.sensitivity" />
                                                }
                                                htmlFor="alert.sensitivity"
                                            >
                                                <AlertSensitivitySelect
                                                    id="alert.sensitivity"
                                                    selectedSensitivity={selectedSensitivity}
                                                    onSensitivityChange={onSensitivityChange}
                                                    overlayPositionType={OVERLAY_POSITION_TYPE}
                                                    closeOnParentScroll={CLOSE_ON_PARENT_SCROLL}
                                                />
                                            </FormField>
                                            <FormField
                                                label={
                                                    <div className="gd-dashboard-alerting-dialog-form-field__content-container-tooltip">
                                                        <FormattedMessage id="insightAlert.config.granularity" />
                                                        <UiTooltip
                                                            anchor={
                                                                <UiIconButton
                                                                    icon="question"
                                                                    variant="tertiary"
                                                                    size="xsmall"
                                                                    accessibilityConfig={{
                                                                        ariaLabel: intl.formatMessage({
                                                                            id: "insightAlert.config.granularity",
                                                                        }),
                                                                    }}
                                                                />
                                                            }
                                                            content={
                                                                <FormattedMessage id="insightAlert.config.granularity.tooltip" />
                                                            }
                                                            arrowPlacement="left"
                                                            optimalPlacement
                                                            offset={10}
                                                            width={280}
                                                            triggerBy={["hover", "click"]}
                                                        />
                                                    </div>
                                                }
                                                htmlFor="alert.granularity"
                                            >
                                                <AlertGranularitySelect
                                                    id="alert.granularity"
                                                    allowHourlyRecurrence={allowHourlyRecurrence}
                                                    selectedGranularity={selectedGranularity}
                                                    onGranularityChange={(granularity) => {
                                                        onGranularityChange(selectedMeasure, granularity);
                                                    }}
                                                    overlayPositionType={OVERLAY_POSITION_TYPE}
                                                    closeOnParentScroll={CLOSE_ON_PARENT_SCROLL}
                                                />
                                            </FormField>
                                        </>
                                    )}
                                </FormFieldGroup>
                                <ContentDivider className="gd-divider-with-margin" />
                                <FormFieldGroup label={<FormattedMessage id="insightAlert.config.do" />}>
                                    {notificationChannels.length > 1 && (
                                        <FormField
                                            label={<FormattedMessage id="insightAlert.config.action" />}
                                            htmlFor="alert.destination"
                                        >
                                            <AlertDestinationSelect
                                                id="alert.destination"
                                                selectedDestination={editedAutomation?.notificationChannel}
                                                onDestinationChange={onDestinationChange}
                                                destinations={notificationChannels}
                                                overlayPositionType={OVERLAY_POSITION_TYPE}
                                                closeOnParentScroll={CLOSE_ON_PARENT_SCROLL}
                                            />
                                        </FormField>
                                    )}
                                    <FormField
                                        label={<FormattedMessage id="insightAlert.config.trigger" />}
                                        htmlFor="alert.trigger"
                                    >
                                        <AlertTriggerModeSelect
                                            id="alert.trigger"
                                            selectedTriggerMode={
                                                editedAutomation?.alert?.trigger.mode ?? "ALWAYS"
                                            }
                                            onTriggerModeChange={onTriggerModeChange}
                                            overlayPositionType={OVERLAY_POSITION_TYPE}
                                            closeOnParentScroll={CLOSE_ON_PARENT_SCROLL}
                                            enableAlertOncePerInterval={enableAlertOncePerInterval}
                                        />
                                    </FormField>
                                    {editedAutomation?.alert?.trigger.mode === "ONCE_PER_INTERVAL" ? (
                                        <FormField
                                            label={
                                                <div className="gd-dashboard-alerting-dialog-form-field__content-container-tooltip">
                                                    <FormattedMessage id="insightAlert.config.interval" />
                                                    <UiTooltip
                                                        anchor={
                                                            <UiIconButton
                                                                icon="question"
                                                                variant="tertiary"
                                                                size="xsmall"
                                                                accessibilityConfig={{
                                                                    ariaLabel: intl.formatMessage({
                                                                        id: "insightAlert.config.interval",
                                                                    }),
                                                                }}
                                                            />
                                                        }
                                                        content={
                                                            <FormattedMessage id="insightAlert.config.interval.tooltip" />
                                                        }
                                                        arrowPlacement="left"
                                                        optimalPlacement
                                                        offset={10}
                                                        width={280}
                                                        triggerBy={["hover", "click"]}
                                                    />
                                                </div>
                                            }
                                            htmlFor="alert.interval"
                                        >
                                            <AlertTriggerIntervalSelect
                                                id="alert.interval"
                                                selectedTriggerInterval={
                                                    editedAutomation?.alert?.trigger.interval ?? "DAY"
                                                }
                                                onTriggerIntervalChange={onTriggerIntervalChange}
                                                overlayPositionType={OVERLAY_POSITION_TYPE}
                                                closeOnParentScroll={CLOSE_ON_PARENT_SCROLL}
                                            />
                                        </FormField>
                                    ) : null}
                                    <FormField
                                        label={<FormattedMessage id="insightAlert.config.recipients" />}
                                        htmlFor="alert.recipients"
                                        fullWidth
                                    >
                                        <RecipientsSelect
                                            id="alert.recipients"
                                            loggedUser={defaultUser}
                                            users={users}
                                            usersError={usersError}
                                            value={editedAutomation?.recipients ?? []}
                                            originalValue={originalAutomation?.recipients || []}
                                            onChange={onRecipientsChange}
                                            allowEmptySelection
                                            allowOnlyLoggedUserRecipients={allowOnlyLoggedUserRecipients}
                                            allowExternalRecipients={allowExternalRecipients}
                                            maxRecipients={maxAutomationsRecipients}
                                            notificationChannels={notificationChannels}
                                            notificationChannelId={editedAutomation?.notificationChannel}
                                            showLabel={false}
                                            externalRecipientOverride={externalRecipientOverride}
                                        />
                                    </FormField>
                                </FormFieldGroup>
                                {warningMessage ? (
                                    <Message
                                        type="warning"
                                        className="gd-notifications-channels-dialog-error"
                                    >
                                        {warningMessage}
                                    </Message>
                                ) : null}
                                {invalidDatapoint ? (
                                    <Message
                                        type="error"
                                        id={invalidDatapoint.id}
                                        className="gd-notifications-channels-dialog-error gd-notifications-channels-dialog-error-scrollable"
                                    >
                                        {invalidDatapoint.message}
                                    </Message>
                                ) : null}
                            </ScrollablePanel>
                        </ConfirmDialogBase>
                    </ValidationContextStore>
                </OverlayControllerProvider>
            </Overlay>
            {alertToDelete ? (
                <DeleteAlertConfirmDialog
                    alert={alertToDelete}
                    onCancel={() => setAlertToDelete(null)}
                    onSuccess={handleAlertDeleteSuccess}
                    onError={onDeleteError}
                />
            ) : null}
        </>
    );
}

/**
 * @alpha
 */
export function DefaultAlertingDialogNew(props: IAlertingDialogProps) {
    const { isLoading, onCancel, alertToEdit } = props;
    const locale = useDashboardSelector(selectLocale);

    if (isLoading) {
        return <DefaultLoadingAlertingDialog onCancel={onCancel} alertToEdit={alertToEdit} />;
    }

    return (
        <IntlWrapper locale={locale}>
            <AlertingDialogRenderer {...props} />
        </IntlWrapper>
    );
}

function useDefaultAlertingDialogData() {
    const maxAutomationsRecipientsEntitlement = useDashboardSelector(
        selectEntitlementMaxAutomationRecipients,
    );
    const maxAutomationsRecipients = parseInt(
        maxAutomationsRecipientsEntitlement?.value ?? DEFAULT_MAX_RECIPIENTS,
        10,
    );

    const isExecutionTimestampMode = !!useDashboardSelector(selectExecutionTimestamp);
    const enableAutomationFilterContext = useEnableAlertingAutomationFilterContext();

    return {
        maxAutomationsRecipients,
        isExecutionTimestampMode,
        enableAutomationFilterContext,
    };
}

interface IAlertingDialogFooterProps {
    isWhiteLabeled: boolean;
    helpTextId: string;
    alertToEdit?: IAutomationMetadataObject | IAutomationMetadataObjectDefinition | null;
    isSavingAlert: boolean;
    onDeleteClick: () => void;
}

function AlertingDialogFooter({
    isWhiteLabeled,
    helpTextId,
    alertToEdit,
    isSavingAlert,
    onDeleteClick,
}: IAlertingDialogFooterProps) {
    const intl = useIntl();

    return (
        <div className="gd-notifications-channels-dialog-footer-link">
            {isWhiteLabeled ? null : (
                <Hyperlink
                    text={intl.formatMessage({ id: helpTextId })}
                    href="https://www.gooddata.com/docs/cloud/create-dashboards/automation/alerts/"
                    iconClass="gd-icon-circle-question"
                />
            )}
            {alertToEdit ? (
                <Button
                    className="gd-button-link-dimmed"
                    value={intl.formatMessage({ id: "delete" })}
                    onClick={onDeleteClick}
                    disabled={isSavingAlert}
                />
            ) : null}
        </div>
    );
}

function FormField({
    label,
    children,
    htmlFor,
    fullWidth = false,
}: {
    label: ReactNode;
    children: ReactNode;
    htmlFor?: string;
    fullWidth?: boolean;
}) {
    return (
        <div className="gd-input-component gd-input-component--no-last-child-margin gd-dashboard-alerting-dialog-form-field">
            <div className="gd-dashboard-alerting-dialog-form-field__label-container">
                <label className="gd-label gd-dashboard-alerting-dialog-form-field__label" htmlFor={htmlFor}>
                    {label}
                </label>
            </div>
            <div
                className={
                    fullWidth
                        ? "gd-dashboard-alerting-dialog-form-field__content-container-full-width"
                        : "gd-dashboard-alerting-dialog-form-field__content-container"
                }
            >
                {children}
            </div>
        </div>
    );
}

function FormFieldGroup({ label, children }: { label: ReactNode; children: ReactNode }) {
    return (
        <div className="gd-input-component gd-input-component--no-last-child-margin gd-dashboard-alerting-dialog-form-field-group">
            <div className="gd-dashboard-alerting-dialog-form-field-group__label-container">
                <label className="gd-label gd-dashboard-alerting-dialog-form-field-group__label">
                    {label}
                </label>
            </div>
            <div className="gd-dashboard-alerting-dialog-form-field-group__content-container">{children}</div>
        </div>
    );
}
