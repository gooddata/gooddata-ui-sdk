// (C) 2019-2020 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import invariant from "ts-invariant";
import { Identifier, isIdentifierRef, isUriRef, ObjRef } from "../base";
import { IMeasureFilter } from "../filter";
import { modifySimpleMeasure } from "./factory";

/**
 * Available measure definitions; this is union of simple measure, arithmetic measure, PoP measure and
 * previous period measure. See the respective definitions for more information on what can be achieved
 * using them.
 *
 * @public
 */
export type IMeasureDefinitionType =
    | IMeasureDefinition
    | IArithmeticMeasureDefinition
    | IPoPMeasureDefinition
    | IPreviousPeriodMeasureDefinition;

/**
 * All types of measures have a set of common properties; those are defined here. The measure-type-specific
 * information is stored in the measure definition.
 *
 * @public
 */
export interface IMeasure<T extends IMeasureDefinitionType = IMeasureDefinitionType> extends IMeasureTitle {
    measure: {
        localIdentifier: Identifier;
        definition: T;
        alias?: string;
        title?: string;
        format?: string;
    };
}

/**
 * Subset of IMeasure interface which defines properties that MAY be used to provide human readable
 * description of the measure.
 *
 * @public
 */
export interface IMeasureTitle {
    measure: {
        localIdentifier: string;
        title?: string;
        alias?: string;
    };
}

/**
 * Simple measures created from facts can use these types of aggregations.
 *
 * @public
 */
export type MeasureAggregation = "sum" | "count" | "avg" | "min" | "max" | "median" | "runsum";

/**
 * Simple measures are defined from existing MAQL measures or logical data model facts. Measures created
 * from facts MAY specify aggregation function to apply during execution.
 *
 * @public
 */
export interface IMeasureDefinition {
    measureDefinition: {
        /**
         * Reference to MAQL metric or LDM fact object.
         */
        item: ObjRef;

        /**
         * Aggregation to apply when calculating from LDM facts. If aggregation is provided for MAQL measures,
         * it will be ignored.
         */
        aggregation?: MeasureAggregation;

        /**
         * Filters to apply in scope of this measure's calculation.
         */
        filters?: IMeasureFilter[];

        /**
         * Indicates whether the measure should be calculated as % of total instead of actual values.
         */
        computeRatio?: boolean;
    };
}

/**
 * Simple math operators for arithmetic measure construction.
 *
 * @public
 */
export type ArithmeticMeasureOperator = "sum" | "difference" | "multiplication" | "ratio" | "change";

/**
 * Arithmetic measures are created by composing two or more other measures and defining arithmetic
 * to apply on their values.
 *
 * @public
 */
export interface IArithmeticMeasureDefinition {
    arithmeticMeasure: {
        measureIdentifiers: Identifier[];
        operator: ArithmeticMeasureOperator;
    };
}

/**
 * Defines Period-Over-Period measure (or Time-over-Time). This is a derived measure that calculates value
 * of a measure referenced by measureIdentifier in previous period. The period to calculate value for will be
 * determined from the specified date data set's attribute - popAttribute.
 *
 * TODO: enhance, add examples
 * @public
 */
export interface IPoPMeasureDefinition {
    popMeasureDefinition: {
        measureIdentifier: Identifier;
        popAttribute: ObjRef;
    };
}

/**
 * This is a derived measure that calculates value of a measure referenced by measureIdentifier for previous
 * period. Period is determined from filter setting of the specified date data sets. The time period for
 * this derived measure will be shifted forward or backward according to the specified periodAgo number
 *
 * TODO: enhance, add examples
 *
 * @public
 */
export interface IPreviousPeriodMeasureDefinition {
    previousPeriodMeasure: {
        measureIdentifier: Identifier;
        dateDataSets: IPreviousPeriodDateDataSet[];
    };
}

/**
 * This is used to specify previous period. Previous period is current time period shifted forward or backward
 * one or more times. The current time period is calculated from filter setting for the provided date data set.
 *
 * @public
 */
export interface IPreviousPeriodDateDataSet {
    dataSet: ObjRef;
    periodsAgo: number;
}

//
//
//

/**
 * Defines function signature for measure predicates.
 *
 * @public
 */
export type MeasurePredicate = (measure: IMeasure) => boolean;

/**
 * Implementation of measure predicate which always returns true.
 *
 * @public
 */
export const anyMeasure: MeasurePredicate = _ => true;

/**
 * Factory function for measure predicate which evaluates true for measures that match particular ID.
 *
 * @public
 */
export const idMatchMeasure: (id: string) => MeasurePredicate = id => m => m.measure.localIdentifier === id;

//
// Type guards
//

/**
 * Type guard for checking whether object is any type of measure.
 *
 * @public
 */
export function isMeasure(obj: any): obj is IMeasure {
    return !isEmpty(obj) && (obj as IMeasure).measure !== undefined;
}

