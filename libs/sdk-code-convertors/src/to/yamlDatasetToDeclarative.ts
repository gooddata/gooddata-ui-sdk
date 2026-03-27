// (C) 2023-2026 GoodData Corporation

import {
    type DeclarativeAggregatedFact,
    type DeclarativeAttribute,
    type DeclarativeDataset,
    type DeclarativeFact,
    type DeclarativeLabel,
    type DeclarativeLabelValueTypeEnum,
    type DeclarativeReference,
    type DeclarativeReferenceSource,
    type DeclarativeWorkspaceDataFilterReferences,
    type GrainIdentifier,
} from "@gooddata/api-client-tiger";

import type {
    AggregatedFact,
    Attribute,
    Dataset,
    DateDataset,
    Fact,
    Fields,
} from "../schemas/v1/metadata.js";
import { type ExportEntities } from "../types.js";
import { determineTypeForId } from "../utils/granularityUtils.js";
import { TABLE_PATH_DELIMITER, convertIdToTitle } from "../utils/sharedUtils.js";
import { createIdentifier } from "../utils/yamlUtils.js";

/**
 * A guard check if a given field is numeric
 */
const isFact = (node: Fact | Attribute | AggregatedFact | any): node is Fact =>
    Boolean(node && typeof node === "object" && node.type === "fact");

/**
 * A guard check if a given field is an aggregated fact
 */
const isAggregatedFact = (node: Fact | Attribute | AggregatedFact | any): node is AggregatedFact =>
    Boolean(node && typeof node === "object" && node.type === "aggregated_fact");

/**
 * A guard check if a given field is textual
 */
const isAttribute = (node: Fact | Attribute | AggregatedFact | any): node is Attribute =>
    node && typeof node === "object" && node.type === "attribute";

/**
 * Convert the data source from AaC to Declarative definitions.
 *
 * - Assuming that input has a correct structure, i.e. schema is validated.
 * - Do not run additional validation, leave it to server to keep it consistent with REST API.
 * - Do not set default values to optional fields, like `description`, let server do it for consistency.
 */
/** @public */
export function yamlDatasetToDeclarative(
    entities: ExportEntities,
    input: Dataset,
    dataSourceId?: string,
): DeclarativeDataset {
    const path = input.table_path?.split(TABLE_PATH_DELIMITER);
    const sql = input.sql;

    const workspaceDataFilterReferences = buildWorkspaceDataFilterReferences(
        input.workspace_data_filters ?? [],
    );

    const output: DeclarativeDataset = {
        id: input.id,
        title: input.title ?? convertIdToTitle(input.id),
        ...(path
            ? {
                  dataSourceTableId: {
                      id: path[path.length - 1] ?? "",
                      type: "dataSource",
                      dataSourceId: input.data_source ?? dataSourceId ?? "",
                      path,
                  },
              }
            : {}),
        ...(sql
            ? {
                  sql: {
                      statement: sql,
                      dataSourceId: input.data_source ?? dataSourceId ?? "",
                  },
              }
            : {}),
        grain: buildGrain(entities, input.primary_key),
        references: buildReferences(entities, input.references),
        ...(workspaceDataFilterReferences.length > 0 ? { workspaceDataFilterReferences } : {}),
    };

    // Add optional props only when present
    if (input.description) {
        output.description = input.description;
    }

    if (input.tags) {
        output.tags = input.tags;
    }

    if (input.precedence !== undefined) {
        output.precedence = input.precedence;
    }

    output.facts = buildFacts(input.fields);
    output.attributes = buildAttributes(input.fields);

    const aggregatedFacts = buildAggregatedFacts(input.fields);
    if (aggregatedFacts.length > 0) {
        output.aggregatedFacts = aggregatedFacts;
    }

    return output;
}

/**
 * Build `grain` declarative prop.
 */
