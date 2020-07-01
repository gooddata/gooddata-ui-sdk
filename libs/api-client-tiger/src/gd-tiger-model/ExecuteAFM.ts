// (C) 2019-2020 GoodData Corporation

export namespace ExecuteAFM {
    export interface IExecution {
        project: string;
        resultSpec?: IResultSpec;
        execution: IAfm;
    }

    export interface IAfm {
        attributes?: IAttribute[];
        measures?: IMeasure[];
        filters?: CompatibilityFilter[];
        // native totals not yet supported by NAS
        // nativeTotals?: INativeTotalItem[];
    }

    export interface IResultSpec {
        dimensions?: IDimension[];
    }

    export interface IAttribute {
        localIdentifier: Identifier;
        displayForm: ObjQualifier;
        alias?: string;
    }

    export interface IMeasure {
        localIdentifier: Identifier;
        definition: MeasureDefinition;
        alias?: string;
        format?: string;
    }

    export type MeasureDefinition =
        | ISimpleMeasureDefinition
        | IArithmeticMeasureDefinition
        | IOverPeriodMeasureDefinition
        | IPreviousPeriodMeasureDefinition;

    export interface ISimpleMeasureDefinition {
        measure: ISimpleMeasure;
    }

    export interface IArithmeticMeasureDefinition {
        arithmeticMeasure: IArithmeticMeasure;
    }

    export interface IOverPeriodMeasureDefinition {
        overPeriodMeasure: IOverPeriodMeasure;
    }

    export interface IPreviousPeriodMeasureDefinition {
        previousPeriodMeasure: IPreviousPeriodMeasure;
    }

    export type SimpleMeasureAggregation = "SUM" | "COUNT" | "AVG" | "MIN" | "MAX" | "MEDIAN" | "RUNSUM";

    export interface ISimpleMeasure {
        item: ObjQualifier;
        aggregation?: SimpleMeasureAggregation;
        filters?: FilterItem[];
        computeRatio?: boolean;
    }

    export type ArithmeticMeasureOperator = "sum" | "difference" | "multiplication" | "ratio" | "change";

    export interface IArithmeticMeasure {
        measureIdentifiers: ILocalIdentifierQualifier[];
        operator: ArithmeticMeasureOperator;
    }

    export interface IPopDateAttribute {
        attribute: ObjQualifier;
        periodsAgo: number;
    }

    export interface IOverPeriodMeasure {
        measureIdentifier: ILocalIdentifierQualifier;
        dateAttributes: IPopDateAttribute[];
    }

    export interface IPreviousPeriodMeasure {
        measureIdentifier: ILocalIdentifierQualifier;
        dateDatasets: IPreviousPeriodDateDataset[];
    }

    export interface IPreviousPeriodDateDataset {
        dataset: ObjQualifier;
        periodsAgo: number;
    }

    export type Identifier = string;
    export type ObjQualifier = IObjIdentifierQualifier;

    export interface IObjIdentifierQualifier {
        identifier: {
            id: string;
            type: string;
        };
    }

    export interface ILocalIdentifierQualifier {
        localIdentifier: string;
    }

    export type CompatibilityFilter = IExpressionFilter | FilterItem;
    export type FilterItem = DateFilterItem | AttributeFilterItem | MeasureValueFilterItem;
    export type AttributeFilterItem = IPositiveAttributeFilter | INegativeAttributeFilter;
    export type DateFilterItem = IAbsoluteDateFilter | IRelativeDateFilter;
    export type MeasureValueFilterItem = IRangeMeasureValueFilter | IComparisonMeasureValueFilter;

    export interface IAttributeElementsByValue {
        values: string[];
    }

    export type AttributeElements = string[] | IAttributeElementsByValue;

    export interface IPositiveAttributeFilter {
        positiveAttributeFilter: {
            displayForm: ObjQualifier;
            in: AttributeElements;
        };
    }

    export interface INegativeAttributeFilter {
        negativeAttributeFilter: {
            displayForm: ObjQualifier;
            notIn: AttributeElements;
        };
    }

    export interface IAbsoluteDateFilter {
        absoluteDateFilter: {
            dataset: ObjQualifier;
            from: string;
            to: string;
        };
    }

    export interface IRelativeDateFilter {
        relativeDateFilter: {
            dataset: ObjQualifier;
            granularity: string;
            from: number;
            to: number;
        };
    }

    export type RangeConditionOperator = "BETWEEN" | "NOT_BETWEEN";

    export interface IRangeMeasureValueFilter {
        rangeMeasureValueFilter: {
            measure: ObjQualifier | ILocalIdentifierQualifier;
            operator: RangeConditionOperator;
            from: number;
            to: number;
            treatNullValuesAs?: number;
        };
    }

    export type ComparisonConditionOperator =
        | "GREATER_THAN"
        | "GREATER_THAN_OR_EQUAL_TO"
        | "LESS_THAN"
        | "LESS_THAN_OR_EQUAL_TO"
        | "EQUAL_TO"
        | "NOT_EQUAL_TO";

    export interface IComparisonMeasureValueFilter {
        comparisonMeasureValueFilter: {
            measure: ObjQualifier | ILocalIdentifierQualifier;
            operator: ComparisonConditionOperator;
            value: number;
            treatNullValuesAs?: number;
        };
    }

    // Might be removed, as we don't know if expression filter is needed
    export interface IExpressionFilter {
        value: string;
    }

    export interface ITotalItem {
        measureIdentifier: ILocalIdentifierQualifier;
        type: TotalType;
        attributeIdentifier: ILocalIdentifierQualifier;
    }

    export type TotalType = "sum" | "avg" | "max" | "min" | "nat" | "med";

    export interface INativeTotalItem {
        measureIdentifier: ILocalIdentifierQualifier;
        attributeIdentifiers: ILocalIdentifierQualifier[];
    }

    export type SortDirection = "ASC" | "DESC";

    export interface IAttributeSortKey {
        attribute: {
            attributeIdentifier: string;
            direction: SortDirection;
        };
    }

    export interface IDimensionItemValue {
        itemIdentifier: string;
        itemValue: string;
    }

    export interface IDimensionLocator {
        dimensionIdentifier: string;
        locator: IDimensionItemValue[];
    }

    export interface IValueSortKey {
        value: {
            direction: SortDirection;
            dataColumnLocators: IDimensionLocator[];
        };
    }

    export type SortKey = IAttributeSortKey | IValueSortKey;

    export interface IDimension {
        localIdentifier: string;
        itemIdentifiers: Identifier[];
        sorting?: SortKey[];
        totals?: ITotalItem[];
    }

    export const isObjIdentifierQualifier = (value: any): value is IObjIdentifierQualifier => {
        return !!(
            (value as Partial<IObjIdentifierQualifier>)?.identifier?.id &&
            (value as Partial<IObjIdentifierQualifier>)?.identifier?.type
        );
    };
}
