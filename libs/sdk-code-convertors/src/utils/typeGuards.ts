// (C) 2023-2026 GoodData Corporation

import type {
    All,
    ArithmeticMetricField,
    Attribute,
    AttributeField,
    AttributeFilter,
    AttributeSort,
    CalculatedMetricField,
    Comparison,
    ContainerWidget,
    DashboardAbsoluteDateFilter,
    DashboardAttributeFilter,
    DashboardRelativeDateFilter,
    Dataset,
    DateDataset,
    DateFilter,
    Fact,
    InlineMetricField,
    Metric,
    MetricField,
    MetricSort,
    MetricValueFilter,
    MultipleConditions,
    PoPMetricField,
    PreviousPeriodMetricField,
    Range,
    RankingFilter,
    RichTextWidget,
    VisualisationWidget,
    VisualizationSwitcherWidget,
} from "../schemas/v1/metadata.js";

export type ReferenceObject = {
    type:
        | "fact"
        | "label"
        | "metric"
        | "dataset"
        | "attribute"
        | "visualisation"
        | "plugin"
        | "dashboard"
        | "attribute_hierarchy";
    identifier: string;
};

export const SupportedReferenceTypes = ["fact", "label", "metric", "dataset", "attribute"] as const;

export function parseReferenceObject(obj: string): ReferenceObject | null {
    const [t, identifier] = obj?.split("/") ?? [];
    const type = t as ReferenceObject["type"];

    if (Boolean(type && identifier) && SupportedReferenceTypes.includes(type as any)) {
        return {
            identifier,
            type,
        };
    }
    return null;
}

export const AttrTypes: Attribute["type"][] = ["attribute"];

export function isAttribute(obj: unknown): obj is Attribute {
    if (typeof obj === "object" && obj && "type" in obj) {
        return AttrTypes.includes(obj.type as Attribute["type"]);
    }
    return false;
}

export function isAttributeField(obj: unknown): obj is AttributeField {
    if (
        typeof obj === "object" &&
        obj &&
        "using" in obj &&
        typeof obj.using === "string" &&
        !("aggregation" in obj)
    ) {
        const id = parseReferenceObject(obj.using);
        return Boolean(id && ["attribute", "label", "fact"].includes(id.type));
    }
    return false;
}

export function isInlineMetricField(obj: unknown): obj is InlineMetricField {
    return typeof obj === "object" && obj !== null && "maql" in obj && typeof obj.maql === "string";
}

export function isMetricField(obj: unknown): obj is MetricField {
    if (typeof obj === "object" && obj && "using" in obj && typeof obj.using === "string") {
        const id = parseReferenceObject(obj.using);
        return Boolean(id && ["metric"].includes(id.type));
    }
    return false;
}

export function isCalculatedMetricField(obj: unknown): obj is CalculatedMetricField {
    if (
        typeof obj === "object" &&
        obj &&
        "using" in obj &&
        typeof obj.using === "string" &&
        "aggregation" in obj &&
        obj.aggregation
    ) {
        const id = parseReferenceObject(obj.using);
        return Boolean(id && ["attribute", "label", "fact"].includes(id.type));
    }
    return false;
}

export function isArithmeticMetricField(obj: unknown): obj is ArithmeticMetricField {
    if (typeof obj === "object" && obj && "using" in obj && "operator" in obj && obj.operator) {
        return Array.isArray(obj.using);
    }
    return false;
}

export function isPoPMetricField(obj: unknown): obj is PoPMetricField {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "using" in obj &&
        "date_filter" in obj &&
        "type" in obj &&
        obj.type === "PREVIOUS_YEAR"
    );
}

export function isPreviousPeriodField(obj: unknown): obj is PreviousPeriodMetricField {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "using" in obj &&
        "date_filter" in obj &&
        "type" in obj &&
        obj.type === "PREVIOUS_PERIOD"
    );
}

export function isDateFilter(obj: unknown): obj is DateFilter {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "using" in obj &&
        "type" in obj &&
        obj.type === "date_filter"
    );
}

