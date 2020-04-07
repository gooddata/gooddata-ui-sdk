// (C) 2019-2020 GoodData Corporation
import stringify from "json-stable-stringify";
import compact = require("lodash/compact");
import merge = require("lodash/merge");
import SparkMD5 from "spark-md5";
import invariant from "ts-invariant";

import { IAttribute, attributeLocalId } from "../attribute";
import {
    SortItem,
    isMeasureSort,
    IMeasureSortItem,
    LocatorItem,
    isMeasureLocator,
    IAttributeSortItem,
} from "../base/sort";
import { IExecutionDefinition } from ".";
import {
    IMeasure,
    isSimpleMeasure,
    IMeasureDefinition,
    measureLocalId,
    isArithmeticMeasure,
    IArithmeticMeasureDefinition,
    measureArithmeticOperands,
    measureArithmeticOperator,
    isPoPMeasure,
    IPoPMeasureDefinition,
    isPreviousPeriodMeasure,
    IPreviousPeriodMeasureDefinition,
} from "../measure";
import {
    IFilter,
    isMeasureValueFilter,
    measureValueFilterMeasure,
    IMeasureValueFilter,
    measureValueFilterCondition,
    isNegativeAttributeFilter,
    attributeElementsIsEmpty,
} from "../filter";
import { isLocalIdRef } from "../../objRef";
import { localIdRef } from "../../objRef/factory";
import { IDimension, MeasureGroupIdentifier } from "../base/dimension";
import { ITotal } from "../base/totals";

/**
 * Calculates fingerprint for the execution definition. Fingerprinting is used as an _approximate_,
 * quick, first-level assessment whether two execution definitions are or are not effectively same = they
 * lead to the same computation on the backend.
 *
 * The contract and the approximate nature of the fingerprint can be described as follows:
 *
 * -  If two execution definitions have the same fingerprint, then they definitely are effectively the same
 *    and backend will perform the same computation for them.
 *
 * -  If two execution definition have different fingerprint, they MAY OR MAY NOT lead to different execution. Or
 *    more concrete: two executions with two different fingerprints MAY lead to the same execution and same results.
 *
 * While not optimal, this contract allows for safe usage of fingerprints to determine whether two
 * execution definitions have changed. For instance it can be used in React lifecycle methods (shouldComponentUpdate)
 * or for client-side caching.
 *
 * @param def - execution definition
 * @public
 */
export function defFingerprint(def: IExecutionDefinition): string {
    invariant(def, "execution definition to calculate fingerprint for must be defined");

    const fingerprint = Fingerprint.forDef(def);
    return SparkMD5.hash(fingerprint);
}

type MeasureDefinitionPropsToDefault = Pick<
    IMeasureDefinition["measureDefinition"],
    "filters" | "computeRatio"
>;

/**
 * Utility class for execution definition fingerprint computation.
 * Disregards aspects of the data, that bear no effect on the resulting execution such as:
 * - localIds
 * - order of definition of filters
 *
 * This makes sure that semantically equivalent execution definitions have the same fingerprint most of the time.
 *
 * @internal
 */
export class Fingerprint {
    /**
     * Computes the fingerprint of the given definition.
     * @param def - the execution definition to compute the fingerprint of
     */
    public static forDef(def: IExecutionDefinition): string {
        return new Fingerprint(def).compute();
    }

    // contains calculated fingerprints of measures and attributes
    private cache = new Map<string, string>();

    // contains localIds of measures and attributes for which fingerprint has already been requested
    // this is for cycle detection purposes
    private itemsRequested = new Set<string>();

    private constructor(private execDef: IExecutionDefinition) {}

    public compute = (): string => {
        // for those items their order is irrelevant, so we can sort them and therefore match executions with identical items sans ordering
        const orderIndependentFingerprints = [...this.execDef.filters.map(this.getFilterFingerprint)];

        orderIndependentFingerprints.sort();

        const toSerialize = compact([
            this.execDef.workspace,
            ...orderIndependentFingerprints,
            ...this.execDef.attributes.map(this.getAttributeFingerprint),
            ...this.execDef.measures.map(this.getMeasureFingerprint),
            ...this.execDef.sortBy.map(this.getSortItemFingerprint),
            ...this.execDef.dimensions.map(this.getDimensionFingerprint),
        ]).join("_");

        return this.serialize(toSerialize);
    };

    private serialize = (value: any): string => stringify(value);

