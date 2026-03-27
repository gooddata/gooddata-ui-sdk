// (C) 2024-2026 GoodData Corporation

import { type AfmObjectIdentifier } from "@gooddata/api-client-tiger";
import type {
    Attribute,
    DateDataset,
    Fact,
    Label,
    Metric,
    Query,
    Reference,
    Dataset as SchemaDataset,
    Source,
} from "@gooddata/sdk-code-schemas/v1";

import { type ExportEntities } from "../types.js";
import { mapDateAttribute, mapDateDataset } from "./dateUtils.js";
import { convertGranularity, convertGranularityToId } from "./granularityUtils.js";
import { mapLocationLabel } from "./locationUtils.js";
import { type FullFields, convertIdToTitle, getFullField } from "./sharedUtils.js";
import {
    isArithmeticMetricField,
    isAttribute,
    isAttributeField,
    isCalculatedMetricField,
    isDataset,
    isDateDataset,
    isFact,
    isInlineMetricField,
    isMetricEntity,
    isMetricField,
    isPoPMetricField,
    isPreviousPeriodField,
} from "./typeGuards.js";
import { createIdentifier } from "./yamlUtils.js";

// --- Inline types for LDM objects (replaces @gooddata/maql-language-server types) ---

type LdmAttribute = { attribute: { id: string; title: string } };
type LdmFact = { fact: { id: string; title: string } };
type LdmMetric = { measure: { id: string; title: string } };
type LdmLabel = { id: string; title: string };

type DatasetAttribute = {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    sourceColumn?: string;
    labels: DatasetLabel[];
    defaultView?: { type: string; id: string };
    sortColumn?: string;
    sortDirection?: string;
    sourceColumnDataType?: string;
};

type DatasetFact = {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    sourceColumn?: string;
    sourceColumnDataType?: string;
};

type DatasetLabel = {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    sourceColumn?: string;
    valueType?: string;
    sourceColumnDataType?: string;
};

type DatasetGrain = {
    id: string;
    type: string;
};

type DatasetReference = {
    identifier: { type: string; id: string };
    multivalue: boolean;
    sources: Array<{
        column: string;
        dataType: string;
        target: { id: string; type: string };
    }>;
};

type Dataset = {
    id: string;
    description?: string;
    title: string;
    tags?: string[];
    grain: DatasetGrain[];
    facts: DatasetFact[];
    attributes: DatasetAttribute[];
    references: DatasetReference[];
};

type DateDatasetItem = {
    type: string;
    dataSet: {
        type: string;
        id: string;
        description: string;
        title: string;
        uri: string;
        ref: { type: string; identifier: string };
        production: boolean;
        deprecated: boolean;
        unlisted: boolean;
    };
    dateAttributes: any[];
    relevance: number;
};

// Type guards imported from typeGuards.ts

// --- resolveEntitiesLdmObjects (from features/references/resolve/objects.ts) ---

export function resolveEntitiesLdmObjects(entities: ExportEntities): {
    metrics: LdmMetric[];
    dates: DateDatasetItem[];
    datasets: Dataset[];
    attributes: LdmAttribute[];
    facts: LdmFact[];
    labels: LdmLabel[];
} {
    const { metrics, datasets, dates } = entities.reduce(
        (prev, item) => {
            if (isDataset(item.data)) {
                prev.datasets.push(buildDataset(item.data));
            }
            if (isDateDataset(item.data)) {
                prev.dates.push(buildDate(item.data));
            }
            if (isMetricEntity(item.data)) {
                prev.metrics.push(buildMetric(item.data));
            }
            return prev;
        },
        {
            metrics: [],
            dates: [],
            datasets: [],
        } as {
            metrics: LdmMetric[];
            dates: DateDatasetItem[];
            datasets: Dataset[];
        },
    );

    const { attributes, facts, labels } = extractFromDatasets(datasets);

    return {
        datasets,
        dates,
        metrics,
        attributes,
        facts,
        labels,
    };
}

function extractFromDatasets(datasets: Dataset[]) {
    const attributes: LdmAttribute[] = [];
    const facts: LdmFact[] = [];
    const labels: LdmLabel[] = [];

    datasets.forEach((dataset) => {
        const attrs = dataset.attributes || [];
        attrs.forEach((attribute) => {
            const [attr, lbls] = buildAttribute(attribute);
            attributes.push(attr);
            labels.push(...lbls);
        });

        const fcts = dataset.facts || [];
        fcts.forEach((fact) => {
            facts.push(buildFact(fact));
        });
    });

    return {
        attributes,
        facts,
        labels,
    };
}

function buildFact(fact: DatasetFact): LdmFact {
    return {
        fact: {
            id: fact.id,
            title: fact.title,
        },
    };
}

