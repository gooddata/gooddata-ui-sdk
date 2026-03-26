// (C) 2024-2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";
import { call, getContext, put, select } from "redux-saga/effects";
import { v4 as uuidV4 } from "uuid";

import { type IAnalyticalBackend, type IChatConversation } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeOrMeasure,
    type IBucket,
    type IGenAIVisualization,
    type IInsight,
    type IInsightDefinition,
    applyRatioRule,
    newBucket,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { mapVisualizationAnomalyDetectionToChartConfig } from "../../anomalyDetection/anomalyDetectionMapping.js";
import { mapVisualizationClusteringToChartConfig } from "../../clustering/clusteringMapping.js";
import { prepareExecution } from "../../components/messages/contents/useExecution.js";
import { mapVisualizationForecastToChartConfig } from "../../forecast/forecastMapping.js";
import {
    type IChatConversationLocalItem,
    type IChatConversationMultipartLocalPart,
    type Message,
    isVisualizationContents,
} from "../../model.js";
import { getHeadlineComparison } from "../../utils.js";
import {
    conversationMessagesSelector,
    conversationSelector,
    messagesSelector,
} from "../messages/messagesSelectors.js";
import { saveVisualizationErrorAction, saveVisualizationSuccessAction } from "../messages/messagesSlice.js";

export function* onVisualizationSave({
    payload,
}: PayloadAction<{
    visualizationId: string;
    visualizationTitle: string;
    assistantMessageId: string;
    explore: boolean;
}>) {
    // Retrieve backend from context
    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");
    const conversation: IChatConversation = yield select(conversationSelector);

    try {
        if (conversation) {
            const messages: IChatConversationLocalItem[] = yield select(conversationMessagesSelector);
            const assistantMessage = messages.find(
                (message) => message.localId === payload.assistantMessageId,
            );

            if (!assistantMessage || assistantMessage.content.type !== "multipart") {
                return;
            }

            const visualizationContent: IChatConversationMultipartLocalPart | undefined =
                assistantMessage.content.parts
                    .filter((filter) => filter.type === "visualization")
                    .find((content) => content.visualization.id === payload.visualizationId);

            if (!visualizationContent) {
                return;
            }

            const { visualizationId } = yield call(
                checkId,
                backend,
                workspace,
                conversation.id,
                payload.visualizationId,
            );

            const visualization = {
                ...visualizationContent.visualization,
                id: visualizationId,
            };

            //TODO: s.hacker Save visualization
            // eslint-disable-next-line no-console
            console.log("visualization", visualization);

            const savedVisualization: IInsight = yield call(
                backend.workspace(workspace).insights().createInsight,
                {} as IInsightDefinition,
            );

            yield put(
                saveVisualizationSuccessAction({
                    visualizationId: payload.visualizationId,
                    assistantMessageId: payload.assistantMessageId,
                    savedVisualizationId: savedVisualization.insight.identifier,
                    explore: payload.explore,
                }),
            );
        } else {
            const messages: Message[] = yield select(messagesSelector);
            const assistantMessage = messages.find(
                (message) => message.localId === payload.assistantMessageId,
            );

            if (!assistantMessage) {
                return;
            }

            // Find the content with the visualization
            const visualizationContent = assistantMessage.content
                .filter(isVisualizationContents)
                .flatMap((content) => content.createdVisualizations)
                .find((visualization) => visualization.id === payload.visualizationId);

            if (!visualizationContent) {
                return;
            }

            const visDefinition = buildInsightDefinition(visualizationContent, payload.visualizationTitle);

            const savedVisualization: IInsight = yield call(
                backend.workspace(workspace).insights().createInsight,
                visDefinition,
            );

            yield put(
                saveVisualizationSuccessAction({
                    visualizationId: payload.visualizationId,
                    assistantMessageId: payload.assistantMessageId,
                    savedVisualizationId: savedVisualization.insight.identifier,
                    explore: payload.explore,
                }),
            );
        }
    } catch (e) {
        console.error(e);

        const error = e as Error;
        yield put(
            saveVisualizationErrorAction({
                error: {
                    name: error.name,
                    message: error.message,
                },
                visualizationId: payload.visualizationId,
                assistantMessageId: payload.assistantMessageId,
            }),
        );
    }
}

