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
    constructor(localIdentifier: string) {
        this.measure = {
            localIdentifier,
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

    public build = (): IMeasure<T> => {
        return { measure: this.measure };
    };
}

class MeasureBuilder extends MeasureBuilderBase<IMeasureDefinition> {
    constructor(identifier: string, localIdentifier: string) {
        super(localIdentifier);
        this.measure.definition = {
            measureDefinition: {
                item: { identifier },
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

class ArithmeticMeasureBuilder extends MeasureBuilderBase<IArithmeticMeasureDefinition> {
    constructor(measureIdentifiers: string[], localIdentifier: string, operator: ArithmeticMeasureOperator) {
        super(localIdentifier);
        this.measure.definition = {
            arithmeticMeasure: {
                measureIdentifiers,
                operator,
            },
        };
    }
}

class PoPMeasureBuilder extends MeasureBuilderBase<IPoPMeasureDefinition> {
    constructor(measureIdentifier: string, localIdentifier: string, popAttribute: string) {
        super(localIdentifier);
        this.measure.definition = {
            popMeasureDefinition: {
                measureIdentifier,
                popAttribute: {
                    identifier: popAttribute,
                },
            },
        };
    }
}

class PreviousPeriodMeasureBuilder extends MeasureBuilderBase<IPreviousPeriodMeasureDefinition> {
    constructor(
        measureIdentifier: string,
        localIdentifier: string,
        dateDataSets: IPreviousPeriodDateDataSetSimple[],
    ) {
        super(localIdentifier);
        this.measure.definition = {
            previousPeriodMeasure: {
                measureIdentifier,
                dateDataSets: dateDataSets.map(
                    (d): IPreviousPeriodDateDataSet => ({
                        ...d,
                        dataSet: typeof d.dataSet === "string" ? { identifier: d.dataSet } : d.dataSet,
                    }),
                ),
            },
        };
    }
}

type MeasureModifications<TBuilder> = (builder: TBuilder) => TBuilder;

/**
 * Creates a new measure with the specified identifier and optional modifications and localIdentifier.
 * @param identifier - identifier of the measure
 * @param modifications - optional modifications (e.g. alias, title, etc.)
 * @param localIdentifier - optional local identifier, defaults to 'm_$\{identifier\}'
 * @public
 */
export function newMeasure(
    identifier: string,
    modifications: MeasureModifications<MeasureBuilder> = identity,
    localIdentifier = `m_${identifier}`,
): IMeasure<IMeasureDefinition> {
    const builder = new MeasureBuilder(identifier, localIdentifier);
    return modifications(builder).build();
}

/**
 * Creates a new arithmetic measure with the specified measure identifiers and operator and optional modifications and localIdentifier.
 * @param measureIdentifiers - identifiers of the measures to be included in this arithmetic measure
 * @param operator - operator of the measure
 * @param modifications - optional modifications (e.g. alias, title, etc.)
 * @param localIdentifier - optional local identifier, defaults to 'm_$\{all_measure_identifiers\}'
 * @public
 */
export function newArithmeticMeasure(
    measureIdentifiers: string[],
    operator: ArithmeticMeasureOperator,
    modifications: MeasureModifications<ArithmeticMeasureBuilder> = identity,
    localIdentifier = `m_${measureIdentifiers.join("_")}`,
): IMeasure<IArithmeticMeasureDefinition> {
    const builder = new ArithmeticMeasureBuilder(measureIdentifiers, localIdentifier, operator);
    return modifications(builder).build();
}

/**
 * Creates a new PoP measure with the specified identifier and PoP attribute identifier and optional modifications and localIdentifier.
 * @param identifier - identifier of the measure
 * @param popAttributeIdentifier - identifier of the PoP attribute
 * @param modifications - optional modifications (e.g. alias, title, etc.)
 * @param localIdentifier - optional local identifier, defaults to 'm_$\{identifier\}_$\{popAttributeIdentifier\}'
 * @public
 */
export function newPopMeasure(
    identifier: string,
    popAttributeIdentifier: string,
    modifications: MeasureModifications<PoPMeasureBuilder> = identity,
    localIdentifier = `m_${identifier}_${popAttributeIdentifier}`,
): IMeasure<IPoPMeasureDefinition> {
    const builder = new PoPMeasureBuilder(identifier, localIdentifier, popAttributeIdentifier);
    return modifications(builder).build();
}

/**
 * Creates a new Previous Period measure with the specified measure identifier and date data sets and optional modifications and localIdentifier.
 * @param measureIdentifier - identifier of the measure to create Previous Period measure for
 * @param dateDataSets - date data sets to use in the Previous Period calculation
 * @param modifications - optional modifications (e.g. alias, title, etc.)
 * @param localIdentifier - optional local identifier, defaults to 'm_$\{measureIdentifier\}_previous_period'
 * @public
 */
export function newPreviousPeriodMeasure(
    measureIdentifier: string,
    dateDataSets: IPreviousPeriodDateDataSetSimple[],
    modifications: MeasureModifications<PreviousPeriodMeasureBuilder> = identity,
    localIdentifier = `m_${measureIdentifier}_previous_period`,
): IMeasure<IPreviousPeriodMeasureDefinition> {
    const builder = new PreviousPeriodMeasureBuilder(measureIdentifier, localIdentifier, dateDataSets);
    return modifications(builder).build();
}
