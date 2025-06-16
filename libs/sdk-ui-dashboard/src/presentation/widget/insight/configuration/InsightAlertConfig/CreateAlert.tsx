// (C) 2022-2025 GoodData Corporation
import React from "react";
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    ICatalogAttribute,
    ICatalogDateDataset,
    INotificationChannelIdentifier,
    INotificationChannelMetadataObject,
    ISeparators,
    IWorkspaceUser,
} from "@gooddata/sdk-model";
import { AlertAttribute, AlertMetric } from "../../../../alerting/types.js";

import { EditAlert } from "./EditAlert.js";
import { IExecutionResultEnvelope } from "../../../../../model/index.js";
import { IMeasureFormatMap } from "../../../../alerting/DefaultAlertingDialog/utils/getters.js";

interface ICreateAlertProps {
    canManageAttributes: boolean;
    canManageComparison: boolean;
    execResult: IExecutionResultEnvelope | undefined;
    alert: IAutomationMetadataObjectDefinition | null;
    onClose: () => void;
    onCancel: () => void;
    onCreate?: (alert: IAutomationMetadataObjectDefinition) => void;
    destinations: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    users: IWorkspaceUser[];
    hasAlerts: boolean;
    measures: AlertMetric[];
    attributes: AlertAttribute[];
    maxAutomationsReached: boolean;
    maxAutomationsRecipients: number;
    measureFormatMap: IMeasureFormatMap;
    catalogAttributes: ICatalogAttribute[];
    catalogDateDatasets: ICatalogDateDataset[];
    separators?: ISeparators;
    isExecutionTimestampMode?: boolean;
}

export const CreateAlert: React.FC<ICreateAlertProps> = ({
    canManageAttributes,
    canManageComparison,
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
    measureFormatMap,
    catalogAttributes,
    catalogDateDatasets,
    separators,
    isExecutionTimestampMode,
}) => {
    return (
        <EditAlert
            canManageAttributes={canManageAttributes}
            canManageComparison={canManageComparison}
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
            measureFormatMap={measureFormatMap}
            catalogAttributes={catalogAttributes}
            catalogDateDatasets={catalogDateDatasets}
            separators={separators}
            isExecutionTimestampMode={isExecutionTimestampMode}
        />
    );
};
