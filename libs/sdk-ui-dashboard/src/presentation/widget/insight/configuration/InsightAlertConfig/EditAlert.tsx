// (C) 2022-2024 GoodData Corporation
import React from "react";
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IMeasure,
} from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, Button, Input } from "@gooddata/sdk-ui-kit";
import { DashboardInsightSubmenuContainer } from "../../../insightMenu/DefaultDashboardInsightMenu/DashboardInsightMenu/DashboardInsightSubmenuContainer.js";
import { AlertMeasureSelect } from "./AlertMeasureSelect.js";
import { AlertComparisonOperatorSelect } from "./AlertComparisonOperatorSelect.js";
import { AlertDestinationSelect } from "./AlertDestinationSelect.js";
import { EditAlertConfiguration } from "./EditAlertConfiguration.js";
import { useEditAlert } from "./useEditAlert.js";
import { FormattedMessage, useIntl } from "react-intl";
import { Webhooks } from "../../../../../model/index.js";

const TOOLTIP_ALIGN_POINTS = [{ align: "cl cr" }, { align: "cr cl" }];

interface IEditAlertProps {
    alert: IAutomationMetadataObject;
    isNewAlert?: boolean;
    hasAlerts: boolean;
    destinations: Webhooks;
    measures: IMeasure[];
    onClose: () => void;
    onCancel: () => void;
    onCreate?: (alert: IAutomationMetadataObjectDefinition) => void;
    onUpdate?: (alert: IAutomationMetadataObject) => void;
    maxAutomationsReached?: boolean;
}

export const EditAlert: React.FC<IEditAlertProps> = ({
    alert,
    isNewAlert,
    hasAlerts,
    destinations,
    measures,
    onClose,
    onCancel,
    onCreate,
    onUpdate,
    maxAutomationsReached = false,
}) => {
    const {
        viewMode,
        updatedAlert,
        canSubmit,
        //
        changeComparisonOperator,
        changeMeasure,
        changeValue,
        changeDestination,
        //
        configureAlert,
        saveAlertConfiguration,
        cancelAlertConfiguration,
        //
        createAlert,
        updateAlert,
    } = useEditAlert({
        alert,
        onCreate,
        onUpdate,
    });
    const intl = useIntl();
    const disableCreateButtonDueToLimits = isNewAlert && maxAutomationsReached;

    return viewMode === "edit" ? (
        <DashboardInsightSubmenuContainer
            title={
                isNewAlert
                    ? intl.formatMessage({ id: "insightAlert.config.createAlert" })
                    : intl.formatMessage({ id: "insightAlert.config.editAlert" })
            }
            onClose={onClose}
            onBack={hasAlerts ? onCancel : undefined}
        >
            <div className="gd-edit-alert">
                <div className="gd-edit-alert__form">
                    <div className="gd-edit-alert__form-content">
                        <div className="gd-edit-alert__measure-label">
                            <FormattedMessage id="insightAlert.config.when" />
                        </div>
                        <AlertMeasureSelect
                            selectedMeasureIdentifier={updatedAlert.alert!.condition.left}
                            onMeasureChange={changeMeasure}
                            measures={measures}
                        />
                        <AlertComparisonOperatorSelect
                            selectedComparisonOperator={updatedAlert.alert!.condition.operator}
                            onComparisonOperatorChange={changeComparisonOperator}
                        />
                        <Input
                            className="gd-edit-alert__value-input s-alert-value-input"
                            isSmall
                            autofocus
                            value={updatedAlert.alert!.condition.right}
                            onChange={(e) => changeValue(e !== "" ? parseInt(e as string, 10) : undefined!)}
                            type="number"
                        />
                        {destinations.length > 1 && (
                            <AlertDestinationSelect
                                selectedDestination={updatedAlert.webhook!}
                                onDestinationChange={changeDestination}
                                destinations={destinations}
                            />
                        )}
                    </div>
                </div>
                <div className="gd-edit-alert__buttons">
                    <Button
                        className="gd-edit-alert__configuration-button gd-button-link gd-button-icon-only gd-icon-settings gd-button-small s-alert-configuration"
                        onClick={configureAlert}
                    />
                    <div>
                        <Button
                            variant="secondary"
                            size="small"
                            onClick={() => {
                                onCancel();
                            }}
                        >
                            <FormattedMessage id="cancel" />
                        </Button>
                        <BubbleHoverTrigger hideDelay={0} showDelay={0}>
                            <Button
                                intent="action"
                                size="small"
                                disabled={!canSubmit || disableCreateButtonDueToLimits}
                                onClick={isNewAlert ? createAlert : updateAlert}
                                className="gd-button-left-margin"
                            >
                                {isNewAlert
                                    ? intl.formatMessage({ id: "create" })
                                    : intl.formatMessage({ id: "save" })}
                            </Button>
                            {disableCreateButtonDueToLimits ? (
                                <Bubble alignPoints={TOOLTIP_ALIGN_POINTS}>
                                    <FormattedMessage id="insightAlert.maxAlertsReached" />
                                </Bubble>
                            ) : null}
                        </BubbleHoverTrigger>
                    </div>
                </div>
            </div>
        </DashboardInsightSubmenuContainer>
    ) : (
        <DashboardInsightSubmenuContainer
            title={intl.formatMessage({ id: "insightAlert.config.title" })}
            onClose={onClose}
            onBack={cancelAlertConfiguration}
        >
            <EditAlertConfiguration
                alert={updatedAlert}
                onUpdate={saveAlertConfiguration}
                onCancel={cancelAlertConfiguration}
            />
        </DashboardInsightSubmenuContainer>
    );
};
