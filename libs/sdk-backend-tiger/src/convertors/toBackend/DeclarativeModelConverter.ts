// (C) 2026 GoodData Corporation

import {
    type CalendarDefinition,
    type ConditionalFormattingCondition,
    type ConditionalFormattingValue,
    type DataSourceTableIdentifier,
    type DeclarativeAggregatedFact,
    type DeclarativeAttribute,
    type DeclarativeCalendar,
    type DeclarativeDataset,
    type DeclarativeDatasetExtension,
    type DeclarativeDatasetSql,
    type DeclarativeDateDataset,
    type DeclarativeFact,
    type DeclarativeLabel,
    type DeclarativeLdm,
    type DeclarativeReference,
    type DeclarativeReferenceSource,
    type DeclarativeWorkspaceDataFilterColumn,
    type DeclarativeWorkspaceDataFilterReferences,
    type GeoAreaConfig,
    type GeoCollectionIdentifier,
    type GrainIdentifier,
    type LabelIdentifier,
    type ObjectConditionalFormatting,
} from "@gooddata/api-client-tiger";
import {
    type DeclarativeCalendarDefinition,
    type DeclarativeConditionalFormattingValue,
    type IDeclarativeAggregatedFact,
    type IDeclarativeAttribute,
    type IDeclarativeCalendar,
    type IDeclarativeConditionalFormatting,
    type IDeclarativeConditionalFormattingCondition,
    type IDeclarativeDataSourceTableIdentifier,
    type IDeclarativeDataset,
    type IDeclarativeDatasetExtension,
    type IDeclarativeDatasetSql,
    type IDeclarativeDateDataset,
    type IDeclarativeFact,
    type IDeclarativeGeoAreaConfig,
    type IDeclarativeGeoCollectionIdentifier,
    type IDeclarativeGrainIdentifier,
    type IDeclarativeLabel,
    type IDeclarativeLabelIdentifier,
    type IDeclarativeLogicalModel,
    type IDeclarativeReference,
    type IDeclarativeReferenceSource,
    type IDeclarativeWorkspaceDataFilterColumn,
    type IDeclarativeWorkspaceDataFilterReference,
} from "@gooddata/sdk-model";

import {
    assertAllFieldsMapped,
    copyArray,
    mapArray,
    mapRecord,
    withoutUndefined,
} from "../shared/declarativeFields.js";

export function convertDeclarativeLdmToBackend(ldm: IDeclarativeLogicalModel): DeclarativeLdm {
    const { calendars, datasetExtensions, datasets, dateInstances, ...unmapped } = ldm;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({
        calendars: mapRecord(calendars, convertCalendar),
        datasetExtensions: mapArray(datasetExtensions, convertDatasetExtension),
        datasets: mapArray(datasets, convertDataset),
        dateInstances: mapArray(dateInstances, convertDateDataset),
    });
}

function convertCalendar(calendar: IDeclarativeCalendar): DeclarativeCalendar {
    const { definition, description, enabledGranularities, name, ...unmapped } = calendar;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({
        definition: convertCalendarDefinition(definition),
        description,
        enabledGranularities: enabledGranularities.map(({ granularity, prefix, ...rest }) => {
            assertAllFieldsMapped(rest);
            return { granularity, prefix };
        }),
        name,
    });
}

function convertCalendarDefinition(definition: DeclarativeCalendarDefinition): CalendarDefinition {
    if (definition.type === "fiscalYear") {
        const { type, monthOffset, ...unmapped } = definition;
        assertAllFieldsMapped(unmapped);
        return { type, monthOffset };
    }
    const { type, dataSourceTables, ...unmapped } = definition;
    assertAllFieldsMapped(unmapped);
    return {
        type,
        dataSourceTables:
            mapRecord(dataSourceTables, ({ path, version, ...rest }) => {
                assertAllFieldsMapped(rest);
                return { path: [...path], version };
            }) ?? {},
    };
}

function convertDatasetExtension(extension: IDeclarativeDatasetExtension): DeclarativeDatasetExtension {
    const { id, workspaceDataFilterReferences, ...unmapped } = extension;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({
        id,
        workspaceDataFilterReferences: mapArray(
            workspaceDataFilterReferences,
            convertWorkspaceDataFilterReference,
        ),
    });
}

function convertWorkspaceDataFilterReference(
    reference: IDeclarativeWorkspaceDataFilterReference,
): DeclarativeWorkspaceDataFilterReferences {
    const { filterColumn, filterColumnDataType, filterId, ...unmapped } = reference;
    assertAllFieldsMapped(unmapped);
    const { id, type, ...unmappedId } = filterId;
    assertAllFieldsMapped(unmappedId);
    return { filterColumn, filterColumnDataType, filterId: { id, type } };
}