export function isAbsoluteDateFilter(obj: unknown): obj is DateFilter {
    return (
        isDateFilter(obj) && typeof obj.from === "string" && typeof obj.to === "string" && !obj.granularity
    );
}

export function isRelativeDateFilter(obj: unknown): obj is DateFilter {
    // Case 1: Date filter with from/to as numbers and granularity
    if (isDateFilter(obj) && typeof obj.from === "number" && typeof obj.to === "number" && obj.granularity) {
        return true;
    }
    // Case 2: All-time date filter (no from/to, possible granularity)
    return isAllTimeDateFilter(obj);
}

export function isAllTimeDateFilter(obj: unknown): obj is DateFilter {
    return isDateFilter(obj) && typeof obj.from === "undefined" && typeof obj.to === "undefined";
}

export function isAttributeFilter(obj: unknown): obj is AttributeFilter {
    if (
        typeof obj === "object" &&
        obj &&
        "using" in obj &&
        "type" in obj &&
        obj.type === "attribute_filter"
    ) {
        const id = parseReferenceObject(obj.using as string);
        return Boolean(id && ["attribute", "label"].includes(id.type));
    }
    return false;
}

export function isPositiveAttributeFilter(obj: unknown): obj is AttributeFilter {
    if (isAttributeFilter(obj)) {
        return Boolean(obj.state?.include);
    }
    return false;
}

export function isNegativeAttributeFilter(obj: unknown): obj is AttributeFilter {
    return Boolean(
        typeof obj === "object" &&
        obj &&
        "type" in obj &&
        obj.type === "attribute_filter" &&
        !isPositiveAttributeFilter(obj),
    );
}

export function isMetricValueFilter(obj: unknown): obj is MetricValueFilter {
    if (
        typeof obj === "object" &&
        obj &&
        "using" in obj &&
        "type" in obj &&
        obj.type === "metric_value_filter"
    ) {
        const id = parseReferenceObject(obj.using as string);
        // if reference is parsed, then must by a metric
        if (id) {
            return ["metric"].includes(id.type);
        }
        // probably local id
        return true;
    }
    return false;
}

export function isMetricValueFilterWithConditions(obj: unknown): obj is MultipleConditions {
    return isMetricValueFilter(obj) && Array.isArray((obj as any).conditions);
}

export function isMetricRangeValueFilter(obj: unknown): obj is Range {
    if (isMetricValueFilterWithConditions(obj)) {
        return false;
    }
    if (isMetricValueFilter(obj)) {
        const condition = (obj as any).condition;
        return typeof condition === "string" && ["BETWEEN", "NOT_BETWEEN"].includes(condition);
    }
    return false;
}

export function isMetricComparisonValueFilter(obj: unknown): obj is Comparison {
    if (isMetricValueFilterWithConditions(obj)) {
        return false;
    }
    if (!isMetricValueFilter(obj)) {
        return false;
    }

    const condition = (obj as any).condition;
    if (typeof condition !== "string") {
        // MVF with operator "All" can be represented without a condition.
        return false;
    }

    return [
        "GREATER_THAN",
        "GREATER_THAN_OR_EQUAL_TO",
        "LESS_THAN",
        "LESS_THAN_OR_EQUAL_TO",
        "EQUAL_TO",
        "NOT_EQUAL_TO",
    ].includes(condition);
}

/**
 * MVF with operator "All" can be represented without a condition.
 * In that case it is a no-op at execution time, but may be preserved in persisted insight definition.
 */
export function isMetricAllValueFilter(obj: unknown): obj is All {
    if (!isMetricValueFilter(obj)) {
        return false;
    }

    // New multi-condition MVF: ALL is represented by a condition item with no condition field.
    if (isMetricValueFilterWithConditions(obj)) {
        const conditions = (obj as any).conditions as any[];
        return (
            conditions.length > 0 &&
            conditions.every((c) => c && typeof c === "object" && c.condition == null)
        );
    }

    const condition = (obj as any).condition;
    return condition === undefined || condition === null;
}

export function isRankingFilter(obj: unknown): obj is RankingFilter {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "using" in obj &&
        "type" in obj &&
        obj.type === "ranking_filter"
    );
}

