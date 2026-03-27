// (C) 2023-2026 GoodData Corporation

import { Document, Pair, YAMLMap, YAMLSeq } from "yaml";

import {
    type DeclarativeAggregatedFact,
    type DeclarativeAttribute,
    type DeclarativeDataset,
    type DeclarativeFact,
    type DeclarativeLabel,
    type DeclarativeReference,
    type DeclarativeTable,
    type DeclarativeWorkspaceDataFilterReferences,
} from "@gooddata/api-client-tiger";

import type { Dataset } from "../schemas/v1/metadata.js";
import { type Profile } from "../types.js";
import { DATASET_COMMENT } from "../utils/texts.js";
import {
    entryWithSpace,
    fillOptionalMetaFields,
    findSourceColumnDataType,
    findTable,
} from "../utils/yamlUtils.js";

function processDeclarativeLabel(
    dataset: DeclarativeDataset,
    label: DeclarativeLabel,
    tablesMap: Record<string, DeclarativeTable[]>,
    profile: Profile | null,
): YAMLMap {
    const map = new YAMLMap();

    map.add(new Pair("source_column", label.sourceColumn));
    map.add(
        new Pair(
            "data_type",
            label.sourceColumnDataType ??
                findSourceColumnDataType(tablesMap, profile, dataset, label.sourceColumn) ??
                "STRING",
        ),
    );

    fillOptionalMetaFields(map, label, false);

    if (label.locale) {
        map.add(new Pair("locale", label.locale));
    }

    if (label.translations?.length) {
        const translations = new YAMLSeq();

        for (const translation of label.translations) {
            const translationMap = new YAMLMap();
            translationMap.add(new Pair("locale", translation.locale));
            translationMap.add(new Pair("source_column", translation.sourceColumn));
            translations.add(translationMap);
        }

        map.add(new Pair("translations", translations));
    }

    if (label.valueType) {
        map.add(new Pair("value_type", label.valueType));
    }

    const geoAreaCollectionId = label.geoAreaConfig?.collection?.id;
    if (geoAreaCollectionId) {
        const geoAreaMap = new YAMLMap();
        const geoAreaCollection = new YAMLMap();
        geoAreaCollection.add(new Pair("id", geoAreaCollectionId));
        geoAreaMap.add(new Pair("collection", geoAreaCollection));
        map.add(new Pair("geo_area_config", geoAreaMap));
    }

    if (label.isHidden === true) {
        map.add(new Pair("show_in_ai_results", false));
    }

    if (label.isNullable !== undefined) {
        map.add(new Pair("is_nullable", label.isNullable));
    }

    if (label.nullValue !== undefined) {
        map.add(new Pair("null_value_join_replacement", label.nullValue));
    }

    return map;
}

function processDeclarativeAttribute(
    dataset: DeclarativeDataset,
    attr: DeclarativeAttribute,
    tablesMap: Record<string, DeclarativeTable[]>,
    profile: Profile | null,
): YAMLMap {
    const map = new YAMLMap();

    map.add(new Pair("type", "attribute"));
    map.add(new Pair("source_column", attr.sourceColumn));
    map.add(
        new Pair(
            "data_type",
            attr.sourceColumnDataType ??
                findSourceColumnDataType(tablesMap, profile, dataset, attr.sourceColumn) ??
                "STRING",
        ),
    );

    fillOptionalMetaFields(map, attr, false);

    if (attr.sortColumn) {
        map.add(new Pair("sort_column", attr.sortColumn));
    }

    if (attr.sortDirection) {
        map.add(new Pair("sort_direction", attr.sortDirection));
    }

    if (attr.isHidden === true) {
        map.add(new Pair("show_in_ai_results", false));
    }

    if (attr.locale) {
        map.add(new Pair("locale", attr.locale));
    }

    if (attr.isNullable !== undefined) {
        map.add(new Pair("is_nullable", attr.isNullable));
    }

    if (attr.nullValue !== undefined) {
        map.add(new Pair("null_value_join_replacement", attr.nullValue));
    }

    if (attr.labels.length) {
        // Default view does not make sense without any labels
        if (attr.defaultView) {
            map.add(new Pair("default_view", attr.defaultView.id));
        }

        const labelsMap = new YAMLMap();
        map.add(new Pair("labels", labelsMap));

        for (const label of attr.labels) {
            labelsMap.add(new Pair(label.id, processDeclarativeLabel(dataset, label, tablesMap, profile)));
        }
    }

    return map;
}

