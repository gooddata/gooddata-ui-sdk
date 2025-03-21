// (C) 2022-2025 GoodData Corporation
import React from "react";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { AddButton, SeparatorLine } from "@gooddata/sdk-ui-kit";
import { AlertsListItem } from "./AlertsListItem.js";
import { DashboardInsightSubmenuContainer } from "../../../insightMenu/DefaultDashboardInsightMenu/DashboardInsightMenu/DashboardInsightSubmenuContainer.js";
import { FormattedMessage, useIntl } from "react-intl";
import Skeleton from "react-loading-skeleton";

interface IAlertsListProps {
    isLoading: boolean;
    alerts: IAutomationMetadataObject[];
    onCreateAlert: () => void;
    onEditAlert: (alert: IAutomationMetadataObject) => void;
    onPauseAlert: (alert: IAutomationMetadataObject) => void;
    onResumeAlert: (alert: IAutomationMetadataObject) => void;
    onDeleteAlert: (alert: IAutomationMetadataObject) => void;
    onClose: () => void;
    onGoBack: () => void;
    maxAutomationsReached: boolean;
    canCreateAutomation: boolean;
    isExecutionTimestampMode?: boolean;
}

export const AlertsList: React.FC<IAlertsListProps> = ({
    isLoading,
    alerts,
    onCreateAlert,
    onEditAlert,
    onPauseAlert,
    onResumeAlert,
    onDeleteAlert,
    onClose,
    onGoBack,
    maxAutomationsReached,
    canCreateAutomation,
    isExecutionTimestampMode,
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
                    {isLoading ? (
                        <LoadingSkeleton />
                    ) : (
                        <>
                            {alerts.length > 0 ? (
                                alerts.map((alert) => {
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
                                })
                            ) : (
                                <div className="gd-alerts-list__empty">
                                    <FormattedMessage id="insightAlert.config.alerts.empty" />
                                </div>
                            )}
                        </>
                    )}
                </div>
                {canCreateAutomation ? (
                    <>
                        <SeparatorLine pL={10} pR={10} />
                        <div className="gd-alerts-list__buttons">
                            <AddButton
                                onClick={onCreateAlert}
                                title={<FormattedMessage id="insightAlert.config.addAlert" />}
                                className="gd-alerts-list__add-button"
                                isDisabled={maxAutomationsReached || isLoading || isExecutionTimestampMode}
                                tooltip={
                                    maxAutomationsReached ? (
                                        <FormattedMessage id="insightAlert.maxAlertsReached" />
                                    ) : isExecutionTimestampMode ? (
                                        <FormattedMessage id="insightAlert.executionTimestampMode" />
                                    ) : undefined
                                }
                            />
                        </div>
                    </>
                ) : null}
            </div>
        </DashboardInsightSubmenuContainer>
    );
};

const LoadingSkeletonItem = () => {
    return (
        <div className="gd-react-loading-skeleton-wrapper">
            <Skeleton className="gd-react-loading-skeleton" circle={true} width={27} height={27} />
            <Skeleton
                containerClassName="skeleton-flex skeleton-margin"
                className="gd-react-loading-skeleton"
                width={"83%"}
                height={14}
            />
        </div>
    );
};

const LoadingSkeleton = () => {
    return (
        <>
            <LoadingSkeletonItem />
            <LoadingSkeletonItem />
        </>
    );
};
