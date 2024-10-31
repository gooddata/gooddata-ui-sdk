// (C) 2022-2024 GoodData Corporation
import React from "react";
import {
    IAttributeMetadataObject,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    ICatalogMeasure,
    INotificationChannelMetadataObject,
    IWorkspaceUser,
} from "@gooddata/sdk-model";
import { AlertAttribute, AlertMetric } from "../../types.js";

import { EditAlert } from "./EditAlert.js";
import { IExecutionResultEnvelope } from "../../../../../model/index.js";

interface ICreateAlertProps {
    canManageAttributes: boolean;
    execResult: IExecutionResultEnvelope | undefined;
    alert: IAutomationMetadataObjectDefinition | null;
    onClose: () => void;
    onCancel: () => void;
    onCreate?: (alert: IAutomationMetadataObjectDefinition) => void;
    destinations: INotificationChannelMetadataObject[];
    users: IWorkspaceUser[];
    hasAlerts: boolean;
    measures: AlertMetric[];
    attributes: AlertAttribute[];
    maxAutomationsReached: boolean;
    maxAutomationsRecipients: number;
    catalogMeasures: ICatalogMeasure[];
    catalogAttributes: IAttributeMetadataObject[];
}

export const CreateAlert: React.FC<ICreateAlertProps> = ({
    canManageAttributes,
    execResult,
    alert,
    onClose,
    onCancel,
    onCreate,
    destinations,
    users,
    hasAlerts,
    measures,
    attributes,
    maxAutomationsReached,
    maxAutomationsRecipients,
    catalogMeasures,
    catalogAttributes,
}) => {
    return (
        <EditAlert
            canManageAttributes={canManageAttributes}
            execResult={execResult}
            alert={alert as IAutomationMetadataObject}
            onClose={onClose}
            onCancel={onCancel}
            onCreate={onCreate}
            isNewAlert
            destinations={destinations}
            users={users}
            hasAlerts={hasAlerts}
            measures={measures}
            attributes={attributes}
            maxAutomationsReached={maxAutomationsReached}
            maxAutomationsRecipients={maxAutomationsRecipients}
            catalogMeasures={catalogMeasures}
            catalogAttributes={catalogAttributes}
        />
    );
};