function buildAttribute(attribute: DatasetAttribute): [LdmAttribute, LdmLabel[]] {
    const displayForms = [buildDisplayForm(attribute), ...attribute.labels.map(buildDisplayForm)];

    return [
        {
            attribute: {
                id: attribute.id,
                title: attribute.title,
            },
        },
        displayForms,
    ];
}

function buildDisplayForm(label: DatasetLabel | DatasetAttribute): LdmLabel {
    return {
        id: label.id,
        title: label.title,
    };
}

function buildMetric(item: Metric): LdmMetric {
    return {
        measure: {
            id: item.id,
            title: item.title ?? convertIdToTitle(item.id),
        },
    };
}

function convertDateTitle(item: DateDataset, gran: Required<DateDataset>["granularities"][number]) {
    const title = item.title || convertIdToTitle(item.id);
    const granularityTitle = convertIdToTitle(convertGranularityToId(gran));
    const titleBase = item.title_base || title;
    const titleFormatted = item.title_pattern
        ? item.title_pattern.replace("%titleBase", titleBase).replace("%granularityTitle", granularityTitle)
        : undefined;

    return titleFormatted || title;
}

function buildDateAttribute(item: DateDataset, gran: Required<DateDataset>["granularities"][number]): any {
    const id = `${item.id}.${convertGranularityToId(gran)}`;

    return {
        granularity: convertGranularity(gran),
        attribute: {
            id: id,
            title: convertDateTitle(item, gran),
        },
        defaultDisplayForm: {
            id: id,
            title: convertDateTitle(item, gran),
        },
    };
}

function buildDate(item: DateDataset): DateDatasetItem {
    return {
        type: "dateDataset",
        dataSet: {
            type: "dataSet",
            ...buildUriRef("dataSet", item.id),
            id: item.id,
            description: item.description ?? "",
            title: item.title ?? convertIdToTitle(item.id),
            production: true,
            deprecated: false,
            unlisted: false,
        },
        dateAttributes:
            item.granularities
                ?.map((gran) => buildDateAttribute(item, gran))
                .filter((attr) => attr.granularity !== null) ?? [],
        relevance: 0,
    };
}

function buildUriRef(type: string, id: string) {
    const uri = "";

    return {
        uri,
        ref: { type, identifier: id },
    };
}

function buildDataset(item: SchemaDataset): Dataset {
    const { facts, attributes, grain, references } = buildDatasetReferences(item);

    return {
        id: item.id,
        description: item.description,
        title: item.title ?? convertIdToTitle(item.id),
        tags: item.tags,
        grain,
        facts,
        attributes,
        references,
    };
}

function buildDatasetReferences(item: SchemaDataset) {
    const fields = item.fields || {};

    const attributes: DatasetAttribute[] = [];
    const facts: DatasetFact[] = [];
    const grain: DatasetGrain[] = [];
    const references: DatasetReference[] = [];

    Object.keys(fields).forEach((fieldName) => {
        const field = fields[fieldName];
        if (isAttribute(field)) {
            attributes.push(buildDatasetAttribute(item, field, fieldName));
        }
        if (isFact(field)) {
            facts.push(buildDatasetFact(item, field, fieldName));
        }
    });

    if (item.primary_key && Array.isArray(item.primary_key)) {
        grain.push(...item.primary_key.map((id) => buildGrain(id)));
    }
    if (item.primary_key && !Array.isArray(item.primary_key)) {
        grain.push(buildGrain(item.primary_key));
    }

    item.references?.forEach((item) => {
        if (item) {
            references.push(buildReference(item));
        }
    });

    return {
        references,
        attributes,
        facts,
        grain,
    };
}

function buildGrain(id: string): DatasetGrain {
    return {
        id,
        type: "attribute",
    };
}

function buildReferenceSource(sources?: Source[]) {
    if (sources) {
        return sources
            .map((source) => {
                if (!source?.source_column || !source.target) {
                    return null;
                }
                return {
                    column: source.source_column,
                    dataType: source.data_type ?? "STRING",
                    target: {
                        id: source.target,
                        type: "attribute",
                    },
                };
            })
            .filter(Boolean) as DatasetReference["sources"];
    }
    return [];
}

function buildReference(item: Reference): DatasetReference {
    return {
        identifier: { type: "dataset", id: item.dataset },
        multivalue: false,
        sources: buildReferenceSource(item.sources),
    };
}

function buildDatasetFact(_item: SchemaDataset, fact: Fact, id: string): DatasetFact {
    return {
        id,
        description: fact.description,
        title: fact.title ?? convertIdToTitle(id),
        tags: fact.tags,
        sourceColumn: fact.source_column || id,
        sourceColumnDataType: undefined,
    };
}

