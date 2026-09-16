// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";
import { useDispatch } from "react-redux";

import { type IChatConversationVisualisationContent } from "@gooddata/sdk-backend-spi";
import {
    type IBucket,
    type IColorPalette,
    type IDrillOrigin,
    type IExecutionConfig,
    type IFilter,
    type IKeyDriveAnalysis,
    type ISeparators,
    type ISortItem,
    type ITheme,
    isAttribute,
    isMeasure,
} from "@gooddata/sdk-model";
import {
    type ExplicitDrill,
    type GoodDataSdkError,
    type IDrillEvent,
    type OnError,
    type OnExportReady,
    type OnFiredDrillEvent,
} from "@gooddata/sdk-ui";
import {
    AreaChart,
    BarChart,
    BubbleChart,
    BulletChart,
    ColumnChart,
    ComboChart,
    DependencyWheelChart,
    DonutChart,
    FunnelChart,
    Headline,
    Heatmap,
    type ITotalConfig,
    LineChart,
    PieChart,
    PyramidChart,
    RadarChart,
    Repeater,
    SankeyChart,
    ScatterPlot,
    Treemap,
    WaterfallChart,
} from "@gooddata/sdk-ui-charts";
import {
    type IDashboardKeyDriverCombinationItem,
    getKdaKeyDriverCombinations,
} from "@gooddata/sdk-ui-dashboard";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { PivotTableNext, useAgGridToken } from "@gooddata/sdk-ui-pivot/next";
import { ScopedThemeProvider, useTheme } from "@gooddata/sdk-ui-theme-provider";

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
import { storeKdaReturnFocusFromDrillContext } from "../../../utils/kdaReturnFocus.js";

import { useExecution } from "./useExecution.js";
import { changeAnalysisDrills } from "./utils/changeAnalysisDrills.js";

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

const SLICED_CHARTS: Record<string, typeof PieChart> = {
    "local:pie": PieChart,
    "local:donut": DonutChart,
    "local:pyramid": PyramidChart,
    "local:funnel": FunnelChart,
};

const FLOW_DIAGRAMS: Record<string, typeof SankeyChart> = {
    "local:sankey": SankeyChart,
    "local:dependencywheel": DependencyWheelChart,
};

export type ConversationVisualisationProps = {
    message: IChatConversationLocalItem;
    visualization: NonNullable<IChatConversationVisualisationContent["visualization"]>;
    colorPalette?: IColorPalette;
    separators?: ISeparators;
    execConfig?: IExecutionConfig;
    agGridToken?: string;
    isTable?: boolean;
    onVisualisationError?: (error: GoodDataSdkError) => void;
    onDrillFired?: (
        data: {
            keyDriverData: IDashboardKeyDriverCombinationItem[];
            event: IDrillEvent;
        } | null,
    ) => void;
    enableDrilling?: boolean;
    enableChangeAnalysis?: boolean;
    enableSecondGranularities?: boolean;
    enableNewPivotTable?: boolean;
    enableAccessibleChartTooltip?: boolean;
};

