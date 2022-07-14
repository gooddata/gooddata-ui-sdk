// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Message } from "@gooddata/sdk-ui-kit";

interface IKpiConfigurationMessagesProps {
    numberOfAlerts: number | undefined;
}

export const KpiConfigurationMessages: React.FC<IKpiConfigurationMessagesProps> = (props) => {
    const { numberOfAlerts } = props;

    if (numberOfAlerts) {
        return (
            <div className="warning s-alert-edit-warning">
                <Message type="warning">
                    <FormattedMessage
                        id="configurationPanel.breakAlertWarning"
                        values={{ numAlerts: numberOfAlerts }}
                    />
                </Message>
            </div>
        );
    }

    return null;
};
