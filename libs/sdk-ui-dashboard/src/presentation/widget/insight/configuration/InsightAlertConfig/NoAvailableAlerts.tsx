// (C) 2022-2025 GoodData Corporation
import React from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { AddButton, SeparatorLine } from "@gooddata/sdk-ui-kit";

import { DashboardInsightSubmenuContainer } from "../../../insightMenu/DefaultDashboardInsightMenu/DashboardInsightMenu/DashboardInsightSubmenuContainer.js";

interface INoAvailableMeasuresProps {
    onClose: () => void;
    onBack: () => void;
}

export const NoAvailableMeasures: React.FC<INoAvailableMeasuresProps> = ({ onClose, onBack }) => {
    const intl = useIntl();

    return (
        <DashboardInsightSubmenuContainer
            title={intl.formatMessage({ id: "insightAlert.config.noAlertMeasures" })}
            onClose={onClose}
            onBack={onBack}
        >
            <div className="gd-no-measures-alert">
                <div className="gd-message progress s-no-measures-alert-info">
                    <div className="gd-message-text">
                        <div>
                            <FormattedMessage
                                id="insightAlert.config.noAlertMeasures.title"
                                tagName="strong"
                            />
                        </div>
                        <FormattedMessage id="insightAlert.config.noAlertMeasures.description" />
                    </div>
                </div>
                <SeparatorLine pL={10} pR={10} />
                <div className="gd-alerts-list__buttons">
                    <AddButton
                        title={<FormattedMessage id="insightAlert.config.addAlert" />}
                        className="gd-alerts-list__add-button"
                        isDisabled={true}
                    />
                </div>
            </div>
        </DashboardInsightSubmenuContainer>
    );
};
