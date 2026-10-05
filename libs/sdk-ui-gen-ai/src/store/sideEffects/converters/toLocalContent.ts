// (C) 2024-2026 GoodData Corporation

import {
    type IChatConversationContent,
    type IChatConversationMultipartPart,
} from "@gooddata/sdk-backend-spi";
import {
    type IInsight,
    attributeLocalId,
    insightBucket,
    insightBuckets,
    insightSetBuckets,
    isAttribute,
    modifyAttribute,
} from "@gooddata/sdk-model";

import type { IChatConversationLocalContent, IChatConversationMultipartLocalPart } from "../../../model.js";

export function convertToLocalContent(content: IChatConversationContent): IChatConversationLocalContent {
    return {
        ...content,
        ...(content.type === "multipart"
            ? {
                  parts: convertToLocalMultipartContent(content.parts ?? []),
              }
            : {}),
    };
}

export function convertToLocalMultipartContent(
    content: IChatConversationMultipartPart[],
): IChatConversationMultipartLocalPart[] {
    return content.map((c) => ({
        ...c,
        ...(c.type === "visualization"
            ? {
                  visualization: withRepeaterRowAttributeColumn(c.visualization),
                  reporting: true,
              }
            : {}),
    }));
}

function withRepeaterRowAttributeColumn(visualization: IInsight | null): IInsight | null {
    if (visualization?.insight.visualizationUrl !== "local:repeater") {
        return visualization;
    }

    const rowAttribute = insightBucket(visualization, "attribute")?.items.find(isAttribute);
    const columns = insightBucket(visualization, "columns");

    if (!rowAttribute || !columns || columns.items.some(isAttribute)) {
        return visualization;
    }

    const rowAttributeColumn = modifyAttribute(rowAttribute, (a) =>
        a.localId(`${attributeLocalId(rowAttribute)}_cloned`),
    );

    return insightSetBuckets(
        visualization,
        insightBuckets(visualization).map((bucket) =>
            bucket === columns ? { ...bucket, items: [rowAttributeColumn, ...bucket.items] } : bucket,
        ),
    );
}
