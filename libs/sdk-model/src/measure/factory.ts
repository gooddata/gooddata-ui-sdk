// (C) 2019 GoodData Corporation
import identity = require("lodash/identity");
import {
    ArithmeticMeasureOperator,
    IArithmeticMeasureDefinition,
    IMeasure,
    IMeasureDefinition,
    IMeasureDefinitionType,
    IPoPMeasureDefinition,
    IPreviousPeriodDateDataSet,
    IPreviousPeriodMeasureDefinition,
    MeasureAggregation,
} from ".";
import { IFilter } from "../filter";

/**
 * Simplified Previous Period Data DataSet specification
 * @public
 */
export interface IPreviousPeriodDateDataSetSimple {
    dataSet: string;
    periodsAgo: number;
}

class MeasureBuilderBase<T extends IMeasureDefinitionType> implements IMeasure<T> {
    public measure: IMeasure<T>["measure"];
    constructor() {
        this.measure = {} as any; // definition is added in subclass
    }

    public alias = (alias: string) => {
        this.measure.alias = alias;
        return this;
    };

    public format = (format: string) => {
        this.measure.format = format;
        return this;
    };

    public localId = (localId: string) => {
        this.measure.localIdentifier = localId;
        return this;
    };

    public title = (title: string) => {
        this.measure.title = title;
        return this;
    };

    public build = (): IMeasure<T> => {
        return { measure: this.measure };
    };
}

class MeasureBuilder extends MeasureBuilderBase<IMeasureDefinition> {
    constructor(measureId: string) {
        super();
        this.measure.definition = {
            measureDefinition: {
                item: { identifier: measureId },
            },
        };
        this.measure.localIdentifier = `m_${measureId}`;
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

class ArithmeticMeasureBuilder extends MeasureBuilderBase<IArithmeticMeasureDefinition> {
    constructor(measureIds: string[], operator: ArithmeticMeasureOperator) {
        super();
        this.measure.definition = {
            arithmeticMeasure: {
                measureIdentifiers: measureIds,
                operator,
            },
        };
        this.measure.localIdentifier = `m_${measureIds.join("_")}`;
    }
}

class PoPMeasureBuilder extends MeasureBuilderBase<IPoPMeasureDefinition> {
    constructor(measureId: string, popAttributeId: string) {
        super();
        this.measure.definition = {
            popMeasureDefinition: {
                measureIdentifier: measureId,
                popAttribute: {
                    identifier: popAttributeId,
                },
            },
        };
        this.measure.localIdentifier = `m_${measureId}_${popAttributeId}`;
    }
}

class PreviousPeriodMeasureBuilder extends MeasureBuilderBase<IPreviousPeriodMeasureDefinition> {
    constructor(measureId: string, dateDataSets: IPreviousPeriodDateDataSetSimple[]) {
        super();
        this.measure.definition = {
            previousPeriodMeasure: {
                measureIdentifier: measureId,
                dateDataSets: dateDataSets.map(
                    (d): IPreviousPeriodDateDataSet => ({
                        ...d,
                        dataSet: typeof d.dataSet === "string" ? { identifier: d.dataSet } : d.dataSet,
                    }),
                ),
            },
        };
        this.measure.localIdentifier = `m_${measureId}_previous_period`;
    }
}

type MeasureModifications<TBuilder> = (builder: TBuilder) => TBuilder;

/**
 * Creates a new measure with the specified identifier and optional modifications and localIdentifier.
 * @param measureId - identifier of the measure
 * @param modifications - optional modifications (e.g. alias, title, etc.)
 * @public
 */
export function newMeasure(
    measureId: string,
    modifications: MeasureModifications<MeasureBuilder> = identity,
): IMeasure<IMeasureDefinition> {
    const builder = new MeasureBuilder(measureId);
    return modifications(builder).build();
}

/**
 * Creates a new arithmetic measure with the specified measure identifiers and operator and optional modifications and localIdentifier.
 * @param measureIds - identifiers of the measures to be included in this arithmetic measure
 * @param operator - operator of the measure
 * @param modifications - optional modifications (e.g. alias, title, etc.)
 * @public
 */
export function newArithmeticMeasure(
    measureIds: string[],
    operator: ArithmeticMeasureOperator,
    modifications: MeasureModifications<ArithmeticMeasureBuilder> = identity,
): IMeasure<IArithmeticMeasureDefinition> {
    const builder = new ArithmeticMeasureBuilder(measureIds, operator);
    return modifications(builder).build();
}

/**
 * Creates a new PoP measure with the specified identifier and PoP attribute identifier and optional modifications and localIdentifier.
 * @param measureId - identifier of the measure
 * @param popAttributeId - identifier of the PoP attribute
 * @param modifications - optional modifications (e.g. alias, title, etc.)
 * @public
 */
export function newPopMeasure(
    measureId: string,
    popAttributeId: string,
    modifications: MeasureModifications<PoPMeasureBuilder> = identity,
): IMeasure<IPoPMeasureDefinition> {
    const builder = new PoPMeasureBuilder(measureId, popAttributeId);
    return modifications(builder).build();
}

/**
 * Creates a new Previous Period measure with the specified measure identifier and date data sets and optional modifications and localIdentifier.
 * @param measureId - identifier of the measure to create Previous Period measure for
 * @param dateDataSets - date data sets to use in the Previous Period calculation
 * @param modifications - optional modifications (e.g. alias, title, etc.)
 * @public
 */
export function newPreviousPeriodMeasure(
    measureId: string,
    dateDataSets: IPreviousPeriodDateDataSetSimple[],
    modifications: MeasureModifications<PreviousPeriodMeasureBuilder> = identity,
): IMeasure<IPreviousPeriodMeasureDefinition> {
    const builder = new PreviousPeriodMeasureBuilder(measureId, dateDataSets);
    return modifications(builder).build();
}
