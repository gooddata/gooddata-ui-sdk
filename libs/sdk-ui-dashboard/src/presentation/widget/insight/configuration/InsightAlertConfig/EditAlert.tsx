// (C) 2022-2025 GoodData Corporation
import React from "react";

import { FormattedMessage, MessageDescriptor, defineMessages, useIntl } from "react-intl";

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
import {
    Bubble,
    BubbleHoverTrigger,
    Button,
    Input,
    Message,
    OverlayPositionType,
} from "@gooddata/sdk-ui-kit";

import { AlertTitle } from "./AlertTitle.js";
import { EditAlertConfiguration } from "./EditAlertConfiguration.js";
import { useEditAlert } from "./hooks/useEditAlert.js";
import { IExecutionResultEnvelope } from "../../../../../model/index.js";
import { AlertAttributeSelectOld } from "../../../../alerting/DefaultAlertingDialog/components/AlertAttributeSelectOld.js";
import { AlertComparisonOperatorSelect } from "../../../../alerting/DefaultAlertingDialog/components/AlertComparisonOperatorSelect.js";
import { AlertComparisonPeriodSelect } from "../../../../alerting/DefaultAlertingDialog/components/AlertComparisonPeriodSelect.js";
import { AlertDestinationSelect } from "../../../../alerting/DefaultAlertingDialog/components/AlertDestinationSelect.js";
import { AlertMeasureSelect } from "../../../../alerting/DefaultAlertingDialog/components/AlertMeasureSelect.js";
import {
    AlertInvalidityReason,
    useAlertValidation,
} from "../../../../alerting/DefaultAlertingDialog/hooks/useAlertValidation.js";
import { useAttributeValuesFromExecResults } from "../../../../alerting/DefaultAlertingDialog/hooks/useAttributeValuesFromExecResults.js";
import { useThresholdValue } from "../../../../alerting/DefaultAlertingDialog/hooks/useThresholdValue.js";
import {
    IMeasureFormatMap,
    getAlertAttribute,
    getAlertCompareOperator,
    getAlertComparison,
    getAlertFilters,
    getAlertMeasure,
    getAlertRelativeOperator,
    getValueSuffix,
} from "../../../../alerting/DefaultAlertingDialog/utils/getters.js";
import { translateGranularity } from "../../../../alerting/DefaultAlertingDialog/utils/granularity.js";
import { isChangeOrDifferenceOperator } from "../../../../alerting/DefaultAlertingDialog/utils/guards.js";
import { AlertAttribute, AlertMetric } from "../../../../alerting/types.js";
import { RecipientsSelect } from "../../../../scheduledEmail/DefaultScheduledEmailDialog/components/RecipientsSelect/RecipientsSelect.js";
import { DashboardInsightSubmenuContainer } from "../../../insightMenu/DefaultDashboardInsightMenu/DashboardInsightMenu/DashboardInsightSubmenuContainer.js";

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
    canManageAttributes: boolean;
    canManageComparison: boolean;
    execResult: IExecutionResultEnvelope | undefined;
    alert: IAutomationMetadataObject;
    isNewAlert?: boolean;
    hasAlerts: boolean;
    destinations: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    users: IWorkspaceUser[];
    measures: AlertMetric[];
    attributes: AlertAttribute[];
    measureFormatMap: IMeasureFormatMap;
    catalogAttributes: ICatalogAttribute[];
    catalogDateDatasets: ICatalogDateDataset[];
    onClose: () => void;
    onCancel: () => void;
    onCreate?: (alert: IAutomationMetadataObjectDefinition) => void;
    onUpdate?: (alert: IAutomationMetadataObject) => void;
    maxAutomationsReached?: boolean;
    maxAutomationsRecipients: number;
    overlayPositionType?: OverlayPositionType;
    separators?: ISeparators;
    isExecutionTimestampMode?: boolean;
}

