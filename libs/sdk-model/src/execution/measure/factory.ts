// (C) 2019-2020 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import isEmpty = require("lodash/isEmpty");
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
    isArithmeticMeasure,
    isMeasure,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    isSimpleMeasure,
    MeasureAggregation,
    measureLocalId,
} from "./index";
import { Identifier, isObjRef, ObjRef, objRefToString } from "../base";
import { IMeasureFilter } from "../filter";
import { idRef } from "../base/factory";
import SparkMD5 from "spark-md5";

/**
 * Simplified Previous Period Data DataSet specification
 * @public
 */
export interface IPreviousPeriodDateDataSetSimple {
    dataSet: string;
    periodsAgo: number;
}

type MeasureEnvelope = Omit<IMeasure["measure"], "definition">;

/**
 * Abstract base class for measure builders. Measure builders allow for incremental, fluent construction
 * (and optionally modification) of measures.
 *
 * You should not be instantiating the builders directly. Instead, rely on the different functions to
 * create different types of measures.
 *
 * @public
 */
export abstract class MeasureBuilderBase<T extends IMeasureDefinitionType> {
    protected customLocalId: boolean = false;
    private measure: MeasureEnvelope;

    /**
     * @internal
     */
    protected constructor() {
        this.measure = {} as any;
    }

    public localId = (localId: Identifier) => {
        this.measure.localIdentifier = localId;
        this.customLocalId = true;

        return this;
    };

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
        const envelope = this.buildEnvelope();

        return {
            measure: {
                ...envelope,
                definition: this.buildDefinition(),
            },
        };
    };

    protected initializeFromExisting(measure: MeasureEnvelope): void {
        this.measure = cloneDeep(measure);
        this.customLocalId = false;
    }

    /**
     * Generation of local identifier is a responsibility shared with the the subclass - so that the concrete
     * builders can use their concrete definition to provide additional parts of the local id.
     *
     * @returns local identifier
     */
    protected abstract generateLocalId(): string;

    /**
     * Build of measure definition is responsibility of the subclass.
     *
     * @returns new instance
     */
    protected abstract buildDefinition(): T;

    /**
     * If custom localId has been set using localId() function, then use it unless it is empty.
     *
     * In all other cases generate localId. The localId generation consists up from three parts:
     *
     * - local identifier always starts with letter 'm'
     * - IF alias, title or format is specified, it is hashed and first 8 chars of the hash will follow
     * - The measure type specific part of the local identifier follows
     *
     * These three parts are separated using underscore.
     */
    private getOrGenerateLocalId(): string {
        if (this.customLocalId && !isEmpty(this.measure.localIdentifier)) {
            return this.measure.localIdentifier!;
        }

        return ["m", this.buildEnvelopeLocalIdPart(), this.generateLocalId()]
            .filter(part => !isEmpty(part))
            .join("_");
    }

    private buildEnvelopeLocalIdPart(): string {
        const { alias, format, title } = this.measure;

        if (!alias && !format && !title) {
            return "";
        }

        const hasher = new SparkMD5();
        hasher.append("alias_" + (alias ?? ""));
        hasher.append("format_" + (format ?? ""));
        hasher.append("title_" + (title ?? ""));

        return hasher.end().substr(0, 8);
    }

    private buildEnvelope(): MeasureEnvelope {
        return {
            ...this.measure,
            localIdentifier: this.getOrGenerateLocalId(),
        };
    }
}

/**
 * Builder for simple measures.
 *
 * Do not instantiate this builder directly, instead use {@link newMeasure} or {@link modifyMeasure} functions.
 *
 * @public
 */
export class MeasureBuilder extends MeasureBuilderBase<IMeasureDefinition> {
    private readonly measureDefinition: IMeasureDefinition["measureDefinition"];

    /**
     * @internal
     */
    constructor(measureOrRef: IMeasure<IMeasureDefinition> | ObjRef) {
        super();

        if (isMeasure(measureOrRef)) {
            this.initializeFromExisting(measureOrRef.measure);
            this.measureDefinition = cloneDeep(measureOrRef.measure.definition.measureDefinition);
        } else {
            this.measureDefinition = {
                item: measureOrRef,
            };
        }
    }

    public aggregation = (aggregation: MeasureAggregation) => {
        this.measureDefinition.aggregation = aggregation;

        return this;
    };

    public noAggregation = () => {
        delete this.measureDefinition.aggregation;

        return this;
    };

    public ratio = () => {
        this.measureDefinition.computeRatio = true;

        return this;
    };

    public noRatio = () => {
        delete this.measureDefinition.computeRatio;

        return this;
    };

    public filters = (...filters: IMeasureFilter[]) => {
        this.measureDefinition.filters = filters;

        return this;
    };