    private terminateWithError = (message: string): never => {
        throw new Error(`Inconsistent execution definition: ${message}`);
    };

    private getMeasureByLocalId = (localId: string) => {
        const match = this.execDef.measures.find(measure => measureLocalId(measure) === localId);
        return (
            match ??
            this.terminateWithError(`Measure with localId '${localId}' not found in the execution definition`)
        );
    };

    private getAttributeByLocalId = (localId: string) => {
        const match = this.execDef.attributes.find(attribute => attributeLocalId(attribute) === localId);
        return (
            match ??
            this.terminateWithError(
                `Attribute with localId '${localId}' not found in the execution definition`,
            )
        );
    };

    private geSimpleMeasureFingerprint = (measure: IMeasure<IMeasureDefinition>): string => {
        const localId = measureLocalId(measure);
        const measureDefinitionDefaults: MeasureDefinitionPropsToDefault = {
            filters: [],
            computeRatio: false,
        };

        const measureDefinitionWithDefaults: IMeasureDefinition["measureDefinition"] = merge(
            measureDefinitionDefaults,
            measure.measure.definition.measureDefinition,
        );

        const toSerialize: IMeasure<IMeasureDefinition> = {
            measure: {
                ...measure.measure,
                localIdentifier: "",
                definition: {
                    measureDefinition: measureDefinitionWithDefaults,
                },
            },
        };

        return this.hashAndStoreFingerprint(toSerialize, localId);
    };

    private getArithmeticMeasureFingerprint = (measure: IMeasure<IArithmeticMeasureDefinition>): string => {
        const localId = measureLocalId(measure);
        const toSerialize: IMeasure<IArithmeticMeasureDefinition> = {
            measure: {
                ...measure.measure,
                localIdentifier: "",
                definition: {
                    arithmeticMeasure: {
                        measureIdentifiers:
                            measureArithmeticOperands(measure)?.map(operand =>
                                this.getMeasureFingerprint(this.getMeasureByLocalId(operand)),
                            ) ?? [],
                        operator: measureArithmeticOperator(measure)!,
                    },
                },
            },
        };

        return this.hashAndStoreFingerprint(toSerialize, localId);
    };

    private getPoPMeasureFingerprint = (measure: IMeasure<IPoPMeasureDefinition>): string => {
        const localId = measureLocalId(measure);
        const toSerialize: IMeasure<IPoPMeasureDefinition> = {
            measure: {
                ...measure.measure,
                localIdentifier: "",
                definition: {
                    popMeasureDefinition: {
                        ...measure.measure.definition.popMeasureDefinition,
                        measureIdentifier: this.getMeasureFingerprintById(
                            measure.measure.definition.popMeasureDefinition.measureIdentifier,
                        ),
                    },
                },
            },
        };

        return this.hashAndStoreFingerprint(toSerialize, localId);
    };

    private getPreviousPeriodMeasureFingerprint = (
        measure: IMeasure<IPreviousPeriodMeasureDefinition>,
    ): string => {
        const localId = measureLocalId(measure);
        const toSerialize: IMeasure<IPreviousPeriodMeasureDefinition> = {
            measure: {
                ...measure.measure,
                localIdentifier: "",
                definition: {
                    previousPeriodMeasure: {
                        ...measure.measure.definition.previousPeriodMeasure,
                        measureIdentifier: this.getMeasureFingerprintById(
                            measure.measure.definition.previousPeriodMeasure.measureIdentifier,
                        ),
                    },
                },
            },
        };

        return this.hashAndStoreFingerprint(toSerialize, localId);
    };

    private getMeasureFingerprint = (measure: IMeasure): string => {
        const localId = measureLocalId(measure);
        const cacheHit = this.cache.get(localId);
        if (cacheHit) {
            return cacheHit;
        }

        this.preventCycles(localId);

        if (isSimpleMeasure(measure)) {
            return this.geSimpleMeasureFingerprint(measure);
        }

        if (isArithmeticMeasure(measure)) {
            return this.getArithmeticMeasureFingerprint(measure);
        }

        if (isPoPMeasure(measure)) {
            return this.getPoPMeasureFingerprint(measure);
        }

        if (isPreviousPeriodMeasure(measure)) {
            return this.getPreviousPeriodMeasureFingerprint(measure);
        }

        return this.terminateWithError("Unknown measure type");
    };

    private getMeasureFingerprintById = (localId: string): string =>
        this.getMeasureFingerprint(this.getMeasureByLocalId(localId));

