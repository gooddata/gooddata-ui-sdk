// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";
import { useDispatch } from "react-redux";

import {
    type IChatConversationVisualisationContent,
    type IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";
import {
    DefaultLocale,
    type IColorPalette,
    type IDrillOrigin,
    type IExecutionConfig,
    type IInsight,
    type IKeyDriveAnalysis,
    type ISeparators,
    isLocale,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError, type IDrillEvent } from "@gooddata/sdk-ui";
import {
    type IDashboardKeyDriverCombinationItem,
    getKdaKeyDriverCombinations,
} from "@gooddata/sdk-ui-dashboard";
import { InsightRenderer, convertInsightToTableDefinition } from "@gooddata/sdk-ui-ext";
import { useAgGridToken } from "@gooddata/sdk-ui-pivot/next";
import { ScopedThemeProvider, useTheme } from "@gooddata/sdk-ui-theme-provider";

import { mapVisualizationAnomalyDetectionToChartConfig } from "../../../anomalyDetection/anomalyDetectionMapping.js";
import { mapVisualizationClusteringToChartConfig } from "../../../clustering/clusteringMapping.js";
import { mapVisualizationForecastToChartConfig } from "../../../forecast/forecastMapping.js";
import { type IChatConversationLocalItem } from "../../../model.js";
import {
    saveVisualisationRenderStatusAction,
    visualizationErrorAction,
} from "../../../store/messages/messagesSlice.js";
import { storeKdaReturnFocusFromDrillContext } from "../../../utils/kdaReturnFocus.js";

import { changeAnalysisDrills } from "./utils/changeAnalysisDrills.js";

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

const defaultsChartOptions = {
    enableChartSorting: true,
    enableReversedStacking: true,
    enableSeparateTotalLabels: true,
};

function analyticsConfigFor(insight: IInsight["insight"]) {
    const controls = insight.properties["controls"];

    if (insight.visualizationUrl === "local:line") {
        const forecast = mapVisualizationForecastToChartConfig(controls);
        const anomalies = mapVisualizationAnomalyDetectionToChartConfig(controls);

        return {
            ...(forecast ? { forecast } : {}),
            ...(anomalies ? { anomalies } : {}),
        };
    }

    if (insight.visualizationUrl === "local:scatter") {
        const clustering = mapVisualizationClusteringToChartConfig(controls);

        return clustering ? { clustering } : {};
    }

    return {};
}

export type ConversationVisualisationProps = {
    message: IChatConversationLocalItem;
    visualization: NonNullable<IChatConversationVisualisationContent["visualization"]>;
    colorPalette?: IColorPalette;
    separators?: ISeparators;
    execConfig?: IExecutionConfig;
    settings?: IUserWorkspaceSettings;
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
    enableAccessibleChartTooltip?: boolean;
};

export function ConversationVisualisation({
    message,
    colorPalette,
    separators,
    visualization,
    execConfig,
    settings,
    agGridToken,
    isTable,
    onVisualisationError,
    onDrillFired,
    enableDrilling = true,
    enableChangeAnalysis = false,
    enableSecondGranularities = false,
    enableAccessibleChartTooltip = false,
}: ConversationVisualisationProps) {
    const intl = useIntl();
    const dispatch = useDispatch();
    const resolvedAgGridToken = useAgGridToken(agGridToken);
    const kpiTheme = useKpiTheme();

    const insight = useMemo(() => {
        const originalInsight = { insight: visualization.insight };

        return isTable ? convertInsightToTableDefinition(originalInsight, { settings }) : originalInsight;
    }, [isTable, settings, visualization.insight]);

    const config = useMemo(() => {
        const commonConfig = {
            ...defaultsChartOptions,
            ...visualizationTooltipOptions,
            ...legendTooltipOptions,
            separators,
            enableAccessibleTooltip: enableAccessibleChartTooltip,
            cooperativeGestures: true,
            agGridToken: resolvedAgGridToken,
        };

        return {
            ...commonConfig,
            ...(isTable ? {} : analyticsConfigFor(visualization.insight)),
        };
    }, [enableAccessibleChartTooltip, isTable, resolvedAgGridToken, separators, visualization.insight]);

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

    return (
        <ScopedThemeProvider theme={kpiTheme}>
            <InsightRenderer
                insight={insight}
                locale={isLocale(intl.locale) ? intl.locale : DefaultLocale}
                settings={settings}
                colorPalette={colorPalette}
                config={config}
                drillableItems={drillableItems}
                onDrill={handlerDrill}
                onError={handleSdkError}
                onExportReady={handleSuccess}
                execConfig={execConfig}
            />
        </ScopedThemeProvider>
    );
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
