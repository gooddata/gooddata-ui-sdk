// (C) 2007-2020 GoodData Corporation
import { Attribute, Catalog, DisplayForm, Fact, Metric } from "../../base/types";
import { DefaultGetOptions } from "./client";
import {
    TagResourceSchema,
    LabelResourceSchema,
    SuccessIncluded,
    MetricResourcesResponseSchema,
    FactResourcesResponseSchema,
    AttributeResourceSchema,
    LabelResourceReference,
    TagResourceReference,
    AttributeResourcesResponseSchema,
    ITigerClient,
} from "@gooddata/gd-tiger-client";
import { keyBy } from "lodash";

type TagMap = { [id: string]: TagResourceSchema };
type LabelMap = { [id: string]: LabelResourceSchema };

function createTagMap(included: SuccessIncluded[]): TagMap {
    const tags: TagResourceSchema[] = included
        .map(include => {
            if (include.type !== "tag") {
                return null;
            }

            return include as TagResourceSchema;
        })
        .filter((include): include is TagResourceSchema => include !== null);

    return keyBy(tags, t => t.id);
}

// @ts-ignore
function createLabelMap(included: SuccessIncluded[]): LabelMap {
    const labels: LabelResourceSchema[] = included
        .map(include => {
            if (include.type !== "label") {
                return null;
            }

            return include as LabelResourceSchema;
        })
        .filter((include): include is LabelResourceSchema => include !== null);

    return keyBy(labels, t => t.id);
}

function convertMetrics(metrics: MetricResourcesResponseSchema): Metric[] {
    const tags = metrics.included ? createTagMap(metrics.included) : {};

    return metrics.data.map(metric => {
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
    const tags = facts.included ? createTagMap(facts.included) : {};

    return facts.data.map(fact => {
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

function convertLabels(
    attribute: AttributeResourceSchema,
    labelsMap: LabelMap,
    _tagsMap: TagMap,
): DisplayForm[] {
    const labelRefs: LabelResourceReference[] = (attribute.relationships as any)?.labels?.data ?? [];

    return labelRefs
        .map(ref => {
            const label = labelsMap[ref.id];

            if (!label) {
                return;
            }

            return {
                meta: {
                    identifier: ref.id,
                    title: label.attributes.title ?? ref.id,
                    tags: "",
                },
            };
        })
        .filter((df): df is DisplayForm => df !== undefined);
}

function convertTags(relationships: object | undefined, tagsMap: TagMap): string {
    if (!relationships) {
        return "";
    }

    const tagRefs: TagResourceReference[] = (relationships as any)?.tags?.data ?? [];

    return tagRefs
        .map(ref => {
            const tag = tagsMap[ref.id];

            if (!tag) {
                return;
            }

            return tag.attributes.title ?? ref.id;
        })
        .filter(tag => typeof tag === "string")
        .join(",");
}

function convertAttributes(attributes: AttributeResourcesResponseSchema): Attribute[] {
    const tags = attributes.included ? createTagMap(attributes.included) : {};
    const labels = attributes.included ? createLabelMap(attributes.included) : {};

    return attributes.data
        .map(attribute => {
            if (attribute.attributes.granularity) {
                /*
                 * Filter out date data set attributes. Purely because there is special processing for them
                 * in catalog & code generators. Want to stick to that.
                 *
                 * TODO: find expression to filter these params via servier side query. should be simple
                 */
                return;
            }

            return {
                attribute: {
                    content: {
                        displayForms: convertLabels(attribute, labels, tags),
                    },
                    meta: {
                        identifier: attribute.id,
                        title: attribute.attributes.title ?? attribute.id,
                        tags: convertTags(attribute.relationships, tags),
                    },
                },
            };
        })
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

    console.log(JSON.stringify(attributesResult.data.data, null, 4));

    return {
        metrics: convertMetrics(metricsResult.data),
        facts: convertFacts(factsResult.data),
        attributes: convertAttributes(attributesResult.data),
    };
}
