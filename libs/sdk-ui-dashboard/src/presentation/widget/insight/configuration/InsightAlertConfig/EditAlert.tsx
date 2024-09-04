// (C) 2022-2024 GoodData Corporation
import React from "react";
import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";
import {
    Bubble,
    BubbleHoverTrigger,
    Button,
    Input,
    Message,
    OverlayPositionType,
} from "@gooddata/sdk-ui-kit";
import { DashboardInsightSubmenuContainer } from "../../../insightMenu/DefaultDashboardInsightMenu/DashboardInsightMenu/DashboardInsightSubmenuContainer.js";
import { AlertMeasureSelect } from "./AlertMeasureSelect.js";
import { AlertComparisonOperatorSelect } from "./AlertComparisonOperatorSelect.js";
import { AlertDestinationSelect } from "./AlertDestinationSelect.js";
import { EditAlertConfiguration } from "./EditAlertConfiguration.js";
import { useEditAlert } from "./hooks/useEditAlert.js";
import { defineMessages, FormattedMessage, MessageDescriptor, useIntl } from "react-intl";
import { Smtps, Webhooks } from "../../../../../model/index.js";
import { AlertMetric } from "../../types.js";
import { useAlertValidation, AlertInvalidityReason } from "./hooks/useAlertValidation.js";

const TOOLTIP_ALIGN_POINTS = [{ align: "cl cr" }, { align: "cr cl" }];

const messages = defineMessages({
    invalidDefault: {
        id: "insightAlert.config.invalid",
    },
    invalidWidget: {
        id: "insightAlert.config.invalidWidget",
    },
});

const invalidMessagesObj: Record<AlertInvalidityReason, MessageDescriptor> = {
    missingMetric: messages.invalidDefault,
    missingWidget: messages.invalidWidget,
};

interface IEditAlertProps {
    alert: IAutomationMetadataObject;
    isNewAlert?: boolean;
    hasAlerts: boolean;
    destinations: (Webhooks[number] | Smtps[number])[];
    measures: AlertMetric[];
    onClose: () => void;
    onCancel: () => void;
    onCreate?: (alert: IAutomationMetadataObjectDefinition) => void;
    onUpdate?: (alert: IAutomationMetadataObject) => void;
    maxAutomationsReached?: boolean;
    overlayPositionType?: OverlayPositionType;
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
    overlayPositionType,
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
    const selectedMeasureIdentifier = updatedAlert.alert!.condition.left;
    const selectedMeasure = measures.find(
        (measure) => measure.measure.measure.localIdentifier === selectedMeasureIdentifier,
    );
    const { isValid, invalidityReason } = useAlertValidation(alert, isNewAlert);

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
                            selectedMeasure={selectedMeasure}
                            onMeasureChange={changeMeasure}
                            measures={measures}
                            overlayPositionType={overlayPositionType}
                        />
                        <AlertComparisonOperatorSelect
                            selectedComparisonOperator={updatedAlert.alert!.condition.operator}
                            onComparisonOperatorChange={changeComparisonOperator}
                            overlayPositionType={overlayPositionType}
                        />
                        <Input
                            className="gd-edit-alert__value-input s-alert-value-input"
                            isSmall
                            autofocus
                            value={updatedAlert.alert!.condition.right}
                            onChange={(e) => changeValue(e !== "" ? parseFloat(e as string) : undefined!)}
                            type="number"
                        />
                        {destinations.length > 1 && (
                            <AlertDestinationSelect
                                selectedDestination={updatedAlert.notificationChannel!}
                                onDestinationChange={changeDestination}
                                destinations={destinations}
                                overlayPositionType={overlayPositionType}
                            />
                        )}
                    </div>
                    {!isValid ? (
                        <Message type="error">
                            <FormattedMessage id={invalidMessagesObj[invalidityReason!].id} />
                        </Message>
                    ) : null}
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
                overlayPositionType={overlayPositionType}
            />
        </DashboardInsightSubmenuContainer>
    );
};
