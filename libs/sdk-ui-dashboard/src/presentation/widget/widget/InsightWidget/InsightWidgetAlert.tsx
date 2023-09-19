// (C) 2023 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
import {
    Bubble,
    BubbleHoverTrigger,
    Button,
    DialogBase,
    Dropdown,
    DropdownButton,
    IAlignPoint,
    Input,
    Message,
    Overlay,
    Typography,
    useToastMessage,
} from "@gooddata/sdk-ui-kit";
import { useIntl } from "react-intl";
import cx from "classnames";
import { kpiAlertDialogAlignPoints } from "../../kpi/ViewModeDashboardKpi/KpiAlerts/KpiAlertDialog/alignPoints.js";
import { KpiAlertDialogWhenTriggeredPicker } from "../../kpi/ViewModeDashboardKpi/KpiAlerts/KpiAlertDialog/KpiAlertDialogWhenTriggeredPicker.js";
import { IWidgetAlertDefinition, ObjRef } from "@gooddata/sdk-model";
import {
    createAlert,
    removeAlerts,
    selectAlertByWidgetRef,
    selectDashboardIdRef,
    selectFilterContextDefinition,
    selectIsInsightAlertOpenedByWidgetRef,
    uiActions,
    updateAlert,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";
import isNil from "lodash/isNil.js";

const enabledBubbleAlignPoints: IAlignPoint[] = [{ align: "tc bc" }, { align: "tc br" }];

const ZapierIcon = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 256 256"
            className="zapier-icon"
        >
            <path
                fill="#FF4A00"
                d="M128.08009-.00018c7.23096.01328 14.34243.62432 21.25557 1.77998v74.51998l52.8313-52.69529c5.8351 4.14435 11.29392 8.75371 16.34085 13.78818 5.04947 5.03447 9.6845 10.49405 13.839 16.31213l-52.83383 52.69526h74.71487C255.38725 113.29414 256 120.36111 256 127.58724v.17264c0 7.22613-.61275 14.30632-1.77215 21.2004h-74.72758l52.84655 52.68204c-4.1545 5.81808-8.78954 11.27766-13.82375 16.31213h-.01526c-5.04693 5.03447-10.50575 9.65705-16.3256 13.78816l-52.84655-52.69552v74.52011c-6.90043 1.15584-14.0119 1.76604-21.24286 1.7813h-.1856c-7.2335-.01526-14.317-.62546-21.23015-1.7813v-74.52011l-52.83129 52.69552c-11.66768-8.2757-21.86832-18.46388-30.17986-30.10029l52.83383-52.68204H1.78486C.61275 142.05273 0 134.9461 0 127.71996v-.37092c.01215-1.87522.13494-4.1661.31131-6.5362l.05446-.71308c.52223-6.67121 1.41909-13.6997 1.41909-13.6997h74.71487L23.6659 53.7048c4.14178-5.81808 8.7641-11.26444 13.81103-16.28543l.02543-.0267c5.03676-5.03447 10.50829-9.64383 16.3434-13.78818l52.83129 52.69529V1.7798C113.5902.62414 120.68895.0131 127.93262-.00018h.14747Zm-.01271 95.76025h-.12205c-9.50907 0-18.61642 1.74011-27.03475 4.9015-3.15528 8.38196-4.902 17.4677-4.91471 26.95212v.1195c.01271 9.4844 1.75943 18.5704 4.92743 26.95211 8.40561 3.16164 17.51296 4.90175 27.02204 4.90175h.12204c9.50907 0 18.61642-1.7401 27.02203-4.90175 3.168-8.39493 4.91472-17.4677 4.91472-26.95212v-.1195c0-9.4844-1.74672-18.57015-4.91472-26.95211-8.4056-3.16139-17.51296-4.9015-27.02203-4.9015Z"
            />
        </svg>
    );
};

const availableActions = [
    { title: "Action 1", id: "action-1" },
    { title: "Action 2", id: "action-2" },
];

interface IInsightWidgetAlertProps {
    insightRef: ObjRef;
}

