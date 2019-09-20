// (C) 2018 GoodData Corporation
import { getQualifierObject } from "./utils";
import {
    ArithmeticMeasureOperator,
    IArithmeticMeasureDefinition,
    IFilter,
    IMeasure,
    IMeasureDefinition,
    IMeasureDefinitionType,
    IPoPMeasureDefinition,
    IPreviousPeriodDateDataSet,
    IPreviousPeriodMeasureDefinition,
    MeasureAggregation,
    ObjQualifier,
} from "@gooddata/sdk-model";

export interface IPreviousPeriodDateDataSetSimple {
    dataSet: ObjQualifier | string;
    periodsAgo: number;
}

export class MeasureBuilderBase<T extends IMeasureDefinitionType> implements IMeasure<T> {
    private static lastMeasureId = 0;
    public measure: IMeasure<T>["measure"];
    constructor() {
        this.measure = {
            localIdentifier: `m_${MeasureBuilderBase.lastMeasureId++}`,
        } as any; // definition is added in subclass
    }

    public alias = (alias: string) => {
        this.measure.alias = alias;
        return this;
    };

    public format = (format: string) => {
        this.measure.format = format;
        return this;
    };

    public title = (title: string) => {
        this.measure.title = title;
        return this;
    };

    public localIdentifier = (localIdentifier: string) => {
        this.measure.localIdentifier = localIdentifier;
        return this;
    };
}

export class MeasureBuilder extends MeasureBuilderBase<IMeasureDefinition> {
    constructor(identifier: string) {
        super();
        this.measure.definition = {
            measureDefinition: {
                item: getQualifierObject(identifier),
            },
        };
    }

    public aggregation = (aggregation: MeasureAggregation) => {
        this.measure.definition.measureDefinition.aggregation = aggregation;
        return this;
    };

    public ratio = () => {
        this.measure.definition.measureDefinition.computeRatio = true;
        return this;
    };

    public filters = (...filters: IFilter[]) => {
        this.measure.definition.measureDefinition.filters = filters;
        return this;
    };
}

export class ArithmeticMeasureBuilder extends MeasureBuilderBase<IArithmeticMeasureDefinition> {
    constructor(measureIdentifiers: string[], operator: ArithmeticMeasureOperator) {
        super();
        this.measure.definition = {
            arithmeticMeasure: {
                measureIdentifiers,
                operator,
            },
        };
    }
}

export class PoPMeasureBuilder extends MeasureBuilderBase<IPoPMeasureDefinition> {
    constructor(measureIdentifier: string, popAttribute: string) {
        super();
        this.measure.definition = {
            popMeasureDefinition: {
                measureIdentifier,
                popAttribute: getQualifierObject(popAttribute),
            },
        };
    }
}

export class PreviousPeriodMeasureBuilder extends MeasureBuilderBase<IPreviousPeriodMeasureDefinition> {
    constructor(measureIdentifier: string, dateDataSets: IPreviousPeriodDateDataSetSimple[]) {
        super();
        this.measure.definition = {
            previousPeriodMeasure: {
                measureIdentifier,
                dateDataSets: dateDataSets.map(
                    (d): IPreviousPeriodDateDataSet => ({
                        ...d,
                        dataSet: typeof d.dataSet === "string" ? getQualifierObject(d.dataSet) : d.dataSet,
                    }),
                ),
            },
        };
    }
}

export const measure = (identifier: string) => new MeasureBuilder(identifier);

export const arithmeticMeasure = (measureIdentifiers: string[], operator: ArithmeticMeasureOperator) =>
    new ArithmeticMeasureBuilder(measureIdentifiers, operator);

export const popMeasure = (measureIdentifier: string, popAttribute: string) =>
    new PoPMeasureBuilder(measureIdentifier, popAttribute);

export const previousPeriodMeasure = (
    measureIdentifier: string,
    dateDataSets: IPreviousPeriodDateDataSetSimple[] = [],
) => new PreviousPeriodMeasureBuilder(measureIdentifier, dateDataSets);
