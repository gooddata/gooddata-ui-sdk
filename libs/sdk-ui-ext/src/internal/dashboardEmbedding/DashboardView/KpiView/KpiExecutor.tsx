// (C) 2020 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
import { injectIntl, IntlShape, WrappedComponentProps } from "react-intl";
import compact from "lodash/compact";
import isNil from "lodash/isNil";
import isNumber from "lodash/isNumber";
import noop from "lodash/noop";
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
    IFilter,
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
    IDrillableItem,
    IDrillEventContext,
    IErrorProps,
    IHeaderPredicate,
    ILoadingProps,
    isNoDataSdkError,
    isSomeHeaderPredicateMatched,
    LoadingComponent as DefaultLoading,
    NoDataSdkError,
    OnError,
    OnFiredDrillEvent,
    useDataView,
    useExecution,
} from "@gooddata/sdk-ui";

import { filterContextToFiltersForWidget } from "../../converters";
import { DashboardItemHeadline } from "../../DashboardItem/DashboardItemHeadline";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useUserWorkspacePermissions } from "../../hooks/useUserWorkspacePermissions";
import {
    DashboardItemWithKpiAlert,
    enrichBrokenAlertsInfo,
    evaluateAlertTriggered,
    getBrokenAlertFiltersBasicInfo,
    KpiAlertDialog,
} from "../../KpiAlerts";
import { useBrokenAlertFiltersMeta } from "../../KpiAlerts/useBrokenAlertFiltersMeta";
import { IKpiAlertResult, IKpiResult } from "../../types";
import { dashboardFilterToFilterContextItem } from "../../utils/filters";
import { useUserWorkspaceSettings } from "../UserWorkspaceSettingsContext";

import {
    IUseAlertManipulationHandlerConfig,
    useAlertDeleteHandler,
    useAlertSaveOrUpdateHandler,
} from "./alertManipulationHooks";
import { KpiRenderer } from "./KpiRenderer";

interface IKpiExecutorProps {
    dashboardRef: ObjRef;
    kpiWidget: IKpiWidget | IKpiWidgetDefinition;
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

    const userWorkspaceSettings = useUserWorkspaceSettings();

    const brokenAlertsBasicInfo = useMemo(
        () => (alert ? getBrokenAlertFiltersBasicInfo(alert, kpiWidget, filters) : undefined),
        [alert, kpiWidget, filters],
    );

    const isAlertBroken = !!brokenAlertsBasicInfo?.length; // we need to know if the alert is broken synchronously (for the alert execution)...

    // ...but we can load the extra data needed asynchronously to have it ready by the time the user opens the dialog
    const { result: brokenAlertsMeta } = useBrokenAlertFiltersMeta({
        backend,
        workspace,
        brokenAlertFilters: brokenAlertsBasicInfo,
    });

    const brokenAlertFilters = useMemo(() => {
        if (!brokenAlertsMeta) {
            return null;
        }

        return enrichBrokenAlertsInfo(
            brokenAlertsBasicInfo,
            intl,
            userWorkspaceSettings.responsiveUiDateFormat,
            brokenAlertsMeta.dateDatasets,
            brokenAlertsMeta.attributeFiltersMeta,
        );
    }, [brokenAlertsMeta]);

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

    const isReadonlyMode = false; // TODO we need to support proper read only mode for live examples with proxy (RAIL-2931)

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
                                      filters: filters.map(dashboardFilterToFilterContextItem),
                                  },
                                  description: "",
                                  title: "",
                              };
                        saveOrUpdateAlert(toSave);
                    }}
                    onAlertDialogUpdateClick={noop as any} // TODO implement
                    onApplyAlertFiltersClick={noop as any} // TODO implement
                    isAlertLoading={alertStatus === "loading"}
                    alertDeletingStatus={alertDeletingStatus}
                    alertSavingStatus={alertSavingStatus}
                    filters={filters}
                    isThresholdRepresentingPercent={isThresholdRepresentingPercent}
                    thresholdPlaceholder={thresholdPlaceholder}
                    brokenAlertFilters={brokenAlertFilters}
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
