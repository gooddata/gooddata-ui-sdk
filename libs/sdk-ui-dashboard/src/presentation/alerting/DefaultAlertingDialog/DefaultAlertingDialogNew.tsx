// (C) 2019-2025 GoodData Corporation
import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";
import {
    Button,
    ConfirmDialogBase,
    ContentDivider,
    Hyperlink,
    Input,
    Message,
    Overlay,
    OverlayController,
    OverlayControllerProvider,
    useId,
    ScrollablePanel,
} from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { ReactNode, useRef, useState } from "react";
import { defineMessage, FormattedMessage, useIntl } from "react-intl";
import {
    selectEntitlementMaxAutomationRecipients,
    selectExecutionTimestamp,
    selectExternalRecipient,
    selectIsWhiteLabeled,
    selectLocale,
    useDashboardSelector,
    useEnableAlertingAutomationFilterContext,
} from "../../../model/index.js";
import { AutomationFiltersSelect } from "../../automationFilters/components/AutomationFiltersSelect.js";
import { useAutomationFiltersSelect } from "../../automationFilters/useAutomationFiltersSelect.js";
import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../constants/index.js";
import { IntlWrapper } from "../../localization/index.js";
import { IAlertingDialogProps } from "../types.js";
//
import { RecipientsSelect } from "../../scheduledEmail/DefaultScheduledEmailDialog/components/RecipientsSelect/RecipientsSelect.js";
import { DEFAULT_MAX_RECIPIENTS } from "../../scheduledEmail/DefaultScheduledEmailDialog/constants.js";
//
import { AlertAttributeSelect } from "./components/AlertAttributeSelect.js";
import { AlertComparisonOperatorSelect } from "./components/AlertComparisonOperatorSelect.js";
import { AlertComparisonPeriodSelect } from "./components/AlertComparisonPeriodSelect.js";
import { AlertDestinationSelect } from "./components/AlertDestinationSelect.js";
import { AlertMeasureSelect } from "./components/AlertMeasureSelect.js";
import { AlertTriggerModeSelect } from "./components/AlertTriggerModeSelect.js";

import { useEditAlert } from "./hooks/useEditAlert.js";
import { useSaveAlertToBackend } from "./hooks/useSaveAlertToBackend.js";

import { isMobileView } from "./utils/responsive.js";

import { AlertingDialogHeader } from "./AlertingDialogHeader.js";
import { DefaultLoadingAlertingDialog } from "./DefaultLoadingAlertingDialog.js";

import { DeleteAlertConfirmDialog } from "../DefaultAlertingManagementDialog/components/DeleteAlertConfirmDialog.js";

import { convertError } from "@gooddata/sdk-ui";
import { getDescription, getValueSuffix } from "./utils/getters.js";
import { isChangeOrDifferenceOperator } from "./utils/guards.js";
import { useValidateExistingAutomationFilters } from "../../automationFilters/hooks/useValidateExistingAutomationFilters.js";
import { ApplyCurrentFiltersConfirmDialog } from "../../automationFilters/components/ApplyLatestFiltersConfirmDialog.js";

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
        defaultUser,
        originalAutomation,
        editedAutomation,
        allowOnlyLoggedUserRecipients,
        allowExternalRecipients,
        warningMessage,
        validationErrorMessage,
        isSubmitDisabled,
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

    const errorMessage = validationErrorMessage;

    const helpTextId = isMobileView()
        ? defineMessage({ id: "dialogs.alerting.footer.title.short" }).id
        : defineMessage({ id: "dialogs.alerting.footer.title" }).id;

    const titleElementId = useId();

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
                isModal={true}
                positionType="fixed"
                ensureVisibility={true}
            >
                <OverlayControllerProvider overlayController={overlayController}>
                    <ConfirmDialogBase
                        className="gd-notifications-channels-dialog s-gd-notifications-channels-dialog"
                        isPositive={true}
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
                        }}
                        showProgressIndicator={isSavingAlert}
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
                                title={editedAutomation.title ?? ""}
                                onChange={onTitleChange}
                                onCancel={onCancel}
                                placeholder={intl.formatMessage({
                                    id: "dialogs.alert.title.placeholder",
                                })}
                                ref={dialogTitleRef}
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
                                        storeFilters={true}
                                        onStoreFiltersChange={() => {}}
                                        isDashboardAutomation={false}
                                        overlayPositionType={OVERLAY_POSITION_TYPE}
                                    />
                                    <ContentDivider className="gd-divider-with-margin" />
                                </>
                            ) : null}
                            <FormFieldGroup label={<FormattedMessage id="insightAlert.config.when" />}>
                                <FormField label="Metric" htmlFor="alert.measure">
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
                                    supportedAttributes.filter((a) => a.type === "attribute").length > 0 && (
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
                                        selectedComparisonOperator={selectedComparisonOperator}
                                        selectedRelativeOperator={selectedRelativeOperator}
                                        onComparisonOperatorChange={onComparisonOperatorChange}
                                        onRelativeOperatorChange={onRelativeOperatorChange}
                                        overlayPositionType={OVERLAY_POSITION_TYPE}
                                        closeOnParentScroll={CLOSE_ON_PARENT_SCROLL}
                                    />
                                </FormField>
                                <FormField
                                    label={<FormattedMessage id="insightAlert.config.threshold" />}
                                    htmlFor="alert.value"
                                >
                                    <Input
                                        id="alert.value"
                                        className="gd-edit-alert__value-input s-alert-value-input"
                                        isSmall
                                        value={value}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        type="number"
                                        suffix={getValueSuffix(editedAutomation?.alert)}
                                    />
                                </FormField>
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
                                                    selectedMeasure!,
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
                                            selectedDestination={editedAutomation.notificationChannel!}
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
                                    />
                                </FormField>
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
                                        value={editedAutomation.recipients ?? []}
                                        originalValue={originalAutomation.recipients || []}
                                        onChange={onRecipientsChange}
                                        allowEmptySelection
                                        allowOnlyLoggedUserRecipients={allowOnlyLoggedUserRecipients}
                                        allowExternalRecipients={allowExternalRecipients}
                                        maxRecipients={maxAutomationsRecipients}
                                        notificationChannels={notificationChannels}
                                        notificationChannelId={editedAutomation.notificationChannel}
                                        showLabel={false}
                                        externalRecipientOverride={externalRecipientOverride}
                                    />
                                </FormField>
                            </FormFieldGroup>
                            {warningMessage ? (
                                <Message type="warning" className="gd-notifications-channels-dialog-error">
                                    {warningMessage}
                                </Message>
                            ) : null}
                            {errorMessage ? (
                                <Message
                                    type="error"
                                    className="gd-notifications-channels-dialog-error gd-notifications-channels-dialog-error-scrollable"
                                >
                                    {errorMessage}
                                </Message>
                            ) : null}
                        </ScrollablePanel>
                    </ConfirmDialogBase>
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

interface AlertingDialogFooterProps {
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
}: AlertingDialogFooterProps) {
    const intl = useIntl();

    return (
        <div className="gd-notifications-channels-dialog-footer-link">
            {!isWhiteLabeled ? (
                <Hyperlink
                    text={intl.formatMessage({ id: helpTextId })}
                    href="https://www.gooddata.com/docs/cloud/create-dashboards/automation/alerts/"
                    iconClass="gd-icon-circle-question"
                />
            ) : null}
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
