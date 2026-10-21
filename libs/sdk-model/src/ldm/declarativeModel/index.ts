// (C) 2026 GoodData Corporation

import {
    type ConditionalFormattingOperator,
    type IConditionalFormattingFormat,
} from "../../conditionalFormatting/index.js";

/**
 * Data type of a source column.
 *
 * @alpha
 */
export type DeclarativeColumnDataType =
    | "INT"
    | "STRING"
    | "DATE"
    | "NUMERIC"
    | "TIMESTAMP"
    | "TIMESTAMP_TZ"
    | "BOOLEAN"
    | "HLL";

/**
 * Granularity of a date dataset or a calendar, in the vocabulary of the declarative model.
 *
 * @alpha
 */
export type DeclarativeDateGranularity =
    | "SECOND"
    | "SECOND_OF_MINUTE"
    | "SECOND_OF_DAY"
    | "MINUTE"
    | "MINUTE_OF_HOUR"
    | "MINUTE_OF_DAY"
    | "HOUR"
    | "HOUR_OF_DAY"
    | "DAY"
    | "DAY_OF_WEEK"
    | "DAY_OF_MONTH"
    | "DAY_OF_QUARTER"
    | "DAY_OF_YEAR"
    | "WEEK"
    | "WEEK_OF_YEAR"
    | "MONTH"
    | "MONTH_OF_YEAR"
    | "QUARTER"
    | "QUARTER_OF_YEAR"
    | "YEAR"
    | "FISCAL_DAY_OF_FISCAL_WEEK"
    | "FISCAL_DAY_OF_FISCAL_MONTH"
    | "FISCAL_DAY_OF_FISCAL_QUARTER"
    | "FISCAL_DAY_OF_FISCAL_SEMESTER"
    | "FISCAL_DAY_OF_FISCAL_YEAR"
    | "FISCAL_WEEK"
    | "FISCAL_WEEK_OF_FISCAL_MONTH"
    | "FISCAL_WEEK_OF_FISCAL_QUARTER"
    | "FISCAL_WEEK_OF_FISCAL_SEMESTER"
    | "FISCAL_WEEK_OF_FISCAL_YEAR"
    | "FISCAL_MONTH"
    | "FISCAL_MONTH_OF_FISCAL_QUARTER"
    | "FISCAL_MONTH_OF_FISCAL_SEMESTER"
    | "FISCAL_MONTH_OF_FISCAL_YEAR"
    | "FISCAL_QUARTER"
    | "FISCAL_QUARTER_OF_FISCAL_SEMESTER"
    | "FISCAL_QUARTER_OF_FISCAL_YEAR"
    | "FISCAL_SEMESTER"
    | "FISCAL_SEMESTER_OF_FISCAL_YEAR"
    | "FISCAL_YEAR";

/**
 * Value type of a label.
 *
 * @alpha
 */
export type DeclarativeLabelValueType =
    | "TEXT"
    | "HYPERLINK"
    | "GEO"
    | "GEO_LONGITUDE"
    | "GEO_LATITUDE"
    | "GEO_AREA"
    | "GEO_ICON"
    | "IMAGE"
    | "HYPERLOGLOG";

/**
 * Type of a dataset.
 *
 * @alpha
 */
export type DeclarativeDatasetType = "NORMAL" | "AUXILIARY";

/**
 * Sort direction of attribute elements.
 *
 * @alpha
 */
export type DeclarativeAttributeSortDirection = "ASC" | "DESC";

/**
 * Type of the object that is a part of a dataset grain or a target of a reference source.
 *
 * @alpha
 */
export type DeclarativeGrainType = "attribute" | "date";

/**
 * Operation that an aggregated fact applies to its source.
 *
 * @alpha
 */
export type DeclarativeAggregationOperation = "SUM" | "MIN" | "MAX" | "APPROXIMATE_COUNT";

/**
 * Logical data model of a workspace in the declarative form.
 *
 * @remarks
 * The model has the same form as the declarative logical model document of the backend, so it can be
 * exported to JSON and imported back without changes.
 *
 * @alpha
 */
export interface IDeclarativeLogicalModel {
    /**
     * Calendars by their identifier.
     */
    calendars?: { [id: string]: IDeclarativeCalendar };
    /**
     * Extensions of datasets that the workspace inherits from its parents.
     */
    datasetExtensions?: IDeclarativeDatasetExtension[];
    datasets?: IDeclarativeDataset[];
    /**
     * Date datasets.
     */
    dateInstances?: IDeclarativeDateDataset[];
}

/**
 * Calendar of the logical data model.
 *
 * @alpha
 */
export interface IDeclarativeCalendar {
    definition: DeclarativeCalendarDefinition;
    description?: string;
    enabledGranularities: IDeclarativeCalendarGranularity[];
    name: string;
}

/**
 * Definition of a calendar.
 *
 * @alpha
 */