function convertDataset(dataset: IDeclarativeDataset): DeclarativeDataset {
    const {
        aggregatedFacts,
        attributes,
        dataSourceTableId,
        description,
        facts,
        grain,
        id,
        precedence,
        references,
        sql,
        tags,
        title,
        type,
        workspaceDataFilterColumns,
        workspaceDataFilterReferences,
        ...unmapped
    } = dataset;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({
        aggregatedFacts: mapArray(aggregatedFacts, convertAggregatedFact),
        attributes: mapArray(attributes, convertAttribute),
        dataSourceTableId: dataSourceTableId && convertDataSourceTableId(dataSourceTableId),
        description,
        facts: mapArray(facts, convertFact),
        grain: mapArray(grain, convertGrainIdentifier),
        id,
        precedence,
        references: mapArray(references, convertReference),
        sql: sql && convertDatasetSql(sql),
        tags: copyArray(tags),
        title,
        type,
        workspaceDataFilterColumns: mapArray(workspaceDataFilterColumns, convertWorkspaceDataFilterColumn),
        workspaceDataFilterReferences: mapArray(
            workspaceDataFilterReferences,
            convertWorkspaceDataFilterReference,
        ),
    });
}

function convertAggregatedFact(fact: IDeclarativeAggregatedFact): DeclarativeAggregatedFact {
    const {
        description,
        id,
        isNullable,
        nullValue,
        sourceColumn,
        sourceColumnDataType,
        sourceFactReference,
        tags,
        ...unmapped
    } = fact;
    assertAllFieldsMapped(unmapped);
    const { operation, reference, ...unmappedReference } = sourceFactReference;
    assertAllFieldsMapped(unmappedReference);
    const { id: referenceId, type: referenceType, ...unmappedIdentifier } = reference;
    assertAllFieldsMapped(unmappedIdentifier);
    return withoutUndefined({
        description,
        id,
        isNullable,
        nullValue,
        sourceColumn,
        sourceColumnDataType,
        sourceFactReference: { operation, reference: { id: referenceId, type: referenceType } },
        tags: copyArray(tags),
    });
}

function convertAttribute(attribute: IDeclarativeAttribute): DeclarativeAttribute {
    const {
        conditionalFormatting,
        defaultView,
        description,
        id,
        isHidden,
        isNullable,
        labels,
        locale,
        nullValue,
        sortColumn,
        sortDirection,
        sourceColumn,
        sourceColumnDataType,
        tags,
        title,
        ...unmapped
    } = attribute;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({
        conditionalFormatting: convertConditionalFormatting(conditionalFormatting),
        defaultView: defaultView && convertLabelIdentifier(defaultView),
        description,
        id,
        isHidden,
        isNullable,
        labels: mapArray(labels, convertLabel),
        locale,
        nullValue,
        sortColumn,
        sortDirection,
        sourceColumn,
        sourceColumnDataType,
        tags: copyArray(tags),
        title,
    });
}

function convertLabel(label: IDeclarativeLabel): DeclarativeLabel {
    const {
        conditionalFormatting,
        description,
        geoAreaConfig,
        id,
        isHidden,
        isNullable,
        locale,
        nullValue,
        sourceColumn,
        sourceColumnDataType,
        tags,
        title,
        translations,
        valueType,
        ...unmapped
    } = label;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({
        conditionalFormatting: convertConditionalFormatting(conditionalFormatting),
        description,
        geoAreaConfig: geoAreaConfig && convertGeoAreaConfig(geoAreaConfig),
        id,
        isHidden,
        isNullable,
        locale,
        nullValue,
        sourceColumn,
        sourceColumnDataType,
        tags: copyArray(tags),
        title,
        translations: mapArray(translations, ({ locale, sourceColumn, ...rest }) => {
            assertAllFieldsMapped(rest);
            return { locale, sourceColumn };
        }),
        valueType,
    });
}

function convertConditionalFormatting(
    conditionalFormatting: IDeclarativeConditionalFormatting | null | undefined,
): ObjectConditionalFormatting | null | undefined {
    if (!conditionalFormatting) {
        return conditionalFormatting;
    }
    const { conditions, enabled, ...unmapped } = conditionalFormatting;
    assertAllFieldsMapped(unmapped);
    return { conditions: conditions.map(convertConditionalFormattingCondition), enabled };
}

function convertConditionalFormattingCondition(
    condition: IDeclarativeConditionalFormattingCondition,
): ConditionalFormattingCondition {
    const { format, id, operator, value, ...unmapped } = condition;
    assertAllFieldsMapped(unmapped);
    const { backgroundColor, color, scope, ...unmappedFormat } = format;
    assertAllFieldsMapped(unmappedFormat);
    return withoutUndefined({
        format: withoutUndefined({ backgroundColor, color, scope }),
        id,
        operator,
        value: convertConditionalFormattingValue(value),
    });
}

