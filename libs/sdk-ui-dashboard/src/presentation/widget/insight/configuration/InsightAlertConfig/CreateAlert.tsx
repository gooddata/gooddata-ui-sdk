// (C) 2022-2024 GoodData Corporation
import React from "react";
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    ICatalogMeasure,
    INotificationChannelMetadataObject,
    IWorkspaceUser,
} from "@gooddata/sdk-model";
import { AlertMetric } from "../../types.js";

import { EditAlert } from "./EditAlert.js";

interface ICreateAlertProps {
    alert: IAutomationMetadataObjectDefinition | null;
    onClose: () => void;
    onCancel: () => void;
    onCreate?: (alert: IAutomationMetadataObjectDefinition) => void;
    destinations: INotificationChannelMetadataObject[];
    users: IWorkspaceUser[];
    hasAlerts: boolean;
    measures: AlertMetric[];
    maxAutomationsReached: boolean;
    maxAutomationsRecipients: number;
    catalogMeasures: ICatalogMeasure[];
}

export const CreateAlert: React.FC<ICreateAlertProps> = ({
    alert,
    onClose,
    onCancel,
    onCreate,
    destinations,
    users,
    hasAlerts,
    measures,
    maxAutomationsReached,
    maxAutomationsRecipients,
    catalogMeasures,
}) => {
    return (
        <EditAlert
            alert={alert as IAutomationMetadataObject}
            onClose={onClose}
            onCancel={onCancel}
            onCreate={onCreate}
            isNewAlert
            destinations={destinations}
            users={users}
            hasAlerts={hasAlerts}
            measures={measures}
            maxAutomationsReached={maxAutomationsReached}
            maxAutomationsRecipients={maxAutomationsRecipients}
            catalogMeasures={catalogMeasures}
        />
    );
};