const buildInsightDefinition = (
    visualizationContent: IGenAIVisualization,
    visualizationTitle: string,
): IInsightDefinition => {
    switch (visualizationContent.visualizationType) {
        case "BAR":
            return buildBarChart(visualizationContent, visualizationTitle);
        case "COLUMN":
            return buildColumnChart(visualizationContent, visualizationTitle);
        case "PIE":
            return buildPieChart(visualizationContent, visualizationTitle);
        case "LINE":
            return buildLineChart(visualizationContent, visualizationTitle);
        case "SCATTER":
            return buildScatterPlot(visualizationContent, visualizationTitle);
        case "TABLE":
            return buildTableChart(visualizationContent, visualizationTitle);
        case "HEADLINE":
            return buildHeadlineChart(visualizationContent, visualizationTitle);
        default:
            return assertNever(visualizationContent.visualizationType);
    }
};

const assertNever = (type: never): never => {
    throw new Error(`Unknown visualization type ${type}`);
};

const buildBarChart = (
    visualizationContent: IGenAIVisualization,
    visualizationTitle: string,
): IInsightDefinition => {
    const exec = prepareExecution(visualizationContent);

    const metrics = applyRatioRule(exec.metrics as IAttributeOrMeasure[]);
    const viewBy = exec.dimensions.slice(0, 2);
    const stackBy = exec.dimensions[2];

    const buckets: IBucket[] = [
        newBucket(BucketNames.MEASURES, ...metrics),
        newBucket(BucketNames.VIEW, ...viewBy),
    ];

    if (stackBy) {
        newBucket(BucketNames.STACK, stackBy);
    }

    return {
        insight: {
            title: visualizationTitle,
            visualizationUrl: "local:bar",
            buckets: buckets,
            filters: exec.filters,
            sorts: [],
            properties:
                exec.metrics.length > 1 && exec.dimensions.length === 2
                    ? {
                          controls: {
                              stackMeasures: true,
                          },
                      }
                    : {},
        },
    };
};

const buildColumnChart = (
    visualizationContent: IGenAIVisualization,
    visualizationTitle: string,
): IInsightDefinition => {
    const definition = buildBarChart(visualizationContent, visualizationTitle);

    definition.insight.visualizationUrl = "local:column";

    return definition;
};

const buildPieChart = (
    visualizationContent: IGenAIVisualization,
    visualizationTitle: string,
): IInsightDefinition => {
    const exec = prepareExecution(visualizationContent);

    const metrics = applyRatioRule(exec.metrics as IAttributeOrMeasure[]);
    const viewBy = metrics.length <= 1 ? exec.dimensions.slice(0, 2) : [];

    return {
        insight: {
            title: visualizationTitle,
            visualizationUrl: "local:pie",
            buckets: [newBucket(BucketNames.MEASURES, ...metrics), newBucket(BucketNames.VIEW, ...viewBy)],
            filters: exec.filters,
            sorts: [],
            properties: {},
        },
    };
};

export const buildLineChart = (
    visualizationContent: IGenAIVisualization,
    visualizationTitle: string,
): IInsightDefinition => {
    const exec = prepareExecution(visualizationContent);

    const metrics = applyRatioRule(exec.metrics as IAttributeOrMeasure[]);
    const viewBy = exec.dimensions[0];
    const segmentBy = exec.dimensions[1];

    const buckets: IBucket[] = [
        newBucket(BucketNames.MEASURES, ...metrics),
        newBucket(BucketNames.TREND, viewBy),
    ];

    if (segmentBy && metrics.length <= 1) {
        newBucket(BucketNames.SEGMENT, segmentBy);
    }

    const forecast = mapVisualizationForecastToChartConfig(visualizationContent);
    const anomalies = mapVisualizationAnomalyDetectionToChartConfig(visualizationContent);

    const controls = {
        ...(forecast ? { forecast } : {}),
        ...(anomalies ? { anomalies } : {}),
    };

    return {
        insight: {
            title: visualizationTitle,
            visualizationUrl: "local:line",
            buckets: buckets,
            filters: exec.filters,
            sorts: [],
            properties: {
                legend: {
                    responsive: "autoPositionWithPopup",
                },
                ...(Object.keys(controls).length > 0 ? { controls } : {}),
            },
        },
    };
};