export type DeclarativeCalendarDefinition =
    | IDeclarativeCustomCalendarDefinition
    | IDeclarativeFiscalYearCalendarDefinition;

/**
 * Calendar that reads its periods from data source tables.
 *
 * @alpha
 */
export interface IDeclarativeCustomCalendarDefinition {
    type: "custom";
    dataSourceTables: { [id: string]: IDeclarativeCalendarTableReference };
}

/**
 * Data source table that a custom calendar reads.
 *
 * @alpha
 */
export interface IDeclarativeCalendarTableReference {
    path: string[];
    version: string;
}

/**
 * Calendar with a fiscal year that starts with an offset from the calendar year.
 *
 * @alpha
 */
export interface IDeclarativeFiscalYearCalendarDefinition {
    type: "fiscalYear";
    monthOffset: number;
}

/**
 * Granularity that a calendar enables.
 *
 * @alpha
 */
export interface IDeclarativeCalendarGranularity {
    granularity: DeclarativeDateGranularity;
    prefix: string;
}

/**
 * Extension of a dataset inherited from a parent workspace.
 *
 * @alpha
 */
export interface IDeclarativeDatasetExtension {
    id: string;
    workspaceDataFilterReferences?: IDeclarativeWorkspaceDataFilterReference[];
}

/**
 * Reference from a dataset column to a workspace data filter.
 *
 * @alpha
 */
export interface IDeclarativeWorkspaceDataFilterReference {
    filterColumn: string;
    filterColumnDataType: DeclarativeColumnDataType;
    filterId: IDeclarativeWorkspaceDataFilterIdentifier;
}

/**
 * Identifier of a workspace data filter.
 *
 * @alpha
 */
export interface IDeclarativeWorkspaceDataFilterIdentifier {
    id: string;
    type: "workspaceDataFilter";
}

/**
 * Dataset of the logical data model.
 *
 * @alpha
 */
export interface IDeclarativeDataset {
    aggregatedFacts?: IDeclarativeAggregatedFact[];
    attributes?: IDeclarativeAttribute[];
    /**
     * Data source table that the dataset maps to. A dataset maps to a table or to an SQL statement.
     */
    dataSourceTableId?: IDeclarativeDataSourceTableIdentifier;
    description?: string;
    facts?: IDeclarativeFact[];
    grain: IDeclarativeGrainIdentifier[];
    id: string;
    precedence?: number;
    references: IDeclarativeReference[];
    /**
     * SQL statement that the dataset maps to. A dataset maps to a table or to an SQL statement.
     */
    sql?: IDeclarativeDatasetSql;
    tags?: string[];
    title: string;
    type?: DeclarativeDatasetType;
    workspaceDataFilterColumns?: IDeclarativeWorkspaceDataFilterColumn[];
    workspaceDataFilterReferences?: IDeclarativeWorkspaceDataFilterReference[];
}

/**
 * Fact that aggregates a fact or an attribute of another dataset.
 *
 * @alpha
 */
export interface IDeclarativeAggregatedFact {
    description?: string;
    id: string;
    isNullable?: boolean;
    nullValue?: string;
    sourceColumn?: string;
    sourceColumnDataType?: DeclarativeColumnDataType;
    sourceFactReference: IDeclarativeSourceFactReference;
    tags?: string[];
}

/**
 * Source of an aggregated fact.
 *
 * @alpha
 */
export interface IDeclarativeSourceFactReference {
    operation: DeclarativeAggregationOperation;
    reference: IDeclarativeSourceReferenceIdentifier;
}

/**
 * Identifier of the fact or attribute that an aggregated fact aggregates.
 *
 * @alpha
 */
export interface IDeclarativeSourceReferenceIdentifier {
    id: string;
    type: "fact" | "attribute";
}

/**
 * Attribute of a dataset.
 *
 * @alpha
 */
export interface IDeclarativeAttribute {
    conditionalFormatting?: IDeclarativeConditionalFormatting | null;
    defaultView?: IDeclarativeLabelIdentifier;
    description?: string;
    id: string;
    isHidden?: boolean;
    isNullable?: boolean;
    labels: IDeclarativeLabel[];
    locale?: string;
    nullValue?: string;
    sortColumn?: string;
    sortDirection?: DeclarativeAttributeSortDirection;
    sourceColumn?: string;
    sourceColumnDataType?: DeclarativeColumnDataType;
    tags?: string[];
    title: string;
}

/**
 * Identifier of a label.
 *
 * @alpha
 */
export interface IDeclarativeLabelIdentifier {
    id: string;
    type: "label";
}

/**
 * Label of an attribute.
 *
 * @alpha
 */
export interface IDeclarativeLabel {
    conditionalFormatting?: IDeclarativeConditionalFormatting | null;
    description?: string;
    geoAreaConfig?: IDeclarativeGeoAreaConfig;
    id: string;
    isHidden?: boolean;
    isNullable?: boolean;
    locale?: string;
    nullValue?: string;
    sourceColumn?: string;
    sourceColumnDataType?: DeclarativeColumnDataType;
    tags?: string[];
    title: string;
    translations?: IDeclarativeLabelTranslation[];
    valueType?: DeclarativeLabelValueType;
}

