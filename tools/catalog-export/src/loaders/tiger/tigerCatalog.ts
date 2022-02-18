// (C) 2007-2022 GoodData Corporation
import { Attribute, Catalog, Fact, Metric } from "../../base/types";
import {
    JsonApiAttributeOutList,
    JsonApiFactOutList,
    JsonApiMetricOutList,
    ITigerClient,
    MetadataUtilities,
    ValidateRelationsHeader,
} from "@gooddata/api-client-tiger";
import { convertAttribute, createLabelMap, toFullyQualifiedId } from "./tigerCommon";

function convertMetrics(metrics: JsonApiMetricOutList, workspaceId: string): Metric[] {
    return metrics.data.map((metric) => {
        return {
            metric: {
                meta: {
                    identifier: toFullyQualifiedId(metric.id, workspaceId),
                    title: metric.attributes?.title ?? metric.id,
                    tags: metric.attributes?.tags?.join(",") ?? "",
                },
            },
        };
    });
}

function convertFacts(facts: JsonApiFactOutList, workspaceId: string): Fact[] {
    return facts.data.map((fact) => {
        return {
            fact: {
                meta: {
                    identifier: toFullyQualifiedId(fact.id, workspaceId),
                    title: fact.attributes?.title ?? fact.id,
                    tags: fact.attributes?.tags?.join(",") ?? "",
                },
            },
        };
    });
}

function convertAttributes(attributes: JsonApiAttributeOutList, workspaceId: string): Attribute[] {
    const labels = createLabelMap(attributes.included);

    /*
     * Filter out date data set attributes. Purely because there is special processing for them
     * in catalog & code generators. Want to stick to that.
     *
     */

    return attributes.data
        .filter((attribute) => attribute.attributes?.granularity === undefined)
        .map((attribute) => convertAttribute(attribute, labels, workspaceId))
        .filter((a): a is Attribute => a !== undefined);
}

/**
 * Loads metric, attribute and fact catalog
 */
export async function loadCatalog(client: ITigerClient, workspaceId: string): Promise<Catalog> {
    const [metricsResult, factsResult, attributesResult] = await Promise.all([
        MetadataUtilities.getAllPagesOf(
            client,
            client.workspaceObjects.getAllEntitiesMetrics,
            {
                workspaceId,
            },
            { headers: ValidateRelationsHeader },
        )
            .then(MetadataUtilities.mergeEntitiesResults)
            .then(MetadataUtilities.filterValidEntities),
        MetadataUtilities.getAllPagesOf(client, client.workspaceObjects.getAllEntitiesFacts, {
            workspaceId,
        }).then(MetadataUtilities.mergeEntitiesResults),
        MetadataUtilities.getAllPagesOf(client, client.workspaceObjects.getAllEntitiesAttributes, {
            workspaceId,
            include: ["labels"],
        }).then(MetadataUtilities.mergeEntitiesResults),
    ]);

    return {
        metrics: convertMetrics(metricsResult, workspaceId),
        facts: convertFacts(factsResult, workspaceId),
        attributes: convertAttributes(attributesResult, workspaceId),
    };
}
