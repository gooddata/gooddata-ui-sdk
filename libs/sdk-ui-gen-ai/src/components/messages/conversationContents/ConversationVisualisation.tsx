// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";
import { useDispatch } from "react-redux";

import { type IChatVisualisationDefinition } from "@gooddata/sdk-backend-spi";
import {
    type IAttribute,
    type IColorPalette,
    type IDrillOrigin,
    type IExecutionConfig,
    type IFilter,
    type IKeyDriveAnalysis,
    type IMeasure,
    type ISortItem,
    type ITheme,
    isMeasureDescriptor,
} from "@gooddata/sdk-model";
import {
    type ExplicitDrill,
    type GoodDataSdkError,
    type IDrillEvent,
    type IHeaderPredicate,
    type OnError,
    type OnExportReady,
    type OnFiredDrillEvent,
    type OnLoadingChanged,
    isNoDataSdkError,
} from "@gooddata/sdk-ui";
import { BarChart, ColumnChart, Headline, LineChart, PieChart, ScatterPlot } from "@gooddata/sdk-ui-charts";
import {
    type IDashboardKeyDriverCombinationItem,
    getKdaKeyDriverCombinations,
} from "@gooddata/sdk-ui-dashboard";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { PivotTableNext, useAgGridToken } from "@gooddata/sdk-ui-pivot/next";
import { ScopedThemeProvider, useTheme } from "@gooddata/sdk-ui-theme-provider";

import { useExecution } from "./useExecution.js";
import {
    mapVisualizationAnomalyDetectionToBackendConfig,
    mapVisualizationAnomalyDetectionToChartConfig,
} from "../../../anomalyDetection/anomalyDetectionMapping.js";
import {
    mapVisualizationClusteringToBackendConfig,
    mapVisualizationClusteringToChartConfig,
} from "../../../clustering/clusteringMapping.js";
import {
    mapVisualizationForecastToBackendConfig,
    mapVisualizationForecastToChartConfig,
} from "../../../forecast/forecastMapping.js";
import { type IChatConversationLocalItem } from "../../../model.js";
import {
    saveVisualisationRenderStatusAction,
    visualizationErrorAction,
} from "../../../store/messages/messagesSlice.js";
import { getHeadlineComparison } from "../../../utils.js";

const VIS_HEIGHT = 250;

const visualizationTooltipOptions = {
    tooltip: {
        className: "gd-gen-ai-chat__vis_tooltip",
    },
};

const legendTooltipOptions = {
    legend: {
        responsive: "autoPositionWithPopup" as const,
    },
};

export type ConversationVisualisationProps = {
    message: IChatConversationLocalItem;
    visualization: IChatVisualisationDefinition;
    colorPalette?: IColorPalette;
    execConfig?: IExecutionConfig;
    agGridToken?: string;
    isTable?: boolean;
    onVisualisationError?: (error: GoodDataSdkError) => void;
    onLoadingChanged?: OnLoadingChanged;
    onDrillFired?: (
        data: {
            keyDriverData: IDashboardKeyDriverCombinationItem[];
            event: IDrillEvent;
        } | null,
    ) => void;
    enableChangeAnalysis?: boolean;
    enableNewPivotTable?: boolean;
    enableAccessibleChartTooltip?: boolean;
};