export const InsightWidgetAlert: React.FC<IInsightWidgetAlertProps> = (props) => {
    const intl = useIntl();
    const dashboardRef = useDashboardSelector(selectDashboardIdRef);
    const currentFilterContext = useDashboardSelector(selectFilterContextDefinition);

    const { addSuccess } = useToastMessage();
    const isAlertDialogOpen = useDashboardSelector(selectIsInsightAlertOpenedByWidgetRef(props.insightRef));
    const dispatch = useDashboardDispatch();
    const openAlertDialog = useCallback(() => {
        dispatch(uiActions.openKpiAlertDialog(props.insightRef));
    }, [props.insightRef, dispatch]);
    const closeAlertDialog = useCallback(() => {
        dispatch(uiActions.closeKpiAlertDialog());
    }, [dispatch]);

    const onCreated = useCallback(() => {
        addSuccess(
            { id: "fastTrack.alert.success" },
            {
                values: { b: (chunks: React.ReactNode) => <b>{chunks}</b> },
            },
        );
        closeAlertDialog();
    }, [addSuccess, closeAlertDialog]);

    const { run: createWidgetAlert, status: creatingStatus } = useDashboardCommandProcessing({
        commandCreator: createAlert,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.ALERT.CREATED",
        onSuccess: onCreated,
    });

    const { run: updateWidgetAlert, status: updatingStatus } = useDashboardCommandProcessing({
        commandCreator: updateAlert,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.ALERT.UPDATED",
        onSuccess: onCreated, // intentionally the same as for creating a new alert
    });

    const { run: deleteWidgetAlerts, status: _deletingStatus } = useDashboardCommandProcessing({
        commandCreator: removeAlerts,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.ALERTS.REMOVED",
        onSuccess: closeAlertDialog,
    });

    const existingAlert = useDashboardSelector(selectAlertByWidgetRef(props.insightRef));

    const [threshold, setThreshold] = useState(existingAlert?.threshold);
    const [whenTriggered, setWhenTriggered] = useState(existingAlert?.whenTriggered ?? "aboveThreshold");
    const [actionName, _setActionName] = useState<string>(availableActions[0].id);

    const alertIconClasses = cx(
        "dash-item-action",
        "dash-item-action-alert",
        "s-dash-item-action-alert",
        "gd-icon-bell",
    );

    const onIconButtonClick = useCallback(() => {
        isAlertDialogOpen ? closeAlertDialog() : openAlertDialog();
    }, [closeAlertDialog, isAlertDialogOpen, openAlertDialog]);

    const onClose = useCallback(() => {
        closeAlertDialog();
    }, [closeAlertDialog]);

    const onCancelClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            closeAlertDialog();
        },
        [closeAlertDialog],
    );

    const onThresholdInputChange = useCallback(
        (value: string | number) => setThreshold(Number.parseFloat(value.toString())),
        [],
    );

    const onAlertTypeChange = useCallback(
        (value: IWidgetAlertDefinition["whenTriggered"]) => setWhenTriggered(value),
        [],
    );

    const isSaving = creatingStatus === "running" || updatingStatus === "running";

    const thresholdDiffers = !existingAlert || existingAlert.threshold !== threshold;
    const whenTriggeredDiffers = !existingAlert || existingAlert.whenTriggered !== whenTriggered;
    const isSubmitEnabled = !isNil(threshold) && !isSaving && (thresholdDiffers || whenTriggeredDiffers);

    const onSave = useCallback(() => {
        if (existingAlert) {
            updateWidgetAlert({
                ...existingAlert,
                whenTriggered,
                threshold: threshold ?? 0,
                actionName,
            });
        } else {
            createWidgetAlert({
                widget: props.insightRef,
                title: "Alert",
                actionName,
                description: "Alert",
                isTriggered: false,
                dashboard: dashboardRef!,
                whenTriggered,
                threshold: threshold ?? 0,
                filterContext: currentFilterContext,
            });
        }
    }, [
        actionName,
        createWidgetAlert,
        currentFilterContext,
        dashboardRef,
        existingAlert,
        props.insightRef,
        threshold,
        updateWidgetAlert,
        whenTriggered,
    ]);

    const onDeleteClick = useCallback(async () => {
        deleteWidgetAlerts([existingAlert!.ref]);
    }, [deleteWidgetAlerts, existingAlert]);

    const savingButtonTitle = useMemo(() => {
        if (isSaving) {
            return existingAlert ? "Updating…" : "Saving…";
        } else {
            return existingAlert ? "Update" : "Save";
        }
    }, [existingAlert, isSaving]);

    return (
        <>
            <div onClick={onIconButtonClick} className="dash-item-action-alert-wrapper">
                <BubbleHoverTrigger className={alertIconClasses} showDelay={500} hideDelay={0} tagName="div">
                    <Bubble className="bubble-primary" alignPoints={enabledBubbleAlignPoints}>
                        Set an alert on insight change
                    </Bubble>
                </BubbleHoverTrigger>
            </div>
            {isAlertDialogOpen ? (
                <Overlay
                    alignTo={".is-alert-dialog.dash-item-content"}
                    alignPoints={kpiAlertDialogAlignPoints}
                    closeOnOutsideClick
                    onClose={onClose}
                    className="kpi-alert-dialog-overlay"
                >
                    <DialogBase
                        displayCloseButton={false}
                        onCancel={onClose}
                        submitOnEnterKey={false}
                        className="gd-fast-track-popup-dialog"
                    >
                        <div className="gd-fast-track-popup-dialog-header">
                            <Typography tagName="h2">
                                {existingAlert ? "Update alert" : "Set alert"}
                            </Typography>
                        </div>
                        <div className="gd-fast-track-dialog-content">
                            <div className="fast-track-form">
                                <Typography tagName="p">Send to</Typography>
                                <div className="fast-track-row">
                                    <Dropdown
                                        renderBody={() => undefined}
                                        renderButton={({ toggleDropdown }) => (
                                            <DropdownButton
                                                className="dropdown-button"
                                                value={
                                                    <span>
                                                        <ZapierIcon /> Zapier
                                                    </span>
                                                }
                                                onClick={toggleDropdown}
                                                disabled
                                            />
                                        )}
                                    />
                                </div>
                                <Typography tagName="p">When the value is</Typography>
                                <div className="fast-track-row">
                                    <KpiAlertDialogWhenTriggeredPicker
                                        whenTriggered={whenTriggered}
                                        intl={intl}
                                        onWhenTriggeredChange={onAlertTypeChange}
                                    />
                                </div>
                                <div className="fast-track-row">
                                    <Input
                                        className="s-threshold-input fast-track-input"
                                        // hasError={hasError}
                                        isSmall
                                        maxlength={16}
                                        onChange={onThresholdInputChange}
                                        onEscKeyPress={onClose}
                                        onEnterKeyPress={onSave}
                                        placeholder="e.g. 123" // TODO use the actual value?
                                        // ref={this.threshold} // TODO autofocus
                                        // suffix={inputSuffix} // TODO percent detection
                                        value={threshold}
                                    />
                                </div>
                                {!existingAlert ? (
                                    <Message type="progress">
                                        Dashboard contains filter changes that will be saved in the alert.{" "}
                                        <a href="#">Learn more</a>
                                    </Message>
                                ) : null}
                            </div>
                            <div className="gd-fast-track-buttons">
                                <div className="left-buttons">
                                    {existingAlert ? (
                                        // TODO deleting state
                                        <Button
                                            key="delete-button"
                                            className="s-delete_button gd-button-link-dimmed delete-link"
                                            value={"Delete"}
                                            onClick={onDeleteClick}
                                            // disabled={isDeleting}
                                        />
                                    ) : null}
                                </div>
                                <div className="right-buttons">
                                    <Button
                                        className="gd-button-action gd-button-small save-button s-save_button"
                                        value={savingButtonTitle}
                                        onClick={onSave}
                                        disabled={!isSubmitEnabled}
                                    />
                                    <Button
                                        className="gd-button-secondary gd-button-small cancel-button s-cancel_button"
                                        value={intl.formatMessage({ id: "cancel" })}
                                        onClick={onCancelClick}
                                    />
                                </div>
                            </div>
                        </div>
                    </DialogBase>
                </Overlay>
            ) : undefined}
        </>
    );
};
