// (C) 2019-2026 GoodData Corporation

import { type ReactNode, useEffect, useRef, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";
import {
    ValidationContextStore,
    createInvalidDatapoint,
    createInvalidNode,
    useValidationContextValue,
} from "@gooddata/sdk-ui";
import {
    ConfirmDialogBase,
    ContentDivider,
    Message,
    Overlay,
    OverlayController,
    OverlayControllerProvider,
    ScrollablePanel,
    UiIconButton,
    UiTooltip,
    useId,
} from "@gooddata/sdk-ui-kit";

import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../../constants/zIndex.js";
import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { useAlertingDialogContext } from "../../contexts/AlertingDialogContext.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { ApplyCurrentFiltersConfirmDialog } from "../../shared/automationFilters/components/ApplyLatestFiltersConfirmDialog.js";
import {
    AutomationDialogFooterLeft,
    DefaultAutomationDialogActionBar,
} from "../../shared/slots/DefaultAutomationDialogActionBar.js";
import { DeleteAlertConfirmDialog } from "../DefaultAlertingManagementDialog/components/DeleteAlertConfirmDialog.js";
import { useAlertActions } from "../state/AlertActionsContext.js";
import { useAlertData } from "../state/AlertDataContext.js";
import { useAlertDraft } from "../state/AlertDraftContext.js";
import { useAlertFilters } from "../state/AlertFiltersContext.js";
import { useAlertDialogValidity } from "../state/useAlertDialogValidity.js";
import {
    useAlertingDialogActionBarProps,
    useAlertingDialogDestinationProps,
    useAlertingDialogFiltersProps,
    useAlertingDialogHeaderProps,
    useAlertingDialogRecipientsProps,
} from "../state/useAlertingDialogRegionProps.js";
import { useAlertSelectedValues } from "../state/useAlertSelectedValues.js";
import { useAlertSubmit } from "../state/useAlertSubmit.js";
import { type IDefaultAlertingDialogProps } from "../types.js";
import { getValueSuffix } from "../utils/getters.js";
import { isAnomalyDetection, isChangeOrDifferenceOperator } from "../utils/guards.js";

import { AlertAttributeSelect } from "./components/AlertAttributeSelect.js";
import { AlertComparisonOperatorSelect } from "./components/AlertComparisonOperatorSelect.js";
//
//
import { AlertComparisonPeriodSelect } from "./components/AlertComparisonPeriodSelect.js";
import { AlertGranularitySelect } from "./components/AlertGranularitySelect.js";
import { AlertMeasureSelect } from "./components/AlertMeasureSelect.js";
import { AlertSensitivitySelect } from "./components/AlertSensitivitySelect.js";
import { AlertThresholdInput } from "./components/AlertThresholdInput.js";
import { AlertTriggerIntervalSelect } from "./components/AlertTriggerIntervalSelect.js";
import { AlertTriggerModeSelect } from "./components/AlertTriggerModeSelect.js";
import { ALERTING_DIALOG_ID } from "./constants.js";
import { DefaultAlertingDialogDestination } from "./DefaultAlertingDialogDestination.js";
import { DefaultAlertingDialogFilters } from "./DefaultAlertingDialogFilters.js";
import { DefaultAlertingDialogHeader } from "./DefaultAlertingDialogHeader.js";
import { DefaultAlertingDialogRecipients } from "./DefaultAlertingDialogRecipients.js";
import { DefaultLoadingAlertingDialog } from "./DefaultLoadingAlertingDialog.js";
import { FormField } from "./FormField.js";
import { useAlertThreshold } from "./hooks/useAlertThreshold.js";

const OVERLAY_POSITION_TYPE = "sameAsTarget";
const CLOSE_ON_PARENT_SCROLL = true;

const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

export function AlertingDialogRenderer({
    onCancel,
    onDeleteSuccess,
    onDeleteError,
    onError,
    onSuccess,
    onSaveError,
    onSaveSuccess,
    slots,
    topContent,
    bottomContent,
}: IDefaultAlertingDialogProps) {
    const HeaderSlot = slots?.Header;
    const FiltersSlot = slots?.Filters;
    const DestinationSlot = slots?.Destination;
    const RecipientsSlot = slots?.Recipients;
    const ActionBarSlot = slots?.ActionBar;

    const intl = useIntl();

    const dialogTitleRef = useRef<HTMLInputElement | null>(null);

    const {
        features: {
            enableAlertOncePerInterval,
            enableAnomalyDetectionAlert,
            canUseAiAssistant: enableAiAssistant,
        },
        catalogAttributes,
        catalogDateDatasets,
        allowHourlyRecurrence,
    } = useAutomationsContext();
    const { alertToEdit, notificationChannels } = useAlertingDialogContext();

    const [alertToDelete, setAlertToDelete] = useState<IAutomationMetadataObject | null>(null);

    const handleAlertDeleteSuccess = (alert: IAutomationMetadataObject) => {
        onDeleteSuccess?.(alert);
        setAlertToDelete(null);
    };

    const { editedAutomation, warningMessage } = useAlertDraft();

    const {
        onMeasureChange,
        onAttributeChange,
        onComparisonOperatorChange,
        onRelativeOperatorChange,
        onAnomalyDetectionChange,
        onComparisonTypeChange,
        onTriggerModeChange,
        onTriggerIntervalChange,
        onSensitivityChange,
        onGranularityChange,
        setEditedAutomation,
    } = useAlertActions();

    const { supportedMeasures, supportedAttributes, isResultLoading, getAttributeValues, getMetricValue } =
        useAlertData();

    const { onApplyCurrentFilters, automationIsValid, filtersAreStale, dropStaleParameters } =
        useAlertFilters();

    const {
        selectedMeasure,
        selectedComparisonOperator,
        selectedRelativeOperator,
        selectedAiOperator,
        selectedComparator,
        selectedSensitivity,
        selectedGranularity,
        selectedAttribute,
        selectedValue,
    } = useAlertSelectedValues();

    const { value, onChange, onBlur, thresholdErrorMessage } = useAlertThreshold({
        setEditedAutomation,
        editedAutomation,
        getMetricValue,
        isNewAlert: !alertToEdit,
        selectedRelativeOperator,
        selectedMeasure,
        selectedAttribute,
        selectedValue,
    });

    const { validationErrorMessage, canChangeMeasure, isInvalidConnectionToInsight } =
        useAlertDialogValidity();

    const [isApplyCurrentFiltersDialogOpen, setIsApplyCurrentFiltersDialogOpen] =
        useState(!automationIsValid);

    const { isSaving, submit } = useAlertSubmit({ onSuccess, onError, onSaveSuccess, onSaveError });

    const headerDefaultProps = useAlertingDialogHeaderProps({ onCancel, ref: dialogTitleRef });
    const filtersDefaultProps = useAlertingDialogFiltersProps();
    const destinationDefaultProps = useAlertingDialogDestinationProps();
    const recipientsDefaultProps = useAlertingDialogRecipientsProps();
    const actionBarDefaultProps = useAlertingDialogActionBarProps({
        onCancel,
        onSubmit: () => void submit(),
        isSaving,
        onDelete: () => setAlertToDelete(alertToEdit as IAutomationMetadataObject),
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

    const titleElementId = useId();

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
                            cancelButtonText={actionBarDefaultProps.cancelButtonText}
                            submitButtonText={actionBarDefaultProps.submitButtonText}
                            accessibilityConfig={{
                                closeButton: {
                                    ariaLabel: intl.formatMessage({ id: "dialogs.alert.closeLabel" }),
                                },
                                titleElementId,
                                dialogId: ALERTING_DIALOG_ID,
                            }}
                            showProgressIndicator={actionBarDefaultProps.isSaving}
                            returnFocusAfterClose={false}
                            footerLeftRenderer={
                                ActionBarSlot
                                    ? undefined
                                    : () => (
                                          <AutomationDialogFooterLeft
                                              helpLinkText={actionBarDefaultProps.helpLinkText}
                                              helpLinkHref={actionBarDefaultProps.helpLinkHref}
                                              deleteButtonText={actionBarDefaultProps.deleteButtonText}
                                              onDelete={actionBarDefaultProps.onDelete}
                                              isDeleteDisabled={actionBarDefaultProps.isSaving}
                                          />
                                      )
                            }
                            footerRenderer={
                                ActionBarSlot
                                    ? () => (
                                          <ActionBarSlot
                                              Default={DefaultAutomationDialogActionBar}
                                              defaultProps={actionBarDefaultProps}
                                          />
                                      )
                                    : undefined
                            }
                            isSubmitDisabled={actionBarDefaultProps.isSubmitDisabled}
                            submitButtonTooltipText={actionBarDefaultProps.submitButtonTooltipText}
                            initialFocus={dialogTitleRef}
                            submitOnEnterKey={false}
                            onCancel={onCancel}
                            onSubmit={actionBarDefaultProps.onSubmit}
                            headline={undefined}
                            headerLeftButtonRenderer={() => {
                                return HeaderSlot ? (
                                    <HeaderSlot
                                        Default={DefaultAlertingDialogHeader}
                                        defaultProps={headerDefaultProps}
                                    />
                                ) : (
                                    <DefaultAlertingDialogHeader {...headerDefaultProps} />
                                );
                            }}
                        >
                            <h2 className={"sr-only"} id={titleElementId}>
                                {intl.formatMessage({ id: "dialogs.alert.accessibility.label.title" })}
                            </h2>
                            <ScrollablePanel className="gd-notifications-channel-dialog-content-wrapper gd-notification-channel-dialog-with-automation-filters">
                                {topContent}
                                <div className="gd-divider-with-margin" />
                                <>
                                    {FiltersSlot ? (
                                        <FiltersSlot
                                            Default={DefaultAlertingDialogFilters}
                                            defaultProps={filtersDefaultProps}
                                        />
                                    ) : (
                                        <DefaultAlertingDialogFilters {...filtersDefaultProps} />
                                    )}
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
                                    {notificationChannels.length > 1 ? (
                                        DestinationSlot ? (
                                            <DestinationSlot
                                                Default={DefaultAlertingDialogDestination}
                                                defaultProps={destinationDefaultProps}
                                            />
                                        ) : (
                                            <DefaultAlertingDialogDestination {...destinationDefaultProps} />
                                        )
                                    ) : null}
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
                                    {RecipientsSlot ? (
                                        <RecipientsSlot
                                            Default={DefaultAlertingDialogRecipients}
                                            defaultProps={recipientsDefaultProps}
                                        />
                                    ) : (
                                        <DefaultAlertingDialogRecipients {...recipientsDefaultProps} />
                                    )}
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
                                {bottomContent}
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
 * This component is a pure consumer of `AutomationsContext`, `AlertingDialogContext`, and the
 * alerting dialog state contexts: it reads org/workspace data, per-dialog state, and the alert
 * draft's state from those contexts rather than from the dashboard store. It must therefore be
 * rendered within an `AutomationsContextProvider`, an `AlertingDialogContextProvider` (for the
 * create/edit flow), and an `AlertingDialogStateProvider`. Inside a `Dashboard`, the alerting
 * connector supplies the first two providers above the `AlertingDialogComponent` slot, and mounts
 * `AlertingDialogStateProvider` around the resolved slot component once
 * `useAlertingDialogContext().isLoading` is false — so the default component, and any wholesale
 * slot replacement, inherit all three contexts automatically and require no extra wiring.
 *
 * The providers are intentionally hoisted above the slot rather than built inside this component:
 * that is what lets a wholesale replacement receive the same contexts. Rendering this component
 * outside those providers throws at runtime.
 *
 * The dialog is composed from the exported region renders — {@link DefaultAlertingDialogHeader},
 * {@link DefaultAlertingDialogFilters}, {@link DefaultAlertingDialogDestination},
 * {@link DefaultAlertingDialogRecipients}, {@link DefaultAutomationDialogActionBar} — fed by the
 * matching `use*Props` hooks ({@link useAlertingDialogFiltersProps} and siblings). A custom
 * `AlertingDialogComponent` that keeps our regions but owns the markup places the connected blocks
 * ({@link AlertingDialogFilters} and siblings) instead of this component, and reads or writes the
 * same draft through {@link useAlertDraft} and {@link useAlertActions}.
 *
 * Slots render only in the fully rendered dialog: not while the dialog context reports loading,
 * and not while the stale-filters confirmation step is shown.
 *
 * @alpha
 */
export function DefaultAlertingDialog(props: IDefaultAlertingDialogProps) {
    const { onCancel } = props;
    const { locale } = useAutomationsContext();
    const { isLoading, alertToEdit } = useAlertingDialogContext();

    if (isLoading) {
        return <DefaultLoadingAlertingDialog onCancel={onCancel} alertToEdit={alertToEdit} />;
    }

    return (
        <IntlWrapper locale={locale}>
            <AlertingDialogRenderer {...props} />
        </IntlWrapper>
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
