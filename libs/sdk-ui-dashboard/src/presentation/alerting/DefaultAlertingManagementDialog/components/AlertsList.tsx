// (C) 2022-2024 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { IAutomationMetadataObject, IInsightWidget, IWebhookDefinitionObject } from "@gooddata/sdk-model";
import { LoadingSpinner } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { Alert } from "./Alert.js";

interface IAlertsProps {
    onDelete: (alert: IAutomationMetadataObject) => void;
    onEdit: (
        alert: IAutomationMetadataObject,
        widget: IInsightWidget | undefined,
        anchor: HTMLElement | null,
        onClosed: () => void,
    ) => void;
    onPause: (alert: IAutomationMetadataObject, pause: boolean) => void;
    isLoading: boolean;
    alerts: IAutomationMetadataObject[];
    noAlertsMessageId: string;
    webhooks: IWebhookDefinitionObject[];
}

export const Alerts: React.FC<IAlertsProps> = (props) => {
    const { isLoading, alerts, onDelete, onEdit, onPause, noAlertsMessageId, webhooks } = props;
    const theme = useTheme();

    if (isLoading) {
        return (
            <div className="gd-loading-equalizer-wrap gd-notifications-channels-message">
                <div className="gd-loading-equalizer gd-loading-equalizer-fade">
                    <LoadingSpinner
                        className="large gd-loading-equalizer-spinner"
                        color={theme?.palette?.complementary?.c9}
                    />
                </div>
            </div>
        );
    }

    if (alerts.length === 0) {
        return (
            <div className="gd-notifications-channels-message s-no-alerts-message">
                <FormattedMessage id={noAlertsMessageId} values={{ br: <br /> }} />
            </div>
        );
    }

    return (
        <>
            {alerts.map((alert) => (
                <Alert
                    key={alert.id}
                    alert={alert}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onPause={onPause}
                    webhooks={webhooks}
                />
            ))}
        </>
    );
};
