// (C) 2022-2024 GoodData Corporation
import React from "react";
import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";

import { Smtps, Webhooks } from "../../../../../model/index.js";
import { AlertMetric } from "../../types.js";

import { EditAlert } from "./EditAlert.js";

interface ICreateAlertProps {
    alert: IAutomationMetadataObjectDefinition | null;
    onClose: () => void;
    onCancel: () => void;
    onCreate?: (alert: IAutomationMetadataObjectDefinition) => void;
    destinations: (Webhooks[number] | Smtps[number])[];
    hasAlerts: boolean;
    measures: AlertMetric[];
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
