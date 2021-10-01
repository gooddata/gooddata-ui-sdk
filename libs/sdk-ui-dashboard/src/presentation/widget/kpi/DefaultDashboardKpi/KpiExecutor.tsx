// (C) 2020 GoodData Corporation
import React, { useCallback, useEffect, useState } from "react";
import { injectIntl, IntlShape, WrappedComponentProps } from "react-intl";
import compact from "lodash/compact";
import isEqual from "lodash/isEqual";
import isNil from "lodash/isNil";
import isNumber from "lodash/isNumber";
import flowRight from "lodash/flowRight";
import round from "lodash/round";
import {
    FilterContextItem,
    IAnalyticalBackend,
    IKpiWidget,
    ISeparators,
    IUserWorkspaceSettings,
    IWidgetAlert,
    widgetRef,
} from "@gooddata/sdk-backend-spi";
import {
    IMeasure,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    isMeasureFormatInPercent,
    measureLocalId,
    ObjRef,
    objRefToString,
} from "@gooddata/sdk-model";
import {
    convertDrillableItemsToPredicates,
    createNumberJsFormatter,
    DataViewFacade,
    GoodDataSdkError,
    IDataSeries,
    IDrillEventContext,
    ILoadingProps,
    isSomeHeaderPredicateMatched,
    NoDataSdkError,
    OnError,
    withBackend,
    withExecution,
} from "@gooddata/sdk-ui";

import { filterContextItemsToFiltersForWidget } from "../../../../converters";
import {
    selectPermissions,
    selectSettings,
    selectUser,
    useDashboardAsyncRender,
    useDashboardSelector,
    useDashboardUserInteraction,
    selectDisableDefaultDrills,
    selectDrillableItems,
    useWidgetExecutionsHandler,
} from "../../../../model";
import { DashboardItemHeadline } from "../../../presentationComponents";
import { IDashboardFilter, OnFiredDashboardViewDrillEvent } from "../../../../types";

import { KpiRenderer } from "./KpiRenderer";
import { KpiAlertDialogWrapper } from "./KpiAlertDialogWrapper";
import { useKpiAlertOperations } from "./useKpiAlertOperations";
import { IKpiAlertResult, IKpiResult } from "./types";
import { DashboardItemWithKpiAlert, evaluateAlertTriggered } from "./KpiAlerts";
import { dashboardFilterToFilterContextItem, stripDateDatasets } from "./utils/filterUtils";
import { useWidgetBrokenAlertsQuery } from "../../common/useWidgetBrokenAlertsQuery";
import { invariant } from "ts-invariant";

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
    onDrill?: OnFiredDashboardViewDrillEvent;
    onError?: OnError;
    backend: IAnalyticalBackend;
    workspace: string;
    separators: ISeparators;
    disableDrillUnderline?: boolean;
    isReadOnly?: boolean;
    LoadingComponent?: React.ComponentType<ILoadingProps>;
}

interface IKpiResultsProps {
    backend: IAnalyticalBackend;
    result?: DataViewFacade;
    error?: GoodDataSdkError;
    isLoading?: boolean;
    alertExecutionResult?: DataViewFacade;
    alertExecutionError?: GoodDataSdkError;
    isAlertExecutionLoading?: boolean;
}

type IKpiProps = IKpiResultsProps & IKpiExecutorProps & WrappedComponentProps;