export const buildScatterPlot = (
    visualizationContent: IGenAIVisualization,
    visualizationTitle: string,
): IInsightDefinition => {
    const exec = prepareExecution(visualizationContent);

    const metrics = applyRatioRule(exec.metrics as IAttributeOrMeasure[]);
    const xAxisMeasure = metrics[0];
    const yAxisMeasure = metrics[1];
    const attribute = exec.dimensions[0];
    const segmentBy = exec.dimensions[1];

    const buckets: IBucket[] = [
        newBucket(BucketNames.MEASURES, xAxisMeasure),
        newBucket(BucketNames.SECONDARY_MEASURES, yAxisMeasure),
        newBucket(BucketNames.ATTRIBUTE, attribute),
    ];

    if (segmentBy) {
        buckets.push(newBucket(BucketNames.SEGMENT, segmentBy));
    }

    const clustering = mapVisualizationClusteringToChartConfig(visualizationContent);

    return {
        insight: {
            title: visualizationTitle,
            visualizationUrl: "local:scatter",
            buckets: buckets,
            filters: exec.filters,
            sorts: [],
            properties: {
                ...(clustering ? { controls: { clustering } } : {}),
            },
        },
    };
};

const buildTableChart = (
    visualizationContent: IGenAIVisualization,
    visualizationTitle: string,
): IInsightDefinition => {
    const exec = prepareExecution(visualizationContent);

    const buckets: IBucket[] = [
        newBucket(BucketNames.MEASURES, ...applyRatioRule(exec.metrics as IAttributeOrMeasure[])),
        newBucket(BucketNames.ATTRIBUTE, ...exec.dimensions),
    ];

    return {
        insight: {
            title: visualizationTitle,
            visualizationUrl: "local:table",
            buckets: buckets,
            filters: exec.filters,
            sorts: [],
            properties: {},
        },
    };
};

const buildHeadlineChart = (
    visualizationContent: IGenAIVisualization,
    visualizationTitle: string,
): IInsightDefinition => {
    const exec = prepareExecution(visualizationContent);

    const metrics = applyRatioRule(exec.metrics as IAttributeOrMeasure[]);

    const buckets: IBucket[] = [newBucket(BucketNames.MEASURES, metrics[0])];

    if (metrics.length > 1) {
        buckets.push(newBucket(BucketNames.SECONDARY_MEASURES, ...[metrics[1], metrics[2]].filter(Boolean)));
    }

    return {
        insight: {
            title: visualizationTitle,
            visualizationUrl: "local:headline",
            buckets,
            filters: exec.filters,
            sorts: [],
            properties: {
                controls: {
                    ...getHeadlineComparison(metrics),
                },
            },
        },
    };
};

async function checkId(
    backend: IAnalyticalBackend,
    workspace: string,
    conversationId: string,
    visualizationId: string,
) {
    try {
        const existing = await backend.workspace(workspace).insights().getInsight({
            identifier: visualizationId,
            type: "insight",
        });

        if (existing) {
            const id = uuidV4();

            await backend
                .workspace(workspace)
                .genAI()
                .getChatConversations()
                .getConversationThread(conversationId)
                .resaveVisualisation(visualizationId, id);

            return {
                visualizationId: id,
            };
        } else {
            return {
                visualizationId,
            };
        }
    } catch (e) {
        return {
            error: e,
            visualizationId,
        };
    }
}