export function ConversationVisualisation({
    message,
    colorPalette,
    visualization,
    execConfig,
    agGridToken,
    isTable,
    onVisualisationError,
    onLoadingChanged,
    onDrillFired,
    enableChangeAnalysis = false,
    enableNewPivotTable = true,
    enableAccessibleChartTooltip = false,
}: ConversationVisualisationProps) {
    const intl = useIntl();
    const dispatch = useDispatch();
    const resolvedAgGridToken = useAgGridToken(agGridToken);
    const kpiTheme = useKpiTheme();

    const { metrics, dimensions, filters, sorts } = useExecution(visualization);

    const drillableItems = useMemo(() => {
        if (visualization && enableChangeAnalysis) {
            if (visualization.type === "TABLE") {
                return metrics.filter(Boolean).map(headerPredicate);
            }
            return [dimensions[0], dimensions[1]].filter(Boolean).map((x) => x.attribute.displayForm);
        }
        return undefined;
    }, [dimensions, enableChangeAnalysis, metrics, visualization]);

    const handleSdkError = useCallback(
        (error: GoodDataSdkError) => {
            // Ignore NO_DATA error, we still want an option to save the visualization
            if (!isNoDataSdkError(error)) {
                onVisualisationError?.(error);
            }
            dispatch(
                visualizationErrorAction({
                    errorType: error.seType,
                    errorMessage: error.getMessage(),
                }),
            );

            switch (error.seType) {
                case "NO_DATA":
                    dispatch(
                        saveVisualisationRenderStatusAction({
                            visualizationId: visualization.id,
                            assistantMessageId: message.localId,
                            status: "NO_DATA",
                        }),
                    );
                    break;
                case "DATA_TOO_LARGE_TO_COMPUTE":
                case "DATA_TOO_LARGE_TO_DISPLAY":
                    dispatch(
                        saveVisualisationRenderStatusAction({
                            visualizationId: visualization.id,
                            assistantMessageId: message.localId,
                            status: "TOO_MANY_DATA_POINTS",
                        }),
                    );
                    break;
                default:
                    dispatch(
                        saveVisualisationRenderStatusAction({
                            visualizationId: visualization.id,
                            assistantMessageId: message.localId,
                            status: "UNEXPECTED_ERROR",
                        }),
                    );
                    break;
            }
        },
        [dispatch, onVisualisationError, visualization.id, message.localId],
    );
    const handleLoadingChanged = useCallback(
        ({ isLoading }: { isLoading: boolean }) => {
            onLoadingChanged?.({ isLoading });
        },
        [onLoadingChanged],
    );
    const handleSuccess = useCallback(() => {
        dispatch(
            saveVisualisationRenderStatusAction({
                visualizationId: visualization.id,
                assistantMessageId: message.localId,
                status: "SUCCESSFUL",
            }),
        );
    }, [dispatch, visualization?.id, message.localId]);
    const handlerDrill = useCallback(
        (event: IDrillEvent) => {
            const keyDriverData = getKdaKeyDriverCombinations(
                {
                    type: "keyDriveAnalysis",
                    transition: "in-place",
                    origin: {} as IDrillOrigin,
                } as IKeyDriveAnalysis,
                event,
            );
            if (keyDriverData.length === 0) {
                onDrillFired?.(null);
            } else {
                onDrillFired?.({ keyDriverData, event });
            }
        },
        [onDrillFired],
    );

    const renderCurrentChart = () => {
        if (!visualization) {
            return null;
        }

        if (isTable) {
            return renderTable(
                intl.locale,
                metrics,
                dimensions,
                filters,
                sorts,
                handleSdkError,
                handleLoadingChanged,
                handleSuccess,
                handlerDrill,
                {
                    drillableItems,
                    enableChangeAnalysis,
                    enableNewPivotTable,
                    enableAccessibleChartTooltip,
                    agGridToken: resolvedAgGridToken,
                    execConfig,
                },
            );
        }

        switch (visualization.type) {
            case "BAR":
                return renderBarChart(
                    intl.locale,
                    metrics,
                    dimensions,
                    filters,
                    sorts,
                    colorPalette,
                    handleSdkError,
                    handleLoadingChanged,
                    handleSuccess,
                    handlerDrill,
                    {
                        enableChangeAnalysis,
                        enableAccessibleChartTooltip,
                        execConfig,
                    },
                );
            case "COLUMN":
                return renderColumnChart(
                    intl.locale,
                    metrics,
                    dimensions,
                    filters,
                    sorts,
                    colorPalette,
                    handleSdkError,
                    handleLoadingChanged,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableChangeAnalysis,
                        enableAccessibleChartTooltip,
                        execConfig,
                    },
                );
            case "LINE":
                return renderLineChart(
                    intl.locale,
                    visualization,
                    metrics,
                    dimensions,
                    filters,
                    sorts,
                    colorPalette,
                    handleSdkError,
                    handleLoadingChanged,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableChangeAnalysis,
                        enableAccessibleChartTooltip,
                        execConfig,
                    },
                );
            case "PIE":
                return renderPieChart(
                    intl.locale,
                    metrics,
                    dimensions,
                    filters,
                    sorts,
                    colorPalette,
                    handleSdkError,
                    handleLoadingChanged,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableChangeAnalysis,
                        enableAccessibleChartTooltip,
                        execConfig,
                    },
                );
            case "SCATTER":
                return renderScatterPlot(
                    intl.locale,
                    visualization,
                    metrics,
                    dimensions,
                    filters,
                    sorts,
                    colorPalette,
                    handleSdkError,
                    handleLoadingChanged,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableAccessibleChartTooltip,
                        execConfig,
                    },
                );
            case "TABLE":
                return renderTable(
                    intl.locale,
                    metrics,
                    dimensions,
                    filters,
                    sorts,
                    handleSdkError,
                    handleLoadingChanged,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableChangeAnalysis,
                        enableNewPivotTable,
                        enableAccessibleChartTooltip,
                        agGridToken: resolvedAgGridToken,
                        execConfig,
                    },
                );
            case "HEADLINE":
                return renderHeadline(
                    intl.locale,
                    kpiTheme,
                    metrics,
                    dimensions,
                    filters,
                    colorPalette,
                    handleSdkError,
                    handleLoadingChanged,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableChangeAnalysis,
                        execConfig,
                    },
                );
            default:
                //TODO: s.hacker assertNever(visualization.type);
                return null;
        }
    };

    return <>{renderCurrentChart()}</>;
}

