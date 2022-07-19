// (C) 2020-2022 GoodData Corporation
import React, { memo, useCallback, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import compact from "lodash/compact";
import { IAnalyticalBackend, IDataView, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import {
    IMeasure,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    ObjRef,
    objRefToString,
    FilterContextItem,
    IWidgetAlert,
    IKpiWidget,
    widgetRef,
    ISeparators,
} from "@gooddata/sdk-model";
import {
    convertDrillableItemsToPredicates,
    IDrillEventContext,
    ILoadingProps,
    isSomeHeaderPredicateMatched,
    NoDataSdkError,
    OnError,
    useExecutionDataView,
} from "@gooddata/sdk-ui";

import { filterContextItemsToDashboardFiltersByWidget } from "../../../../converters";
import {
    selectDrillableItems,
    selectCanCreateScheduledMail,
    selectSettings,
    selectCurrentUser,
    useDashboardAsyncRender,
    useDashboardSelector,
    useDashboardUserInteraction,
    useWidgetExecutionsHandler,
    selectValidConfiguredDrillsByWidgetRef,
    uiActions,
    useDashboardDispatch,
    selectIsKpiAlertOpenedByWidgetRef,
    selectIsKpiAlertHighlightedByWidgetRef,
    selectEnableWidgetCustomHeight,
    selectDateFormat,
} from "../../../../model";
import { DashboardItemHeadline } from "../../../presentationComponents";
import { IDashboardFilter, OnFiredDashboardDrillEvent } from "../../../../types";

import { KpiAlertDialogWrapper } from "./KpiAlertDialogWrapper";
import { useKpiAlertOperations } from "./useKpiAlertOperations";
import { DashboardItemWithKpiAlert, evaluateAlertTriggered } from "./KpiAlerts";
import { useWidgetBrokenAlertsQuery } from "../../common/useWidgetBrokenAlertsQuery";
import { invariant } from "ts-invariant";
import { useWidgetSelection } from "../../common/useWidgetSelection";
import {
    dashboardFilterToFilterContextItem,
    getAlertThresholdInfo,
    getKpiAlertResult,
    getKpiResult,
    KpiRenderer,
    stripDateDatasets,
} from "../common";

interface IKpiExecutorProps {
    dashboardRef?: ObjRef;
    kpiWidget: IKpiWidget;
    primaryMeasure: IMeasure;
    secondaryMeasure?: IMeasure<IPoPMeasureDefinition> | IMeasure<IPreviousPeriodMeasureDefinition>;
    alert?: IWidgetAlert;
    /**
     * Filters that should be used for the execution
     */
    effectiveFilters?: IDashboardFilter[];
    /**
     * All filters that are currently set (this is useful for broken alert filters, where we need even
     * the filters ignored for execution)
     */
    allFilters?: IDashboardFilter[];
    onFiltersChange?: (filters: (IDashboardFilter | FilterContextItem)[], resetOthers?: boolean) => void;
    onDrill?: OnFiredDashboardDrillEvent;
    onError?: OnError;
    backend: IAnalyticalBackend;
    workspace: string;
    separators: ISeparators;
    disableDrillUnderline?: boolean;
    isReadOnly?: boolean;
    LoadingComponent?: React.ComponentType<ILoadingProps>;
}

const KpiExecutorCore: React.FC<IKpiExecutorProps> = (props) => {
    const {
        dashboardRef,
        kpiWidget,

        backend,
        workspace,

        primaryMeasure,
        secondaryMeasure,
        effectiveFilters,

        alert,

        separators,
        disableDrillUnderline,
        isReadOnly,

        onDrill,
        onError,
        onFiltersChange,
    } = props;

    const intl = useIntl();

    const kpiWidgetRef = widgetRef(kpiWidget);

    const { error, result, status } = useExecutionDataView(
        {
            backend,
            workspace,
            execution: {
                seriesBy: compact([primaryMeasure, secondaryMeasure]),
                filters: effectiveFilters,
            },
        },
        [primaryMeasure, secondaryMeasure, effectiveFilters, backend, workspace],
    );
    const isLoading = status === "loading" || status === "pending";

    const {
        error: alertExecutionError,
        result: alertExecutionResult,
        status: alertExecutionStatus,
    } = useExecutionDataView(
        {
            backend,
            workspace,
            execution: {
                seriesBy: [primaryMeasure],
                filters: effectiveFilters,
            },
        },
        [primaryMeasure, effectiveFilters, backend, workspace],
    );
    const isAlertExecutionLoading = alertExecutionStatus === "loading" || alertExecutionStatus === "pending";

    const currentUser = useDashboardSelector(selectCurrentUser);
    const canCreateScheduledMail = useDashboardSelector(selectCanCreateScheduledMail);
    const settings = useDashboardSelector(selectSettings);
    const enableCompactSize = useDashboardSelector(selectEnableWidgetCustomHeight);
    const dateFormat = useDashboardSelector(selectDateFormat);

    const drillableItems = useDashboardSelector(selectDrillableItems);
    const widgetDrills = useDashboardSelector(selectValidConfiguredDrillsByWidgetRef(kpiWidgetRef));
    const isAlertDialogOpen = useDashboardSelector(selectIsKpiAlertOpenedByWidgetRef(kpiWidgetRef));
    const isAlertHighlighted = useDashboardSelector(selectIsKpiAlertHighlightedByWidgetRef(kpiWidgetRef));

    const dispatch = useDashboardDispatch();
    const openAlertDialog = useCallback(() => {
        dispatch(uiActions.openKpiAlertDialog(kpiWidgetRef));
    }, [kpiWidgetRef, dispatch]);
    const closeAlertDialog = useCallback(() => {
        dispatch(uiActions.closeKpiAlertDialog());
    }, [dispatch]);

    const { result: brokenAlertsBasicInfo } = useWidgetBrokenAlertsQuery(kpiWidget, alert);

    const isAlertBroken = !!brokenAlertsBasicInfo?.length;

    const executionsHandler = useWidgetExecutionsHandler(widgetRef(kpiWidget));

    useEffect(() => {
        const err = error ?? alertExecutionError;
        if (err) {
            onError?.(err);
        }
        // for executions we care only about KPI errors
        if (error) {
            executionsHandler.onError(error);
        }
    }, [error, alertExecutionError]);

    useEffect(() => {
        if (result) {
            // empty data is considered an error for execution handling
            if (result.rawData().isEmpty()) {
                executionsHandler.onError(new NoDataSdkError());
            } else {
                executionsHandler.onSuccess(result.result());
            }
        }
    }, [result]);

    const handleOnDrill = useCallback(
        (drillContext: IDrillEventContext): ReturnType<OnFiredDashboardDrillEvent> => {
            if (!onDrill) {
                return false;
            }

            return onDrill({
                dataView: result?.dataView as IDataView, // Even invalid Kpi can be drillable
                drillContext,
                drillDefinitions: kpiWidget.drills,
                widgetRef: widgetRef(kpiWidget),
            });
        },
        [onDrill, result, kpiWidget],
    );

    const kpiAlertOperations = useKpiAlertOperations(closeAlertDialog);
    const canSetAlert = canCreateScheduledMail;

    const { onRequestAsyncRender, onResolveAsyncRender } = useDashboardAsyncRender(
        objRefToString(widgetRef(kpiWidget)),
    );

    useEffect(() => {
        if (isLoading) {
            onRequestAsyncRender();
        } else {
            onResolveAsyncRender();
        }
        executionsHandler.onLoadingChanged({ isLoading: !!isLoading });
    }, [isLoading, onRequestAsyncRender, onResolveAsyncRender]);

    const { kpiAlertDialogClosed, kpiAlertDialogOpened } = useDashboardUserInteraction();

    const kpiResult = getKpiResult(result, primaryMeasure, secondaryMeasure, separators);
    const kpiAlertResult = getKpiAlertResult(alertExecutionResult, primaryMeasure, separators);
    const { isThresholdRepresentingPercent, thresholdPlaceholder } = useMemo(
        () => getAlertThresholdInfo(kpiResult, intl),
        [kpiResult, intl],
    );

    const predicates = convertDrillableItemsToPredicates(drillableItems);
    const isDrillable =
        (kpiResult?.measureDescriptor &&
            result &&
            isSomeHeaderPredicateMatched(predicates, kpiResult.measureDescriptor, result)) ||
        widgetDrills.length > 0;

    const alertSavingStatus =
        kpiAlertOperations.creatingStatus === "inProgress" ||
        kpiAlertOperations.updatingStatus === "inProgress"
            ? "inProgress"
            : kpiAlertOperations.creatingStatus === "error" || kpiAlertOperations.updatingStatus === "error"
            ? "error"
            : "idle";

    const { isSelectable, isSelected, onSelected } = useWidgetSelection(kpiWidgetRef);

    return (
        <DashboardItemWithKpiAlert
            kpi={kpiWidget}
            alert={alert}
            filters={effectiveFilters}
            userWorkspaceSettings={settings as IUserWorkspaceSettings}
            kpiResult={kpiResult}
            renderHeadline={(clientHeight) => (
                <DashboardItemHeadline title={kpiWidget.title} clientHeight={clientHeight} />
            )}
            kpiAlertResult={kpiAlertResult}
            canSetAlert={canSetAlert}
            isReadOnlyMode={isReadOnly}
            alertExecutionError={
                alertExecutionError ??
                /*
                 * if alert is broken, behave as if its execution yielded no data (which is true, we do not execute it)
                 * context: the problem is alerts on KPIs without dateDataset, their date filters are invalid
                 * and we have no idea what date dataset to put there hence it is sometimes impossible
                 * to execute them (unlike KPI Dashboards, we do not have the guarantee that there is a date
                 * filter in the filters)
                 */
                (isAlertBroken ? new NoDataSdkError() : undefined)
            }
            isLoading={isLoading}
            isAlertLoading={false /* alerts are always loaded at this point */}
            isAlertExecutionLoading={isAlertExecutionLoading}
            isAlertBroken={isAlertBroken}
            isAlertDialogOpen={isAlertDialogOpen}
            isAlertHighlighted={isAlertHighlighted}
            onAlertDialogOpenClick={() => {
                kpiAlertDialogOpened(!!alert);
                openAlertDialog();
            }}
            renderAlertDialog={() => (
                <KpiAlertDialogWrapper
                    alert={alert}
                    dateFormat={dateFormat!}
                    userEmail={currentUser.email!}
                    onAlertDialogCloseClick={() => {
                        kpiAlertDialogClosed();
                        closeAlertDialog();
                    }}
                    onAlertDialogDeleteClick={() => {
                        kpiAlertOperations.onRemoveAlert(alert!);
                    }}
                    onAlertDialogSaveClick={(threshold, whenTriggered) => {
                        if (alert) {
                            return kpiAlertOperations.onUpdateAlert({
                                ...alert,
                                threshold,
                                whenTriggered,
                                isTriggered: evaluateAlertTriggered(
                                    kpiAlertResult!.measureResult,
                                    threshold,
                                    whenTriggered,
                                ),
                            });
                        }

                        // alerts are not possible when the dashboard is not yet persisted. if the code bombs here
                        // then it means we use view-mode KPI widget in edit-mode dashboard - there is a configuration
                        // customization error somewhere.
                        invariant(dashboardRef, "attempting to create alert of an unsaved dashboard");

                        return kpiAlertOperations.onCreateAlert({
                            dashboard: dashboardRef,
                            widget: kpiWidgetRef,
                            threshold,
                            whenTriggered,
                            isTriggered: evaluateAlertTriggered(
                                kpiResult?.measureResult ?? 0,
                                threshold,
                                whenTriggered,
                            ),
                            filterContext: {
                                title: "filterContext",
                                description: "",
                                filters:
                                    effectiveFilters
                                        ?.map(dashboardFilterToFilterContextItem)
                                        .map(stripDateDatasets) ?? [],
                            },
                            description: "",
                            title: "",
                        });
                    }}
                    onAlertDialogUpdateClick={() => {
                        return kpiAlertOperations.onUpdateAlert({
                            ...alert!,
                            // evaluate triggered as if the alert already used the correct filters (i.e. use the KPI execution itself)
                            isTriggered: evaluateAlertTriggered(
                                kpiResult?.measureResult ?? 0,
                                alert!.threshold,
                                alert!.whenTriggered,
                            ),
                            // change the filters to the filters currently used by the KPI
                            filterContext: {
                                ...alert!.filterContext!,
                                filters:
                                    effectiveFilters
                                        ?.map(dashboardFilterToFilterContextItem)
                                        .map(stripDateDatasets) ?? [],
                            },
                        });
                    }}
                    onApplyAlertFiltersClick={
                        onFiltersChange
                            ? () =>
                                  onFiltersChange(
                                      filterContextItemsToDashboardFiltersByWidget(
                                          alert?.filterContext?.filters ?? [],
                                          kpiWidget,
                                      ),
                                      true,
                                  )
                            : undefined
                    }
                    isAlertLoading={isAlertExecutionLoading}
                    alertDeletingStatus={kpiAlertOperations.removingStatus}
                    alertSavingStatus={alertSavingStatus}
                    alertUpdatingStatus={alertSavingStatus}
                    filters={effectiveFilters}
                    isThresholdRepresentingPercent={isThresholdRepresentingPercent}
                    thresholdPlaceholder={thresholdPlaceholder}
                    brokenAlertFiltersBasicInfo={brokenAlertsBasicInfo!}
                    backend={backend}
                    workspace={workspace}
                />
            )}
            alertDeletingStatus={kpiAlertOperations.removingStatus}
            alertSavingStatus={alertSavingStatus}
            isSelectable={isSelectable}
            isSelected={isSelected}
            onSelected={onSelected}
        >
            {() => {
                return (
                    <KpiRenderer
                        kpi={kpiWidget}
                        kpiResult={kpiResult}
                        filters={effectiveFilters ?? []}
                        disableDrillUnderline={disableDrillUnderline}
                        isDrillable={isDrillable}
                        onDrill={onDrill && handleOnDrill}
                        separators={separators}
                        enableCompactSize={enableCompactSize}
                        error={error}
                        errorHelp={intl.formatMessage({ id: "kpi.error.view" })}
                        isLoading={isLoading}
                    />
                );
            }}
        </DashboardItemWithKpiAlert>
    );
};

/**
 * Executes the given measures and displays them as KPI
 * @internal
 */
export const KpiExecutor = memo(KpiExecutorCore);
