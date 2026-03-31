// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";
import { useDispatch } from "react-redux";

import { type IChatConversationVisualisationContent } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeOrMeasure,
    type IBucket,
    type IColorPalette,
    type IDrillOrigin,
    type IExecutionConfig,
    type IFilter,
    type IKeyDriveAnalysis,
    type ISortItem,
    type ITheme,
    type ObjRef,
    isAttribute,
    isMeasure,
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
    visualization: IChatConversationVisualisationContent["visualization"];
    colorPalette?: IColorPalette;
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
    onDrillFired,
    enableChangeAnalysis = false,
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
        if (visualization && enableChangeAnalysis) {
            if (visualization.insight.visualizationUrl === "local:table") {
                return visualization.insight.buckets
                    .map((bucket) => {
                        return bucket.items.map(headerPredicate);
                    })
                    .flat();
            }
            return visualization.insight.buckets
                .map((bucket) => {
                    return bucket.items.map((attr) => {
                        if (isAttribute(attr)) {
                            return attr.attribute.displayForm;
                        }
                        return undefined;
                    });
                })
                .flat()
                .filter(Boolean) as ObjRef[];
        }
        return undefined;
    }, [enableChangeAnalysis, visualization]);

    const handleSdkError = useCallback(
        (error: GoodDataSdkError) => {
            if (!visualization) {
                return;
            }
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
                },
            );
        }

        switch (visualization.insight.visualizationUrl) {
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
                    },
                );
            case "local:pie":
                return renderPieChart(
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
    },
) => {
    const { metrics, view, stack } = buckets;

    return (
        <BarChart
            locale={locale}
            height={VIS_HEIGHT}
            measures={metrics}
            viewBy={view[0]}
            stackBy={stack[0]}
            sortBy={sortBy}
            config={{
                ...visualizationTooltipOptions,
                ...legendTooltipOptions,
                colorPalette,
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
    visualization: IChatConversationVisualisationContent["visualization"],
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

const renderPieChart = (
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
    },
) => {
    const { metrics, view } = buckets;

    return (
        <PieChart
            locale={locale}
            height={VIS_HEIGHT}
            measures={metrics}
            viewBy={view[0]}
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
            onExportReady={onSuccess}
            execConfig={props.execConfig}
        />
    );
};

const renderScatterPlot = (
    locale: string,
    visualization: IChatConversationVisualisationContent["visualization"],
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
    },
) => {
    const clustering = mapVisualizationClusteringToChartConfig(visualization.insight.properties["controls"]);
    const clusteringConfig = mapVisualizationClusteringToBackendConfig(
        visualization.insight.properties["controls"],
    );

    const { metrics, attribute, segment } = buckets;

    return (
        <ScatterPlot
            locale={locale}
            height={VIS_HEIGHT}
            xAxisMeasure={metrics[0]}
            yAxisMeasure={metrics[1]}
            attribute={attribute[0]}
            segmentBy={segment[0]}
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
    },
) => {
    const TableComponent = props.enableNewPivotTable ? PivotTableNext : PivotTable;
    const { metrics, rows } = buckets;

    return (
        <TableComponent
            locale={locale}
            measures={metrics}
            rows={rows}
            filters={filters}
            sortBy={sortBy}
            config={props.enableNewPivotTable ? { agGridToken: props.agGridToken } : undefined}
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

function headerPredicate(m: IAttributeOrMeasure): IHeaderPredicate {
    return (header) => {
        if (isMeasureDescriptor(header) && isMeasure(m)) {
            return header.measureHeaderItem.localIdentifier === m.measure.localIdentifier;
        }
        return false;
    };
}

function useBucketData(buckets: IBucket[]) {
    return useMemo(() => {
        const metrics = buckets.find((b) => b.localIdentifier === "measures")?.items.filter(isMeasure) ?? [];
        const secondary_metrics =
            buckets.find((b) => b.localIdentifier === "secondary_measures")?.items.filter(isMeasure) ?? [];
        const view = buckets.find((b) => b.localIdentifier === "view")?.items.filter(isAttribute) ?? [];
        const stack = buckets.find((b) => b.localIdentifier === "stack")?.items.filter(isAttribute) ?? [];
        const trend = buckets.find((b) => b.localIdentifier === "trend")?.items.filter(isAttribute) ?? [];
        const rows = buckets.find((b) => b.localIdentifier === "rows")?.items.filter(isAttribute) ?? [];
        const attribute =
            buckets.find((b) => b.localIdentifier === "attribute")?.items.filter(isAttribute) ?? [];
        const segment = buckets.find((b) => b.localIdentifier === "segment")?.items.filter(isAttribute) ?? [];

        return {
            metrics,
            secondary_metrics,
            view,
            stack,
            trend,
            segment,
            attribute,
            rows,
        };
    }, [buckets]);
}