export function ConversationVisualisation({
    message,
    colorPalette,
    separators,
    visualization,
    execConfig,
    agGridToken,
    isTable,
    onVisualisationError,
    onDrillFired,
    enableDrilling = true,
    enableChangeAnalysis = false,
    enableSecondGranularities = false,
    enableNewPivotTable = true,
    enableAccessibleChartTooltip = false,
}: ConversationVisualisationProps) {
    const intl = useIntl();
    const dispatch = useDispatch();
    const resolvedAgGridToken = useAgGridToken(agGridToken);
    const kpiTheme = useKpiTheme();

    const { filters, sorts, buckets } = useExecution(visualization);
    const bucketsData = useBucketData(buckets);

    const drillableItems = useMemo(() => {
        const items = [...changeAnalysisDrills(visualization, enableDrilling, enableChangeAnalysis)];
        return items.length ? items : undefined;
    }, [enableChangeAnalysis, visualization, enableDrilling]);

    const handleSdkError = useCallback(
        (error: GoodDataSdkError) => {
            if (!visualization) {
                return;
            }

            // Error callback
            onVisualisationError?.(error);

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
                            visualizationId: visualization.insight.identifier,
                            assistantMessageId: message.localId,
                            status: "NO_DATA",
                        }),
                    );
                    break;
                case "DATA_TOO_LARGE_TO_COMPUTE":
                case "DATA_TOO_LARGE_TO_DISPLAY":
                    dispatch(
                        saveVisualisationRenderStatusAction({
                            visualizationId: visualization.insight.identifier,
                            assistantMessageId: message.localId,
                            status: "TOO_MANY_DATA_POINTS",
                        }),
                    );
                    break;
                default:
                    dispatch(
                        saveVisualisationRenderStatusAction({
                            visualizationId: visualization.insight.identifier,
                            assistantMessageId: message.localId,
                            status: "UNEXPECTED_ERROR",
                        }),
                    );
                    break;
            }
        },
        [visualization, dispatch, onVisualisationError, message.localId],
    );
    const handleSuccess = useCallback(() => {
        if (!visualization) {
            return;
        }
        dispatch(
            saveVisualisationRenderStatusAction({
                visualizationId: visualization.insight.identifier,
                assistantMessageId: message.localId,
                status: "SUCCESSFUL",
            }),
        );
    }, [dispatch, visualization, message.localId]);
    const handlerDrill = useCallback(
        (event: IDrillEvent) => {
            storeKdaReturnFocusFromDrillContext(event.drillContext);
            const keyDriverData = getKdaKeyDriverCombinations(
                {
                    type: "keyDriveAnalysis",
                    transition: "in-place",
                    origin: {} as IDrillOrigin,
                } as IKeyDriveAnalysis,
                event,
                enableSecondGranularities,
            );
            if (keyDriverData.length === 0) {
                onDrillFired?.(null);
            } else {
                onDrillFired?.({ keyDriverData, event });
            }
        },
        [onDrillFired, enableSecondGranularities],
    );

    const renderCurrentChart = () => {
        if (!visualization) {
            return null;
        }

        if (isTable) {
            return renderTable(
                intl.locale,
                bucketsData,
                filters,
                sorts,
                handleSdkError,
                handleSuccess,
                handlerDrill,
                {
                    drillableItems,
                    enableChangeAnalysis,
                    enableNewPivotTable,
                    enableAccessibleChartTooltip,
                    agGridToken: resolvedAgGridToken,
                    execConfig,
                    separators,
                },
            );
        }

        switch (visualization.insight.visualizationUrl) {
            case "local:area":
                return renderAreaChart(
                    intl.locale,
                    visualization,
                    bucketsData,
                    filters,
                    sorts,
                    colorPalette,
                    handleSdkError,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableAccessibleChartTooltip,
                        execConfig,
                        separators,
                    },
                );
            case "local:bar":
                return renderBarChart(
                    intl.locale,
                    bucketsData,
                    filters,
                    sorts,
                    colorPalette,
                    handleSdkError,
                    handleSuccess,
                    handlerDrill,
                    {
                        enableChangeAnalysis,
                        enableAccessibleChartTooltip,
                        execConfig,
                        separators,
                    },
                );
            case "local:column":
                return renderColumnChart(
                    intl.locale,
                    bucketsData,
                    filters,
                    sorts,
                    colorPalette,
                    handleSdkError,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableChangeAnalysis,
                        enableAccessibleChartTooltip,
                        execConfig,
                        separators,
                    },
                );
            case "local:line":
                return renderLineChart(
                    intl.locale,
                    visualization,
                    bucketsData,
                    filters,
                    sorts,
                    colorPalette,
                    handleSdkError,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableChangeAnalysis,
                        enableAccessibleChartTooltip,
                        execConfig,
                        separators,
                    },
                );
            case "local:pie":
            case "local:donut":
            case "local:pyramid":
            case "local:funnel":
                return renderSlicedChart(
                    SLICED_CHARTS[visualization.insight.visualizationUrl],
                    intl.locale,
                    bucketsData,
                    filters,
                    sorts,
                    colorPalette,
                    handleSdkError,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableChangeAnalysis,
                        enableAccessibleChartTooltip,
                        execConfig,
                        separators,
                    },
                );
            case "local:bubble":
                return renderBubbleChart(
                    intl.locale,
                    bucketsData,
                    filters,
                    sorts,
                    colorPalette,
                    handleSdkError,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableAccessibleChartTooltip,
                        execConfig,
                        separators,
                    },
                );
            case "local:bullet":
                return renderBulletChart(
                    intl.locale,
                    bucketsData,
                    filters,
                    sorts,
                    colorPalette,
                    handleSdkError,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableAccessibleChartTooltip,
                        execConfig,
                        separators,
                    },
                );
            case "local:combo2":
                return renderComboChart(
                    intl.locale,
                    visualization,
                    bucketsData,
                    filters,
                    sorts,
                    colorPalette,
                    handleSdkError,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableAccessibleChartTooltip,
                        execConfig,
                        separators,
                    },
                );
            case "local:sankey":
            case "local:dependencywheel":
                return renderFlowDiagram(
                    FLOW_DIAGRAMS[visualization.insight.visualizationUrl],
                    intl.locale,
                    bucketsData,
                    filters,
                    sorts,
                    colorPalette,
                    handleSdkError,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableAccessibleChartTooltip,
                        execConfig,
                        separators,
                    },
                );
            case "local:scatter":
                return renderScatterPlot(
                    intl.locale,
                    visualization,
                    bucketsData,
                    filters,
                    sorts,
                    colorPalette,
                    handleSdkError,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableAccessibleChartTooltip,
                        execConfig,
                        separators,
                    },
                );
            case "local:table":
                return renderTable(
                    intl.locale,
                    bucketsData,
                    filters,
                    sorts,
                    handleSdkError,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableChangeAnalysis,
                        enableNewPivotTable,
                        enableAccessibleChartTooltip,
                        agGridToken: resolvedAgGridToken,
                        execConfig,
                        separators,
                    },
                );
            case "local:repeater":
                return renderRepeater(
                    intl.locale,
                    visualization,
                    bucketsData,
                    filters,
                    colorPalette,
                    handleSdkError,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        execConfig,
                        separators,
                    },
                );
            case "local:treemap":
                return renderTreemap(
                    intl.locale,
                    bucketsData,
                    filters,
                    colorPalette,
                    handleSdkError,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableAccessibleChartTooltip,
                        execConfig,
                        separators,
                    },
                );
            case "local:radar":
                return renderRadarChart(
                    intl.locale,
                    bucketsData,
                    filters,
                    sorts,
                    colorPalette,
                    handleSdkError,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableAccessibleChartTooltip,
                        execConfig,
                        separators,
                    },
                );
            case "local:heatmap":
                return renderHeatmap(
                    intl.locale,
                    bucketsData,
                    filters,
                    sorts,
                    colorPalette,
                    handleSdkError,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableAccessibleChartTooltip,
                        execConfig,
                        separators,
                    },
                );
            case "local:waterfall":
                return renderWaterfallChart(
                    intl.locale,
                    visualization,
                    bucketsData,
                    filters,
                    sorts,
                    colorPalette,
                    handleSdkError,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableAccessibleChartTooltip,
                        execConfig,
                        separators,
                    },
                );
            case "local:headline":
                return renderHeadline(
                    intl.locale,
                    kpiTheme,
                    bucketsData,
                    filters,
                    colorPalette,
                    handleSdkError,
                    handleSuccess,
                    handlerDrill,
                    {
                        drillableItems,
                        enableChangeAnalysis,
                        execConfig,
                        separators,
                    },
                );
            default:
                throw new Error(`Unsupported chart type: ${visualization.insight.visualizationUrl}`);
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

