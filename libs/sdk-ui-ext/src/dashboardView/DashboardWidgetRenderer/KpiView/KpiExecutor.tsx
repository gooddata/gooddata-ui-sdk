// (C) 2020 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
import { injectIntl, IntlShape, WrappedComponentProps } from "react-intl";
import compact from "lodash/compact";
import isNil from "lodash/isNil";
import isNumber from "lodash/isNumber";
import round from "lodash/round";
import {
    IAnalyticalBackend,
    IKpiWidget,
    IKpiWidgetDefinition,
    ISeparators,
    IWidgetAlert,
    IWidgetAlertDefinition,
} from "@gooddata/sdk-backend-spi";
import {
    IMeasure,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    isMeasureFormatInPercent,
    ObjRef,
} from "@gooddata/sdk-model";
import {
    convertDrillableItemsToPredicates,
    createNumberJsFormatter,
    DataViewFacade,
    ErrorComponent as DefaultError,
    IDataSeries,
    ExplicitDrill,
    IDrillEventContext,
    IErrorProps,
    ILoadingProps,
    isNoDataSdkError,
    isSomeHeaderPredicateMatched,
    LoadingComponent as DefaultLoading,
    NoDataSdkError,
    OnError,
    useDataView,
    useExecution,
} from "@gooddata/sdk-ui";

import { filterContextItemsToFiltersForWidget, filterContextToFiltersForWidget } from "../../converters";
import { useCurrentUser, useUserWorkspacePermissions } from "../../hooks/internal";
import {
    DashboardItemHeadline,
    DashboardItemWithKpiAlert,
    evaluateAlertTriggered,
    getBrokenAlertFiltersBasicInfo,
    IKpiAlertResult,
    IKpiResult,
    dashboardFilterToFilterContextItem,
    stripDateDatasets,
} from "../../../internal";
import { useUserWorkspaceSettings } from "../../contexts";
import { OnFiredDashboardViewDrillEvent, IDashboardFilter } from "../../types";

import {
    IUseAlertManipulationHandlerConfig,
    useAlertDeleteHandler,
    useAlertSaveOrUpdateHandler,
} from "./alertManipulationHooks";
import { KpiRenderer } from "./KpiRenderer";
import { KpiAlertDialogWrapper } from "./KpiAlertDialogWrapper";

interface IKpiExecutorProps {
    dashboardRef: ObjRef;
    kpiWidget: IKpiWidget | IKpiWidgetDefinition;
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
    onFiltersChange?: (filters: IDashboardFilter[]) => void;
    drillableItems?: ExplicitDrill[];
    onDrill?: OnFiredDashboardViewDrillEvent;
    onError?: OnError;
    backend: IAnalyticalBackend;
    workspace: string;
    separators: ISeparators;
    disableDrillUnderline?: boolean;
    isReadOnly?: boolean;
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
}