export function buildGrain(entities: ExportEntities, primaryKey?: string | string[]): GrainIdentifier[] {
    if (!primaryKey) {
        return [];
    }

    const datesId = entities
        .filter((entity) => entity.type === "date")
        .map((entity) => (entity.data as DateDataset).id);

    const arr = Array.isArray(primaryKey) ? primaryKey : [primaryKey];

    return arr.map((pk) => ({
        id: pk,
        type: determineTypeForId(pk, datesId),
    }));
}

/**
 * Build declarative references
 */
export function buildReferences(
    entities: ExportEntities,
    refs: Dataset["references"] = [],
): DeclarativeReference[] {
    const datesId = entities
        .filter((entity) => entity.type === "date")
        .map((entity) => (entity.data as DateDataset).id);

    return refs
        .map((ref) => {
            const identifier = createIdentifier(ref.dataset, { forceType: "dataset" })?.identifier;

            if (!identifier) {
                return null;
            }

            return {
                identifier,
                multivalue: ref.multi_directional ?? false,
                sources:
                    ref.sources
                        ?.map((source) => {
                            const forceType = determineTypeForId(source.target, datesId);
                            const target = createIdentifier(source.target, {
                                forceType,
                            })?.identifier;

                            if (!target) {
                                return null;
                            }

                            const result = {
                                column: source.source_column,
                                dataType: source.data_type,
                                target,
                            } as DeclarativeReferenceSource;

                            if (source.is_nullable !== undefined) {
                                result.isNullable = source.is_nullable;
                            }

                            if (source.null_value_join_replacement !== undefined) {
                                result.nullValue = source.null_value_join_replacement;
                            }

                            return result;
                        })
                        .filter(Boolean) ?? [],
            };
        })
        .filter(Boolean) as DeclarativeReference[];
}

/**
 * Build declarative workspace data filter references
 */
export function buildWorkspaceDataFilterReferences(
    refs: Dataset["workspace_data_filters"] = [],
): DeclarativeWorkspaceDataFilterReferences[] {
    return refs
        .map((ref) => {
            const filterId = createIdentifier(ref.filter_id, {
                forceType: "workspaceDataFilter",
            })?.identifier;

            if (!filterId) {
                return null;
            }

            return {
                filterId: filterId as unknown as DeclarativeWorkspaceDataFilterReferences["filterId"],
                filterColumn: ref.source_column,
                filterColumnDataType: ref.data_type,
            };
        })
        .filter(Boolean) as DeclarativeWorkspaceDataFilterReferences[];
}

/**
 * Build declarative facts out of AaC fields
 */
export function buildFacts(fields?: Fields): DeclarativeFact[] {
    if (!fields) {
        return [];
    }

    // Take both id and the definition itself
    return Object.entries(fields)
        .map(([id, field]): DeclarativeFact | null => {
            if (!isFact(field)) {
                return null;
            }
            // Map mandatory options
            const output: DeclarativeFact = {
                id,
                title: field.title ?? convertIdToTitle(id),
                sourceColumn: field.source_column ?? id,
                sourceColumnDataType: field.data_type,
            };

            // Add optional properties
            if (field.description) {
                output.description = field.description;
            }

            if (field.tags) {
                output.tags = field.tags;
            }

            if (field.is_hidden !== undefined) {
                output.isHidden = field.is_hidden;
            }
            if (field.show_in_ai_results !== undefined) {
                output.isHidden = field.show_in_ai_results === false;
            }

            if (field.is_nullable !== undefined) {
                output.isNullable = field.is_nullable;
            }

            if (field.null_value_join_replacement !== undefined) {
                output.nullValue = field.null_value_join_replacement;
            }

            return output;
        })
        .filter(Boolean) as DeclarativeFact[];
}

/**
 * Build declarative aggregated facts out of AaC fields
 */