/**
 * Geo area configuration of a label.
 *
 * @alpha
 */
export interface IDeclarativeGeoAreaConfig {
    collection: IDeclarativeGeoCollectionIdentifier;
}

/**
 * Identifier of a geo collection.
 *
 * @alpha
 */
export interface IDeclarativeGeoCollectionIdentifier {
    id: string;
    kind?: "STATIC" | "CUSTOM";
}

/**
 * Source column of a label value in one locale.
 *
 * @alpha
 */
export interface IDeclarativeLabelTranslation {
    locale: string;
    sourceColumn: string;
}

/**
 * Conditional formatting of an attribute, a label or a date dataset.
 *
 * @alpha
 */
export interface IDeclarativeConditionalFormatting {
    conditions: IDeclarativeConditionalFormattingCondition[];
    enabled: boolean;
}

/**
 * Condition of a conditional formatting in the declarative model.
 *
 * @alpha
 */
export interface IDeclarativeConditionalFormattingCondition {
    format: IConditionalFormattingFormat;
    id?: string;
    operator: ConditionalFormattingOperator;
    value: DeclarativeConditionalFormattingValue;
}

/**
 * Operand of a conditional formatting condition in the declarative model.
 *
 * @remarks
 * Relative date values use the {@link DeclarativeDateGranularity} vocabulary.
 *
 * @alpha
 */
export type DeclarativeConditionalFormattingValue =
    | { kind: "none" }
    | { kind: "literal"; value: string | number }
    | { kind: "literalRange"; from: number; to: number }
    | { kind: "absoluteDate"; from: string; to: string }
    | { kind: "relativeDate"; granularity: DeclarativeDateGranularity; from: number; to: number };

/**
 * Identifier of a data source table.
 *
 * @alpha
 */
export interface IDeclarativeDataSourceTableIdentifier {
    dataSourceId: string;
    id: string;
    path?: string[] | null;
    type: "dataSource";
}

/**
 * Fact of a dataset.
 *
 * @alpha
 */
export interface IDeclarativeFact {
    description?: string;
    id: string;
    isHidden?: boolean;
    isNullable?: boolean;
    nullValue?: string;
    sourceColumn?: string;
    sourceColumnDataType?: DeclarativeColumnDataType;
    tags?: string[];
    title: string;
}

/**
 * Identifier of an attribute or a date dataset.
 *
 * @alpha
 */
export interface IDeclarativeGrainIdentifier {
    id: string;
    type: DeclarativeGrainType;
}

/**
 * Reference from a dataset to another dataset or a date dataset.
 *
 * @alpha
 */
export interface IDeclarativeReference {
    identifier: IDeclarativeDatasetIdentifier;
    multivalue: boolean;
    sourceColumnDataTypes?: DeclarativeColumnDataType[];
    sourceColumns?: string[];
    sources?: IDeclarativeReferenceSource[];
}

/**
 * Identifier of a dataset or a date dataset.
 *
 * @alpha
 */
export interface IDeclarativeDatasetIdentifier {
    id: string;
    type: "dataset";
}

/**
 * Source column of a reference and the grain object of the referenced dataset that it maps to.
 *
 * @alpha
 */
export interface IDeclarativeReferenceSource {
    column?: string;
    dataType?: DeclarativeColumnDataType;
    isNullable?: boolean;
    nullValue?: string;
    target: IDeclarativeGrainIdentifier;
}

/**
 * SQL statement that a dataset maps to.
 *
 * @alpha
 */
export interface IDeclarativeDatasetSql {
    dataSourceId: string;
    statement: string;
}

/**
 * Column of a dataset that workspace data filters use.
 *
 * @alpha
 */
export interface IDeclarativeWorkspaceDataFilterColumn {
    dataType: DeclarativeColumnDataType;
    name: string;
}

/**
 * Date dataset of the logical data model.
 *
 * @alpha
 */
export interface IDeclarativeDateDataset {
    conditionalFormatting?: IDeclarativeConditionalFormatting | null;
    description?: string;
    granularities: DeclarativeDateGranularity[];
    granularitiesFormatting: IDeclarativeGranularitiesFormatting;
    id: string;
    tags?: string[];
    title: string;
}

/**
 * Title formatting of the attributes of a date dataset.
 *
 * @alpha
 */
export interface IDeclarativeGranularitiesFormatting {
    titleBase: string;
    titlePattern: string;
}

/**
 * Logical data model and analytical objects of a workspace.
 *
 * @alpha
 */
export interface IDeclarativeWorkspaceLayout {
    ldm: IDeclarativeLogicalModel;
    /**
     * Analytical objects in the declarative analytics document of the backend.
     *
     * @remarks
     * The model does not describe this document. Use a document that the backend exported.
     */
    analytics: object;
}
