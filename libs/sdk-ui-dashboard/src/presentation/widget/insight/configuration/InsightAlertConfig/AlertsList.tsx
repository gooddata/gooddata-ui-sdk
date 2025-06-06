// (C) 2022-2025 GoodData Corporation
import React from "react";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import {
    AddButton,
    AutofocusOnMount,
    SeparatorLine,
    useIdPrefixed,
    useListWithActionsKeyboardNavigation,
} from "@gooddata/sdk-ui-kit";
import { DashboardInsightSubmenuContainer } from "../../../insightMenu/DefaultDashboardInsightMenu/DashboardInsightMenu/DashboardInsightSubmenuContainer.js";
import { FormattedMessage, useIntl } from "react-intl";
import Skeleton from "react-loading-skeleton";
import { Alert } from "../../../../alerting/DefaultAlertingManagementDialog/components/Alert.js";

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

const getItemAdditionalActions = () => {
    return ["dropdown" as const, "item" as const];
};

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

    const handleEdit = React.useCallback(
        (alert: IAutomationMetadataObject) => () => onEditAlert(alert),
        [onEditAlert],
    );

    const handleTogglePause = React.useCallback(
        (alert: IAutomationMetadataObject) => () =>
            (alert.alert?.trigger.state === "PAUSED" ? onResumeAlert : onPauseAlert)(alert),
        [onPauseAlert, onResumeAlert],
    );
    const handleDelete = React.useCallback(
        (alert: IAutomationMetadataObject) => () => onDeleteAlert(alert),
        [onDeleteAlert],
    );

    const [dropdownOpenAlertId, setDropdownOpenAlertId] = React.useState<string | null>(null);
    const handleToggleDropdown = React.useCallback(
        (alert: IAutomationMetadataObject) => (desiredState?: boolean) => {
            setDropdownOpenAlertId((prev) => {
                const nextState = desiredState ?? !prev;

                return nextState ? alert.id : null;
            });
        },
        [],
    );

    const { focusedAction, focusedItem, onKeyboardNavigation } = useListWithActionsKeyboardNavigation({
        items: alerts,
        getItemAdditionalActions,
        actionHandlers: {
            selectItem: handleEdit,
            item: handleEdit,
            dropdown: (alert) => () => {
                handleToggleDropdown(alert)(true);
            },
        },
        isNestedList: true,
    });

    const listId = useIdPrefixed("AlertsList");

    return (
        <DashboardInsightSubmenuContainer
            title={intl.formatMessage({ id: "insightAlert.config.alerts" })}
            onClose={onClose}
            onBack={onGoBack}
        >
            <div className="gd-alerts-list gd-alerts-list--widget">
                <AutofocusOnMount>
                    <div
                        onKeyDown={onKeyboardNavigation}
                        tabIndex={0}
                        className="gd-alerts-list__items"
                        id={listId}
                    >
                        {isLoading ? (
                            <LoadingSkeleton />
                        ) : (
                            <>
                                {alerts.length > 0 ? (
                                    alerts.map((alert) => {
                                        return (
                                            <Alert
                                                key={alert.id}
                                                alert={alert}
                                                focusedAction={
                                                    alert === focusedItem ? focusedAction : undefined
                                                }
                                                listId={listId}
                                                isDropdownOpen={dropdownOpenAlertId === alert.id}
                                                onToggleDropdown={handleToggleDropdown(alert)}
                                                onEdit={handleEdit(alert)}
                                                onTogglePause={handleTogglePause(alert)}
                                                onDelete={handleDelete(alert)}
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
                </AutofocusOnMount>
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
