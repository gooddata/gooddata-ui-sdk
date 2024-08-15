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
import { useInsightWidgetAlerting } from "./InsightAlertConfig/useInsightAlerting.js";
import { CreateAlert } from "./InsightAlertConfig/CreateAlert.js";

const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);

export const InsightAlerts: React.FC<IInsightMenuSubmenuComponentProps> = ({ widget, onClose, onGoBack }) => {
    const widgetRefSuffix = isInsightWidget(widget)
        ? stringUtils.simplifyText(objRefToString(widget.ref))
        : "";
    const classes = cx(
        "configuration-scrollable-panel",
        "s-configuration-scrollable-panel",
        `s-visualization-${widgetRefSuffix}`,
    );

    const {
        isLoading,
        alerts,
        hasAlerts,
        destinations,
        viewMode,
        supportedMeasures,
        maxAutomationsReached,
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
    if (viewMode === "list") {
        content = (
            <AlertsList
                alerts={alerts}
                onCreateAlert={initiateAlertCreation}
                onEditAlert={initiateAlertEditing}
                onPauseAlert={pauseExistingAlert}
                onResumeAlert={resumeExistingAlert}
                onDeleteAlert={deleteExistingAlert}
                onClose={onClose}
                onGoBack={onGoBack}
                maxAutomationsReached={maxAutomationsReached}
            />
        );
    } else if (viewMode === "edit" && editingAlert) {
        content = (
            <EditAlert
                alert={editingAlert}
                hasAlerts={hasAlerts}
                destinations={destinations}
                measures={supportedMeasures}
                onUpdate={updateExistingAlert}
                onCancel={cancelAlertEditing}
                onClose={onClose}
            />
        );
    } else if (viewMode === "create") {
        content = (
            <CreateAlert
                isLoading={isLoading}
                alert={creatingAlert}
                measures={supportedMeasures}
                hasAlerts={hasAlerts}
                destinations={destinations}
                onCreate={saveNewAlert}
                onCancel={cancelAlertCreation}
                onClose={onClose}
                maxAutomationsReached={maxAutomationsReached}
            />
        );
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