    protected generateLocalId(): string {
        const aggString = this.measureDefinition.aggregation ? `_${this.measureDefinition.aggregation}` : "";
        const ratioString = this.measureDefinition.computeRatio ? `_ratio` : "";

        return `${objRefToString(
            this.measureDefinition.item,
        )}${aggString}${ratioString}${this.filterLocalIdString()}`;
    }

    protected buildDefinition(): IMeasureDefinition {
        return {
            measureDefinition: this.measureDefinition,
        };
    }

    private filterLocalIdString(): string {
        if (isEmpty(this.measureDefinition.filters)) {
            return "";
        }

        const hasher = new SparkMD5();
        hasher.append(JSON.stringify(this.measureDefinition.filters));

        return "_" + hasher.end().substr(0, 8);
    }
}

type ArithmeticMeasureBuilderInput =
    | {
          measuresOrIds: ReadonlyArray<IMeasure | Identifier>;
          operator: ArithmeticMeasureOperator;
      }
    | IMeasure<IArithmeticMeasureDefinition>;

/**
 * Builder for arithmetic measures.
 *
 * Do not instantiate this builder directly, instead use {@link newArithmeticMeasure}.
 *
 * @public
 */
export class ArithmeticMeasureBuilder extends MeasureBuilderBase<IArithmeticMeasureDefinition> {
    private arithmeticMeasure: IArithmeticMeasureDefinition["arithmeticMeasure"];

    /**
     * @internal
     */
    constructor(input: ArithmeticMeasureBuilderInput) {
        super();

        if (isArithmeticMeasure(input)) {
            this.initializeFromExisting(input.measure);
            this.arithmeticMeasure = cloneDeep(input.measure.definition.arithmeticMeasure);
        } else {
            const measureIdentifiers: Identifier[] = input.measuresOrIds.map(m =>
                isMeasure(m) ? measureLocalId(m) : m,
            );

            this.arithmeticMeasure = {
                measureIdentifiers,
                operator: input.operator,
            };
        }
    }

    protected buildDefinition(): IArithmeticMeasureDefinition {
        return {
            arithmeticMeasure: this.arithmeticMeasure,
        };
    }

    protected generateLocalId(): string {
        const hasher = new SparkMD5();
        this.arithmeticMeasure.measureIdentifiers.forEach(id => hasher.append(id));

        return hasher.end();
    }
}

type PoPMeasureBuilderInput =
    | { measureOrLocalId: IMeasure | Identifier; popAttrIdOrRef: ObjRef | Identifier }
    | IMeasure<IPoPMeasureDefinition>;

/**
 * Builder for period-over-period measures.
 *
 * Do not instantiate this builder directly, instead use {@link newPopMeasure}.
 *
 * @public
 */
export class PoPMeasureBuilder extends MeasureBuilderBase<IPoPMeasureDefinition> {
    private popMeasureDefinition: IPoPMeasureDefinition["popMeasureDefinition"];

    /**
     * @internal
     */
    constructor(input: PoPMeasureBuilderInput) {
        super();

        if (isPoPMeasure(input)) {
            this.initializeFromExisting(input.measure);
            this.popMeasureDefinition = cloneDeep(input.measure.definition.popMeasureDefinition);
        } else {
            const measureIdentifier = isMeasure(input.measureOrLocalId)
                ? measureLocalId(input.measureOrLocalId)
                : input.measureOrLocalId;
            const popAttribute = isObjRef(input.popAttrIdOrRef)
                ? input.popAttrIdOrRef
                : idRef(input.popAttrIdOrRef, "attribute");

            this.popMeasureDefinition = {
                measureIdentifier,
                popAttribute,
            };
        }
    }

    protected buildDefinition(): IPoPMeasureDefinition {
        return {
            popMeasureDefinition: this.popMeasureDefinition,
        };
    }

    protected generateLocalId(): string {
        return `${this.popMeasureDefinition.measureIdentifier}_${objRefToString(
            this.popMeasureDefinition.popAttribute,
        )}`;
    }
}

type PreviousPeriodMeasureBuilderInput =
    | {
          measureIdOrLocalId: IMeasure | string;
          dateDataSets: IPreviousPeriodDateDataSetSimple[];
      }
    | IMeasure<IPreviousPeriodMeasureDefinition>;

/**
 * Builder for previous period measures.
 *
 * Do not instantiate this builder directly, instead use {@link newPreviousPeriodMeasure}.
 *
 * @public
 */
export class PreviousPeriodMeasureBuilder extends MeasureBuilderBase<IPreviousPeriodMeasureDefinition> {
    private previousPeriodMeasure: IPreviousPeriodMeasureDefinition["previousPeriodMeasure"];

