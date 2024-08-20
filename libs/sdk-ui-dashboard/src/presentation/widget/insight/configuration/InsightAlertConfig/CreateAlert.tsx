// (C) 2022-2024 GoodData Corporation
import React from "react";
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IMeasure,
} from "@gooddata/sdk-model";

import { EditAlert } from "./EditAlert.js";
import { INotificationChannel } from "./constants.js";
import { LoadingMask } from "@gooddata/sdk-ui-kit";

const LOADING_MASK_HEIGHT = 100;

interface ICreateAlertProps {
    isLoading: boolean;
    alert: IAutomationMetadataObjectDefinition | null;
    onClose: () => void;
    onCancel: () => void;
    onCreate?: (alert: IAutomationMetadataObjectDefinition) => void;
    destinations: INotificationChannel[];
    hasAlerts: boolean;
    measures: IMeasure[];
    maxAutomationsReached: boolean;
}

export const CreateAlert: React.FC<ICreateAlertProps> = ({
    isLoading,
    alert,
    onClose,
    onCancel,
    onCreate,
    destinations,
    hasAlerts,
    measures,
    maxAutomationsReached,
}) => {
    if (isLoading) {
        return <LoadingMask height={LOADING_MASK_HEIGHT} />;
    }

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
