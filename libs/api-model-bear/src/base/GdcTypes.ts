// (C) 2007-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";

/**
 * @public
 */
export type DateString = string; // YYYY-MM-DD

// Type aliases, because string is too vague to represent some values

/**
 * @public
 */
export type Timestamp = string; // YYYY-MM-DD HH:mm:ss

/**
 * @public
 */
export type TimeIso8601 = string; // YYYY-MM-DDTHH:mm:ss.sssZ

/**
 * @public
 */
export type Email = string; // xxx@xxx.xx

/**
 * @public
 */
export type NumberAsString = string; // Number, but returned as a string

/**
 * @public
 */
export type Uri = string; // Metadata uri (f.e. /gdc/md/...)

/**
 * @public
 */
export type MaqlExpression = string; // Maql expression (f.e. SELECT [/gdc/md/...] IN [/gdc/md/...])

/**
 * @public
 */
export type BooleanAsString = "1" | "0";

/**
 * CSS color in hex format (f.g. #14b2e2)
 * @public
 */
export type ThemeColor = string;

/**
 * @public
 */
export type ThemeFontUri = string; // font uri

/**
 * @public
 */
export type SortDirection = "asc" | "desc";

/**
 * @public
 */
export type Identifier = string;

/**
 * @public
 */
export type MeasureAggregation = "sum" | "count" | "avg" | "min" | "max" | "median" | "runsum";

/**
 * @public
 */
export type TotalType = "sum" | "avg" | "max" | "min" | "nat" | "med";

/**
 * @public
 */
export type ArithmeticMeasureOperator = "sum" | "difference" | "multiplication" | "ratio" | "change";

/**
 * @public
 */
export type ComparisonConditionOperator =
    | "GREATER_THAN"
    | "GREATER_THAN_OR_EQUAL_TO"
    | "LESS_THAN"
    | "LESS_THAN_OR_EQUAL_TO"
    | "EQUAL_TO"
    | "NOT_EQUAL_TO";

/**
 * @public
 */
export type RangeConditionOperator = "BETWEEN" | "NOT_BETWEEN";

/**
 * @public
 */
export type RankingFilterOperator = "TOP" | "BOTTOM";

/**
 * @public
 */
export interface ILocalIdentifierQualifier {
    localIdentifier: string;
}

/**
 * @public
 */
export interface IObjUriQualifier {
    uri: string;
}

/**
 * @public
 */
export interface IObjIdentifierQualifier {
    identifier: string;
}

/**
 * @public
 */
export type ObjQualifier = IObjUriQualifier | IObjIdentifierQualifier;

/**
 * @public
 */
export type Qualifier = ObjQualifier | ILocalIdentifierQualifier;

/**
 * @public
 */
export interface IComparisonCondition {
    comparison: {
        operator: ComparisonConditionOperator;
        value: number;
        treatNullValuesAs?: number;
    };
}

/**
 * @public
 */
export interface IRangeCondition {
    range: {
        operator: RangeConditionOperator;
        from: number;
        to: number;
        treatNullValuesAs?: number;
    };
}

/**
 * @public
 */
export type MeasureValueFilterCondition = IComparisonCondition | IRangeCondition;

/**
 * @public
 */
export interface IPreviousPeriodDateDataSet {
    dataSet: ObjQualifier;
    periodsAgo: number;
}

/**
 * @public
 */
export function isObjectUriQualifier(qualifier: ObjQualifier): qualifier is IObjUriQualifier {
    return !isEmpty(qualifier) && (qualifier as IObjUriQualifier).uri !== undefined;
}

/**
 * @public
 */
export function isObjIdentifierQualifier(qualifier: ObjQualifier): qualifier is IObjIdentifierQualifier {
    return !isEmpty(qualifier) && (qualifier as IObjIdentifierQualifier).identifier !== undefined;
}

/**
 * @public
 */
export function isLocalIdentifierQualifier(qualifier: unknown): qualifier is ILocalIdentifierQualifier {
    return !isEmpty(qualifier) && (qualifier as ILocalIdentifierQualifier).localIdentifier !== undefined;
}

/**
 * @public
 */
export function isComparisonCondition(
    condition: MeasureValueFilterCondition,
): condition is IComparisonCondition {
    return !isEmpty(condition) && (condition as IComparisonCondition).comparison !== undefined;
}

/**
 * @public
 */
export function isRangeCondition(condition: MeasureValueFilterCondition): condition is IRangeCondition {
    return !isEmpty(condition) && (condition as IRangeCondition).range !== undefined;
}
