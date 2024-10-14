// (C) 2022-2024 GoodData Corporation
import React from "react";
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    ICatalogMeasure,
    INotificationChannelMetadataObject,
} from "@gooddata/sdk-model";
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
import { AlertMetric, AlertMetricComparatorType } from "../../types.js";
import { useAlertValidation, AlertInvalidityReason } from "./hooks/useAlertValidation.js";
import {
    getAlertCompareOperator,
    getAlertMeasure,
    getAlertRelativeOperator,
    getAlertThreshold,
    getValueSuffix,
    isChangeOrDifferenceOperator,
} from "./utils.js";

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
    destinations: INotificationChannelMetadataObject[];
    measures: AlertMetric[];
    catalogMeasures: ICatalogMeasure[];
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
    catalogMeasures,
}) => {
    const {
        viewMode,
        updatedAlert,
        canSubmit,
        //
        changeComparisonOperator,
        changeRelativeOperator,
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
        metrics: measures,
        alert,
        onCreate,
        onUpdate,
        catalogMeasures,
    });
    const intl = useIntl();
    const disableCreateButtonDueToLimits = isNewAlert && maxAutomationsReached;
    const selectedMeasure = getAlertMeasure(measures, updatedAlert.alert);
    const { isValid, invalidityReason } = useAlertValidation(alert, isNewAlert);
    const filters = alert.alert?.execution?.filters ?? [];

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
                        {filters.length > 0 && (
                            <div className="gd-edit-alert__measure-info">
                                <FormattedMessage
                                    id="insightAlert.config.filters"
                                    values={{
                                        n: filters.length,
                                    }}
                                />
                                <div role="item-info" className="gd-list-item-bubble">
                                    <BubbleHoverTrigger
                                        tagName="div"
                                        showDelay={200}
                                        hideDelay={0}
                                        eventsOnBubble={false}
                                    >
                                        <div className="inlineBubbleHelp" />
                                        <Bubble
                                            className="bubble-primary"
                                            alignPoints={[{ align: "cr cl" }]}
                                            arrowOffsets={{ "cr cl": [15, 0] }}
                                        >
                                            <FormattedMessage
                                                id="insightAlert.config.filters.info"
                                                values={{
                                                    spacer: (
                                                        <div className="gd-alert-comparison-operator-tooltip-spacer" />
                                                    ),
                                                }}
                                            />
                                        </Bubble>
                                    </BubbleHoverTrigger>
                                </div>
                            </div>
                        )}
                        <AlertComparisonOperatorSelect
                            measure={selectedMeasure}
                            selectedComparisonOperator={getAlertCompareOperator(updatedAlert.alert)}
                            selectedRelativeOperator={getAlertRelativeOperator(updatedAlert.alert)}
                            onComparisonOperatorChange={changeComparisonOperator}
                            onRelativeOperatorChange={changeRelativeOperator}
                            overlayPositionType={overlayPositionType}
                        />
                        <Input
                            className="gd-edit-alert__value-input s-alert-value-input"
                            isSmall
                            autofocus
                            value={getAlertThreshold(updatedAlert.alert)}
                            onChange={(e) => changeValue(e !== "" ? parseFloat(e as string) : undefined!)}
                            type="number"
                            suffix={getValueSuffix(updatedAlert.alert)}
                        />
                        {selectedMeasure?.comparators.some(
                            (a) => a.comparator === AlertMetricComparatorType.SamePeriodPreviousYear,
                        ) && isChangeOrDifferenceOperator(updatedAlert.alert) ? (
                            <div className="gd-edit-alert__measure-info">
                                <FormattedMessage id="insightAlert.config.compare_with" />{" "}
                                <FormattedMessage id="insightAlert.config.compare_with_sp" />
                            </div>
                        ) : null}
                        {selectedMeasure?.comparators.some(
                            (a) => a.comparator === AlertMetricComparatorType.PreviousPeriod,
                        ) && isChangeOrDifferenceOperator(updatedAlert.alert) ? (
                            <div className="gd-edit-alert__measure-info">
                                <FormattedMessage id="insightAlert.config.compare_with" />{" "}
                                <FormattedMessage id="insightAlert.config.compare_with_pp" />
                            </div>
                        ) : null}
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