    private getAttributeFingerprint = (attribute: IAttribute): string => {
        const localId = attributeLocalId(attribute);
        const cacheHit = this.cache.get(localId);
        if (cacheHit) {
            return cacheHit;
        }

        this.preventCycles(localId);

        const toSerialize: IAttribute = {
            attribute: {
                ...attribute.attribute,
                localIdentifier: "",
            },
        };

        return this.hashAndStoreFingerprint(toSerialize, localId);
    };

    private getAttributeFingerprintById = (localId: string): string =>
        this.getAttributeFingerprint(this.getAttributeByLocalId(localId));

    private getFilterFingerprint = (filter: IFilter): string => {
        if (isMeasureValueFilter(filter)) {
            // measure value filter without condition is as good as nothing
            if (!measureValueFilterCondition(filter)) {
                return "";
            }

            const measureRef = measureValueFilterMeasure(filter);
            if (isLocalIdRef(measureRef)) {
                const toSerialize: IMeasureValueFilter = {
                    measureValueFilter: {
                        ...filter.measureValueFilter,
                        measure: localIdRef(this.getMeasureFingerprintById(measureRef.localIdentifier)),
                    },
                };
                return this.serialize(toSerialize);
            }
        } else if (isNegativeAttributeFilter(filter)) {
            // empty negative attribute filter is as good as nothing
            if (attributeElementsIsEmpty(filter.negativeAttributeFilter.notIn)) {
                return "";
            }
        }

        return this.serialize(filter);
    };

    private getMeasureSortItemFingerprint = (sortItem: IMeasureSortItem): string => {
        const toSerialize: IMeasureSortItem = {
            measureSortItem: {
                ...sortItem.measureSortItem,
                locators: sortItem.measureSortItem.locators.map(
                    (locator): LocatorItem =>
                        isMeasureLocator(locator)
                            ? {
                                  measureLocatorItem: {
                                      measureIdentifier: this.getMeasureFingerprintById(
                                          locator.measureLocatorItem.measureIdentifier,
                                      ),
                                  },
                              }
                            : {
                                  attributeLocatorItem: {
                                      ...locator.attributeLocatorItem,
                                      attributeIdentifier: this.getAttributeFingerprintById(
                                          locator.attributeLocatorItem.attributeIdentifier,
                                      ),
                                  },
                              },
                ),
            },
        };
        return this.serialize(toSerialize);
    };

    private getAttributeSortItemFingerprint = (sortItem: IAttributeSortItem): string => {
        const toSerialize: IAttributeSortItem = {
            attributeSortItem: {
                ...sortItem.attributeSortItem,
                attributeIdentifier: this.getAttributeFingerprintById(
                    sortItem.attributeSortItem.attributeIdentifier,
                ),
            },
        };
        return this.serialize(toSerialize);
    };

    private getSortItemFingerprint = (sortItem: SortItem): string => {
        if (isMeasureSort(sortItem)) {
            return this.getMeasureSortItemFingerprint(sortItem);
        } else {
            return this.getAttributeSortItemFingerprint(sortItem);
        }
    };

    private getDimensionFingerprint = (dimension: IDimension): string => {
        const totals: ITotal[] | undefined = dimension.totals
            ? dimension.totals.map(total => ({
                  ...total,
                  attributeIdentifier: this.getAttributeFingerprintById(total.attributeIdentifier),
                  measureIdentifier: this.getMeasureFingerprintById(total.measureIdentifier),
              }))
            : undefined;

        const toSerialize: IDimension = {
            itemIdentifiers: dimension.itemIdentifiers.map(identifier => {
                if (identifier === MeasureGroupIdentifier) {
                    return identifier;
                }
                return this.getAttributeFingerprintById(identifier);
            }),
            ...(totals && { totals }),
        };

        return this.serialize(toSerialize);
    };

    // prevents infinite loops for cyclic definitions
    // the idea is that an item's fingerprint should be only requested once,
    // subsequent request should be covered by cache
    private preventCycles = (localId: string): void => {
        if (this.itemsRequested.has(localId)) {
            return this.terminateWithError("Cycle detected");
        }
        this.itemsRequested.add(localId);
    };

    private hashAndStoreFingerprint = (toSerialize: any, localId: string): string => {
        const fingerprint = this.serialize(toSerialize);
        this.cache.set(localId, fingerprint);
        return fingerprint;
    };
}
