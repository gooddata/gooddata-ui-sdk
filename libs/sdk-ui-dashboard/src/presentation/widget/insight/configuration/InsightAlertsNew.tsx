// (C) 2022-2025 GoodData Corporation
import React, { useMemo, useState } from "react";
import { IAutomationMetadataObject, isInsightWidget, objRefToString } from "@gooddata/sdk-model";
import {
    ScrollablePanel,
    OverlayControllerProvider,
    OverlayController,
    useToastMessage,
} from "@gooddata/sdk-ui-kit";
import { fillMissingTitles, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { stringUtils } from "@gooddata/util";
import cx from "classnames";
import { IInsightMenuSubmenuComponentProps } from "../../insightMenu/types.js";
import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../../constants/index.js";
import { AlertsList } from "./InsightAlertConfig/AlertsList.js";
import { NoAvailableMeasures } from "./InsightAlertConfig/NoAvailableAlerts.js";
import {
    DEFAULT_MAX_AUTOMATIONS,
    selectAllAutomationsCount,
    selectAutomationsIsLoading,
    selectCanCreateAutomation,
    selectCanManageWorkspace,
    selectCatalogDateDatasets,
    selectCurrentUser,
    selectDashboardUserAutomationAlertsInContext,
    selectEnableComparisonInAlerting,
    selectEntitlementMaxAutomations,
    selectEntitlementUnlimitedAutomations,
    selectExecutionTimestamp,
    selectInsightByWidgetRef,
    selectLocale,
    useDashboardAutomations,
    useDashboardSelector,
    useDashboardAlerts,
} from "../../../../model/index.js";
import { useSaveAlertToBackend } from "../../../alerting/DefaultAlertingDialog/hooks/useSaveAlertToBackend.js";
import { messages } from "../../../alerting/DefaultAlertingDialog/messages.js";
import { getSupportedInsightMeasuresByInsight } from "../../../alerting/DefaultAlertingDialog/utils/items.js";
import { AlertDeleteDialog } from "../../../alerting/DefaultAlertingDialog/components/AlertDeleteDialog.js";

const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);