function processDeclarativeFact(
    dataset: DeclarativeDataset,
    fact: DeclarativeFact,
    tablesMap: Record<string, DeclarativeTable[]>,
    profile: Profile | null,
): YAMLMap {
    const map = new YAMLMap();

    map.add(new Pair("type", "fact"));
    map.add(new Pair("source_column", fact.sourceColumn));
    map.add(
        new Pair(
            "data_type",
            fact.sourceColumnDataType ??
                findSourceColumnDataType(tablesMap, profile, dataset, fact.sourceColumn) ??
                "STRING",
        ),
    );

    fillOptionalMetaFields(map, fact, false);

    if (fact.isHidden === true) {
        map.add(new Pair("show_in_ai_results", false));
    }

    if (fact.isNullable !== undefined) {
        map.add(new Pair("is_nullable", fact.isNullable));
    }

    if (fact.nullValue !== undefined) {
        map.add(new Pair("null_value_join_replacement", fact.nullValue));
    }

    return map;
}

function processDeclarativeAggregatedFact(
    dataset: DeclarativeDataset,
    fact: DeclarativeAggregatedFact,
    tablesMap: Record<string, DeclarativeTable[]>,
    profile: Profile | null,
): YAMLMap {
    const map = new YAMLMap();

    map.add(new Pair("type", "aggregated_fact"));
    map.add(new Pair("source_column", fact.sourceColumn));
    map.add(
        new Pair(
            "data_type",
            fact.sourceColumnDataType ??
                findSourceColumnDataType(tablesMap, profile, dataset, fact.sourceColumn) ??
                "STRING",
        ),
    );

    map.add(new Pair("aggregated_as", fact.sourceFactReference.operation));
    map.add(new Pair("assigned_to", fact.sourceFactReference.reference.id));

    if (fact.description) {
        map.add(new Pair("description", fact.description ?? ""));
    }

    // Tags are shown when not empty or we force-render optional props
    if (Boolean(fact.tags) && fact.tags!.length > 0) {
        map.add(new Pair("tags", fact.tags ?? []));
    }

    if (fact.isNullable !== undefined) {
        map.add(new Pair("is_nullable", fact.isNullable));
    }

    if (fact.nullValue !== undefined) {
        map.add(new Pair("null_value_join_replacement", fact.nullValue));
    }

    return map;
}

function processDeclarativeReference(
    dataset: DeclarativeDataset,
    ref: DeclarativeReference,
    tablesMap: Record<string, DeclarativeTable[]>,
    profile: Profile | null,
): YAMLMap {
    const map = new YAMLMap();

    map.add(new Pair("dataset", ref.identifier.id));

    const sources: YAMLMap[] = [];
    ref.sources?.forEach((source) => {
        const src = new YAMLMap();
        src.add(new Pair("source_column", source.column));
        src.add(
            new Pair(
                "data_type",
                source.dataType ??
                    findSourceColumnDataType(tablesMap, profile, dataset, source.column) ??
                    "STRING",
            ),
        );
        src.add(new Pair("target", source.target.id));

        if (source.isNullable !== undefined) {
            src.add(new Pair("is_nullable", source.isNullable));
        }

        if (source.nullValue !== undefined) {
            src.add(new Pair("null_value_join_replacement", source.nullValue));
        }

        sources.push(src);
    });
    map.add(new Pair("sources", sources));

    if (ref.multivalue) {
        map.add(new Pair("multi_directional", ref.multivalue));
    }

    return map;
}

