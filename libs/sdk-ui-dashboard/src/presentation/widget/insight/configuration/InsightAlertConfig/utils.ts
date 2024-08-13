// (C) 2024 GoodData Corporation

import {
    bucketMeasures,
    IAlertComparisonOperator,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IBucket,
    IFilter,
    IInsight,
    IMeasure,
    insightBucket,
    measureAlias,
    measureTitle,
} from "@gooddata/sdk-model";
import { COMPARISON_OPERATORS } from "./constants.js";
import { BucketNames } from "@gooddata/sdk-ui";

/**
 * @internal
 */
export const getMeasureTitle = (measure: IMeasure) => {
    return measure ? measureTitle(measure) ?? measureAlias(measure) : undefined;
};

/**
 * @internal
 */
export const getComparisonOperatorTitle = (operator: IAlertComparisonOperator): string => {
    const titleByOperator: Record<IAlertComparisonOperator, string> = {
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_LESS_THAN]: "Is less than",
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_LESS_THAN_OR_EQUALS]: "Is less than or equal to",
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_GREATER_THAN]: "Is greater than",
        [COMPARISON_OPERATORS.COMPARISON_OPERATOR_GREATER_THAN_OR_EQUALS]: "Is greater than or equal to",
    };

    return titleByOperator[operator];
};

/**
 * @internal
 */
export const createDefaultAlert = (
    filters: IFilter[],
    measure: IMeasure,
    notificationChannelId: string,
    comparisonOperator: IAlertComparisonOperator = "GREATER_THAN",
): IAutomationMetadataObjectDefinition => {
    return {
        type: "automation",
        title: getMeasureTitle(measure),
        description: "",
        webhook: notificationChannelId,
        alert: {
            condition: {
                type: "comparison",
                left: measure,
                operator: comparisonOperator,
                right: undefined!,
            },
            execution: {
                attributes: [],
                measures: [measure],
                filters,
            },
            trigger: {
                state: "ACTIVE",
            },
        },
    };
};

type InsightType =
    | "headline"
    | "scatter"
    | "donut"
    | "treemap"
    | "combo2"
    | "heatmap"
    | "bubble"
    | "bullet"
    | "bar"
    | "table"
    | "area"
    | "column"
    | "line"
    | "pushpin"
    | "pie"
    | "sankey"
    | "dependencywheel"
    | "funnel"
    | "pyramid"
    | "waterfall"
    | "repeater";

export const getSupportedInsightMeasuresByInsight = (insight: IInsight) => {
    const visualizationUrl = insight?.insight.visualizationUrl;
    const insightType = visualizationUrl?.split(":")[1] as InsightType;

    switch (insightType) {
        case "headline": {
            const insightMeasuresBucket: IBucket | undefined = insight
                ? insightBucket(insight, BucketNames.MEASURES)
                : undefined;
            return insightMeasuresBucket ? bucketMeasures(insightMeasuresBucket) : [];
        }
        case "scatter":
        case "donut":
        case "treemap":
        case "combo2":
        case "heatmap":
        case "bubble":
        case "bullet":
        case "bar":
        case "table":
        case "area":
        case "column":
        case "line":
        case "pushpin":
        case "pie":
        case "sankey":
        case "dependencywheel":
        case "funnel":
        case "pyramid":
        case "waterfall":
        case "repeater":
        default: {
            return [];
        }
    }
};

/**
 * @internal
 */
export const mockAlertAutomation = (): IAutomationMetadataObject => {
    return {
        id: "1",
        ref: {
            identifier: "1",
            type: "automation",
        },
        uri: "1",
        type: "automation",
        title: "# of Orders",
        description: "Greater than 9000",
        production: true,
        deprecated: false,
        unlisted: false,
        alert: {
            condition: {
                type: "comparison",
                left: {
                    measure: {
                        localIdentifier: "79f6a7051f3e43288b71df96c4b0da39",
                        definition: {
                            measureDefinition: {
                                item: {
                                    identifier: "order_unit_price",
                                    type: "fact",
                                },
                                aggregation: "sum",
                                filters: [],
                            },
                        },
                        title: "Sum of Order unit price",
                        format: "#,##0.00",
                    },
                },
                operator: "GREATER_THAN",
                right: 12,
            },
            execution: {
                attributes: [],
                measures: [
                    {
                        measure: {
                            localIdentifier: "79f6a7051f3e43288b71df96c4b0da39",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        identifier: "order_unit_price",
                                        type: "fact",
                                    },
                                    aggregation: "sum",
                                    filters: [],
                                },
                            },
                            title: "Sum of Order unit price",
                            format: "#,##0.00",
                        },
                    },
                ],
                filters: [],
            },
            trigger: {
                state: "ACTIVE",
            },
        },
    };
};