function useKpiTheme() {
    const theme = useTheme();

    return useMemo(
        () => ({
            ...theme,
            kpi: {
                ...theme?.kpi,
                primaryMeasureColor:
                    theme?.dashboards?.content?.widget?.title?.color ?? theme?.palette?.complementary?.c8,
                secondaryInfoColor:
                    theme?.dashboards?.content?.widget?.title?.color ?? theme?.palette?.complementary?.c8,
            },
        }),
        [theme],
    );
}

const renderBarChart = (
    locale: string,
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        enableChangeAnalysis?: boolean;
        execConfig?: IExecutionConfig;
    },
) => (
    <BarChart
        locale={locale}
        height={VIS_HEIGHT}
        measures={metrics}
        viewBy={[dimensions[0], dimensions[1]].filter(Boolean)}
        stackBy={metrics.length <= 1 ? dimensions[2] : undefined}
        sortBy={sortBy}
        config={{
            ...visualizationTooltipOptions,
            ...legendTooltipOptions,
            colorPalette,
            // Better visibility with stacked bars if there are multiple metrics and dimensions
            stackMeasures: metrics.length > 1 && dimensions.length === 2,
            enableAccessibleTooltip: props.enableAccessibleChartTooltip,
        }}
        drillableItems={props.drillableItems}
        onDrill={onDrill}
        filters={filters}
        onError={onError}
        onLoadingChanged={onLoadingChanged}
        onExportReady={onSuccess}
        execConfig={props.execConfig}
    />
);

const renderColumnChart = (
    locale: string,
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        enableChangeAnalysis?: boolean;
        execConfig?: IExecutionConfig;
    },
) => (
    <ColumnChart
        locale={locale}
        height={VIS_HEIGHT}
        measures={metrics}
        viewBy={[dimensions[0], dimensions[1]].filter(Boolean)}
        stackBy={metrics.length <= 1 ? dimensions[2] : undefined}
        sortBy={sortBy}
        config={{
            ...visualizationTooltipOptions,
            ...legendTooltipOptions,
            colorPalette,
            // Better visibility with stacked bars if there are multiple metrics and dimensions
            stackMeasures: metrics.length > 1 && dimensions.length === 2,
            enableAccessibleTooltip: props.enableAccessibleChartTooltip,
        }}
        drillableItems={props.drillableItems}
        onDrill={onDrill}
        filters={filters}
        onError={onError}
        onLoadingChanged={onLoadingChanged}
        onExportReady={onSuccess}
        execConfig={props.execConfig}
    />
);

