// (C) 2022-2025 GoodData Corporation

import React from "react";
import {
    ArrowOffsets,
    IAlignPoint,
    OverlayController,
    OverlayControllerProvider,
    ScrollablePanel,
} from "@gooddata/sdk-ui-kit";
import cx from "classnames";

import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../constants/index.js";
import { ConfigurationBubble } from "../../widget/common/index.js";
import { IAlertingDialogProps } from "../types.js";
import { EditAlert } from "../../widget/insight/configuration/InsightAlertConfig/EditAlert.js";
import { useInsightWidgetAlerting } from "../../widget/insight/configuration/InsightAlertConfig/hooks/useInsightAlerting.js";
import noop from "lodash/noop.js";

const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

const defaultAlignPoints: IAlignPoint[] = [
    { align: "br tr" },
    { align: "tr bl" },
    { align: "cr cl" },
    { align: "cl cr" },
];

const defaultArrowOffsets: ArrowOffsets = {
    "br tr": [0, 0],
    "tr bl": [0, 0],
};

/**
 * @alpha
 */
export const AlertingDialog: React.FC<IAlertingDialogProps> = (props) => {
    const { editAlert, editWidget, anchorEl, onCancel = () => noop, onUpdate = () => noop } = props;

    const {
        execResult,
        hasAlerts,
        destinations,
        users,
        supportedMeasures,
        supportedAttributes,
        measureFormatMap,
        catalogAttributes,
        catalogDateDatasets,
        canManageAttributes,
        canManageComparison,
        cancelAlertEditing,
        updateExistingAlert,
        maxAutomationsRecipients,
    } = useInsightWidgetAlerting({ closeInsightWidgetMenu: onCancel, widget: editWidget });

    if (!anchorEl?.id || !editAlert) {
        return null;
    }

    const classes = cx(
        "gd-alerts-configuration-panel",
        "configuration-scrollable-panel",
        "s-configuration-scrollable-panel",
        `s-alert-${editAlert.id}`,
    );

    return (
        <ConfigurationBubble
            alignPoints={defaultAlignPoints}
            arrowOffsets={defaultArrowOffsets}
            alignTo={`#${anchorEl.id}`}
            onClose={onCancel}
            overlayPositionType="fixed"
            classNames="gd-alerts-configuration-panel-management"
        >
            <ScrollablePanel className={classes}>
                <OverlayControllerProvider overlayController={overlayController}>
                    <EditAlert
                        canManageAttributes={canManageAttributes}
                        canManageComparison={canManageComparison}
                        execResult={execResult}
                        alert={editAlert}
                        hasAlerts={hasAlerts}
                        destinations={destinations}
                        measures={supportedMeasures}
                        attributes={supportedAttributes}
                        users={users ?? []}
                        onUpdate={(alert) => {
                            updateExistingAlert(alert);
                            onUpdate(alert);
                        }}
                        onCancel={() => {
                            cancelAlertEditing();
                            onCancel();
                        }}
                        onClose={onCancel}
                        overlayPositionType="fixed"
                        measureFormatMap={measureFormatMap}
                        catalogAttributes={catalogAttributes}
                        catalogDateDatasets={catalogDateDatasets}
                        maxAutomationsRecipients={maxAutomationsRecipients}
                    />
                </OverlayControllerProvider>
            </ScrollablePanel>
        </ConfigurationBubble>
    );
};