    /**
     * @internal
     */
    constructor(input: PreviousPeriodMeasureBuilderInput) {
        super();

        if (isPreviousPeriodMeasure(input)) {
            this.initializeFromExisting(input.measure);
            this.previousPeriodMeasure = cloneDeep(input.measure.definition.previousPeriodMeasure);
        } else {
            this.previousPeriodMeasure = {
                measureIdentifier: isMeasure(input.measureIdOrLocalId)
                    ? measureLocalId(input.measureIdOrLocalId)
                    : input.measureIdOrLocalId,
                dateDataSets: input.dateDataSets.map(
                    (d): IPreviousPeriodDateDataSet => ({
                        ...d,
                        dataSet: typeof d.dataSet === "string" ? { identifier: d.dataSet } : d.dataSet,
                    }),
                ),
            };
        }
    }

    protected buildDefinition(): IPreviousPeriodMeasureDefinition {
        return {
            previousPeriodMeasure: this.previousPeriodMeasure,
        };
    }

    protected generateLocalId(): string {
        return `${this.previousPeriodMeasure.measureIdentifier}_previous_period`;
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
 * @param measure - ref of identifier of the measure
 * @param modifications - optional modifications (e.g. alias, title, etc.)
 * @public
 */
export function newMeasure(
    measure: ObjRef | Identifier,
    modifications: MeasureModifications<MeasureBuilder> = identity,
): IMeasure<IMeasureDefinition> {
    const ref = isObjRef(measure) ? measure : idRef(measure);
    const builder = new MeasureBuilder(ref);

    return modifications(builder).build();
}

/**
 * Creates a new measure by applying modifications on top of an existing measure. This generic function can
 * accept measure of any type and thus in returns allows modifications on the properties that are common
 * in any type of measure.
 *
 * This operation is immutable and will not alter the input measure.
 *
 * @param measure - measure to use as template for the new measure
 * @param modifications - modifications to apply
 * @returns new instance
 * @public
 */
export function modifyMeasure<T extends IMeasureDefinitionType>(
    measure: IMeasure<T>,
    modifications: MeasureModifications<MeasureBuilderBase<IMeasureDefinitionType>> = identity,
): IMeasure<T> {
    const builder = createBuilder(measure);

    return modifications(builder).build() as IMeasure<T>;
}

function createBuilder(measure: IMeasure): MeasureBuilderBase<IMeasureDefinitionType> {
    if (isSimpleMeasure(measure)) {
        return new MeasureBuilder(measure);
    } else if (isArithmeticMeasure(measure)) {
        return new ArithmeticMeasureBuilder(measure);
    } else if (isPoPMeasure(measure)) {
        return new PoPMeasureBuilder(measure);
    } else if (isPreviousPeriodMeasure(measure)) {
        return new PreviousPeriodMeasureBuilder(measure);
    }

    throw new Error();
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
export function modifySimpleMeasure(
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
    measuresOrIds: ReadonlyArray<IMeasure | Identifier>,
    operator: ArithmeticMeasureOperator,
    modifications: MeasureModifications<ArithmeticMeasureBuilder> = identity,
): IMeasure<IArithmeticMeasureDefinition> {
    const builder = new ArithmeticMeasureBuilder({ measuresOrIds, operator });

    return modifications(builder).build();
}

/**
 * Creates a new PoP measure with the specified identifier and PoP attribute identifier and optional modifications and localIdentifier.
 * @param measureOrLocalId - measure or local identifier of the measure
 * @param popAttrIdOrRef - identifier or a reference to PoP attribute
 * @param modifications - optional modifications (e.g. alias, title, etc.)
 * @public
 */
export function newPopMeasure(
    measureOrLocalId: IMeasure | Identifier,
    popAttrIdOrRef: ObjRef | Identifier,
    modifications: MeasureModifications<PoPMeasureBuilder> = identity,
): IMeasure<IPoPMeasureDefinition> {
    const builder = new PoPMeasureBuilder({ measureOrLocalId, popAttrIdOrRef });

    return modifications(builder).build();
}

/**
 * Creates a new Previous Period measure with the specified measure identifier and date data sets and optional modifications and localIdentifier.
 * @param measureIdOrLocalId - measure or local identifier of the measure to create Previous Period measure for
 * @param dateDataSets - date data sets to use in the Previous Period calculation
 * @param modifications - optional modifications (e.g. alias, title, etc.)
 * @public
 */
export function newPreviousPeriodMeasure(
    measureIdOrLocalId: IMeasure | Identifier,
    dateDataSets: IPreviousPeriodDateDataSetSimple[],
    modifications: MeasureModifications<PreviousPeriodMeasureBuilder> = identity,
): IMeasure<IPreviousPeriodMeasureDefinition> {
    const builder = new PreviousPeriodMeasureBuilder({ measureIdOrLocalId, dateDataSets });

    return modifications(builder).build();
}