const renderLineChart = (
    locale: string,
    visualization: IChatVisualisationDefinition,
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        enableChangeAnalysis?: boolean;
        execConfig?: IExecutionConfig;
    },
) => {
    const forecast = mapVisualizationForecastToChartConfig(visualization);
    const forecastConfig = mapVisualizationForecastToBackendConfig(visualization);

    const anomalies = mapVisualizationAnomalyDetectionToChartConfig(visualization);
    const outliersConfig = mapVisualizationAnomalyDetectionToBackendConfig(visualization);

    return (
        <LineChart
            locale={locale}
            height={VIS_HEIGHT}
            measures={metrics}
            trendBy={dimensions[0]}
            segmentBy={metrics.length <= 1 ? dimensions[1] : undefined}
            filters={filters}
            sortBy={sortBy}
            config={{
                ...visualizationTooltipOptions,
                ...legendTooltipOptions,
                colorPalette,
                enableAccessibleTooltip: props.enableAccessibleChartTooltip,
                ...(forecastConfig && forecast ? { forecast } : {}),
                ...(outliersConfig && anomalies ? { anomalies } : {}),
            }}
            forecastConfig={forecastConfig}
            outliersConfig={outliersConfig}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            onError={onError}
            onLoadingChanged={onLoadingChanged}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderPieChart = (
    locale: string,
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        enableChangeAnalysis?: boolean;
        execConfig?: IExecutionConfig;
    },
) => (
    <PieChart
        locale={locale}
        height={VIS_HEIGHT}
        measures={metrics}
        viewBy={metrics.length <= 1 ? dimensions[0] : undefined}
        filters={filters}
        sortBy={sortBy}
        config={{
            ...visualizationTooltipOptions,
            colorPalette,
            enableAccessibleTooltip: props.enableAccessibleChartTooltip,
        }}
        drillableItems={props.drillableItems}
        onDrill={onDrill}
        onError={onError}
        onLoadingChanged={onLoadingChanged}
        onExportReady={onSuccess}
        execConfig={props.execConfig}
    />
);

const renderScatterPlot = (
    locale: string,
    visualization: IChatVisualisationDefinition,
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        execConfig?: IExecutionConfig;
    },
) => {
    const clustering = mapVisualizationClusteringToChartConfig(visualization);
    const clusteringConfig = mapVisualizationClusteringToBackendConfig(visualization);

    return (
        <ScatterPlot
            locale={locale}
            height={VIS_HEIGHT}
            xAxisMeasure={metrics[0]}
            yAxisMeasure={metrics[1]}
            attribute={dimensions[0]}
            segmentBy={dimensions[1]}
            filters={filters}
            sortBy={sortBy}
            config={{
                ...visualizationTooltipOptions,
                ...legendTooltipOptions,
                colorPalette,
                enableAccessibleTooltip: props.enableAccessibleChartTooltip,
                ...(clusteringConfig && clustering ? { clustering } : {}),
            }}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            onError={onError}
            onLoadingChanged={onLoadingChanged}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderTable = (
    locale: string,
    metrics: IMeasure[],
    dimensions: IAttribute[],
    filters: IFilter[],
    sortBy: ISortItem[],
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        enableNewPivotTable?: boolean;
        enableChangeAnalysis?: boolean;
        agGridToken?: string;
        execConfig?: IExecutionConfig;
    },
) => {
    const TableComponent = props.enableNewPivotTable ? PivotTableNext : PivotTable;
    return (
        <TableComponent
            locale={locale}
            measures={metrics}
            rows={dimensions}
            filters={filters}
            sortBy={sortBy}
            config={props.enableNewPivotTable ? { agGridToken: props.agGridToken } : undefined}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            onError={onError}
            onLoadingChanged={onLoadingChanged}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderHeadline = (
    locale: string,
    theme: ITheme | undefined,
    metrics: IMeasure[],
    _dimensions: IAttribute[],
    filters: IFilter[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onLoadingChanged: OnLoadingChanged,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableChangeAnalysis?: boolean;
        execConfig?: IExecutionConfig;
    },
) => {
    return (
        <ScopedThemeProvider theme={theme}>
            <Headline
                locale={locale}
                primaryMeasure={metrics[0]}
                secondaryMeasures={[metrics[1], metrics[2]].filter(Boolean)}
                filters={filters}
                config={{
                    ...visualizationTooltipOptions,
                    ...getHeadlineComparison(metrics),
                    colorPalette,
                }}
                drillableItems={props.drillableItems}
                onDrill={onDrill}
                onError={onError}
                onLoadingChanged={onLoadingChanged}
                onExportReady={onSuccess}
                execConfig={props.execConfig}
            />
        </ScopedThemeProvider>
    );
};

function headerPredicate(m: IMeasure): IHeaderPredicate {
    return (header) => {
        if (isMeasureDescriptor(header)) {
            return header.measureHeaderItem.localIdentifier === m.measure.localIdentifier;
        }
        return false;
    };
}
