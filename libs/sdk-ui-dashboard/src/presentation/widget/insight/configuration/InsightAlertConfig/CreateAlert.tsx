// (C) 2022-2026 GoodData Corporation

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type ICatalogAttribute,
    type ICatalogDateDataset,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    type ISeparators,
    type IWorkspaceUser,
} from "@gooddata/sdk-model";

import { type IExecutionResultEnvelope } from "../../../../../model/store/executionResults/types.js";
import { type IMeasureFormatMap } from "../../../../automations/alerting/DefaultAlertingDialog/utils/getters.js";
import { type AlertAttribute, type AlertMetric } from "../../../../automations/alerting/types.js";

import { EditAlert } from "./EditAlert.js";

interface ICreateAlertProps {
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

export function CreateAlert({
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
}: ICreateAlertProps) {
    return (
        <EditAlert
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
}