const renderAreaChart = (
    locale: string,
    visualization: NonNullable<IChatConversationVisualisationContent["visualization"]>,
    buckets: ReturnType<typeof useBucketData>,
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        execConfig?: IExecutionConfig;
        separators?: ISeparators;
    },
) => {
    const { metrics, view, stack } = buckets;
    const controls = visualization.insight.properties["controls"];

    return (
        <AreaChart
            locale={locale}
            height={VIS_HEIGHT}
            measures={metrics}
            viewBy={view}
            stackBy={stack[0]}
            filters={filters}
            sortBy={sortBy}
            config={{
                ...visualizationTooltipOptions,
                ...legendTooltipOptions,
                colorPalette,
                separators: props.separators,
                enableAccessibleTooltip: props.enableAccessibleChartTooltip,
                stackMeasures: controls?.["stackMeasures"],
                stackMeasuresToPercent: controls?.["stackMeasuresToPercent"],
            }}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            onError={onError}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderBarChart = (
    locale: string,
    buckets: ReturnType<typeof useBucketData>,
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        enableChangeAnalysis?: boolean;
        execConfig?: IExecutionConfig;
        separators?: ISeparators;
    },
) => {
    const { metrics, view, stack } = buckets;

    return (
        <BarChart
            locale={locale}
            height={VIS_HEIGHT}
            measures={stack[0] ? [metrics[0]] : metrics}
            viewBy={view[0]}
            stackBy={stack[0]}
            sortBy={sortBy}
            config={{
                ...visualizationTooltipOptions,
                ...legendTooltipOptions,
                colorPalette,
                separators: props.separators,
                // Better visibility with stacked bars if there are multiple metrics and dimensions
                stackMeasures: stack.length >= 1,
                enableAccessibleTooltip: props.enableAccessibleChartTooltip,
            }}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            filters={filters}
            onError={onError}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderColumnChart = (
    locale: string,
    buckets: ReturnType<typeof useBucketData>,
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        enableChangeAnalysis?: boolean;
        execConfig?: IExecutionConfig;
        separators?: ISeparators;
    },
) => {
    const { metrics, view, stack } = buckets;

    return (
        <ColumnChart
            locale={locale}
            height={VIS_HEIGHT}
            measures={metrics}
            viewBy={view}
            stackBy={stack[0]}
            sortBy={sortBy}
            config={{
                ...visualizationTooltipOptions,
                ...legendTooltipOptions,
                colorPalette,
                separators: props.separators,
                // Better visibility with stacked bars if there are multiple metrics and dimensions
                stackMeasures: stack.length >= 1,
                enableAccessibleTooltip: props.enableAccessibleChartTooltip,
            }}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            filters={filters}
            onError={onError}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderLineChart = (
    locale: string,
    visualization: NonNullable<IChatConversationVisualisationContent["visualization"]>,
    buckets: ReturnType<typeof useBucketData>,
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        enableChangeAnalysis?: boolean;
        execConfig?: IExecutionConfig;
        separators?: ISeparators;
    },
) => {
    const forecast = mapVisualizationForecastToChartConfig(visualization.insight.properties["controls"]);
    const forecastConfig = mapVisualizationForecastToBackendConfig(
        visualization.insight.properties["controls"],
    );

    const anomalies = mapVisualizationAnomalyDetectionToChartConfig(
        visualization.insight.properties["controls"],
    );
    const outliersConfig = mapVisualizationAnomalyDetectionToBackendConfig(
        visualization.insight.properties["controls"],
    );

    const { metrics, trend, segment } = buckets;

    return (
        <LineChart
            locale={locale}
            height={VIS_HEIGHT}
            measures={metrics}
            trendBy={trend[0]}
            segmentBy={segment[0]}
            filters={filters}
            sortBy={sortBy}
            config={{
                ...visualizationTooltipOptions,
                ...legendTooltipOptions,
                colorPalette,
                separators: props.separators,
                enableAccessibleTooltip: props.enableAccessibleChartTooltip,
                ...(forecastConfig && forecast ? { forecast } : {}),
                ...(outliersConfig && anomalies ? { anomalies } : {}),
            }}
            forecastConfig={forecastConfig}
            outliersConfig={outliersConfig}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            onError={onError}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderSlicedChart = (
    Chart: typeof PieChart,
    locale: string,
    buckets: ReturnType<typeof useBucketData>,
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        enableChangeAnalysis?: boolean;
        execConfig?: IExecutionConfig;
        separators?: ISeparators;
    },
) => {
    const { metrics, view } = buckets;

    return (
        <Chart
            locale={locale}
            height={VIS_HEIGHT}
            measures={metrics}
            viewBy={view[0]}
            filters={filters}
            sortBy={sortBy}
            config={{
                ...visualizationTooltipOptions,
                ...legendTooltipOptions,
                colorPalette,
                separators: props.separators,
                enableAccessibleTooltip: props.enableAccessibleChartTooltip,
            }}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            onError={onError}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderBubbleChart = (
    locale: string,
    buckets: ReturnType<typeof useBucketData>,
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        execConfig?: IExecutionConfig;
        separators?: ISeparators;
    },
) => {
    const { metrics, secondary_metrics, tertiary_metrics, view } = buckets;

    return (
        <BubbleChart
            locale={locale}
            height={VIS_HEIGHT}
            xAxisMeasure={metrics[0]}
            yAxisMeasure={secondary_metrics[0]}
            size={tertiary_metrics[0]}
            viewBy={view[0]}
            filters={filters}
            sortBy={sortBy}
            config={{
                ...visualizationTooltipOptions,
                ...legendTooltipOptions,
                colorPalette,
                separators: props.separators,
                enableAccessibleTooltip: props.enableAccessibleChartTooltip,
            }}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            onError={onError}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderBulletChart = (
    locale: string,
    buckets: ReturnType<typeof useBucketData>,
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        execConfig?: IExecutionConfig;
        separators?: ISeparators;
    },
) => {
    const { metrics, secondary_metrics, tertiary_metrics, view } = buckets;

    return (
        <BulletChart
            locale={locale}
            height={VIS_HEIGHT}
            primaryMeasure={metrics[0]}
            targetMeasure={secondary_metrics[0]}
            comparativeMeasure={tertiary_metrics[0]}
            viewBy={view}
            filters={filters}
            sortBy={sortBy}
            config={{
                ...visualizationTooltipOptions,
                ...legendTooltipOptions,
                colorPalette,
                separators: props.separators,
                enableAccessibleTooltip: props.enableAccessibleChartTooltip,
            }}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            onError={onError}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderComboChart = (
    locale: string,
    visualization: NonNullable<IChatConversationVisualisationContent["visualization"]>,
    buckets: ReturnType<typeof useBucketData>,
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        execConfig?: IExecutionConfig;
        separators?: ISeparators;
    },
) => {
    const { metrics, secondary_metrics, view } = buckets;
    const controls = visualization.insight.properties["controls"];

    return (
        <ComboChart
            locale={locale}
            height={VIS_HEIGHT}
            primaryMeasures={metrics}
            secondaryMeasures={secondary_metrics}
            viewBy={view[0]}
            filters={filters}
            sortBy={sortBy}
            config={{
                ...visualizationTooltipOptions,
                ...legendTooltipOptions,
                colorPalette,
                separators: props.separators,
                enableAccessibleTooltip: props.enableAccessibleChartTooltip,
                dualAxis: controls?.["dualAxis"],
                primaryChartType: controls?.["primaryChartType"],
                secondaryChartType: controls?.["secondaryChartType"],
            }}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            onError={onError}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderFlowDiagram = (
    Chart: typeof SankeyChart,
    locale: string,
    buckets: ReturnType<typeof useBucketData>,
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        execConfig?: IExecutionConfig;
        separators?: ISeparators;
    },
) => {
    const { metrics, attribute_from, attribute_to } = buckets;

    return (
        <Chart
            locale={locale}
            height={VIS_HEIGHT}
            measure={metrics[0]}
            attributeFrom={attribute_from[0]}
            attributeTo={attribute_to[0]}
            filters={filters}
            sortBy={sortBy}
            config={{
                ...visualizationTooltipOptions,
                ...legendTooltipOptions,
                colorPalette,
                separators: props.separators,
                enableAccessibleTooltip: props.enableAccessibleChartTooltip,
            }}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            onError={onError}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderScatterPlot = (
    locale: string,
    visualization: NonNullable<IChatConversationVisualisationContent["visualization"]>,
    buckets: ReturnType<typeof useBucketData>,
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        execConfig?: IExecutionConfig;
        separators?: ISeparators;
    },
) => {
    const clustering = mapVisualizationClusteringToChartConfig(visualization.insight.properties["controls"]);
    const clusteringConfig = mapVisualizationClusteringToBackendConfig(
        visualization.insight.properties["controls"],
    );

    const { metrics, secondary_metrics, attribute, segment } = buckets;

    return (
        <ScatterPlot
            locale={locale}
            height={VIS_HEIGHT}
            xAxisMeasure={metrics[0]}
            yAxisMeasure={secondary_metrics[0]}
            attribute={attribute[0]}
            segmentBy={segment[0]}
            filters={filters}
            sortBy={sortBy}
            config={{
                ...visualizationTooltipOptions,
                ...legendTooltipOptions,
                colorPalette,
                separators: props.separators,
                enableAccessibleTooltip: props.enableAccessibleChartTooltip,
                ...(clusteringConfig && clustering ? { clustering } : {}),
            }}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            onError={onError}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderRadarChart = (
    locale: string,
    buckets: ReturnType<typeof useBucketData>,
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        execConfig?: IExecutionConfig;
        separators?: ISeparators;
    },
) => {
    const { metrics, trend, segment } = buckets;

    return (
        <RadarChart
            locale={locale}
            height={VIS_HEIGHT}
            measures={metrics}
            trendBy={trend[0]}
            segmentBy={segment[0]}
            filters={filters}
            sortBy={sortBy}
            config={{
                ...visualizationTooltipOptions,
                ...legendTooltipOptions,
                colorPalette,
                separators: props.separators,
                enableAccessibleTooltip: props.enableAccessibleChartTooltip,
            }}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            onError={onError}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

// Treemap takes no sortBy: it always derives its own sorting from the buckets
// (getDefaultTreemapSort), so the sorts the insight carries are deliberately not forwarded.
const renderTreemap = (
    locale: string,
    buckets: ReturnType<typeof useBucketData>,
    filters: IFilter[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        execConfig?: IExecutionConfig;
        separators?: ISeparators;
    },
) => {
    const { metrics, view, segment } = buckets;
    const viewBy = metrics.length === 1 ? view[0] : undefined;

    return (
        <Treemap
            locale={locale}
            height={VIS_HEIGHT}
            measures={metrics}
            viewBy={viewBy}
            segmentBy={segment[0]}
            filters={filters}
            config={{
                ...visualizationTooltipOptions,
                ...legendTooltipOptions,
                colorPalette,
                separators: props.separators,
                enableAccessibleTooltip: props.enableAccessibleChartTooltip,
            }}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            onError={onError}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderHeatmap = (
    locale: string,
    buckets: ReturnType<typeof useBucketData>,
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        execConfig?: IExecutionConfig;
        separators?: ISeparators;
    },
) => {
    const { metrics, view, stack } = buckets;

    return (
        <Heatmap
            locale={locale}
            height={VIS_HEIGHT}
            measure={metrics[0]}
            rows={view[0]}
            columns={stack[0]}
            filters={filters}
            sortBy={sortBy.length ? sortBy : undefined}
            config={{
                ...visualizationTooltipOptions,
                ...legendTooltipOptions,
                colorPalette,
                separators: props.separators,
                enableAccessibleTooltip: props.enableAccessibleChartTooltip,
            }}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            onError={onError}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderWaterfallChart = (
    locale: string,
    visualization: NonNullable<IChatConversationVisualisationContent["visualization"]>,
    buckets: ReturnType<typeof useBucketData>,
    filters: IFilter[],
    sortBy: ISortItem[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        execConfig?: IExecutionConfig;
        separators?: ISeparators;
    },
) => {
    const { metrics, view } = buckets;
    const total = visualization.insight.properties["controls"]?.["total"] as ITotalConfig | undefined;

    return (
        <WaterfallChart
            locale={locale}
            height={VIS_HEIGHT}
            measures={metrics}
            viewBy={view[0]}
            filters={filters}
            sortBy={sortBy}
            config={{
                ...visualizationTooltipOptions,
                ...legendTooltipOptions,
                colorPalette,
                separators: props.separators,
                enableAccessibleTooltip: props.enableAccessibleChartTooltip,
                ...(total ? { total } : {}),
            }}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            onError={onError}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderRepeater = (
    locale: string,
    visualization: NonNullable<IChatConversationVisualisationContent["visualization"]>,
    buckets: ReturnType<typeof useBucketData>,
    filters: IFilter[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        execConfig?: IExecutionConfig;
        separators?: ISeparators;
    },
) => {
    const { attribute, columns, view } = buckets;

    return (
        <Repeater
            locale={locale}
            height={VIS_HEIGHT}
            attribute={attribute[0]}
            columns={columns}
            viewBy={view[0]}
            filters={filters}
            config={{
                colorPalette,
                separators: props.separators,
                inlineVisualizations: visualization.insight.properties["inlineVisualizations"],
            }}
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            onError={onError}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderTable = (
    locale: string,
    buckets: ReturnType<typeof useBucketData>,
    filters: IFilter[],
    sortBy: ISortItem[],
    onError: OnError,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableAccessibleChartTooltip?: boolean;
        enableNewPivotTable?: boolean;
        enableChangeAnalysis?: boolean;
        agGridToken?: string;
        execConfig?: IExecutionConfig;
        separators?: ISeparators;
    },
) => {
    const TableComponent = props.enableNewPivotTable ? PivotTableNext : PivotTable;
    const { metrics, attribute, trend, view, stack, segment, columns } = buckets;

    return (
        <TableComponent
            locale={locale}
            measures={metrics}
            filters={filters}
            sortBy={sortBy}
            columns={[...columns.filter(isAttribute), ...stack, ...segment].filter(Boolean)}
            rows={[...attribute, ...trend, ...view].filter(Boolean)}
            config={
                props.enableNewPivotTable
                    ? { agGridToken: props.agGridToken, separators: props.separators }
                    : { separators: props.separators }
            }
            drillableItems={props.drillableItems}
            onDrill={onDrill}
            onError={onError}
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderHeadline = (
    locale: string,
    theme: ITheme | undefined,
    buckets: ReturnType<typeof useBucketData>,
    filters: IFilter[],
    colorPalette: IColorPalette | undefined,
    onError: OnError,
    onSuccess: OnExportReady,
    onDrill: OnFiredDrillEvent,
    props: {
        drillableItems?: ExplicitDrill[];
        enableChangeAnalysis?: boolean;
        execConfig?: IExecutionConfig;
        separators?: ISeparators;
    },
) => {
    const { metrics, secondary_metrics } = buckets;

    return (
        <ScopedThemeProvider theme={theme}>
            <Headline
                locale={locale}
                primaryMeasure={metrics[0]}
                secondaryMeasures={secondary_metrics}
                filters={filters}
                config={{
                    ...visualizationTooltipOptions,
                    ...getHeadlineComparison(metrics),
                    colorPalette,
                    separators: props.separators,
                }}
                drillableItems={props.drillableItems}
                onDrill={onDrill}
                onError={onError}
                onExportReady={onSuccess}
                execConfig={props.execConfig}
            />
        </ScopedThemeProvider>
    );
};

function useBucketData(buckets: IBucket[]) {
    return useMemo(() => {
        const metrics = buckets.find((b) => b.localIdentifier === "measures")?.items.filter(isMeasure) ?? [];
        const secondary_metrics =
            buckets.find((b) => b.localIdentifier === "secondary_measures")?.items.filter(isMeasure) ?? [];
        const tertiary_metrics =
            buckets.find((b) => b.localIdentifier === "tertiary_measures")?.items.filter(isMeasure) ?? [];
        const view = buckets.find((b) => b.localIdentifier === "view")?.items.filter(isAttribute) ?? [];
        const stack = buckets.find((b) => b.localIdentifier === "stack")?.items.filter(isAttribute) ?? [];
        const trend = buckets.find((b) => b.localIdentifier === "trend")?.items.filter(isAttribute) ?? [];
        const columns = buckets.find((b) => b.localIdentifier === "columns")?.items ?? [];
        const attribute =
            buckets.find((b) => b.localIdentifier === "attribute")?.items.filter(isAttribute) ?? [];
        const segment = buckets.find((b) => b.localIdentifier === "segment")?.items.filter(isAttribute) ?? [];
        const attribute_from =
            buckets.find((b) => b.localIdentifier === "attribute_from")?.items.filter(isAttribute) ?? [];
        const attribute_to =
            buckets.find((b) => b.localIdentifier === "attribute_to")?.items.filter(isAttribute) ?? [];

        return {
            metrics,
            secondary_metrics,
            tertiary_metrics,
            view,
            stack,
            trend,
            segment,
            attribute,
            columns,
            attribute_from,
            attribute_to,
        };
    }, [buckets]);
}
