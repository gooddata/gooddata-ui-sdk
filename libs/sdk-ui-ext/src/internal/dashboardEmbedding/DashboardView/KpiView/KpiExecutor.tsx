// (C) 2020 GoodData Corporation
import React, { useCallback, useState } from "react";
import {
    IAnalyticalBackend,
    IWidgetAlert,
    ISeparators,
    IWidgetDefinition,
    IWidgetAlertDefinition,
} from "@gooddata/sdk-backend-spi";
import {
    IFilter,
    IMeasure,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    ObjRef,
} from "@gooddata/sdk-model";
import {
    useExecution,
    useDataView,
    IErrorProps,
    ILoadingProps,
    ErrorComponent as DefaultError,
    LoadingComponent as DefaultLoading,
    IDrillableItem,
    IHeaderPredicate,
    OnFiredDrillEvent,
    IDrillEventContext,
    convertDrillableItemsToPredicates,
    isSomeHeaderPredicateMatched,
    OnError,
    createNumberJsFormatter,
    IDataSeries,
    NoDataSdkError,
    isNoDataSdkError,
} from "@gooddata/sdk-ui";
import compact from "lodash/compact";
import isNil from "lodash/isNil";
import isNumber from "lodash/isNumber";
import noop from "lodash/noop";
import round from "lodash/round";
import { KpiRenderer } from "./KpiRenderer";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IKpiResult, IKpiAlertResult } from "../../types";
import { DashboardItemWithKpiAlert } from "../../KpiAlerts/DashboardItemWithKpiAlert";
import { DashboardItemHeadline } from "../../DashboardItem/DashboardItemHeadline";
import { useUserWorkspaceSettings } from "../UserWorkspaceSettingsContext";
import { filterContextToFiltersForWidget } from "../../converters";
import { getBrokenAlertFiltersBasicInfo } from "../../KpiAlerts/KpiAlertDialog/utils/brokenFilterUtils";
import KpiAlertDialog from "../../KpiAlerts/KpiAlertDialog/KpiAlertDialog";
import { useAlertDeleteHandler } from "./alertManipulationHooks/useAlertDeleteHandler";
import { useAlertSaveOrUpdateHandler } from "./alertManipulationHooks/useAlertSaveOrUpdateHandler";
import { evaluateTriggered } from "../../KpiAlerts/utils/alertThresholdUtils";
import { dashboardFilterToFilterContextItem } from "../../utils/filters";
import { IUseAlertManipulationHandlerConfig } from "./alertManipulationHooks/types";
import { isMetricFormatInPercent } from "../../utils/format";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useUserWorkspacePermissions } from "../../hooks/useUserWorkspacePermissions";

interface IKpiExecutorProps {
    dashboardRef: ObjRef;
    kpiWidget: IWidgetDefinition;
    primaryMeasure: IMeasure;
    secondaryMeasure?: IMeasure<IPoPMeasureDefinition> | IMeasure<IPreviousPeriodMeasureDefinition>;
    alert?: IWidgetAlert;
    filters?: IFilter[];
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnFiredDrillEvent;
    onError?: OnError;
    backend: IAnalyticalBackend;
    workspace: string;
    separators: ISeparators;
    disableDrillUnderline?: boolean;
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
}

/**
 * Executes the given measures and displays them as KPI
 * @internal
 */
