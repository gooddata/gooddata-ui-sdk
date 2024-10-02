// (C) 2022-2024 GoodData Corporation
import React from "react";
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    ICatalogMeasure,
    INotificationChannelMetadataObject,
} from "@gooddata/sdk-model";
import { AlertMetric } from "../../types.js";

import { EditAlert } from "./EditAlert.js";

interface ICreateAlertProps {
    alert: IAutomationMetadataObjectDefinition | null;
    onClose: () => void;
    onCancel: () => void;
    onCreate?: (alert: IAutomationMetadataObjectDefinition) => void;
    destinations: INotificationChannelMetadataObject[];
    hasAlerts: boolean;
    measures: AlertMetric[];
    maxAutomationsReached: boolean;
    catalogMeasures: ICatalogMeasure[];
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
            hasAlerts={hasAlerts}
            measures={measures}
            maxAutomationsReached={maxAutomationsReached}
            catalogMeasures={catalogMeasures}
        />
    );
};