export function buildAggregatedFacts(fields?: Fields): DeclarativeAggregatedFact[] {
    if (!fields) {
        return [];
    }

    return Object.entries(fields)
        .map(([id, field]): DeclarativeAggregatedFact | null => {
            if (!isAggregatedFact(field)) {
                return null;
            }

            const output: DeclarativeAggregatedFact = {
                id,
                sourceColumn: field.source_column ?? id,
                sourceColumnDataType: field.data_type,
                sourceFactReference: {
                    operation: field.aggregated_as,
                    reference: {
                        id: field.assigned_to,
                        type: "fact",
                    },
                },
            };

            // Add optional properties
            if (field.description) {
                output.description = field.description;
            }

            if (field.tags) {
                output.tags = field.tags;
            }

            if (field.is_nullable !== undefined) {
                output.isNullable = field.is_nullable;
            }

            if (field.null_value_join_replacement !== undefined) {
                output.nullValue = field.null_value_join_replacement;
            }

            return output;
        })
        .filter(Boolean) as DeclarativeAggregatedFact[];
}

/**
 * Build declarative attributes out of AaC fields
 */
export function buildAttributes(fields?: Fields): DeclarativeAttribute[] {
    if (!fields) {
        return [];
    }

    return Object.entries(fields)
        .map(([id, field]): DeclarativeAttribute | null => {
            if (!isAttribute(field)) {
                return null;
            }
            const output: DeclarativeAttribute = {
                id,
                title: field.title ?? convertIdToTitle(id),
                sourceColumn: field.source_column ?? id,
                sourceColumnDataType: field.data_type,
                labels: buildAttributeLabels(field.labels),
            };

            if (field.description) {
                output.description = field.description;
            }

            if (field.tags) {
                output.tags = field.tags;
            }

            if (field.sort_column) {
                output.sortColumn = field.sort_column;
            }

            if (field.sort_direction) {
                output.sortDirection = field.sort_direction;
            }

            if (field.default_view) {
                output.defaultView = {
                    id: field.default_view,
                    type: "label",
                };
            }

            if (field.is_hidden !== undefined) {
                output.isHidden = field.is_hidden;
            }
            if (field.show_in_ai_results !== undefined) {
                output.isHidden = field.show_in_ai_results === false;
            }

            if (field.locale) {
                output.locale = field.locale;
            }

            if (field.is_nullable !== undefined) {
                output.isNullable = field.is_nullable;
            }

            if (field.null_value_join_replacement !== undefined) {
                output.nullValue = field.null_value_join_replacement;
            }

            return output;
        })
        .filter(Boolean) as DeclarativeAttribute[];
}

/**
 * Build declarative attribute labels out of AaC labels
 */
export function buildAttributeLabels(labels?: Attribute["labels"]): DeclarativeLabel[] {
    if (!labels) {
        return [];
    }

    return Object.entries(labels).map(([id, label]): DeclarativeLabel => {
        const output: DeclarativeLabel = {
            id,
            title: label.title ?? convertIdToTitle(id),
            sourceColumn: label.source_column ?? id,
            sourceColumnDataType: label.data_type,
        };

        if (label.description) {
            output.description = label.description;
        }

        if (label.tags) {
            output.tags = label.tags;
        }

        if (label.value_type) {
            // Leave the validation to server
            output.valueType = label.value_type as DeclarativeLabelValueTypeEnum;
        }

        if (label.locale) {
            output.locale = label.locale;
        }

        if (label.translations?.length) {
            output.translations = label.translations.map((translation) => ({
                locale: translation.locale,
                sourceColumn: translation.source_column,
            }));
        }

        if (label.geo_area_config?.collection.id) {
            output.geoAreaConfig = {
                collection: {
                    id: label.geo_area_config.collection.id,
                },
            };
        }

        if (label.is_hidden !== undefined) {
            output.isHidden = label.is_hidden;
        }
        if (label.show_in_ai_results !== undefined) {
            output.isHidden = label.show_in_ai_results === false;
        }

        if (label.is_nullable !== undefined) {
            output.isNullable = label.is_nullable;
        }

        if (label.null_value_join_replacement !== undefined) {
            output.nullValue = label.null_value_join_replacement;
        }

        return output;
    });
}
