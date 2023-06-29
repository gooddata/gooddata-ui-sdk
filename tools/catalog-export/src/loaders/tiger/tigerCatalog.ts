// (C) 2007-2022 GoodData Corporation
import { Attribute, Catalog, Fact, Metric } from "../../base/types.js";
import {
    JsonApiAttributeOutList,
    JsonApiFactOutList,
    JsonApiMetricOutList,
    ITigerClient,
    MetadataUtilities,
    ValidateRelationsHeader,
} from "@gooddata/api-client-tiger";
import { convertAttribute, createLabelMap } from "./tigerCommon.js";

function convertMetrics(metrics: JsonApiMetricOutList): Metric[] {
    return metrics.data.map((metric) => {
        return {
            metric: {
                meta: {
                    identifier: metric.id,
                    title: metric.attributes?.title ?? metric.id,
                    tags: metric.attributes?.tags?.join(",") ?? "",
                },
            },
        };
    });
}

function convertFacts(facts: JsonApiFactOutList): Fact[] {
    return facts.data.map((fact) => {
        return {
            fact: {
                meta: {
                    identifier: fact.id,
                    title: fact.attributes?.title ?? fact.id,
                    tags: fact.attributes?.tags?.join(",") ?? "",
                },
            },
        };
    });
}

function convertAttributes(attributes: JsonApiAttributeOutList): Attribute[] {
    const labels = createLabelMap(attributes.included);

    /*
     * Filter out date data set attributes. Purely because there is special processing for them
     * in catalog & code generators. Want to stick to that.
     *
     */

    return attributes.data
        .filter((attribute) => attribute.attributes?.granularity === undefined)
        .map((attribute) => convertAttribute(attribute, labels))
        .filter((a): a is Attribute => a !== undefined);
}

/**
 * Loads metric, attribute and fact catalog
 */
export async function loadCatalog(client: ITigerClient, workspaceId: string): Promise<Catalog> {
    const [metricsResult, factsResult, attributesResult] = await Promise.all([
        MetadataUtilities.getAllPagesOf(
            client,
            client.entities.getAllEntitiesMetrics,
            {
                workspaceId,
            },
            { headers: ValidateRelationsHeader },
        )
            .then(MetadataUtilities.mergeEntitiesResults)
            .then(MetadataUtilities.filterValidEntities),
        MetadataUtilities.getAllPagesOf(client, client.entities.getAllEntitiesFacts, {
            workspaceId,
        }).then(MetadataUtilities.mergeEntitiesResults),
        MetadataUtilities.getAllPagesOf(client, client.entities.getAllEntitiesAttributes, {
            workspaceId,
            include: ["labels"],
        }).then(MetadataUtilities.mergeEntitiesResults),
    ]);

    return {
        metrics: convertMetrics(metricsResult),
        facts: convertFacts(factsResult),
        attributes: convertAttributes(attributesResult),
    };
}