export const KpiExecutorCore: React.FC<IKpiExecutorProps & WrappedComponentProps> = ({
    dashboardRef,
    kpiWidget,
    primaryMeasure,
    secondaryMeasure,
    alert,
    filters,
    drillableItems,
    onDrill,
    onError,
    backend,
    workspace,
    separators,
    disableDrillUnderline,
    intl,
    ErrorComponent = DefaultError,
    LoadingComponent = DefaultLoading,
}) => {
    const execution = useExecution({
        seriesBy: compact([primaryMeasure, secondaryMeasure]),
        filters,
        backend,
        workspace,
    });

    const { error, result, status } = useDataView({ execution, onError }, [execution.fingerprint()]);

    // TODO move?
    const brokenAlertsInfo = alert ? getBrokenAlertFiltersBasicInfo(alert, kpiWidget, filters) : undefined;
    const isAlertBroken = !!brokenAlertsInfo?.length;

    const alertExecution = useExecution({
        seriesBy: [primaryMeasure],
        filters: alert ? filterContextToFiltersForWidget(alert.filterContext, kpiWidget) ?? [] : filters,
        backend,
        workspace,
    });

    const { error: alertError, result: alertResult, status: alertStatus } = useDataView(
        {
            execution: alert && !isAlertBroken ? alertExecution : null, // no need to execute broken alerts, the data is not shown anyway
            onError,
        },
        [alert, alertExecution.fingerprint()],
    );

    const userWorkspaceSettings = useUserWorkspaceSettings();

    const handleOnDrill = useCallback(
        (drillContext: IDrillEventContext): ReturnType<OnFiredDrillEvent> => {
            if (!onDrill || !result) {
                return false;
            }

            return onDrill({
                dataView: result.dataView,
                drillContext,
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
    const isReadonlyMode = false; // TODO we need to support proper read only mode for live examples with proxy

    if (status === "loading" || status === "pending") {
        return <LoadingComponent />;
    }

    const series = result?.data({ valueFormatter: createNumberJsFormatter(separators) }).series();
    const primarySeries = series?.firstForMeasure(primaryMeasure);
    const secondarySeries = secondaryMeasure ? series?.firstForMeasure(secondaryMeasure) : undefined;

    const kpiResult: IKpiResult | undefined = primarySeries
        ? {
              measureDescriptor: primarySeries.descriptor.measureDescriptor,
              measureFormat: primarySeries.measureFormat(),
              measureResult: getSeriesResult(primarySeries),
              measureForComparisonResult: getSeriesResult(secondarySeries),
          }
        : undefined;

    const alertSeries = alertResult?.data({ valueFormatter: createNumberJsFormatter(separators) }).series();
    const kpiAlertResult: IKpiAlertResult | undefined = alertSeries
        ? {
              measureFormat: alertSeries.firstForMeasure(primaryMeasure).measureFormat(),
              measureResult: getSeriesResult(alertSeries.firstForMeasure(primaryMeasure)),
          }
        : undefined;

    const isThresholdRepresentingPercent = kpiResult
        ? isMetricFormatInPercent(kpiResult.measureFormat)
        : false;
    const value = round(kpiResult?.measureResult || 0, 2); // sure about rounding?
    const thresholdPlaceholder = isThresholdRepresentingPercent
        ? `${intl.formatMessage({ id: "kpi.alertBox.example" })} ${value * 100}`
        : `${intl.formatMessage({ id: "kpi.alertBox.example" })} ${value}`; // TODO fix floating point multiply

    const predicates = drillableItems ? convertDrillableItemsToPredicates(drillableItems) : [];
    const isDrillable =
        status !== "error" &&
        (kpiWidget.drills.length > 0 ||
            isSomeHeaderPredicateMatched(predicates, primarySeries.descriptor.measureDescriptor, result));

    return (
        <DashboardItemWithKpiAlert
            kpi={kpiWidget}
            alert={alert}
            filters={filters}
            userWorkspaceSettings={userWorkspaceSettings}
            kpiResult={kpiResult}
            renderHeadline={() => <DashboardItemHeadline title={kpiWidget.title} />}
            kpiAlertResult={kpiAlertResult}
            canSetAlert={canSetAlert}
            isReadOnlyMode={isReadonlyMode}
            alertExecutionError={
                alertError ||
                // TODO get rid of this hack, detect broken alerts differently
                // (the problem is alerts on KPIs without dateDataset, their date filters are invalid and we have no idea what date dataset to put there)
                (isAlertBroken ? new NoDataSdkError() : undefined)
            }
            isAlertLoading={false /* alerts are always loaded at this point */}
            isAlertExecutionLoading={alertStatus === "loading"}
            isAlertBroken={isAlertBroken}
            isAlertDialogOpen={isAlertDialogOpen}
            onAlertDialogOpenClick={() => setIsAlertDialogOpen(true)}
            renderAlertDialog={() => (
                <KpiAlertDialog
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
                                  isTriggered: evaluateTriggered(
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
                                  isTriggered: evaluateTriggered(
                                      kpiResult?.measureResult ?? 0,
                                      threshold,
                                      whenTriggered,
                                  ),
                                  filterContext: {
                                      title: "filterContext",
                                      description: "",
                                      filters: filters.map(dashboardFilterToFilterContextItem),
                                  },
                                  description: "",
                                  title: "",
                              };
                        saveOrUpdateAlert(toSave);
                    }}
                    onAlertDialogUpdateClick={noop as any}
                    onApplyAlertFiltersClick={noop as any}
                    isAlertLoading={alertStatus === "loading"}
                    alertDeletingStatus={alertDeletingStatus}
                    alertSavingStatus={alertSavingStatus}
                    filters={filters}
                    isThresholdRepresentingPercent={isThresholdRepresentingPercent}
                    thresholdPlaceholder={thresholdPlaceholder}
                />
            )}
            alertDeletingStatus={alertDeletingStatus}
            alertSavingStatus={alertSavingStatus}
        >
            {({ clientWidth }) => {
                if (status === "error" && !isNoDataSdkError(error)) {
                    return <ErrorComponent message={(error as Error).message} />;
                }
                return (
                    <KpiRenderer
                        kpi={kpiWidget}
                        kpiResult={kpiResult}
                        filters={filters}
                        disableDrillUnderline={disableDrillUnderline}
                        isDrillable={isDrillable}
                        onDrill={onDrill && handleOnDrill}
                        clientWidth={clientWidth}
                        separators={separators}
                    />
                );
            }}
        </DashboardItemWithKpiAlert>
    );
};

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
