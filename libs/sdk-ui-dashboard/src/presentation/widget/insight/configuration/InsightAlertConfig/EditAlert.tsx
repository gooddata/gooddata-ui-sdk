// (C) 2022-2024 GoodData Corporation
import React from "react";
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IMeasure,
} from "@gooddata/sdk-model";
import { Button, Input } from "@gooddata/sdk-ui-kit";
import { DashboardInsightSubmenuContainer } from "../../../insightMenu/DefaultDashboardInsightMenu/DashboardInsightMenu/DashboardInsightSubmenuContainer.js";
import { AlertMeasureSelect } from "./AlertMeasureSelect.js";
import { AlertComparisonOperatorSelect } from "./AlertComparisonOperatorSelect.js";
import { AlertDestinationSelect } from "./AlertDestinationSelect.js";
import { EditAlertConfiguration } from "./EditAlertConfiguration.js";
import { INotificationChannel } from "./constants.js";
import { useEditAlert } from "./useEditAlert.js";

interface IEditAlertProps {
    alert: IAutomationMetadataObject;
    isNewAlert?: boolean;
    hasAlerts: boolean;
    destinations: INotificationChannel[];
    measures: IMeasure[];
    onClose: () => void;
    onCancel: () => void;
    onCreate?: (alert: IAutomationMetadataObjectDefinition) => void;
    onUpdate?: (alert: IAutomationMetadataObject) => void;
}

export const EditAlert: React.FC<IEditAlertProps> = ({
    alert,
    isNewAlert,
    hasAlerts,
    destinations,
    measures,
    onClose,
    onCancel,
    onCreate,
    onUpdate,
}) => {
    const {
        viewMode,
        updatedAlert,
        canSubmit,
        //
        changeComparisonOperator,
        changeMeasure,
        changeValue,
        changeDestination,
        //
        configureAlert,
        saveAlertConfiguration,
        cancelAlertConfiguration,
        //
        createAlert,
        updateAlert,
    } = useEditAlert({
        alert,
        onCreate,
        onUpdate,
    });

    return viewMode === "edit" ? (
        <DashboardInsightSubmenuContainer
            title="Alert"
            onClose={onClose}
            onBack={hasAlerts ? onCancel : undefined}
        >
            <div className="gd-edit-alert">
                <div className="gd-edit-alert__form">
                    <div className="gd-edit-alert__form-content">
                        <div className="gd-edit-alert__measure-label">When</div>
                        <AlertMeasureSelect
                            selectedMeasure={updatedAlert.alert!.condition.left}
                            onMeasureChange={changeMeasure}
                            measures={measures}
                        />
                        <AlertComparisonOperatorSelect
                            selectedComparisonOperator={updatedAlert.alert!.condition.operator}
                            onComparisonOperatorChange={changeComparisonOperator}
                        />
                        <Input
                            className="gd-edit-alert__value-input"
                            isSmall
                            autofocus
                            value={updatedAlert.alert!.condition.right}
                            onChange={(e) => changeValue(e !== "" ? parseInt(e as string, 10) : undefined!)}
                            type="number"
                        />
                        {destinations.length > 1 && (
                            <AlertDestinationSelect
                                selectedDestination={updatedAlert.webhook!}
                                onDestinationChange={changeDestination}
                                destinations={destinations}
                            />
                        )}
                    </div>
                </div>
                <div className="gd-edit-alert__buttons">
                    <Button
                        className="gd-edit-alert__configuration-button gd-button-link gd-button-icon-only gd-icon-settings gd-button-small"
                        onClick={configureAlert}
                    />
                    <div>
                        <Button
                            variant="secondary"
                            size="small"
                            onClick={() => {
                                onCancel();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            intent="action"
                            size="small"
                            disabled={!canSubmit}
                            onClick={isNewAlert ? createAlert : updateAlert}
                        >
                            {isNewAlert ? "Add" : "Save"}
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardInsightSubmenuContainer>
    ) : (
        <DashboardInsightSubmenuContainer
            title="Configuration"
            onClose={onClose}
            onBack={cancelAlertConfiguration}
        >
            <EditAlertConfiguration
                alert={updatedAlert}
                onUpdate={saveAlertConfiguration}
                onCancel={cancelAlertConfiguration}
            />
        </DashboardInsightSubmenuContainer>
    );
};
