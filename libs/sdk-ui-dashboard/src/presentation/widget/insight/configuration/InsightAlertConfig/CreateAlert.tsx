// (C) 2022-2024 GoodData Corporation
import React from "react";
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IMeasure,
} from "@gooddata/sdk-model";

import { EditAlert } from "./EditAlert.js";
import { INotificationChannel } from "./constants.js";

interface ICreateAlertProps {
    alert: IAutomationMetadataObjectDefinition;
    onClose: () => void;
    onCancel: () => void;
    onCreate?: (alert: IAutomationMetadataObjectDefinition) => void;
    destinations: INotificationChannel[];
    hasAlerts: boolean;
    measures: IMeasure[];
    maxAutomationsReached: boolean;
}

export const CreateAlert: React.FC<ICreateAlertProps> = ({
    alert,
    onClose,
    onCancel,
    onCreate,
    destinations,
    hasAlerts,
    measures,
    maxAutomationsReached,
}) => {
    return (
        <EditAlert
            alert={alert as IAutomationMetadataObject}
            onClose={onClose}
            onCancel={onCancel}
            onCreate={onCreate}
            isNewAlert
            destinations={destinations}
            hasAlerts={hasAlerts}
            measures={measures}
            maxAutomationsReached={maxAutomationsReached}
        />
    );
};
