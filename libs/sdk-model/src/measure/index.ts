// (C) 2019 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import { Identifier, isIdentifierQualifier, isUriQualifier, ObjQualifier } from "../base";
import { IFilter } from "../filter";
import unset = require("lodash/unset");
import cloneDeep = require("lodash/cloneDeep");

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type IMeasureDefinitionType =
    | IMeasureDefinition
    | IArithmeticMeasureDefinition
    | IPoPMeasureDefinition
    | IPreviousPeriodMeasureDefinition;

/**
 * TODO: SDK8: Add docs
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
 * TODO: SDK8: Add docs
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
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type MeasureAggregation = "sum" | "count" | "avg" | "min" | "max" | "median" | "runsum";

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IMeasureDefinition {
    measureDefinition: {
        item: ObjQualifier;
        aggregation?: MeasureAggregation;
        filters?: IFilter[];
        computeRatio?: boolean;
    };
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type ArithmeticMeasureOperator = "sum" | "difference" | "multiplication" | "ratio" | "change";

/**
 * TODO: SDK8: Add docs
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
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IPoPMeasureDefinition {
    popMeasureDefinition: {
        measureIdentifier: Identifier;
        popAttribute: ObjQualifier;
    };
}

/**
 * TODO: SDK8: Add docs
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
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IPreviousPeriodDateDataSet {
    dataSet: ObjQualifier;
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
export function measureId(measure: IMeasure): string {
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
    if (!isSimpleMeasure(measure)) {
        return undefined;
    }

    const qualifier = measure.measure.definition.measureDefinition.item;

    return isUriQualifier(qualifier) ? qualifier.uri : undefined;
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
    if (!isSimpleMeasure(measure)) {
        return undefined;
    }

    const qualifier = measure.measure.definition.measureDefinition.item;

    return isIdentifierQualifier(qualifier) ? qualifier.identifier : undefined;
}

/**
 * TODO move and hide this; fingerprint calculation only make sense in the context of the entire execution
 *
 * @internal
 */
export function measureFingerprint(measure: IMeasure): string {
    return JSON.stringify(measure);
}

/**
 * Tests whether the measure is set to compute ratio.
 *
 * @param measure - measure to to test
 * @returns true if computes ratio, false otherwise
 * @public
 */
export function measureDoesComputeRatio(measure: IMeasure): boolean {
    if (isSimpleMeasure(measure)) {
        const computeRatio = measure.measure.definition.measureDefinition.computeRatio;

        return computeRatio ? computeRatio : false;
    }

    return false;
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
    if (!measureDoesComputeRatio(measure)) {
        return measure;
    }

    const newItem: IMeasure = cloneDeep(measure);
    // I was not able to get any other way working for a while so doing this dirty stuff.
    unset(newItem, ["measure", "definition", "measureDefinition", "computeRatio"]);

    return newItem;
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
    if (!isArithmeticMeasure(measure)) {
        return undefined;
    }

    return measure.measure.definition.arithmeticMeasure.measureIdentifiers;
}
