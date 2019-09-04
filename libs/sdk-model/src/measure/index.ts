// (C) 2019 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import { ObjQualifier, Identifier } from "../base";
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
export interface IMeasure {
    measure: {
        localIdentifier: Identifier;
        definition: IMeasureDefinitionType;
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
// Type guards
//

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isMeasure(obj: any): obj is IMeasure {
    return !isEmpty(obj) && (obj as IMeasure).measure !== undefined;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isMeasureDefinition(obj: any): obj is IMeasureDefinition {
    return !isEmpty(obj) && (obj as IMeasureDefinition).measureDefinition !== undefined;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isPoPMeasureDefinition(obj: any): obj is IPoPMeasureDefinition {
    return !isEmpty(obj) && (obj as IPoPMeasureDefinition).popMeasureDefinition !== undefined;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isPreviousPeriodMeasure(obj: any): obj is IPreviousPeriodMeasureDefinition {
    return !isEmpty(obj) && (obj as IPreviousPeriodMeasureDefinition).previousPeriodMeasure !== undefined;
}
