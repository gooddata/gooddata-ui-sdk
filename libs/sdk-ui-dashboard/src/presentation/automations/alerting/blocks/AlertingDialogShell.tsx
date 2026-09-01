// (C) 2026 GoodData Corporation

import { type ReactElement, useEffect, useRef, useState } from "react";

import { useIntl } from "react-intl";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";
import {
    ValidationContextStore,
    createInvalidDatapoint,
    createInvalidNode,
    useValidationContextValue,
} from "@gooddata/sdk-ui";
import {
    ConfirmDialogBase,
    Message,
    Overlay,
    OverlayController,
    OverlayControllerProvider,
    ScrollablePanel,
    useId,
} from "@gooddata/sdk-ui-kit";

import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../../constants/zIndex.js";
import { useAlertingDialogContext } from "../../contexts/AlertingDialogContext.js";
import { ApplyCurrentFiltersConfirmDialog } from "../../shared/automationFilters/components/ApplyLatestFiltersConfirmDialog.js";
import { DefaultAutomationDialogActionBar } from "../../shared/slots/DefaultAutomationDialogActionBar.js";
import { ALERTING_DIALOG_ID } from "../DefaultAlertingDialog/constants.js";
import { DefaultAlertingDialogHeader } from "../DefaultAlertingDialog/DefaultAlertingDialogHeader.js";
import { DeleteAlertConfirmDialog } from "../DefaultAlertingManagementDialog/components/DeleteAlertConfirmDialog.js";
import { useAlertDraft } from "../state/AlertDraftContext.js";
import { useAlertFilters } from "../state/AlertFiltersContext.js";
import { useAlertDialogValidity } from "../state/useAlertDialogValidity.js";
import {
    useAlertingDialogActionBarProps,
    useAlertingDialogHeaderProps,
} from "../state/useAlertingDialogRegionProps.js";
import { type IAlertingDialogShellProps } from "../types.js";

import { DefaultLoadingAlertingDialog } from "./DefaultLoadingAlertingDialog.js";

const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

/**
 * The alerting dialog's chrome, connected to the dialog's state: the modal overlay, the dialog frame
 * with the header row (the title input) and the action bar, the scrollable content area around
 * `children`, the dialog's warning and validation messages, the stale-filters confirmation step shown
 * before the dialog when the saved filters no longer match the dashboard, and the delete confirmation
 * reached from the action bar in edit mode. While `useAlertingDialogContext().isLoading` is true it
 * renders the loading skeleton and none of its children.
 *
 * The default dialog is `<AlertingDialogShell>` around the region and field blocks; a custom
 * `AlertingDialogComponent` that keeps this chrome and arranges the blocks differently renders the shell
 * itself. The shell does not own the submit: call {@link useAlertSubmit} and pass its `submit` and
 * `isSaving`, so the footer button and any Enter handler in the body share one instance. Call that hook
 * only once `useAlertingDialogContext().isLoading` is false — the state hooks throw while the dialog
 * loads — and render the shell alone (any `onSubmit`, `isSaving: false`) until then, as the example does.
 *
 * Needs an ambient `IntlProvider`; inside a `Dashboard` the dashboard's provider covers it.
 *
 * @example
 * ```tsx
 * function MyAlertingDialog(props: IAlertingDialogProps) {
 *     const { isLoading } = useAlertingDialogContext();
 *     // the state hooks throw while the dialog loads; the shell renders the loading skeleton
 *     if (isLoading) {
 *         return <AlertingDialogShell {...props} onSubmit={() => {}} isSaving={false} />;
 *     }
 *     return <MyAlertingDialogBody {...props} />;
 * }
 *
 * function MyAlertingDialogBody(props: IAlertingDialogProps) {
 *     const { isSaving, submit } = useAlertSubmit(props);
 *     return (
 *         <AlertingDialogShell {...props} onSubmit={() => void submit()} isSaving={isSaving}>
 *             <AlertingDialogFormFieldGroup label="When">
 *                 <AlertingDialogMeasure />
 *                 <AlertingDialogComparisonOperator />
 *                 <AlertingDialogThreshold />
 *             </AlertingDialogFormFieldGroup>
 *             <AlertingDialogRecipients />
 *         </AlertingDialogShell>
 *     );
 * }
 * ```
 *
 * @alpha
 */
export function AlertingDialogShell(props: IAlertingDialogShellProps): ReactElement {
    const { isLoading, alertToEdit } = useAlertingDialogContext();
    if (isLoading) {
        return <DefaultLoadingAlertingDialog onCancel={props.onCancel} alertToEdit={alertToEdit} />;
    }
    return <LoadedAlertingDialogShell {...props} />;
}

function LoadedAlertingDialogShell({
    onCancel,
    onDeleteSuccess,
    onDeleteError,
    onSubmit,
    isSaving,
    slots,
    topContent,
    bottomContent,
    children,
}: IAlertingDialogShellProps): ReactElement {
    const HeaderSlot = slots?.Header;
    const ActionBarSlot = slots?.ActionBar;

    const intl = useIntl();

    const dialogTitleRef = useRef<HTMLInputElement | null>(null);

    const { alertToEdit } = useAlertingDialogContext();

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

    const headerDefaultProps = useAlertingDialogHeaderProps({ onCancel, ref: dialogTitleRef });
    const actionBarDefaultProps = useAlertingDialogActionBarProps({
        onCancel,
        onSubmit,
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
                            accessibilityConfig={{
                                closeButton: {
                                    ariaLabel: intl.formatMessage({ id: "dialogs.alert.closeLabel" }),
                                },
                                titleElementId,
                                dialogId: ALERTING_DIALOG_ID,
                            }}
                            returnFocusAfterClose={false}
                            footerRenderer={() =>
                                ActionBarSlot ? (
                                    <ActionBarSlot
                                        Default={DefaultAutomationDialogActionBar}
                                        defaultProps={actionBarDefaultProps}
                                    />
                                ) : (
                                    <DefaultAutomationDialogActionBar {...actionBarDefaultProps} />
                                )
                            }
                            isSubmitDisabled={actionBarDefaultProps.isSubmitDisabled}
                            initialFocus={dialogTitleRef}
                            submitOnEnterKey={false}
                            onCancel={onCancel}
                            onSubmit={actionBarDefaultProps.onSubmit}
                            headline={undefined}
                            headerLeftButtonRenderer={() =>
                                HeaderSlot ? (
                                    <HeaderSlot
                                        Default={DefaultAlertingDialogHeader}
                                        defaultProps={headerDefaultProps}
                                    />
                                ) : (
                                    <DefaultAlertingDialogHeader {...headerDefaultProps} />
                                )
                            }
                        >
                            <h2 className={"sr-only"} id={titleElementId}>
                                {intl.formatMessage({ id: "dialogs.alert.accessibility.label.title" })}
                            </h2>
                            <ScrollablePanel className="gd-notifications-channel-dialog-content-wrapper gd-notification-channel-dialog-with-automation-filters">
                                {topContent}
                                <div className="gd-divider-with-margin" />
                                {children}
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
