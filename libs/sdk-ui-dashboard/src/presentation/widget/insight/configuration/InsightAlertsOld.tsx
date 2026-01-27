// (C) 2022-2026 GoodData Corporation

import cx from "classnames";

import { isInsightWidget, objRefToString } from "@gooddata/sdk-model";
import { OverlayController, OverlayControllerProvider, ScrollablePanel } from "@gooddata/sdk-ui-kit";
import { simplifyText } from "@gooddata/util";

import { AlertsList } from "./InsightAlertConfig/AlertsList.js";
import { CreateAlert } from "./InsightAlertConfig/CreateAlert.js";
import { EditAlert } from "./InsightAlertConfig/EditAlert.js";
import { useInsightWidgetAlerting } from "./InsightAlertConfig/hooks/useInsightWidgetAlerting.js";
import { NoAvailableMeasures } from "./InsightAlertConfig/NoAvailableAlerts.js";
import { AlertDeleteDialog } from "../../../alerting/DefaultAlertingDialog/components/AlertDeleteDialog.js";
import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../../constants/zIndex.js";
import { type IInsightMenuSubmenuComponentProps } from "../../insightMenu/types.js";

const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);

export function InsightAlertsOld({ widget, onClose, onGoBack }: IInsightMenuSubmenuComponentProps) {
    const widgetRefSuffix = isInsightWidget(widget) ? simplifyText(objRefToString(widget.ref)) : "";
    const classes = cx(
        "gd-alerts-configuration-panel",
        "configuration-scrollable-panel",
        "s-configuration-scrollable-panel",
        `s-visualization-${widgetRefSuffix}`,
    );

    const {
        isLoading,
        alerts,
        hasAlerts,
        destinations,
        users,
        viewMode,
        execResult,
        separators,
        supportedMeasures,
        supportedAttributes,
        maxAutomationsReached,
        maxAutomationsRecipients,
        canManageAttributes,
        canManageComparison,
        canCreateAutomation,
        catalogAttributes,
        catalogDateDatasets,
        measureFormatMap,
        isExecutionTimestampMode,
        //
        creatingAlert,
        initiateAlertCreation,
        cancelAlertCreation,
        //
        editingAlert,
        initiateAlertEditing,
        cancelAlertEditing,
        //
        saveNewAlert,
        updateExistingAlert,
        pauseExistingAlert,
        resumeExistingAlert,
        //
        alertToDelete,
        startDeletingAlert,
        cancelDeletingAlert,
        deleteExistingAlert,
    } = useInsightWidgetAlerting({ closeInsightWidgetMenu: onClose, widget });

    let content;
    if (isLoading || viewMode === "list") {
        content = (
            <AlertsList
                isLoading={isLoading}
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
        );
    } else if (viewMode === "edit" && editingAlert) {
        content = (
            <EditAlert
                canManageAttributes={canManageAttributes}
                canManageComparison={canManageComparison}
                execResult={execResult}
                alert={editingAlert}
                separators={separators}
                hasAlerts={hasAlerts}
                destinations={destinations}
                users={users ?? []}
                measures={supportedMeasures}
                attributes={supportedAttributes}
                onUpdate={updateExistingAlert}
                onCancel={cancelAlertEditing}
                onClose={onClose}
                measureFormatMap={measureFormatMap}
                catalogAttributes={catalogAttributes}
                catalogDateDatasets={catalogDateDatasets}
                maxAutomationsRecipients={maxAutomationsRecipients}
                isExecutionTimestampMode={isExecutionTimestampMode}
            />
        );
    } else if (viewMode === "create" && creatingAlert) {
        content = (
            <CreateAlert
                canManageAttributes={canManageAttributes}
                canManageComparison={canManageComparison}
                execResult={execResult}
                alert={creatingAlert}
                separators={separators}
                measures={supportedMeasures}
                attributes={supportedAttributes}
                hasAlerts={hasAlerts}
                destinations={destinations}
                users={users ?? []}
                onCreate={saveNewAlert}
                onCancel={cancelAlertCreation}
                onClose={onClose}
                maxAutomationsReached={maxAutomationsReached}
                maxAutomationsRecipients={maxAutomationsRecipients}
                measureFormatMap={measureFormatMap}
                catalogAttributes={catalogAttributes}
                catalogDateDatasets={catalogDateDatasets}
                isExecutionTimestampMode={isExecutionTimestampMode}
            />
        );
    } else {
        content = <NoAvailableMeasures onClose={onClose} onBack={onGoBack} />;
    }

    return (
        <ScrollablePanel className={classes}>
            {/* Header z-index start at  6000 so we need force all overlays z-indexes start at 6000 to be under header */}
            <OverlayControllerProvider overlayController={overlayController}>
                {content}

                {alertToDelete ? (
                    <AlertDeleteDialog
                        onCancel={cancelDeletingAlert}
                        onDelete={() => {
                            void deleteExistingAlert(alertToDelete);
                        }}
                        title={alertToDelete.title}
                    />
                ) : null}
            </OverlayControllerProvider>
        </ScrollablePanel>
    );
}
