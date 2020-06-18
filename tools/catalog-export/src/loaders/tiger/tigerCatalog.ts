// (C) 2007-2020 GoodData Corporation
import { Attribute, Catalog, Fact, Metric } from "../../base/types";
import { DefaultGetOptions } from "./tigerClient";
import {
    AttributeResourcesResponseSchema,
    FactResourcesResponseSchema,
    ITigerClient,
    MetricResourcesResponseSchema,
} from "@gooddata/gd-tiger-client";
import { convertAttribute, convertTags, createLabelMap, createTagMap } from "./tigerCommon";

function convertMetrics(metrics: MetricResourcesResponseSchema): Metric[] {
    const tags = createTagMap(metrics.included);

    return metrics.data.map((metric) => {
        return {
            metric: {
                meta: {
                    identifier: metric.id,
                    title: metric.attributes.title ?? metric.id,
                    tags: convertTags(metric.relationships, tags),
                },
            },
        };
    });
}

function convertFacts(facts: FactResourcesResponseSchema): Fact[] {
    const tags = createTagMap(facts.included);

    return facts.data.map((fact) => {
        return {
            fact: {
                meta: {
                    identifier: fact.id,
                    title: fact.attributes.title ?? fact.id,
                    tags: convertTags(fact.relationships, tags),
                },
            },
        };
    });
}

function convertAttributes(attributes: AttributeResourcesResponseSchema): Attribute[] {
    const tags = createTagMap(attributes.included);
    const labels = createLabelMap(attributes.included);

    /*
     * Filter out date data set attributes. Purely because there is special processing for them
     * in catalog & code generators. Want to stick to that.
     *
     * TODO: find expression to filter these params via servier side query. should be simple
     */

    return attributes.data
        .filter((attribute) => attribute.attributes.granularity === undefined)
        .map((attribute) => convertAttribute(attribute, labels, tags))
        .filter((a): a is Attribute => a !== undefined);
}

/**
 * Loads metric, attribute and fact catalog
 * @param _projectId
 * @param tigerClient
 */
export async function loadCatalog(_projectId: string, tigerClient: ITigerClient): Promise<Catalog> {
    const [metricsResult, factsResult, attributesResult] = await Promise.all([
        tigerClient.metadata.metricsGet(DefaultGetOptions),
        tigerClient.metadata.factsGet(DefaultGetOptions),
        tigerClient.metadata.attributesGet({
            ...DefaultGetOptions,
            include: "labels,tags",
        }),
    ]);

    return {
        metrics: convertMetrics(metricsResult.data),
        facts: convertFacts(factsResult.data),
        attributes: convertAttributes(attributesResult.data),
    };
}
