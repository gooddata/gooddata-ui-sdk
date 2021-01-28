// (C) 2020 GoodData Corporation
import React, { useCallback, useState } from "react";
import {
    IAnalyticalBackend,
    isNoDataError,
    IWidgetAlert,
    ISeparators,
    IWidgetDefinition,
} from "@gooddata/sdk-backend-spi";
import {
    IFilter,
    IMeasure,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
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
} from "@gooddata/sdk-ui";
import compact from "lodash/compact";
import isNil from "lodash/isNil";
import isNumber from "lodash/isNumber";
import noop from "lodash/noop";
import { KpiRenderer } from "./KpiRenderer";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IKpiResult, IKpiAlertResult } from "../../types";
import { DashboardItemWithKpiAlert } from "../../KpiAlerts/DashboardItemWithKpiAlert";
import { DashboardItemHeadline } from "../../DashboardItem/DashboardItemHeadline";
import { useUserWorkspaceSettings } from "../UserWorkspaceSettingsContext";
import { filterContextToFiltersForWidget } from "../../converters";
import { getBrokenAlertFiltersBasicInfo } from "../../KpiAlerts/KpiAlertDialog/utils/brokenFilterUtils";
import KpiAlertDialog from "../../KpiAlerts/KpiAlertDialog/KpiAlertDialog";

interface IKpiExecutorProps {
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
        [alertExecution.fingerprint()],
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

    if (status === "loading" || status === "pending") {
        return <LoadingComponent />;
    }

    if (status === "error") {
        return isNoDataError(error) ? (
            <KpiRenderer
                kpi={kpiWidget}
                kpiResult={null}
                filters={filters}
                disableDrillUnderline={disableDrillUnderline}
                isDrillable={false}
                onDrill={onDrill && handleOnDrill}
                clientWidth={undefined} // TODO get from alert wrapper
                separators={separators}
            />
        ) : (
            <ErrorComponent message={error.message} />
        );
    }

    const series = result.data({ valueFormatter: createNumberJsFormatter(separators) }).series();
    const primarySeries = series.firstForMeasure(primaryMeasure);
    const secondarySeries = secondaryMeasure ? series.firstForMeasure(secondaryMeasure) : undefined;

    const kpiResult: IKpiResult = {
        measureDescriptor: primarySeries.descriptor.measureDescriptor,
        measureFormat: primarySeries.measureFormat(),
        measureResult: getSeriesResult(primarySeries),
        measureForComparisonResult: getSeriesResult(secondarySeries),
    };

    const alertSeries = alertResult?.data({ valueFormatter: createNumberJsFormatter(separators) }).series();
    const kpiAlertResult: IKpiAlertResult | undefined = alertSeries
        ? {
              measureFormat: alertSeries.firstForMeasure(primaryMeasure).measureFormat(),
              measureResult: getSeriesResult(alertSeries.firstForMeasure(primaryMeasure)),
          }
        : undefined;

    const predicates = drillableItems ? convertDrillableItemsToPredicates(drillableItems) : [];
    const isDrillable =
        kpiWidget.drills.length > 0 ||
        isSomeHeaderPredicateMatched(predicates, primarySeries.descriptor.measureDescriptor, result);

    return (
        <DashboardItemWithKpiAlert
            kpi={kpiWidget}
            alert={alert}
            filters={filters}
            userWorkspaceSettings={userWorkspaceSettings}
            kpiResult={kpiResult}
            renderHeadline={() => <DashboardItemHeadline title={kpiWidget.title} />}
            kpiAlertResult={kpiAlertResult}
            isAlertLoading={alertStatus === "loading"}
            canSetAlert // TODO
            alertExecutionError={
                alertError ||
                // TODO get rid of this hack, detect broken alerts differently
                // (the problem is alerts on KPIs without dateDataset, their date filters are invalid and we have no idea what date dataset to put there)
                (isAlertBroken ? new NoDataSdkError() : undefined)
            }
            isAlertBroken={isAlertBroken}
            isAlertDialogOpen={isAlertDialogOpen}
            onAlertDialogOpenClick={() => setIsAlertDialogOpen(true)}
            renderAlertDialog={() => (
                <KpiAlertDialog
                    alert={alert}
                    dateFormat={userWorkspaceSettings.responsiveUiDateFormat}
                    userEmail="TODO@gooddata.com"
                    onAlertDialogCloseClick={() => setIsAlertDialogOpen(false)}
                    onAlertDialogDeleteClick={noop as any}
                    onAlertDialogSaveClick={noop as any}
                    onAlertDialogUpdateClick={noop as any}
                    onApplyAlertFiltersClick={noop as any}
                    isAlertLoading={alertStatus === "loading"}
                />
            )}

            // TODO alert dialog
        >
            {({ clientWidth }) => (
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
            )}
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