function buildDatasetAttribute(_item: SchemaDataset, attr: Attribute, id: string): DatasetAttribute {
    const attrLabels = attr.labels || {};
    const labels = Object.keys(attrLabels)
        .map((labelName) => {
            const label = attrLabels[labelName];
            return label ? buildDatasetLabel(label, labelName) : null;
        })
        .filter(Boolean) as DatasetLabel[];

    return {
        id,
        labels,
        description: attr.description,
        title: attr.title ?? convertIdToTitle(id),
        tags: attr.tags,
        sourceColumn: attr.source_column || id,
        ...(attr.default_view
            ? {
                  defaultView: {
                      type: "label",
                      id: attr.default_view,
                  },
              }
            : {}),
        sortColumn: undefined,
        sortDirection: undefined,
        sourceColumnDataType: undefined,
    };
}

function buildDatasetLabel(label: Label, id: string): DatasetLabel {
    return {
        id,
        title: label.title ?? convertIdToTitle(id),
        description: label.description,
        tags: label.tags,
        sourceColumn: label.source_column || id,
        valueType: label.value_type as any,
        sourceColumnDataType: undefined,
    };
}

// --- convertBucketToTitle ---

export function convertBucketToTitle(
    entities: ExportEntities,
    query: Query,
    field: FullFields,
    location?: boolean,
): string | null {
    if (isAttributeField(field) && location) {
        const { displayForm } = mapLocationLabel(entities, field);
        if (displayForm) {
            const item = findObjectProps(entities, displayForm);
            return item.title;
        }
        return null;
    }
    if (isAttributeField(field)) {
        const displayForm = createIdentifier(field.using) as any;
        if (displayForm) {
            const item = findObjectProps(entities, displayForm);
            return item.title;
        }
        return null;
    }
    if (isInlineMetricField(field)) {
        return null;
    }
    if (isCalculatedMetricField(field)) {
        //TODO: Filters for generating title?
        const metric = createIdentifier(field.using) as any;
        if (metric) {
            const item = findObjectProps(entities, metric);
            const aggregation = firstLetterUpperCase((field.aggregation ?? "SUM").toLowerCase());
            return `${aggregation} of ${item.title}`;
        }
        return null;
    }
    if (isMetricField(field)) {
        //TODO: Filters for generating title?
        const metric = createIdentifier(field.using) as any;
        if (metric) {
            const item = findObjectProps(entities, metric);
            return item.title;
        }
    }
    if (isArithmeticMetricField(field)) {
        const measureIdentifiers = field.using;
        if (measureIdentifiers.length >= 2) {
            const operator = firstLetterUpperCase((field.operator ?? "SUM").toLowerCase());
            const titles = measureIdentifiers
                .map((measure) => convertBucketToTitle(entities, query, getFullField(query.fields[measure])))
                .join(" and ");

            return `${operator} of ${titles}`;
        }
        return null;
    }
    if (isPoPMetricField(field)) {
        const popAttribute = mapDateAttribute(query, field);
        if (popAttribute) {
            const title = convertBucketToTitle(entities, query, getFullField(query.fields[field.using]));
            return `${title} - SP year ago`;
        }
        return null;
    }
    if (isPreviousPeriodField(field)) {
        const dataset = mapDateDataset(query, field);
        if (dataset) {
            const title = convertBucketToTitle(entities, query, getFullField(query.fields[field.using]));
            return `${title} - period ago`;
        }
        return null;
    }

    return null;
}

function findObjectProps(entities: ExportEntities, item: AfmObjectIdentifier): { title: string } {
    const items = resolveEntitiesLdmObjects(entities);

    switch (item.identifier.type) {
        case "attribute": {
            const found = items.attributes.find((attribute) => attribute.attribute.id === item.identifier.id);
            return {
                title:
                    found?.attribute.title ??
                    firstLetterUpperCase(convertIdToTitle(item.identifier.id).toLowerCase()),
            };
        }
        case "fact": {
            const found = items.facts.find((fact) => fact.fact.id === item.identifier.id);
            return {
                title:
                    found?.fact.title ??
                    firstLetterUpperCase(convertIdToTitle(item.identifier.id).toLowerCase()),
            };
        }
        case "label":
        case "metric": {
            const found = items.labels.find((label) => label.id === item.identifier.id);
            return {
                title:
                    found?.title ?? firstLetterUpperCase(convertIdToTitle(item.identifier.id).toLowerCase()),
            };
        }
    }
    return {
        title: firstLetterUpperCase(convertIdToTitle(item.identifier.id).toLowerCase()),
    };
}

function firstLetterUpperCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