const KpiExecutorCore: React.FC<IKpiExecutorProps & WrappedComponentProps> = ({
    dashboardRef,
    kpiWidget,
    primaryMeasure,
    secondaryMeasure,
    alert,
    allFilters,
    effectiveFilters,
    onFiltersChange,
    drillableItems,
    onDrill,
    onError,
    backend,
    workspace,
    separators,
    disableDrillUnderline,
    intl,
    isReadOnly,
    ErrorComponent = DefaultError,
    LoadingComponent = DefaultLoading,
}) => {
    const execution = useExecution({
        seriesBy: compact([primaryMeasure, secondaryMeasure]),
        filters: effectiveFilters,
        backend,
        workspace,
    });

    const { error, result, status } = useDataView({ execution, onError }, [execution.fingerprint()]);

    const userWorkspaceSettings = useUserWorkspaceSettings();

    const brokenAlertsBasicInfo = useMemo(
        () => (alert ? getBrokenAlertFiltersBasicInfo(alert, kpiWidget, allFilters) : undefined),
        [alert, kpiWidget, allFilters],
    );

    const isAlertBroken = !!brokenAlertsBasicInfo?.length;

    const alertExecution = useExecution({
        seriesBy: [primaryMeasure],
        filters: alert
            ? filterContextToFiltersForWidget(alert.filterContext, kpiWidget) ?? []
            : effectiveFilters,
        backend,
        workspace,
    });

    const {
        error: alertError,
        result: alertResult,
        status: alertStatus,
    } = useDataView(
        {
            execution: alert && !isAlertBroken ? alertExecution : null, // no need to execute broken alerts, the data is not shown anyway
            onError,
        },
        [alert, alertExecution.fingerprint()],
    );

    const handleOnDrill = useCallback(
        (drillContext: IDrillEventContext): ReturnType<OnFiredDashboardViewDrillEvent> => {
            if (!onDrill || !result) {
                return false;
            }

            // only return the definitions if there are no custom-specified drillableItems
            // if there are, we assume it was the custom drill
            const drillDefinitions =
                !drillableItems?.length && kpiWidget.drills.length > 0 ? kpiWidget.drills : undefined;

            return onDrill({
                dataView: result.dataView,
                drillContext,
                drillDefinitions,
                widgetRef: kpiWidget.ref,
            });
        },
        [onDrill, result],
    );

    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const closeAlertDialog = () => setIsAlertDialogOpen(false);

    const alertManipulationHandlerConfig: IUseAlertManipulationHandlerConfig = {
        backend,
        workspace,
        closeAlertDialog,
    };
    const { alertDeletingStatus, deleteAlert } = useAlertDeleteHandler(alertManipulationHandlerConfig);
    const { alertSavingStatus, saveOrUpdateAlert } = useAlertSaveOrUpdateHandler(
        alertManipulationHandlerConfig,
    );

    const { result: currentUser } = useCurrentUser({ backend });
    const { result: permissions } = useUserWorkspacePermissions({ backend, workspace });
    const canSetAlert = permissions?.canCreateScheduledMail;

    if (status === "loading" || status === "pending") {
        return <LoadingComponent />;
    }

    const kpiResult = getKpiResult(result, primaryMeasure, secondaryMeasure, separators);
    const kpiAlertResult = getKpiAlertResult(alertResult, primaryMeasure, separators);
    const { isThresholdRepresentingPercent, thresholdPlaceholder } = getAlertThresholdInfo(kpiResult, intl);

    const predicates = drillableItems ? convertDrillableItemsToPredicates(drillableItems) : [];
    const isDrillable =
        status !== "error" &&
        (kpiWidget.drills.length > 0 ||
            isSomeHeaderPredicateMatched(predicates, kpiResult.measureDescriptor, result));

    const enableCompactSize = userWorkspaceSettings.enableKDWidgetCustomHeight;

    return (
        <DashboardItemWithKpiAlert
            kpi={kpiWidget}
            alert={alert}
            filters={effectiveFilters}
            userWorkspaceSettings={userWorkspaceSettings}
            kpiResult={kpiResult}
            renderHeadline={(clientHeight) => (
                <DashboardItemHeadline title={kpiWidget.title} clientHeight={clientHeight} />
            )}
            kpiAlertResult={kpiAlertResult}
            canSetAlert={canSetAlert}
            isReadOnlyMode={isReadOnly}
            alertExecutionError={
                alertError ??
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
            isAlertExecutionLoading={alertStatus === "loading"}
            isAlertBroken={isAlertBroken}
            isAlertDialogOpen={isAlertDialogOpen}
            onAlertDialogOpenClick={() => setIsAlertDialogOpen(true)}
            renderAlertDialog={() => (
                <KpiAlertDialogWrapper
                    alert={alert}
                    dateFormat={userWorkspaceSettings.responsiveUiDateFormat}
                    userEmail={currentUser?.email}
                    onAlertDialogCloseClick={() => setIsAlertDialogOpen(false)}
                    onAlertDialogDeleteClick={() => deleteAlert(alert)}
                    onAlertDialogSaveClick={(threshold, whenTriggered) => {
                        const toSave: IWidgetAlertDefinition = alert
                            ? {
                                  ...alert,
                                  threshold,
                                  whenTriggered,
                                  isTriggered: evaluateAlertTriggered(
                                      kpiAlertResult.measureResult,
                                      threshold,
                                      whenTriggered,
                                  ),
                              }
                            : {
                                  dashboard: dashboardRef,
                                  widget: kpiWidget.ref,
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
                                      filters: effectiveFilters
                                          .map(dashboardFilterToFilterContextItem)
                                          .map(stripDateDatasets),
                                  },
                                  description: "",
                                  title: "",
                              };
                        saveOrUpdateAlert(toSave);
                    }}
                    onAlertDialogUpdateClick={() => {
                        saveOrUpdateAlert({
                            ...alert,
                            // evaluate triggered as if the alert already used the correct filters (i.e. use the KPI execution itself)
                            isTriggered: evaluateAlertTriggered(
                                kpiResult?.measureResult ?? 0,
                                alert.threshold,
                                alert.whenTriggered,
                            ),
                            // change the filters to the filters currently used by the KPI
                            filterContext: {
                                ...alert.filterContext,
                                filters: effectiveFilters
                                    .map(dashboardFilterToFilterContextItem)
                                    .map(stripDateDatasets),
                            },
                        });
                    }}
                    onApplyAlertFiltersClick={
                        onFiltersChange
                            ? () =>
                                  onFiltersChange(
                                      filterContextItemsToFiltersForWidget(
                                          alert.filterContext?.filters ?? [],
                                          kpiWidget,
                                      ),
                                  )
                            : undefined
                    }
                    isAlertLoading={alertStatus === "loading"}
                    alertDeletingStatus={alertDeletingStatus}
                    alertSavingStatus={alertSavingStatus}
                    alertUpdatingStatus={alertSavingStatus} // since alert updating is realized by saving in SDK, we can use the same status
                    filters={effectiveFilters}
                    isThresholdRepresentingPercent={isThresholdRepresentingPercent}
                    thresholdPlaceholder={thresholdPlaceholder}
                    brokenAlertFiltersBasicInfo={brokenAlertsBasicInfo}
                    backend={backend}
                    workspace={workspace}
                />
            )}
            alertDeletingStatus={alertDeletingStatus}
            alertSavingStatus={alertSavingStatus}
        >
            {() => {
                if (status === "error" && !isNoDataSdkError(error)) {
                    return <ErrorComponent message={(error as Error).message} />;
                }
                return (
                    <KpiRenderer
                        kpi={kpiWidget}
                        kpiResult={kpiResult}
                        filters={effectiveFilters}
                        disableDrillUnderline={disableDrillUnderline}
                        isDrillable={isDrillable}
                        onDrill={onDrill && handleOnDrill}
                        separators={separators}
                        enableCompactSize={enableCompactSize}
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
export const KpiExecutor = injectIntl(KpiExecutorCore);

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
              measureResult: getSeriesResult(primarySeries),
              measureForComparisonResult: getSeriesResult(secondarySeries),
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
              measureFormat: alertSeries.firstForMeasure(primaryMeasure).measureFormat(),
              measureResult: getSeriesResult(alertSeries.firstForMeasure(primaryMeasure)),
          }
        : undefined;
}

function getAlertThresholdInfo(kpiResult: IKpiResult | undefined, intl: IntlShape) {
    const isThresholdRepresentingPercent = kpiResult
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
