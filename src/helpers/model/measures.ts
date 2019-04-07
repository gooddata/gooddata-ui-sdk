// (C) 2018 GoodData Corporation
import { VisualizationInput } from "@gooddata/typings";
import { getQualifierObject } from "./utils";

export interface IPreviousPeriodDateDataSetSimple {
    dataSet: VisualizationInput.ObjQualifier | string;
    periodsAgo: number;
}

export interface IMeasureAux<T extends VisualizationInput.IMeasureDefinitionType> {
    measure: {
        definition: T;
        localIdentifier: VisualizationInput.IMeasure["measure"]["localIdentifier"];
        alias: VisualizationInput.IMeasure["measure"]["alias"];
        format: VisualizationInput.IMeasure["measure"]["format"];
        title: VisualizationInput.IMeasure["measure"]["title"];
    };
}

export class MeasureBuilderBase<T extends VisualizationInput.IMeasureDefinitionType>
    implements IMeasureAux<T> {
    private static lastMeasureId = 0;
    public measure: IMeasureAux<T>["measure"];
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

export class MeasureBuilder extends MeasureBuilderBase<VisualizationInput.IMeasureDefinition> {
    constructor(identifier: string) {
        super();
        this.measure.definition = {
            measureDefinition: {
                item: getQualifierObject(identifier),
            },
        };
    }

    public aggregation = (aggregation: VisualizationInput.MeasureAggregation) => {
        this.measure.definition.measureDefinition.aggregation = aggregation;
        return this;
    };

    public ratio = () => {
        this.measure.definition.measureDefinition.computeRatio = true;
        return this;
    };

    public filters = (...filters: VisualizationInput.IFilter[]) => {
        this.measure.definition.measureDefinition.filters = filters;
        return this;
    };
}

export class ArithmeticMeasureBuilder extends MeasureBuilderBase<
    VisualizationInput.IArithmeticMeasureDefinition
> {
    constructor(measureIdentifiers: string[], operator: VisualizationInput.ArithmeticMeasureOperator) {
        super();
        this.measure.definition = {
            arithmeticMeasure: {
                measureIdentifiers,
                operator,
            },
        };
    }
}

export class PoPMeasureBuilder extends MeasureBuilderBase<VisualizationInput.IPoPMeasureDefinition> {
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

export class PreviousPeriodMeasureBuilder extends MeasureBuilderBase<
    VisualizationInput.IPreviousPeriodMeasureDefinition
> {
    constructor(measureIdentifier: string, dateDataSets: IPreviousPeriodDateDataSetSimple[]) {
        super();
        this.measure.definition = {
            previousPeriodMeasure: {
                measureIdentifier,
                dateDataSets: dateDataSets.map(
                    (d): VisualizationInput.IPreviousPeriodDateDataSet => ({
                        ...d,
                        dataSet: typeof d.dataSet === "string" ? getQualifierObject(d.dataSet) : d.dataSet,
                    }),
                ),
            },
        };
    }
}

export const measure = (identifier: string) => new MeasureBuilder(identifier);

export const arithmeticMeasure = (
    measureIdentifiers: string[],
    operator: VisualizationInput.ArithmeticMeasureOperator,
) => new ArithmeticMeasureBuilder(measureIdentifiers, operator);

export const popMeasure = (measureIdentifier: string, popAttribute: string) =>
    new PoPMeasureBuilder(measureIdentifier, popAttribute);

export const previousPeriodMeasure = (
    measureIdentifier: string,
    dateDataSets: IPreviousPeriodDateDataSetSimple[] = [],
) => new PreviousPeriodMeasureBuilder(measureIdentifier, dateDataSets);