export function isAttributeSort(obj: unknown): obj is AttributeSort {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "type" in obj &&
        obj.type === "attribute_sort" &&
        "by" in obj
    );
}

export function isMetricSort(obj: unknown): obj is MetricSort {
    if (obj && typeof obj === "object" && "type" in obj && obj.type === "metric_sort" && "metrics" in obj) {
        return Array.isArray(obj.metrics);
    }
    return false;
}

export function isSimpleMetricSort(obj: unknown): obj is MetricSort {
    if (isMetricSort(obj)) {
        return obj.metrics.every((m) => typeof m === "string");
    }
    return false;
}

export function isDashboardDateFilter(
    obj: unknown,
): obj is DashboardRelativeDateFilter | DashboardAbsoluteDateFilter {
    return typeof obj === "object" && obj !== null && "type" in obj && obj.type === "date_filter";
}

export function isDashboardAbsoluteDateFilter(obj: unknown): obj is DashboardAbsoluteDateFilter {
    return isDashboardDateFilter(obj) && typeof obj["from"] === "string" && typeof obj["to"] === "string";
}

export function isDashboardEmptyDateFilter(obj: unknown): boolean {
    return (
        isDashboardDateFilter(obj) &&
        typeof obj["from"] === "undefined" &&
        typeof obj["to"] === "undefined" &&
        typeof obj["granularity"] === "undefined" &&
        typeof obj["date"] === "undefined"
    );
}

export function isDashboardNoopDateFilter(obj: unknown): boolean {
    return (
        isDashboardEmptyDateFilter(obj) &&
        typeof (obj as { empty_values?: unknown }).empty_values === "undefined"
    );
}

export function isDashboardRelativeDateFilter(obj: unknown): obj is DashboardRelativeDateFilter {
    if (isDashboardDateFilter(obj)) {
        const fromType = typeof obj["from"];
        const toType = typeof obj["to"];

        return ["number", "undefined"].includes(fromType) && ["number", "undefined"].includes(toType);
    }
    return false;
}

export function isDashboardAttributeFilter(obj: unknown): obj is DashboardAttributeFilter {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "type" in obj &&
        obj.type === "attribute_filter" &&
        "using" in obj
    );
}

export function isInsightWidget(obj: unknown): obj is VisualisationWidget {
    return Boolean(typeof obj === "object" && obj && "visualization" in obj);
}

export function isRichTextWidget(obj: unknown): obj is RichTextWidget {
    return Boolean(typeof obj === "object" && obj && "content" in obj);
}

export function isVisualizationSwitcherWidget(obj: unknown): obj is VisualizationSwitcherWidget {
    return Boolean(typeof obj === "object" && obj && "visualizations" in obj);
}

export function isContainerWidget(obj: unknown): obj is ContainerWidget {
    return Boolean(typeof obj === "object" && obj && "sections" in obj);
}

const DatasetTypes: Dataset["type"][] = ["dataset"];
const DateDatasetTypes: DateDataset["type"][] = ["date"];
const MetricEntityTypes: Metric["type"][] = ["metric"];
const FactTypes: Fact["type"][] = ["fact"];

export function isDataset(obj: unknown): obj is Dataset {
    return Boolean(
        typeof obj === "object" &&
        obj &&
        "id" in obj &&
        "type" in obj &&
        DatasetTypes.includes(obj.type as Dataset["type"]),
    );
}

export function isDateDataset(obj: unknown): obj is DateDataset {
    return Boolean(
        typeof obj === "object" &&
        obj &&
        "id" in obj &&
        "type" in obj &&
        DateDatasetTypes.includes(obj.type as DateDataset["type"]),
    );
}

export function isFact(obj: unknown): obj is Fact {
    return Boolean(
        typeof obj === "object" && obj && "type" in obj && FactTypes.includes(obj.type as Fact["type"]),
    );
}

export function isMetricEntity(obj: unknown): obj is Metric {
    return Boolean(
        typeof obj === "object" &&
        obj &&
        "id" in obj &&
        "type" in obj &&
        MetricEntityTypes.includes(obj.type as Metric["type"]),
    );
}
