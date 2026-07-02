// (C) 2019-2026 GoodData Corporation

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { FormattedMessage, defineMessage, useIntl } from "react-intl";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";
import {
    ValidationContextStore,
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

import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../../constants/zIndex.js";
import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { useAlertingDialogContext } from "../../contexts/AlertingDialogContext.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { RecipientsSelect } from "../../scheduledEmail/DefaultScheduledEmailDialog/components/RecipientsSelect/RecipientsSelect.js";
import { ApplyCurrentFiltersConfirmDialog } from "../../shared/automationFilters/components/ApplyLatestFiltersConfirmDialog.js";
import { AutomationFiltersSelect } from "../../shared/automationFilters/components/AutomationFiltersSelect.js";
import { useValidateExistingAutomationFilters } from "../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js";
import { useAutomationFiltersSelect } from "../../shared/automationFilters/useAutomationFiltersSelect.js";
import { DeleteAlertConfirmDialog } from "../DefaultAlertingManagementDialog/components/DeleteAlertConfirmDialog.js";
import { type IAlertingDialogProps } from "../types.js";

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
import { AlertTriggerIntervalSelect } from "./components/AlertTriggerIntervalSelect.js";
import { AlertTriggerModeSelect } from "./components/AlertTriggerModeSelect.js";
import { ALERTING_DIALOG_ID } from "./constants.js";
import { DefaultLoadingAlertingDialog } from "./DefaultLoadingAlertingDialog.js";
import { useAlertSubmit } from "./hooks/useAlertSubmit.js";
import { useEditAlert } from "./hooks/useEditAlert.js";
import { getValueSuffix } from "./utils/getters.js";
import { isAnomalyDetection, isChangeOrDifferenceOperator } from "./utils/guards.js";
import { isMobileView } from "./utils/responsive.js";

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

    const {
        isWhiteLabeled,
        isSecondaryTitleVisible,
        externalRecipient: externalRecipientOverride,
        features: {
            enableAlertOncePerInterval,
            enableAnomalyDetectionAlert,
            canUseAiAssistant: enableAiAssistant,
        },
    } = useAutomationsContext();
    const { widgetTitle } = useAlertingDialogContext();

    const [alertToDelete, setAlertToDelete] = useState<IAutomationMetadataObject | null>(null);

    const handleAlertDeleteSuccess = (alert: IAutomationMetadataObject) => {
        onDeleteSuccess?.(alert);
        setAlertToDelete(null);
    };

    const { maxAutomationsRecipients, isExecutionTimestampMode } = useDefaultAlertingDialogData();

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
        dropStaleParameters,
        automationParameters,
        availableParameters,
        onParameterChange,
        onParameterDelete,
        onParameterAdd,
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
        canChangeMeasure,
        supportedMeasures,
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
        separators,
        defaultUser,
        originalAutomation,
        editedAutomation,
        allowOnlyLoggedUserRecipients,
        allowExternalRecipients,
        warningMessage,
        validationErrorMessage,
        isInvalidConnectionToInsight,
        isSubmitDisabled,
        isParentValid,
        thresholdErrorMessage,
        allowHourlyRecurrence,
    } = useEditAlert({
        insight,
        widget,
        alertToEdit,
        users,
        editedAutomationFilters,
        maxAutomationsRecipients,
        availableFiltersAsVisibleFilters,
        setEditedAutomationFilters,
        notificationChannels,
        filtersForNewAutomation,
        externalRecipientOverride,
    });

    const { isValid, filtersAreStale = false } = useValidateExistingAutomationFilters({
        automationToEdit: alertToEdit,
        widget,
        insight,
    });
    const [isApplyCurrentFiltersDialogOpen, setIsApplyCurrentFiltersDialogOpen] = useState(!isValid);

    const { isSaving, submit } = useAlertSubmit({
        editedAutomation,
        supportedMeasures,
        separators,
        alertToEdit,
        onSuccess,
        onError,
        onSaveSuccess,
        onSaveError,
    });

    const validationContextValue = useValidationContextValue(createInvalidNode({ id: "AlertingDialog" }));
    const { setInvalidDatapoints, getInvalidDatapoints } = validationContextValue;
    const invalidDatapoints = getInvalidDatapoints();

    useEffect(() => {
        setInvalidDatapoints(() => [
            !!validationErrorMessage &&
                createInvalidDatapoint({
                    message: validationErrorMessage,
                    severity: isInvalidConnectionToInsight ? "error" : "warning",
                }),
        ]);
    }, [validationErrorMessage, isInvalidConnectionToInsight, setInvalidDatapoints]);

    const helpTextId = isMobileView()
        ? defineMessage({ id: "dialogs.alerting.footer.title.short" }).id
        : defineMessage({ id: "dialogs.alerting.footer.title" }).id;

    const titleElementId = useId();

    const { secondaryTitle, secondaryTitleIcon } = useMemo(() => {
        return {
            secondaryTitle: widgetTitle,
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
    }, [widgetTitle, intl]);

    if (isApplyCurrentFiltersDialogOpen) {
        return (
            <ApplyCurrentFiltersConfirmDialog
                automationType="alert"
                onCancel={() => onCancel?.()}
                onEdit={() => {
                    // Repair only what is actually stale: replace filters when they are invalid, and
                    // drop catalog-absent parameters. A valid saved filter set survives a param-only fix.
                    if (filtersAreStale) {
                        onApplyCurrentFilters();
                    }
                    dropStaleParameters();
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
                            className="gd-notifications-channels-dialog s-gd-notifications-channels-dialog gd-dialog--wide gd-notifications-channels-dialog--wide"
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
                            showProgressIndicator={isSaving}
                            returnFocusAfterClose={false}
                            footerLeftRenderer={() => (
                                <AlertingDialogFooter
                                    isWhiteLabeled={isWhiteLabeled}
                                    helpTextId={helpTextId}
                                    alertToEdit={alertToEdit}
                                    isSavingAlert={isSaving}
                                    onDeleteClick={() =>
                                        setAlertToDelete(alertToEdit as IAutomationMetadataObject)
                                    }
                                />
                            )}
                            isSubmitDisabled={isSubmitDisabled || isSaving || isExecutionTimestampMode}
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
                            onSubmit={() => void submit()}
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
                            <ScrollablePanel className="gd-notifications-channel-dialog-content-wrapper gd-notification-channel-dialog-with-automation-filters">
                                <div className="gd-divider-with-margin" />
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
                                        parameters={automationParameters}
                                        onParameterChange={onParameterChange}
                                        onParameterDelete={onParameterDelete}
                                        availableParameters={availableParameters}
                                        onParameterAdd={onParameterAdd}
                                    />
                                    <ContentDivider className="gd-divider-with-margin" />
                                </>
                                <FormFieldGroup label={<FormattedMessage id="insightAlert.config.when" />}>
                                    <FormField
                                        label={intl.formatMessage({ id: "insightAlert.config.metric" })}
                                        htmlFor="alert.measure"
                                    >
                                        <AlertMeasureSelect
                                            selectedMeasure={selectedMeasure}
                                            onMeasureChange={onMeasureChange}
                                            measures={supportedMeasures}
                                            disabled={!canChangeMeasure}
                                            overlayPositionType={OVERLAY_POSITION_TYPE}
                                            id="alert.measure"
                                            closeOnParentScroll={CLOSE_ON_PARENT_SCROLL}
                                        />
                                    </FormField>
                                    {supportedAttributes.filter((a) => a.type === "attribute").length > 0 && (
                                        <FormField
                                            label={<FormattedMessage id="insightAlert.config.for" />}
                                            htmlFor="alert.attribute"
                                        >
                                            <AlertAttributeSelect
                                                id="alert.attribute"
                                                disabled={!canChangeMeasure}
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
                                                selectedGranularity={selectedComparator?.granularity}
                                                onComparisonChange={(comparisonType, granularity) => {
                                                    onComparisonTypeChange(
                                                        selectedMeasure,
                                                        selectedRelativeOperator,
                                                        comparisonType,
                                                        granularity,
                                                    );
                                                }}
                                                overlayPositionType={OVERLAY_POSITION_TYPE}
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
                                {invalidDatapoints.map((datapoint) => (
                                    <Message
                                        key={datapoint.id}
                                        id={datapoint.id}
                                        type={datapoint.severity === "info" ? "progress" : datapoint.severity}
                                        className="gd-notifications-channels-dialog-error gd-notifications-channels-dialog-error-scrollable"
                                    >
                                        {datapoint.message}
                                    </Message>
                                ))}
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
 * Default implementation of the alerting create/edit dialog.
 *
 * This component is a pure consumer of `AutomationsContext` and `AlertingDialogContext`: it reads
 * org/workspace data and per-dialog state from those contexts rather than from the dashboard store.
 * It must therefore be rendered within an `AutomationsContextProvider` (and, for the create/edit
 * flow, an `AlertingDialogContextProvider`). Inside a `Dashboard`, the alerting connector supplies
 * both providers above the `AlertingDialogComponent` slot — so the default component, and any
 * wholesale slot replacement, inherit the contexts automatically and require no extra wiring.
 *
 * The providers are intentionally hoisted above the slot rather than built inside this component:
 * that is what lets a wholesale replacement receive the same contexts (see the Phase-2 boundary in
 * `docs/tasks/26Q1 - Automation Dialog Separation.md`). Rendering this component outside those
 * providers throws at runtime.
 *
 * @alpha
 */
export function DefaultAlertingDialog(props: IAlertingDialogProps) {
    const { isLoading, onCancel, alertToEdit } = props;
    const { locale } = useAutomationsContext();

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
    const { maxAutomationsRecipients, isExecutionTimestampMode } = useAutomationsContext();

    return {
        maxAutomationsRecipients,
        isExecutionTimestampMode,
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