export const InsightAlertsNew: React.FC<IInsightMenuSubmenuComponentProps> = ({
    widget,
    onClose,
    onGoBack,
}) => {
    const insight = useDashboardSelector(selectInsightByWidgetRef(widget.ref));
    const currentUser = useDashboardSelector(selectCurrentUser);
    const effectiveBackend = useBackendStrict();
    const effectiveWorkspace = useWorkspaceStrict();
    const canManageAutomations = useDashboardSelector(selectCanManageWorkspace);
    const locale = useDashboardSelector(selectLocale);
    const catalogDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const canManageComparison = useDashboardSelector(selectEnableComparisonInAlerting);
    const automationsLoading = useDashboardSelector(selectAutomationsIsLoading);
    const automationsCount = useDashboardSelector(selectAllAutomationsCount);
    const maxAutomationsEntitlement = useDashboardSelector(selectEntitlementMaxAutomations);
    const unlimitedAutomationsEntitlement = useDashboardSelector(selectEntitlementUnlimitedAutomations);
    const isExecutionTimestampMode = !!useDashboardSelector(selectExecutionTimestamp);
    const canCreateAutomation = useDashboardSelector(selectCanCreateAutomation);
    const alerts = useDashboardSelector(selectDashboardUserAutomationAlertsInContext(widget.localIdentifier));

    const [isDeleteInProgress, setIsDeleteInProgress] = useState(false);
    const [alertToDelete, setAlertToDelete] = React.useState<null | IAutomationMetadataObject>(null);

    const widgetRefSuffix = isInsightWidget(widget)
        ? stringUtils.simplifyText(objRefToString(widget.ref))
        : "";
    const classes = cx(
        "gd-alerts-configuration-panel",
        "configuration-scrollable-panel",
        "s-configuration-scrollable-panel",
        `s-visualization-${widgetRefSuffix}`,
    );

    const { onAlertingOpen } = useDashboardAlerts();
    const { refreshAutomations } = useDashboardAutomations();
    const { addSuccess, addError } = useToastMessage();

    const { handlePauseAlert, handleResumeAlert, isSavingAlert } = useSaveAlertToBackend({
        onPauseSuccess: () => {
            refreshAutomations();
            addSuccess(messages.alertPauseSuccess);
        },
        onPauseError: () => {
            addError(messages.alertSaveError);
        },
        onResumeSuccess: () => {
            refreshAutomations();
            addSuccess(messages.alertResumeSuccess);
        },
        onResumeError: () => {
            addError(messages.alertSaveError);
        },
    });

    const initiateAlertCreation = () => {
        onAlertingOpen(widget);
    };

    const initiateAlertEditing = (alert: IAutomationMetadataObject) => {
        onAlertingOpen(widget, alert);
    };

    const pauseExistingAlert = (alert: IAutomationMetadataObject) => {
        const alertToPause = {
            ...alert,
            alert: { ...alert.alert, trigger: { ...alert.alert?.trigger, state: "PAUSED" } },
        } as IAutomationMetadataObject;
        handlePauseAlert(alertToPause);
    };

    const resumeExistingAlert = (alert: IAutomationMetadataObject) => {
        const alertToResume = {
            ...alert,
            alert: { ...alert.alert, trigger: { ...alert.alert?.trigger, state: "ACTIVE" } },
        } as IAutomationMetadataObject;
        handleResumeAlert(alertToResume);
    };

    const startDeletingAlert = React.useCallback((alert: IAutomationMetadataObject) => {
        setAlertToDelete(alert);
    }, []);

    const cancelDeletingAlert = React.useCallback(() => {
        setAlertToDelete(null);
    }, []);

    const deleteExistingAlert = React.useCallback(async () => {
        if (!alertToDelete) {
            return;
        }

        setIsDeleteInProgress(true);
        const alertCreatorId = alertToDelete.createdBy?.login;
        const currentUserId = currentUser?.login;
        const isAlertCreatedByCurrentUser =
            !!alertCreatorId && !!currentUserId && alertCreatorId === currentUserId;
        const automationService = effectiveBackend.workspace(effectiveWorkspace).automations();

        // If alert is created by current user, or user has permissions to manage automations, delete it, otherwise unsubscribe
        const deleteMethod =
            canManageAutomations || isAlertCreatedByCurrentUser
                ? automationService.deleteAutomation.bind(automationService)
                : automationService.unsubscribeAutomation.bind(automationService);

        try {
            setAlertToDelete(null);
            await deleteMethod(alertToDelete.id);
            addSuccess(messages.alertDeleteSuccess);
            setIsDeleteInProgress(false);
            refreshAutomations();
        } catch (err) {
            addError(messages.alertDeleteError);
            setIsDeleteInProgress(false);
        }
    }, [
        addError,
        addSuccess,
        alertToDelete,
        canManageAutomations,
        currentUser?.login,
        effectiveBackend,
        effectiveWorkspace,
        refreshAutomations,
    ]);

    const maxAutomations = parseInt(maxAutomationsEntitlement?.value ?? DEFAULT_MAX_AUTOMATIONS, 10);
    const maxAutomationsReached = automationsCount >= maxAutomations && !unlimitedAutomationsEntitlement;
    const supportedMeasures = useMemo(
        () =>
            getSupportedInsightMeasuresByInsight(
                insight ? fillMissingTitles(insight, locale, 9999) : insight,
                catalogDateDatasets,
                canManageComparison,
            ),
        [insight, locale, catalogDateDatasets, canManageComparison],
    );

    return (
        <ScrollablePanel className={classes}>
            {/* Header z-index start at  6000 so we need force all overlays z-indexes start at 6000 to be under header */}
            <OverlayControllerProvider overlayController={overlayController}>
                {automationsLoading || supportedMeasures.length > 0 ? (
                    <AlertsList
                        isLoading={automationsLoading || isSavingAlert || isDeleteInProgress}
                        alerts={alerts}
                        onCreateAlert={initiateAlertCreation}
                        onEditAlert={initiateAlertEditing}
                        onPauseAlert={pauseExistingAlert}
                        onResumeAlert={resumeExistingAlert}
                        onDeleteAlert={startDeletingAlert}
                        onClose={onClose}
                        onGoBack={onGoBack}
                        maxAutomationsReached={maxAutomationsReached}
                        canCreateAutomation={canCreateAutomation}
                        isExecutionTimestampMode={isExecutionTimestampMode}
                    />
                ) : (
                    <NoAvailableMeasures onClose={onClose} onBack={onGoBack} />
                )}

                {alertToDelete ? (
                    <AlertDeleteDialog
                        onCancel={cancelDeletingAlert}
                        onDelete={deleteExistingAlert}
                        title={alertToDelete.title}
                    />
                ) : null}
            </OverlayControllerProvider>
        </ScrollablePanel>
    );
};