/**
 * Type guard for checking whether object is a simple measure.
 *
 * @public
 */
export function isSimpleMeasure(obj: any): obj is IMeasure<IMeasureDefinition> {
    return isMeasure(obj) && isMeasureDefinition(obj.measure.definition);
}

/**
 * Type guard for checking whether object is a period-over-period measure.
 *
 * @public
 */
export function isPoPMeasure(obj: any): obj is IMeasure<IPoPMeasureDefinition> {
    return isMeasure(obj) && isPoPMeasureDefinition(obj.measure.definition);
}

/**
 * Type guard for checking whether object is a previous-period measure.
 *
 * @public
 */
export function isPreviousPeriodMeasure(obj: any): obj is IMeasure<IPreviousPeriodMeasureDefinition> {
    return isMeasure(obj) && isPreviousPeriodMeasureDefinition(obj.measure.definition);
}

/**
 * Type guard for checking whether object is an arithmetic measure.
 *
 * @public
 */
export function isArithmeticMeasure(obj: any): obj is IMeasure<IArithmeticMeasureDefinition> {
    return isMeasure(obj) && isArithmeticMeasureDefinition(obj.measure.definition);
}

/**
 * Type guard for checking whether object is a measure definition.
 *
 * @public
 */
export function isMeasureDefinition(obj: any): obj is IMeasureDefinition {
    return !isEmpty(obj) && (obj as IMeasureDefinition).measureDefinition !== undefined;
}

/**
 * Type guard for checking whether object is a period-over-period measure definition.
 *
 * @public
 */
export function isPoPMeasureDefinition(obj: any): obj is IPoPMeasureDefinition {
    return !isEmpty(obj) && (obj as IPoPMeasureDefinition).popMeasureDefinition !== undefined;
}

/**
 * Type guard for checking whether object is a previous period measure definition.
 *
 * @public
 */
export function isPreviousPeriodMeasureDefinition(obj: any): obj is IPreviousPeriodMeasureDefinition {
    return !isEmpty(obj) && (obj as IPreviousPeriodMeasureDefinition).previousPeriodMeasure !== undefined;
}

/**
 * Type guard for checking whether object is an arithmetic measure definition.
 *
 * @public
 */
export function isArithmeticMeasureDefinition(obj: any): obj is IArithmeticMeasureDefinition {
    return !isEmpty(obj) && (obj as IArithmeticMeasureDefinition).arithmeticMeasure !== undefined;
}

//
// Functions
//

/**
 * Gets measure's local identifier.
 *
 * @param measure - measure to work with
 * @returns string identifier
 * @public
 */
export function measureLocalId(measure: IMeasure): string {
    invariant(measure, "measure to get local id from must be specified");

    return measure.measure.localIdentifier;
}

/**
 * Gets URI of persistent measure; undefined is returned if the measure definition is not for a persistent
 * measure (arithmetic or derived). Undefined is returned if the measure is not specified by URI.
 *
 * @param measure - measure to get URI for
 * @returns URI or undefined
 * @public
 */
export function measureUri(measure: IMeasure): string | undefined {
    invariant(measure, "measure must be specified");

    if (!isSimpleMeasure(measure)) {
        return undefined;
    }

    const qualifier = measure.measure.definition.measureDefinition.item;

    return isUriRef(qualifier) ? qualifier.uri : undefined;
}

/**
 * Gets identifier of persistent measure; undefined is returned if the measure definition is not for a persistent
 * measure (arithmetic or derived). Undefined is returned if the measure is not specified by identifier.
 *
 * @param measure - measure to get URI for
 * @returns identifier or undefined
 * @public
 */
export function measureIdentifier(measure: IMeasure): string | undefined {
    invariant(measure, "measure must be specified");

    if (!isSimpleMeasure(measure)) {
        return undefined;
    }

    const qualifier = measure.measure.definition.measureDefinition.item;

    return isIdentifierRef(qualifier) ? qualifier.identifier : undefined;
}

/**
 * Tests whether the measure is set to compute ratio.
 *
 * @param measure - measure to to test
 * @returns true if computes ratio, false otherwise
 * @public
 */
export function measureDoesComputeRatio(measure: IMeasure): boolean {
    invariant(measure, "measure must be specified");

    if (!isSimpleMeasure(measure)) {
        return false;
    }

    return !!measure.measure.definition.measureDefinition.computeRatio;
}

/**
 * Disables compute ratio on the provided measure. This is an immutable function - returning new
 * measure with the ratio disabled.
 *
 * @param measure - measure to disable compute ratio for
 * @returns new measure with disabled ratio; same measure if ratio was not enabled in the first place
 * @public
 */