const KpiExecutorCore: React.FC<IKpiProps> = (props) => {
    const {
        backend,
        workspace,
        dashboardRef,
        kpiWidget,
        primaryMeasure,
        secondaryMeasure,
        separators,
        effectiveFilters,
        result,
        alert,
        alertExecutionResult,
        error,
        alertExecutionError,
        isLoading,
        isAlertExecutionLoading,
        onDrill,
        onError,
        onFiltersChange,
        isReadOnly,
        disableDrillUnderline,
        intl,
    } = props;

    const currentUser = useDashboardSelector(selectUser);
    const permissions = useDashboardSelector(selectPermissions);
    const settings = useDashboardSelector(selectSettings);
    const drillableItems = useDashboardSelector(selectDrillableItems);
    const disableDefaultDrills = useDashboardSelector(selectDisableDefaultDrills);

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
        (drillContext: IDrillEventContext): ReturnType<OnFiredDashboardViewDrillEvent> => {
            if (!onDrill || !result) {
                return false;
            }

            return onDrill({
                dataView: result.dataView,
                drillContext,
                drillDefinitions: kpiWidget.drills,
                widgetRef: widgetRef(kpiWidget),
            });
        },
        [onDrill, result, kpiWidget],
    );

    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const closeAlertDialog = () => setIsAlertDialogOpen(false);
    const kpiAlertOperations = useKpiAlertOperations(closeAlertDialog);
    const canSetAlert = permissions?.canCreateScheduledMail;

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

    const kpiResult = !result?.dataView.totalCount[0]
        ? getNoDataKpiResult(result, primaryMeasure)
        : getKpiResult(result, primaryMeasure, secondaryMeasure, separators);
    const kpiAlertResult = getKpiAlertResult(alertExecutionResult, primaryMeasure, separators);
    const { isThresholdRepresentingPercent, thresholdPlaceholder } = getAlertThresholdInfo(kpiResult, intl);

    const predicates = convertDrillableItemsToPredicates(drillableItems);
    const isDrillable =
        kpiResult &&
        kpiResult?.measureDescriptor &&
        result &&
        status !== "error" &&
        (disableDefaultDrills
            ? isSomeHeaderPredicateMatched(predicates, kpiResult.measureDescriptor, result)
            : kpiWidget.drills.length > 0 ||
              isSomeHeaderPredicateMatched(predicates, kpiResult.measureDescriptor, result));

    const enableCompactSize = settings.enableKDWidgetCustomHeight;

    const alertSavingStatus =
        kpiAlertOperations.creatingStatus === "inProgress" ||
        kpiAlertOperations.updatingStatus === "inProgress"
            ? "inProgress"
            : kpiAlertOperations.creatingStatus === "error" || kpiAlertOperations.updatingStatus === "error"
            ? "error"
            : "idle";

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
            isLoading={false /* content is always loaded at this point */}
            isAlertLoading={false /* alerts are always loaded at this point */}
            isAlertExecutionLoading={isAlertExecutionLoading}
            isAlertBroken={isAlertBroken}
            isAlertDialogOpen={isAlertDialogOpen}
            onAlertDialogOpenClick={() => {
                kpiAlertDialogOpened(!!alert);
                setIsAlertDialogOpen(true);
            }}
            renderAlertDialog={() => (
                <KpiAlertDialogWrapper
                    alert={alert}
                    dateFormat={settings.responsiveUiDateFormat!}
                    userEmail={currentUser.email!}
                    onAlertDialogCloseClick={() => {
                        kpiAlertDialogClosed();
                        setIsAlertDialogOpen(false);
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
                            widget: widgetRef(kpiWidget),
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
                                      filterContextItemsToFiltersForWidget(
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
export const KpiExecutor = flowRight(
    injectIntl,
    withBackend,
    withExecution({
        execution: (props: IKpiExecutorProps) => {
            const { backend, workspace, effectiveFilters, primaryMeasure } = props;

            return backend.workspace(workspace).execution().forItems([primaryMeasure], effectiveFilters);
        },
        exportTitle: "",
        loadOnMount: true,
        shouldRefetch: (prevProps, nextProps) => {
            return (
                prevProps.alert !== nextProps.alert ||
                !isEqual(prevProps.primaryMeasure, nextProps.primaryMeasure) ||
                !isEqual(prevProps.effectiveFilters, nextProps.effectiveFilters)
            );
        },
    }),
    (WrappedComponent: React.ComponentType<Partial<IKpiProps>>) => {
        const withAlertProps = ({ result, error, isLoading, ...props }: IKpiResultsProps) => (
            <WrappedComponent
                alertExecutionResult={result}
                alertExecutionError={error}
                isAlertExecutionLoading={isLoading}
                {...props}
            />
        );
        return withAlertProps;
    },
    withExecution({
        execution: (props: IKpiProps) => {
            const { backend, workspace, primaryMeasure, secondaryMeasure, effectiveFilters } = props;

            return backend
                .workspace(workspace)
                .execution()
                .forItems(compact([primaryMeasure, secondaryMeasure]), effectiveFilters);
        },
        exportTitle: "",
        loadOnMount: true,
        shouldRefetch: (prevProps, nextProps) => {
            return (
                !isEqual(prevProps.primaryMeasure, nextProps.primaryMeasure) ||
                !isEqual(prevProps.secondaryMeasure, nextProps.secondaryMeasure) ||
                !isEqual(prevProps.effectiveFilters, nextProps.effectiveFilters)
            );
        },
    }),
)(KpiExecutorCore);

function getSeriesResult(series: IDataSeries | undefined): number | null {
    if (!series) {
        return null;
    }

    const value = series.dataPoints()[0].rawValue;

    if (isNil(value)) {
        return null;
    }

    if (isNumber(value)) {
        return value;
    }

    return Number.parseFloat(value);
}

function getNoDataKpiResult(
    result: DataViewFacade | undefined,
    primaryMeasure: IMeasure,
): IKpiResult | undefined {
    if (!result) {
        return;
    }

    return {
        measureDescriptor: undefined,
        measureFormat: result.meta().measureDescriptor(measureLocalId(primaryMeasure))?.measureHeaderItem
            ?.format,
        measureResult: undefined,
        measureForComparisonResult: undefined,
    };
}

function getKpiResult(
    result: DataViewFacade | undefined,
    primaryMeasure: IMeasure,
    secondaryMeasure:
        | IMeasure<IPoPMeasureDefinition>
        | IMeasure<IPreviousPeriodMeasureDefinition>
        | undefined,
    separators: ISeparators,
): IKpiResult | undefined {
    const series = result?.data({ valueFormatter: createNumberJsFormatter(separators) }).series();
    const primarySeries = series?.firstForMeasure(primaryMeasure);
    const secondarySeries = secondaryMeasure ? series?.firstForMeasure(secondaryMeasure) : undefined;

    return primarySeries
        ? {
              measureDescriptor: primarySeries.descriptor.measureDescriptor,
              measureFormat: primarySeries.measureFormat(),
              measureResult: getSeriesResult(primarySeries)!,
              measureForComparisonResult: getSeriesResult(secondarySeries)!,
          }
        : undefined;
}

function getKpiAlertResult(
    result: DataViewFacade | undefined,
    primaryMeasure: IMeasure,
    separators: ISeparators,
): IKpiAlertResult | undefined {
    const alertSeries = result?.data({ valueFormatter: createNumberJsFormatter(separators) }).series();
    return alertSeries
        ? {
              measureFormat: alertSeries.count
                  ? alertSeries.firstForMeasure(primaryMeasure).measureFormat()
                  : undefined,
              measureResult: alertSeries.count
                  ? getSeriesResult(alertSeries.firstForMeasure(primaryMeasure))!
                  : 0,
          }
        : undefined;
}

function getAlertThresholdInfo(kpiResult: IKpiResult | undefined, intl: IntlShape) {
    const isThresholdRepresentingPercent = kpiResult?.measureFormat
        ? isMeasureFormatInPercent(kpiResult.measureFormat)
        : false;

    const value = round(kpiResult?.measureResult || 0, 2); // sure about rounding?
    const thresholdPlaceholder = isThresholdRepresentingPercent
        ? `${intl.formatMessage({ id: "kpi.alertBox.example" })} ${value * 100}`
        : `${intl.formatMessage({ id: "kpi.alertBox.example" })} ${value}`; // TODO fix floating point multiply

    return {
        isThresholdRepresentingPercent,
        thresholdPlaceholder,
    };
}
