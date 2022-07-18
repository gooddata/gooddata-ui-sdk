// (C) 2022 GoodData Corporation
import React, { useEffect } from "react";
import cx from "classnames";
import { useIntl } from "react-intl";
import compact from "lodash/compact";
import noop from "lodash/noop";
import {
    IMeasure,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    IKpiWidget,
    widgetRef,
} from "@gooddata/sdk-model";
import { ILoadingProps, OnError, useExecutionDataView } from "@gooddata/sdk-ui";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import {
    useDashboardSelector,
    useWidgetExecutionsHandler,
    selectEnableWidgetCustomHeight,
    selectSeparators,
    selectDisableKpiDashboardHeadlineUnderline,
} from "../../../../model";
import { DashboardItemHeadline, DashboardItemKpi } from "../../../presentationComponents";
import { IDashboardFilter } from "../../../../types";

import { useWidgetSelection } from "../../common/useWidgetSelection";
import { ConfigurationBubble } from "../../common";
import { KpiConfigurationPanel } from "./KpiConfigurationPanel/KpiConfigurationPanel";
import { getKpiResult, getNoDataKpiResult, KpiRenderer } from "../common";

interface IEditableKpiExecutorProps {
    kpiWidget: IKpiWidget;
    backend?: IAnalyticalBackend;
    workspace?: string;
    primaryMeasure: IMeasure;
    secondaryMeasure?: IMeasure<IPoPMeasureDefinition> | IMeasure<IPreviousPeriodMeasureDefinition>;
    /**
     * Filters that should be used for the execution
     */
    effectiveFilters?: IDashboardFilter[];
    onError?: OnError;
    LoadingComponent?: React.ComponentType<ILoadingProps>;
}

export const EditableKpiExecutor = (props: IEditableKpiExecutorProps) => {
    const {
        kpiWidget,

        backend,
        workspace,

        primaryMeasure,
        secondaryMeasure,
        effectiveFilters,

        onError,
    } = props;

    const intl = useIntl();

    const enableCompactSize = useDashboardSelector(selectEnableWidgetCustomHeight);
    const separators = useDashboardSelector(selectSeparators);
    const disableDrillUnderline = useDashboardSelector(selectDisableKpiDashboardHeadlineUnderline);
    const isDrillable = kpiWidget.drills.length > 0;

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

    const kpiResult = !result?.dataView.totalCount[0]
        ? getNoDataKpiResult(result, primaryMeasure)
        : getKpiResult(result, primaryMeasure, secondaryMeasure, separators);

    const executionsHandler = useWidgetExecutionsHandler(widgetRef(kpiWidget));
    const { isSelectable, isSelected, onSelected } = useWidgetSelection(widgetRef(kpiWidget));

    useEffect(() => {
        if (error) {
            onError?.(error);
            executionsHandler.onError(error);
        }
    }, [error, executionsHandler, onError]);

    return (
        <DashboardItemKpi
            visualizationClassName={cx("s-dashboard-kpi-component", "widget-loaded", "visualization", {
                "kpi-with-pop": kpiWidget.kpi.comparisonType !== "none",
                "content-loading": isLoading,
                "content-loaded": !isLoading,
            })}
            renderBeforeContent={() => {
                if (isSelected) {
                    return (
                        <ConfigurationBubble widget={kpiWidget}>
                            <KpiConfigurationPanel widget={kpiWidget} />
                        </ConfigurationBubble>
                    );
                }
                return null;
            }}
            renderHeadline={(clientHeight) => (
                <DashboardItemHeadline title={kpiWidget.title} clientHeight={clientHeight} />
            )}
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
                        separators={separators}
                        enableCompactSize={enableCompactSize}
                        error={error}
                        errorHelp={intl.formatMessage({ id: "kpi.error.view" })}
                        isLoading={isLoading}
                        // need to pass something so that the underline is shown...
                        onDrill={noop}
                        isDrillable={isDrillable}
                        disableDrillUnderline={disableDrillUnderline}
                    />
                );
            }}
        </DashboardItemKpi>
    );
};
