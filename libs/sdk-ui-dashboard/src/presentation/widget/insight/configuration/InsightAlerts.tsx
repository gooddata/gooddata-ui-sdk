// (C) 2022-2024 GoodData Corporation
import React from "react";
import { isInsightWidget, objRefToString } from "@gooddata/sdk-model";
import { ScrollablePanel, OverlayControllerProvider, OverlayController } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";
import cx from "classnames";
import { IInsightMenuSubmenuComponentProps } from "../../insightMenu/types.js";
import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../../constants/index.js";
import { AlertsList } from "./InsightAlertConfig/AlertsList.js";
import { EditAlert } from "./InsightAlertConfig/EditAlert.js";
import { useInsightWidgetAlerting } from "./InsightAlertConfig/hooks/useInsightAlerting.js";
import { CreateAlert } from "./InsightAlertConfig/CreateAlert.js";
import { NoAvailableMeasures } from "./InsightAlertConfig/NoAvailableAlerts.js";

const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);

export const InsightAlerts: React.FC<IInsightMenuSubmenuComponentProps> = ({ widget, onClose, onGoBack }) => {
    const widgetRefSuffix = isInsightWidget(widget)
        ? stringUtils.simplifyText(objRefToString(widget.ref))
        : "";
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
        catalogMeasures,
        catalogAttributes,
        catalogDateDatasets,
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
        deleteExistingAlert,
    } = useInsightWidgetAlerting({ closeInsightWidgetMenu: onClose, widget });

    let content = null;
    if (isLoading || viewMode === "list") {
        content = (
            <AlertsList
                isLoading={isLoading}
                alerts={alerts}
                separators={separators}
                onCreateAlert={initiateAlertCreation}
                onEditAlert={initiateAlertEditing}
                onPauseAlert={pauseExistingAlert}
                onResumeAlert={resumeExistingAlert}
                onDeleteAlert={deleteExistingAlert}
                onClose={onClose}
                onGoBack={onGoBack}
                maxAutomationsReached={maxAutomationsReached}
                canCreateAutomation={canCreateAutomation}
            />
        );
    } else if (viewMode === "edit" && editingAlert) {
        content = (
            <EditAlert
                canManageAttributes={canManageAttributes}
                canManageComparison={canManageComparison}
                execResult={execResult}
                alert={editingAlert}
                hasAlerts={hasAlerts}
                destinations={destinations}
                users={users}
                measures={supportedMeasures}
                attributes={supportedAttributes}
                onUpdate={updateExistingAlert}
                onCancel={cancelAlertEditing}
                onClose={onClose}
                catalogMeasures={catalogMeasures}
                catalogAttributes={catalogAttributes}
                catalogDateDatasets={catalogDateDatasets}
                maxAutomationsRecipients={maxAutomationsRecipients}
            />
        );
    } else if (viewMode === "create" && creatingAlert) {
        content = (
            <CreateAlert
                canManageAttributes={canManageAttributes}
                canManageComparison={canManageComparison}
                execResult={execResult}
                alert={creatingAlert}
                measures={supportedMeasures}
                attributes={supportedAttributes}
                hasAlerts={hasAlerts}
                destinations={destinations}
                users={users}
                onCreate={saveNewAlert}
                onCancel={cancelAlertCreation}
                onClose={onClose}
                maxAutomationsReached={maxAutomationsReached}
                maxAutomationsRecipients={maxAutomationsRecipients}
                catalogMeasures={catalogMeasures}
                catalogAttributes={catalogAttributes}
                catalogDateDatasets={catalogDateDatasets}
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
            </OverlayControllerProvider>
        </ScrollablePanel>
    );
};
