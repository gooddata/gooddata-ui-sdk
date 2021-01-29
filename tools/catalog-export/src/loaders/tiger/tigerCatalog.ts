// (C) 2007-2021 GoodData Corporation
import { Attribute, Catalog, Fact, Metric } from "../../base/types";
import {
    JsonApiAttributeList,
    JsonApiFactList,
    JsonApiMetricList,
    ITigerClient,
} from "@gooddata/api-client-tiger";
import { convertAttribute, createLabelMap } from "./tigerCommon";

function convertMetrics(metrics: JsonApiMetricList): Metric[] {
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

function convertFacts(facts: JsonApiFactList): Fact[] {
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

function convertAttributes(attributes: JsonApiAttributeList): Attribute[] {
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
 * @param _projectId
 * @param tigerClient
 */
export async function loadCatalog(_projectId: string, tigerClient: ITigerClient): Promise<Catalog> {
    const [metricsResult, factsResult, attributesResult] = await Promise.all([
        tigerClient.workspaceModel.getEntitiesMetrics(
            {
                workspaceId: _projectId,
            },
            {
                headers: { Accept: "application/vnd.gooddata.api+json" },
            },
        ),
        tigerClient.workspaceModel.getEntitiesFacts(
            {
                workspaceId: _projectId,
            },
            {
                headers: { Accept: "application/vnd.gooddata.api+json" },
            },
        ),
        tigerClient.workspaceModel.getEntitiesAttributes(
            {
                workspaceId: _projectId,
            },
            {
                headers: { Accept: "application/vnd.gooddata.api+json" },
                query: {
                    include: "labels",
                    // TODO - update after paging is fixed in MDC-354
                    size: "500",
                },
            },
        ),
    ]);

    return {
        metrics: convertMetrics(metricsResult.data),
        facts: convertFacts(factsResult.data),
        attributes: convertAttributes(attributesResult.data),
    };
}
