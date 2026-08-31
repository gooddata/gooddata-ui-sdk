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
import { AlertingDialogAttribute } from "../blocks/AlertingDialogAttribute.js";
import { AlertingDialogComparisonOperator } from "../blocks/AlertingDialogComparisonOperator.js";
import { AlertingDialogComparisonPeriod } from "../blocks/AlertingDialogComparisonPeriod.js";
import { AlertingDialogGranularity } from "../blocks/AlertingDialogGranularity.js";
import { AlertingDialogMeasure } from "../blocks/AlertingDialogMeasure.js";
import { AlertingDialogSensitivity } from "../blocks/AlertingDialogSensitivity.js";
import { AlertingDialogThreshold } from "../blocks/AlertingDialogThreshold.js";
import { AlertingDialogTriggerInterval } from "../blocks/AlertingDialogTriggerInterval.js";
import { AlertingDialogTriggerMode } from "../blocks/AlertingDialogTriggerMode.js";
import { DeleteAlertConfirmDialog } from "../DefaultAlertingManagementDialog/components/DeleteAlertConfirmDialog.js";
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
import { useAlertSubmit } from "../state/useAlertSubmit.js";
import { type IDefaultAlertingDialogProps } from "../types.js";

import { ALERTING_DIALOG_ID } from "./constants.js";
import { DefaultAlertingDialogDestination } from "./DefaultAlertingDialogDestination.js";
import { DefaultAlertingDialogFilters } from "./DefaultAlertingDialogFilters.js";
import { DefaultAlertingDialogHeader } from "./DefaultAlertingDialogHeader.js";
import { DefaultAlertingDialogRecipients } from "./DefaultAlertingDialogRecipients.js";
import { DefaultLoadingAlertingDialog } from "./DefaultLoadingAlertingDialog.js";

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

    const { alertToEdit, notificationChannels } = useAlertingDialogContext();

    const [alertToDelete, setAlertToDelete] = useState<IAutomationMetadataObject | null>(null);

    const handleAlertDeleteSuccess = (alert: IAutomationMetadataObject) => {
        onDeleteSuccess?.(alert);
        setAlertToDelete(null);
    };

    const { warningMessage } = useAlertDraft();

    const { onApplyCurrentFilters, automationIsValid, filtersAreStale, dropStaleParameters } =
        useAlertFilters();

    const { validationErrorMessage, isInvalidConnectionToInsight } = useAlertDialogValidity();

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
                                    <AlertingDialogMeasure />
                                    <AlertingDialogAttribute />
                                    <AlertingDialogComparisonOperator />
                                    <AlertingDialogThreshold />
                                    <AlertingDialogComparisonPeriod />
                                    <AlertingDialogSensitivity />
                                    <AlertingDialogGranularity />
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
                                    <AlertingDialogTriggerMode />
                                    <AlertingDialogTriggerInterval />
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
 * matching `use*Props` hooks ({@link useAlertingDialogFiltersProps} and siblings), and from the
 * connected field blocks — {@link AlertingDialogMeasure}, {@link AlertingDialogAttribute},
 * {@link AlertingDialogComparisonOperator}, {@link AlertingDialogThreshold},
 * {@link AlertingDialogComparisonPeriod}, {@link AlertingDialogSensitivity},
 * {@link AlertingDialogGranularity}, {@link AlertingDialogTriggerMode},
 * {@link AlertingDialogTriggerInterval} — each a labelled {@link AutomationDialogFormField} row; the
 * conditional ones (Attribute, Threshold, ComparisonPeriod, Sensitivity, Granularity, TriggerInterval)
 * gate themselves on the draft. A custom `AlertingDialogComponent` that keeps our regions and fields
 * but owns the markup places the connected blocks ({@link AlertingDialogFilters},
 * {@link AlertingDialogThreshold} and siblings) instead of this component, and reads or writes the
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