function processDeclarativeDataFilterReference(
    dataset: DeclarativeDataset | undefined,
    ref: DeclarativeWorkspaceDataFilterReferences,
    tablesMap: Record<string, DeclarativeTable[]>,
    profile: Profile | null,
): YAMLMap {
    const map = new YAMLMap();

    map.add(new Pair("filter_id", ref.filterId.id));
    map.add(new Pair("source_column", ref.filterColumn));
    map.add(
        new Pair(
            "data_type",
            ref.filterColumnDataType ??
                findSourceColumnDataType(tablesMap, profile, dataset, ref.filterColumn) ??
                "STRING",
        ),
    );

    return map;
}

/** @public */
export function declarativeDatasetToYaml(
    dataset: DeclarativeDataset,
    profile: Profile,
    tablesMap: Record<string, DeclarativeTable[]>,
): {
    content: string;
    json: Dataset;
} {
    const doc = new Document({
        type: "dataset",
        id: dataset.id,
    });

    const { path } = findTable(tablesMap, profile, dataset);
    if (path) {
        doc.add(entryWithSpace("table_path", path));
    }

    if (dataset.dataSourceTableId?.dataSourceId) {
        if (dataset.dataSourceTableId?.dataSourceId !== profile.data_source) {
            doc.add(entryWithSpace("data_source", dataset.dataSourceTableId.dataSourceId));
        }
    }

    if (dataset.sql) {
        doc.add(entryWithSpace("sql", dataset.sql.statement));
    }
    if (dataset.sql?.dataSourceId) {
        if (dataset.sql?.dataSourceId !== profile.data_source) {
            doc.add(entryWithSpace("data_source", dataset.sql.dataSourceId));
        }
    }

    doc.commentBefore = DATASET_COMMENT;

    fillOptionalMetaFields(doc, dataset);

    if (dataset.precedence !== undefined) {
        doc.add(entryWithSpace("precedence", dataset.precedence));
    }

    if (dataset.grain?.length) {
        if (dataset.grain.length === 1) {
            doc.add(entryWithSpace("primary_key", dataset.grain[0].id));
        } else {
            doc.add(
                entryWithSpace(
                    "primary_key",
                    dataset.grain.map((g) => g.id),
                ),
            );
        }
    }

    if (dataset.attributes?.length || dataset.facts?.length || dataset.aggregatedFacts?.length) {
        const fields = new YAMLMap();
        doc.add(entryWithSpace("fields", fields));

        if (dataset.attributes?.length) {
            for (const attr of dataset.attributes) {
                fields.add(
                    doc.createPair(attr.id, processDeclarativeAttribute(dataset, attr, tablesMap, profile)),
                );
            }
        }

        if (dataset.facts?.length) {
            for (const fact of dataset.facts) {
                fields.add(
                    doc.createPair(fact.id, processDeclarativeFact(dataset, fact, tablesMap, profile)),
                );
            }
        }

        if (dataset.aggregatedFacts?.length) {
            for (const aggregatedFact of dataset.aggregatedFacts) {
                fields.add(
                    doc.createPair(
                        aggregatedFact.id,
                        processDeclarativeAggregatedFact(dataset, aggregatedFact, tablesMap, profile),
                    ),
                );
            }
        }
    }

    if (dataset.references?.length) {
        const refsMap = new YAMLSeq();
        doc.add(entryWithSpace("references", refsMap));

        for (const ref of dataset.references) {
            refsMap.add(processDeclarativeReference(dataset, ref, tablesMap, profile));
        }
    }

    if (dataset.workspaceDataFilterReferences?.length) {
        const refsMap = new YAMLSeq();
        doc.add(entryWithSpace("workspace_data_filters", refsMap));

        for (const ref of dataset.workspaceDataFilterReferences) {
            refsMap.add(processDeclarativeDataFilterReference(dataset, ref, tablesMap, profile));
        }
    }

    return {
        content: doc.toString({
            lineWidth: 0,
        }),
        json: doc.toJSON() as Dataset,
    };
}
