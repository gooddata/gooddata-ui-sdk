// (C) 2022-2024 GoodData Corporation
import React from "react";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { Button, SeparatorLine } from "@gooddata/sdk-ui-kit";
import { AlertsListItem } from "./AlertsListItem.js";
import { DashboardInsightSubmenuContainer } from "../../../insightMenu/DefaultDashboardInsightMenu/DashboardInsightMenu/DashboardInsightSubmenuContainer.js";
import { FormattedMessage, useIntl } from "react-intl";

interface IAlertsListProps {
    alerts: IAutomationMetadataObject[];
    onCreateAlert: () => void;
    onEditAlert: (alert: IAutomationMetadataObject) => void;
    onPauseAlert: (alert: IAutomationMetadataObject) => void;
    onResumeAlert: (alert: IAutomationMetadataObject) => void;
    onDeleteAlert: (alert: IAutomationMetadataObject) => void;
    onClose: () => void;
    onGoBack: () => void;
}

export const AlertsList: React.FC<IAlertsListProps> = ({
    alerts,
    onCreateAlert,
    onEditAlert,
    onPauseAlert,
    onResumeAlert,
    onDeleteAlert,
    onClose,
    onGoBack,
}) => {
    const intl = useIntl();
    return (
        <DashboardInsightSubmenuContainer
            title={intl.formatMessage({ id: "insightAlert.config.alerts" })}
            onClose={onClose}
            onBack={onGoBack}
        >
            <div className="gd-alerts-list">
                <div className="gd-alerts-list__items">
                    {alerts.map((alert) => {
                        return (
                            <AlertsListItem
                                key={alert.id}
                                alert={alert}
                                onEditAlert={onEditAlert}
                                onPauseAlert={onPauseAlert}
                                onResumeAlert={onResumeAlert}
                                onDeleteAlert={onDeleteAlert}
                            />
                        );
                    })}
                </div>
                <SeparatorLine pL={10} pR={10} />
                <div className="gd-alerts-list__buttons">
                    <Button className="gd-button gd-button-link gd-icon-plus" onClick={() => onCreateAlert()}>
                        <FormattedMessage id="insightAlert.config.addAlert" />
                    </Button>
                </div>
            </div>
        </DashboardInsightSubmenuContainer>
    );
};
