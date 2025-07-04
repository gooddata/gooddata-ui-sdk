// (C) 2024-2025 GoodData Corporation
import { PayloadAction } from "@reduxjs/toolkit";
import { messagesSelector } from "../messages/messagesSelectors.js";
import { call, getContext, put, select } from "redux-saga/effects";
import { isVisualizationContents, Message } from "../../model.js";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    applyRatioRule,
    IAttribute,
    IAttributeOrMeasure,
    IBucket,
    IGenAIVisualization,
    IInsight,
    IInsightDefinition,
    newBucket,
} from "@gooddata/sdk-model";
import { prepareExecution } from "../../components/messages/contents/useExecution.js";
import { BucketNames } from "@gooddata/sdk-ui";
import { saveVisualizationErrorAction, saveVisualizationSuccessAction } from "../messages/messagesSlice.js";
import { getHeadlineComparison } from "../../utils.js";

export function* onVisualizationSave({
    payload,
}: PayloadAction<{
    visualizationId: string;
    visualizationTitle: string;
    assistantMessageId: string;
    explore: boolean;
}>) {
    try {
        // Retrieve backend from context
        const backend: IAnalyticalBackend = yield getContext("backend");
        const workspace: string = yield getContext("workspace");
        const messages: Message[] = yield select(messagesSelector);
        const assistantMessage = messages.find((message) => message.localId === payload.assistantMessageId);

        if (!assistantMessage) return;

        // Find the content with the visualization
        const visualizationContent = assistantMessage.content
            .filter(isVisualizationContents)
            .flatMap((content) => content.createdVisualizations)
            .find((visualization) => visualization.id === payload.visualizationId);

        if (!visualizationContent) return;

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
        newBucket(BucketNames.VIEW, ...(viewBy as IAttribute[])),
    ];

    if (stackBy) {
        newBucket(BucketNames.STACK, stackBy as IAttribute);
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
            buckets: [
                newBucket(BucketNames.MEASURES, ...metrics),
                newBucket(BucketNames.VIEW, ...(viewBy as IAttribute[])),
            ],
            filters: exec.filters,
            sorts: [],
            properties: {},
        },
    };
};

const buildLineChart = (
    visualizationContent: IGenAIVisualization,
    visualizationTitle: string,
): IInsightDefinition => {
    const exec = prepareExecution(visualizationContent);

    const metrics = applyRatioRule(exec.metrics as IAttributeOrMeasure[]);
    const viewBy = exec.dimensions[0];
    const segmentBy = exec.dimensions[1];

    const buckets: IBucket[] = [
        newBucket(BucketNames.MEASURES, ...metrics),
        newBucket(BucketNames.TREND, viewBy as IAttribute),
    ];

    if (segmentBy && metrics.length <= 1) {
        newBucket(BucketNames.SEGMENT, segmentBy as IAttribute);
    }

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
        newBucket(BucketNames.ATTRIBUTE, ...(exec.dimensions as IAttribute[])),
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