export function measureDisableComputeRatio(measure: IMeasure): IMeasure {
    invariant(measure, "measure must be specified");

    if (!isSimpleMeasure(measure)) {
        return measure;
    }

    if (!measure.measure.definition.measureDefinition.computeRatio) {
        return measure;
    }

    return modifySimpleMeasure(measure, m => m.noRatio());
}

/**
 * Gets identifier of master measure for the provided derived measure (PoP measure or Previous Period measure).
 * If the measure is not derived or is derived and does not specify master measure id, then undefined is returned.
 *
 * @param measure - derived measure
 * @returns master measure identifier, undefined if input measure not derived or does not specify master
 * @public
 */
export function measureMasterIdentifier(measure: IMeasure): string | undefined {
    invariant(measure, "measure must be specified");

    if (isPoPMeasure(measure)) {
        return measure.measure.definition.popMeasureDefinition.measureIdentifier;
    } else if (isPreviousPeriodMeasure(measure)) {
        return measure.measure.definition.previousPeriodMeasure.measureIdentifier;
    }

    return undefined;
}

/**
 * Gets identifiers of arithmetic operands from the provided measure. If the measure is not an arithmetic measure, then
 * undefined is returned.
 *
 * TODO: revisit; perhaps should return empty array?
 *
 * @param measure - measure to get arithmetic operands from
 * @returns array of local identifiers of measures that are used as arithmetic operands, undefined if input measure
 * is not arithmetic
 * @public
 */
export function measureArithmeticOperands(measure: IMeasure): string[] | undefined {
    invariant(measure, "measure must be specified");

    if (!isArithmeticMeasure(measure)) {
        return undefined;
    }

    return measure.measure.definition.arithmeticMeasure.measureIdentifiers;
}

/**
 * Gets arithmetic operator from the provided measure. If the measure is not an arithmetic measure, then
 * undefined is returned.
 *
 * @param measure - measure to get arithmetic operator from
 * @returns arithmetic operator of the measure, or undefined if measure is not arithmetic
 * @public
 */
export function measureArithmeticOperator(measure: IMeasure): ArithmeticMeasureOperator | undefined {
    invariant(measure, "measure must be specified");

    if (!isArithmeticMeasure(measure)) {
        return undefined;
    }

    return measure.measure.definition.arithmeticMeasure.operator;
}

/**
 * Gets measure alias.
 *
 * @param measure - measure to get the alias of
 * @returns measure alias if specified, undefined otherwise
 * @public
 */
export function measureAlias(measure: IMeasure): string | undefined {
    invariant(measure, "measure must be specified");

    return measure.measure.alias;
}

/**
 * Gets measure title.
 * @param measure - measure to get the title of
 * @returns measure title if specified, undefined otherwise
 * @public
 */
export function measureTitle(measure: IMeasure): string | undefined {
    invariant(measure, "measure must be specified");

    return measure.measure.title;
}

/**
 * Gets measure format.
 * @param measure - measure to get the format of
 * @returns measure format if specified, undefined otherwise
 * @public
 */
export function measureFormat(measure: IMeasure): string | undefined {
    invariant(measure, "measure must be specified");

    return measure.measure.format;
}

/**
 * Gets measure aggregation.
 *
 * @param measure - measure to get the aggregation of
 * @returns measure aggregation if specified, undefined otherwise
 * @public
 */
export function measureAggregation(measure: IMeasure): MeasureAggregation | undefined {
    invariant(measure, "measure must be specified");

    if (!isSimpleMeasure(measure)) {
        return undefined;
    }

    return measure.measure.definition.measureDefinition.aggregation;
}

/**
 * Gets measure filters.
 *
 * @param measure - measure to get the filters of
 * @returns measure filters if specified, undefined otherwise
 * @public
 */
export function measureFilters(measure: IMeasure): IMeasureFilter[] | undefined {
    invariant(measure, "measure must be specified");

    if (!isSimpleMeasure(measure)) {
        return undefined;
    }

    return measure.measure.definition.measureDefinition.filters;
}

/**
 * Gets measure popAttribute.
 *
 * @param measure - measure to get the popAttribute of
 * @returns measure popAttribute if specified, undefined otherwise
 * @public
 */
export function measurePopAttribute(measure: IMeasure): ObjRef | undefined {
    invariant(measure, "measure must be specified");

    if (!isPoPMeasure(measure)) {
        return undefined;
    }

    return measure.measure.definition.popMeasureDefinition.popAttribute;
}

/**
 * Gets measure previous period date data sets.
 *
 * @param measure - measure to get the previous period date data sets of
 * @returns measure previous period date data sets if specified, undefined otherwise
 * @public
 */
export function measurePreviousPeriodDateDataSets(
    measure: IMeasure,
): IPreviousPeriodDateDataSet[] | undefined {
    invariant(measure, "measure must be specified");

    if (!isPreviousPeriodMeasure(measure)) {
        return undefined;
    }

    return measure.measure.definition.previousPeriodMeasure.dateDataSets;
}
