// (C) 2018 GoodData Corporation
import { VisualizationObject } from '@gooddata/typings';
import { getQualifierObject } from './utils';

export interface IPreviousPeriodDateDataSetSimple {
    dataSet: VisualizationObject.ObjQualifier | string;
    periodsAgo: number;
}

export interface IMeasureAux<T extends VisualizationObject.IMeasureDefinitionType> {
    measure: {
        definition: T;
        localIdentifier: VisualizationObject.IMeasure['measure']['localIdentifier'];
        alias: VisualizationObject.IMeasure['measure']['alias'];
        format: VisualizationObject.IMeasure['measure']['format'];
        title: VisualizationObject.IMeasure['measure']['title'];
    };
}

export class MeasureBuilderBase<T extends VisualizationObject.IMeasureDefinitionType> implements IMeasureAux<T> {
    private static lastMeasureId = 0;
    public measure: IMeasureAux<T>['measure'];
    constructor() {
        this.measure = {
            localIdentifier: `m_${MeasureBuilderBase.lastMeasureId++}`
        } as any; // definition is added in subclass
    }

    public alias = (alias: string) => {
        this.measure.alias = alias;
        return this;
    }

    public format = (format: string) => {
        this.measure.format = format;
        return this;
    }

    public title = (title: string) => {
        this.measure.title = title;
        return this;
    }

    public localIdentifier = (localIdentifier: string) => {
        this.measure.localIdentifier = localIdentifier;
        return this;
    }
}

export class MeasureBuilder extends MeasureBuilderBase<VisualizationObject.IMeasureDefinition> {
    constructor(identifier: string) {
        super();
        this.measure.definition = {
            measureDefinition: {
                item: getQualifierObject(identifier)
            }
        };
    }

    public aggregation = (aggregation: VisualizationObject.MeasureAggregation) => {
        this.measure.definition.measureDefinition.aggregation = aggregation;
        return this;
    }

    public ratio = () => {
        this.measure.definition.measureDefinition.computeRatio = true;
        return this;
    }

    public filters = (...filters: VisualizationObject.VisualizationObjectFilter[]) => {
        this.measure.definition.measureDefinition.filters = filters;
        return this;
    }
}

export class ArithmeticMeasureBuilder extends MeasureBuilderBase<VisualizationObject.IArithmeticMeasureDefinition> {
    constructor(measureIdentifiers: string[], operator: VisualizationObject.ArithmeticMeasureOperator) {
        super();
        this.measure.definition = {
            arithmeticMeasure: {
                measureIdentifiers,
                operator
            }
        };
    }
}

export class PoPMeasureBuilder extends MeasureBuilderBase<VisualizationObject.IPoPMeasureDefinition> {
    constructor(measureIdentifier: string, popAttribute: string) {
        super();
        this.measure.definition = {
            popMeasureDefinition: {
                measureIdentifier,
                popAttribute: getQualifierObject(popAttribute)
            }
        };
    }
}

export class PreviousPeriodMeasureBuilder
    extends MeasureBuilderBase<VisualizationObject.IPreviousPeriodMeasureDefinition> {
    constructor(measureIdentifier: string, dateDataSets: IPreviousPeriodDateDataSetSimple[]) {
        super();
        this.measure.definition = {
            previousPeriodMeasure: {
                measureIdentifier,
                dateDataSets: dateDataSets.map((d): VisualizationObject.IPreviousPeriodDateDataSet =>
                    ({
                        ...d,
                        dataSet: typeof (d.dataSet) === 'string'
                            ? getQualifierObject(d.dataSet)
                            : d.dataSet
                    }))
            }
        };
    }
}

export const measure = (identifier: string) => new MeasureBuilder(identifier);

export const arithmeticMeasure = (
    measureIdentifiers: string[],
    operator: VisualizationObject.ArithmeticMeasureOperator
) => new ArithmeticMeasureBuilder(measureIdentifiers, operator);

export const popMeasure = (measureIdentifier: string, popAttribute: string) =>
    new PoPMeasureBuilder(measureIdentifier, popAttribute);

export const previousPeriodMeasure = (
    measureIdentifier: string,
    dateDataSets: IPreviousPeriodDateDataSetSimple[] = []
) => new PreviousPeriodMeasureBuilder(measureIdentifier, dateDataSets);
