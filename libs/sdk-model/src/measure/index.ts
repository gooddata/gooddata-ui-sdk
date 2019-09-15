// (C) 2019 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import { Identifier, ObjQualifier } from "../base";
import { IFilter } from "../filter";

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
export interface IMeasure<T extends IMeasureDefinitionType = IMeasureDefinitionType> {
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