function convertConditionalFormattingValue(
    value: DeclarativeConditionalFormattingValue,
): ConditionalFormattingValue {
    switch (value.kind) {
        case "none": {
            const { kind, ...unmapped } = value;
            assertAllFieldsMapped(unmapped);
            return { kind };
        }
        case "literal": {
            const { kind, value: literal, ...unmapped } = value;
            assertAllFieldsMapped(unmapped);
            return { kind, value: literal };
        }
        case "literalRange": {
            const { kind, from, to, ...unmapped } = value;
            assertAllFieldsMapped(unmapped);
            return { kind, from, to };
        }
        case "absoluteDate": {
            const { from, to, kind, ...unmapped } = value;
            assertAllFieldsMapped(unmapped);
            return { from, to, kind };
        }
        case "relativeDate": {
            const { kind, granularity, from, to, ...unmapped } = value;
            assertAllFieldsMapped(unmapped);
            return { kind, granularity, from, to };
        }
    }
}

function convertDataSourceTableId(tableId: IDeclarativeDataSourceTableIdentifier): DataSourceTableIdentifier {
    const { dataSourceId, id, path, type, ...unmapped } = tableId;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({ dataSourceId, id, path: copyArray(path), type });
}

function convertFact(fact: IDeclarativeFact): DeclarativeFact {
    const {
        description,
        id,
        isHidden,
        isNullable,
        nullValue,
        sourceColumn,
        sourceColumnDataType,
        tags,
        title,
        ...unmapped
    } = fact;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({
        description,
        id,
        isHidden,
        isNullable,
        nullValue,
        sourceColumn,
        sourceColumnDataType,
        tags: copyArray(tags),
        title,
    });
}

function convertGrainIdentifier(grain: IDeclarativeGrainIdentifier): GrainIdentifier {
    const { id, type, ...unmapped } = grain;
    assertAllFieldsMapped(unmapped);
    return { id, type };
}

function convertReference(reference: IDeclarativeReference): DeclarativeReference {
    const { identifier, multivalue, sourceColumnDataTypes, sourceColumns, sources, ...unmapped } = reference;
    assertAllFieldsMapped(unmapped);
    const { id, type, ...unmappedIdentifier } = identifier;
    assertAllFieldsMapped(unmappedIdentifier);
    return withoutUndefined({
        identifier: { id, type },
        multivalue,
        sourceColumnDataTypes: copyArray(sourceColumnDataTypes),
        sourceColumns: copyArray(sourceColumns),
        sources: mapArray(sources, convertReferenceSource),
    });
}

function convertReferenceSource(source: IDeclarativeReferenceSource): DeclarativeReferenceSource {
    const { column, dataType, isNullable, nullValue, target, ...unmapped } = source;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({
        column,
        dataType,
        isNullable,
        nullValue,
        target: convertGrainIdentifier(target),
    });
}

function convertDatasetSql(sql: IDeclarativeDatasetSql): DeclarativeDatasetSql {
    const { dataSourceId, statement, ...unmapped } = sql;
    assertAllFieldsMapped(unmapped);
    return { dataSourceId, statement };
}

function convertWorkspaceDataFilterColumn(
    column: IDeclarativeWorkspaceDataFilterColumn,
): DeclarativeWorkspaceDataFilterColumn {
    const { dataType, name, ...unmapped } = column;
    assertAllFieldsMapped(unmapped);
    return { dataType, name };
}

function convertDateDataset(dateDataset: IDeclarativeDateDataset): DeclarativeDateDataset {
    const {
        conditionalFormatting,
        description,
        granularities,
        granularitiesFormatting,
        id,
        tags,
        title,
        ...unmapped
    } = dateDataset;
    assertAllFieldsMapped(unmapped);
    const { titleBase, titlePattern, ...unmappedFormatting } = granularitiesFormatting;
    assertAllFieldsMapped(unmappedFormatting);
    return withoutUndefined({
        conditionalFormatting: convertConditionalFormatting(conditionalFormatting),
        description,
        granularities: [...granularities],
        granularitiesFormatting: { titleBase, titlePattern },
        id,
        tags: copyArray(tags),
        title,
    });
}

function convertLabelIdentifier(identifier: IDeclarativeLabelIdentifier): LabelIdentifier {
    const { id, type, ...unmapped } = identifier;
    assertAllFieldsMapped(unmapped);
    return { id, type };
}

function convertGeoAreaConfig(config: IDeclarativeGeoAreaConfig): GeoAreaConfig {
    const { collection, ...unmapped } = config;
    assertAllFieldsMapped(unmapped);
    return { collection: convertGeoCollectionIdentifier(collection) };
}

function convertGeoCollectionIdentifier(
    identifier: IDeclarativeGeoCollectionIdentifier,
): GeoCollectionIdentifier {
    const { id, kind, ...unmapped } = identifier;
    assertAllFieldsMapped(unmapped);
    return withoutUndefined({ id, kind });
}