export function EditAlert({
    alert,
    execResult,
    isNewAlert,
    hasAlerts,
    destinations,
    users,
    attributes,
    measures,
    onClose,
    onCancel,
    onCreate,
    onUpdate,
    maxAutomationsReached = false,
    maxAutomationsRecipients,
    overlayPositionType,
    measureFormatMap,
    catalogAttributes,
    catalogDateDatasets,
    canManageAttributes,
    canManageComparison,
    separators,
    isExecutionTimestampMode,
}: IEditAlertProps) {
    const {
        defaultUser,
        viewMode,
        updatedAlert,
        canSubmit,
        allowExternalRecipients,
        allowOnlyLoggedUserRecipients,
        warningMessage,
        //
        changeComparisonOperator,
        changeRelativeOperator,
        changeMeasure,
        changeAttribute,
        changeTitle,
        changeValue,
        changeDestination,
        changeComparisonType,
        changeRecipients,
        //
        configureAlert,
        saveAlertConfiguration,
        cancelAlertConfiguration,
        //
        createAlert,
        updateAlert,
    } = useEditAlert({
        metrics: measures,
        separators,
        attributes,
        alert,
        onCreate,
        onUpdate,
        measureFormatMap,
        catalogAttributes,
        catalogDateDatasets,
        destinations,
    });
    const intl = useIntl();
    const disableCreateButtonDueToLimits = isNewAlert && maxAutomationsReached;
    const selectedMeasure = getAlertMeasure(measures, updatedAlert.alert);
    const selectedComparator = getAlertComparison(selectedMeasure, updatedAlert.alert);
    const [selectedAttribute, selectedValue] = getAlertAttribute(attributes, updatedAlert);
    const filters = getAlertFilters(updatedAlert);
    const selectedComparisonOperator = getAlertCompareOperator(updatedAlert.alert);
    const selectedRelativeOperator = getAlertRelativeOperator(updatedAlert.alert);

    const { isValid, invalidityReason } = useAlertValidation(alert, isNewAlert);
    const showFilterInfo = filters.length > 0 || Boolean(selectedComparator?.granularity);

    const { isResultLoading, getAttributeValues, getMetricValue } =
        useAttributeValuesFromExecResults(execResult);

    const { value, onChange, onBlur } = useThresholdValue(
        changeValue,
        getMetricValue,
        isNewAlert,
        updatedAlert.alert,
        selectedRelativeOperator,
        selectedMeasure,
        selectedAttribute,
        selectedValue,
    );

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
                        <label htmlFor="alert.measure" className="gd-edit-alert__measure-label">
                            <FormattedMessage id="insightAlert.config.when" />
                        </label>
                        <AlertMeasureSelect
                            selectedMeasure={selectedMeasure}
                            onMeasureChange={changeMeasure}
                            measures={measures}
                            overlayPositionType={overlayPositionType}
                            id="alert.measure"
                        />

                        {Boolean(canManageAttributes) && (
                            <>
                                <AlertAttributeSelectOld
                                    id="alert.attribute"
                                    selectedAttribute={selectedAttribute}
                                    selectedValue={selectedValue}
                                    onAttributeChange={changeAttribute}
                                    attributes={attributes}
                                    catalogAttributes={catalogAttributes}
                                    catalogDateDatasets={catalogDateDatasets}
                                    getAttributeValues={getAttributeValues}
                                    isResultLoading={isResultLoading}
                                />
                            </>
                        )}
                        {showFilterInfo ? (
                            <div className="gd-edit-alert__measure-info">
                                {Boolean(selectedComparator?.granularity) && (
                                    <FormattedMessage
                                        tagName="span"
                                        id="insightAlert.config.for.filter"
                                        values={{
                                            granularity: [
                                                intl.formatMessage({ id: "granularity.this_keyword" }),
                                                translateGranularity(intl, selectedComparator?.granularity),
                                            ].join(" "),
                                        }}
                                    />
                                )}
                                {filters.length > 0 && selectedComparator?.granularity ? (
                                    <FormattedMessage tagName="span" id="insightAlert.config.and" />
                                ) : null}
                                {filters.length > 0 && (
                                    <>
                                        <FormattedMessage
                                            tagName="span"
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
                                                    alignPoints={[{ align: "cr cl" }, { align: "cl cr" }]}
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
                                    </>
                                )}
                            </div>
                        ) : null}
                        <AlertComparisonOperatorSelect
                            id="alert.comparisonOperator"
                            measure={selectedMeasure}
                            selectedComparisonOperator={selectedComparisonOperator}
                            selectedRelativeOperator={selectedRelativeOperator}
                            onComparisonOperatorChange={changeComparisonOperator}
                            onRelativeOperatorChange={changeRelativeOperator}
                            overlayPositionType={overlayPositionType}
                        />
                        <Input
                            className="gd-edit-alert__value-input s-alert-value-input"
                            isSmall
                            autofocus
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                            type="number"
                            suffix={getValueSuffix(updatedAlert.alert)}
                            accessibilityConfig={{
                                ariaLabel: intl.formatMessage({
                                    id: "insightAlert.config.accessbility.input",
                                }),
                            }}
                        />
                        {!updatedAlert || !isChangeOrDifferenceOperator(updatedAlert.alert) ? null : (
                            <div style={{ marginTop: "1rem" }}>
                                <label htmlFor="alert.comparison">
                                    <FormattedMessage id="insightAlert.config.comparison" />
                                </label>
                                <AlertComparisonPeriodSelect
                                    id="alert.comparison"
                                    measure={selectedMeasure}
                                    alert={updatedAlert}
                                    selectedComparison={selectedComparator?.comparator}
                                    onComparisonChange={(comparisonType) => {
                                        changeComparisonType(
                                            selectedMeasure,
                                            selectedRelativeOperator,
                                            comparisonType,
                                        );
                                    }}
                                    overlayPositionType={overlayPositionType}
                                    canManageComparison={canManageComparison}
                                />
                            </div>
                        )}
                        {destinations.length > 1 && (
                            <div style={{ marginTop: "1rem" }}>
                                <label
                                    htmlFor="alert.destination"
                                    className="gd-edit-alert__destination-label"
                                >
                                    <FormattedMessage id="insightAlert.config.action" />
                                </label>
                                <AlertDestinationSelect
                                    id="alert.destination"
                                    selectedDestination={updatedAlert.notificationChannel!}
                                    onDestinationChange={changeDestination}
                                    destinations={destinations}
                                    overlayPositionType={overlayPositionType}
                                />
                            </div>
                        )}
                        <RecipientsSelect
                            id="alert.recipients"
                            loggedUser={defaultUser}
                            users={users}
                            value={updatedAlert.recipients ?? []}
                            originalValue={alert.recipients || []}
                            onChange={changeRecipients}
                            allowEmptySelection
                            allowOnlyLoggedUserRecipients={allowOnlyLoggedUserRecipients}
                            allowExternalRecipients={allowExternalRecipients}
                            maxRecipients={maxAutomationsRecipients}
                            className="gd-edit-alert__recipients"
                            notificationChannels={destinations}
                            notificationChannelId={updatedAlert.notificationChannel}
                        />
                        <label htmlFor="alert.title" className="gd-edit-alert__title-label">
                            <FormattedMessage id="insightAlert.config.name" />
                        </label>
                        <AlertTitle
                            id="alert.title"
                            measures={measures}
                            alert={updatedAlert}
                            separators={separators}
                            onChange={(e) => {
                                changeTitle(e === "" ? undefined : String(e));
                            }}
                        />
                    </div>
                    {warningMessage ? <Message type="warning">{warningMessage}</Message> : null}
                    {isValid ? null : (
                        <Message type="error">
                            <FormattedMessage id={invalidMessagesObj[invalidityReason!].id} />
                        </Message>
                    )}
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
                                disabled={
                                    !canSubmit || disableCreateButtonDueToLimits || isExecutionTimestampMode
                                }
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
                            {isExecutionTimestampMode ? (
                                <Bubble alignPoints={TOOLTIP_ALIGN_POINTS}>
                                    <FormattedMessage id="insightAlert.executionTimestampMode" />
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
}
