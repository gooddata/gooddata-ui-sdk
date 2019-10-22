// (C) 2019 GoodData Corporation
import identity = require("lodash/identity");
import cloneDeep = require("lodash/cloneDeep");
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
    measureIdentifier,
    measureLocalId,
} from ".";
import { IFilter } from "../filter";
import { Identifier } from "../base";

/**
 * Simplified Previous Period Data DataSet specification
 * @public
 */
export interface IPreviousPeriodDateDataSetSimple {
    dataSet: string;
    periodsAgo: number;
}

/**
 * Abstract base class for measure builders. Measure builders allow for incremental, fluent construction
 * (and optionally modification) of measures.
 *
 * You should not be instantiating the builders directly. Instead, rely on the different functions to
 * create different types of measures.
 *
 * @public
 */
export abstract class MeasureBuilderBase<T extends IMeasureDefinitionType> implements IMeasure<T> {
    public measure: IMeasure<T>["measure"];
    protected customLocalId: boolean = false;

    /**
     * @internal
     */
    protected constructor() {
        // definition is added in subclass
        this.measure = {} as any;
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
        this.customLocalId = true;
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

/**
 * Builder for simple measures.
 *
 * Do not instantiate this builder directly, instead use {@link newMeasure} or {@link modifyMeasure} functions.
 *
 * @public
 */
export class MeasureBuilder extends MeasureBuilderBase<IMeasureDefinition> {
    private readonly measureId: Identifier;

    /**
     * @internal
     */
    constructor(measureOrId: IMeasure<IMeasureDefinition> | string) {
        super();

        if (typeof measureOrId === "string") {
            this.measure.definition = {
                measureDefinition: {
                    item: { identifier: measureOrId },
                },
            };
            this.measure.localIdentifier = `m_${measureOrId}`;
            this.measureId = measureOrId;
        } else {
            this.measure = cloneDeep(measureOrId.measure);
            this.customLocalId = true;
            this.measureId = measureIdentifier(measureOrId)!;
        }
    }

    public aggregation = (aggregation: MeasureAggregation) => {
        this.measure.definition.measureDefinition.aggregation = aggregation;
        if (!this.customLocalId) {
            this.measure.localIdentifier = `m_${this.measureId}_${aggregation}`;
        }
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

/**
 * Builder for arithmetic measures.
 *
 * Do not instantiate this builder directly, instead use {@link newArithmeticMeasure}.
 *
 * @public
 */
export class ArithmeticMeasureBuilder extends MeasureBuilderBase<IArithmeticMeasureDefinition> {
    /**
     * @internal
     */
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

/**
 * Builder for period-over-period measures.
 *
 * Do not instantiate this builder directly, instead use {@link newPopMeasure}.
 *
 * @public
 */
export class PoPMeasureBuilder extends MeasureBuilderBase<IPoPMeasureDefinition> {
    /**
     * @internal
     */
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

/**
 * Builder for previous period measures.
 *
 * Do not instantiate this builder directly, instead use {@link newPreviousPeriodMeasure}.
 *
 * @public
 */
export class PreviousPeriodMeasureBuilder extends MeasureBuilderBase<IPreviousPeriodMeasureDefinition> {
    /**
     * @internal
     */
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

/**
 * Function that will be called to perform modifications of measure before it is fully constructed.
 *
 * @public
 */
export type MeasureModifications<TBuilder> = (builder: TBuilder) => TBuilder;

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
 * Creates a new simple measure by applying modifications on top of an existing measure.
 *
 * This operation is immutable and will not alter the input measure.
 *
 * @param measure - measure to use as template for the new measure
 * @param modifications - modifications to apply
 * @returns new instance
 * @public
 */
export function modifyMeasure(
    measure: IMeasure<IMeasureDefinition>,
    modifications: MeasureModifications<MeasureBuilder> = identity,
): IMeasure<IMeasureDefinition> {
    const builder = new MeasureBuilder(measure);

    return modifications(builder).build();
}

/**
 * Creates a new arithmetic measure with the specified measure identifiers and operator and optional modifications and localIdentifier.
 * @param measuresOrIds - measures or identifiers of the measures to be included in this arithmetic measure
 * @param operator - operator of the measure
 * @param modifications - optional modifications (e.g. alias, title, etc.)
 * @public
 */
export function newArithmeticMeasure(
    measuresOrIds: ReadonlyArray<IMeasure | string>,
    operator: ArithmeticMeasureOperator,
    modifications: MeasureModifications<ArithmeticMeasureBuilder> = identity,
): IMeasure<IArithmeticMeasureDefinition> {
    const measureIds = measuresOrIds.map(m => (typeof m === "string" ? m : measureLocalId(m)));
    const builder = new ArithmeticMeasureBuilder(measureIds, operator);

    return modifications(builder).build();
}

/**
 * Creates a new PoP measure with the specified identifier and PoP attribute identifier and optional modifications and localIdentifier.
 * @param measureOrId - measure or identifier of the measure
 * @param popAttributeId - identifier of the PoP attribute
 * @param modifications - optional modifications (e.g. alias, title, etc.)
 * @public
 */
export function newPopMeasure(
    measureOrId: IMeasure | string,
    popAttributeId: string,
    modifications: MeasureModifications<PoPMeasureBuilder> = identity,
): IMeasure<IPoPMeasureDefinition> {
    const measureId = typeof measureOrId === "string" ? measureOrId : measureLocalId(measureOrId);
    const builder = new PoPMeasureBuilder(measureId, popAttributeId);

    return modifications(builder).build();
}

/**
 * Creates a new Previous Period measure with the specified measure identifier and date data sets and optional modifications and localIdentifier.
 * @param measureIdOrId - measure or identifier of the measure to create Previous Period measure for
 * @param dateDataSets - date data sets to use in the Previous Period calculation
 * @param modifications - optional modifications (e.g. alias, title, etc.)
 * @public
 */
export function newPreviousPeriodMeasure(
    measureIdOrId: IMeasure | string,
    dateDataSets: IPreviousPeriodDateDataSetSimple[],
    modifications: MeasureModifications<PreviousPeriodMeasureBuilder> = identity,
): IMeasure<IPreviousPeriodMeasureDefinition> {
    const measureId = typeof measureIdOrId === "string" ? measureIdOrId : measureLocalId(measureIdOrId);
    const builder = new PreviousPeriodMeasureBuilder(measureId, dateDataSets);

    return modifications(builder).build();
}
