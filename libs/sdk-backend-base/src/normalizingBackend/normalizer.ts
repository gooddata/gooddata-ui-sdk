// (C) 2007-2020 GoodData Corporation
import {
    attributeAlias,
    attributeLocalId,
    filterIsEmpty,
    IArithmeticMeasureDefinition,
    IAttribute,
    Identifier,
    IExecutionDefinition,
    IMeasure,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    isArithmeticMeasureDefinition,
    isAttributeLocator,
    isAttributeSort,
    isLocalIdRef,
    isMeasureSort,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
    isPoPMeasureDefinition,
    isPreviousPeriodMeasureDefinition,
    measureAlias,
    measureFormat,
    MeasureGroupIdentifier,
    measureLocalId,
    measureTitle,
    measureValueFilterCondition,
    modifyAttribute,
    modifyMeasure,
    IMeasureDefinition,
} from "@gooddata/sdk-model";
import {
    IDimensionDescriptor,
    IResultHeader,
    IResultMeasureHeader,
    isAttributeDescriptor,
    isMeasureDescriptor,
    isResultMeasureHeader,
} from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";
import cloneDeep = require("lodash/cloneDeep");
import cloneDeepWith = require("lodash/cloneDeepWith");
import keyBy = require("lodash/keyBy");

type LocalIdMap = { [from: string]: string };

/**
 * @internal
 */
export type NormalizationState = {
    /**
     * Normalized execution definition
     */
    readonly normalized: IExecutionDefinition;

    /**
     * Original execution definition
     */
    readonly original: IExecutionDefinition;

    /**
     * Local ID mapping between normalized and original execution definitions.
     */
    readonly n2oMap: LocalIdMap;
};

/**
 * @internal
 */
export class Denormalizer {
    public static from(state: NormalizationState): Denormalizer {
        return new Denormalizer(state);
    }

    private readonly originalAttributes: { [localId: string]: IAttribute };
    private readonly originalMeasures: { [localId: string]: IMeasure };

    private constructor(public readonly state: NormalizationState) {
        this.originalAttributes = keyBy(state.original.attributes, attributeLocalId);
        this.originalMeasures = keyBy(state.original.measures, measureLocalId);
    }

    /**
     * Given the current normalization state, this method transforms the dimension descriptors of the
     * normalized execution, so that all the customization of the original execution definition is restored
     * into them:
     *
     * -  Reverse lookup of local identifiers happens
     * -  Attribute / Measure name is set according to the defined alias
     * -  Measure format is set according to the format in definition
     *
     * @param normalizedDims - normalized dimension descriptors
     * @returns new descriptors
     */
    public denormalizeDimDescriptors = (normalizedDims: IDimensionDescriptor[]): IDimensionDescriptor[] => {
        return cloneDeepWith(normalizedDims, value => {
            if (isAttributeDescriptor(value)) {
                const localIdentifier = this.originalLocalId(value.attributeHeader.localIdentifier);
                const attribute = this.originalAttributes[localIdentifier]!;
                const name = attributeAlias(attribute) || value.attributeHeader.name;

                return {
                    attributeHeader: {
                        ...value.attributeHeader,
                        name,
                        localIdentifier,
                    },
                };
            } else if (isMeasureDescriptor(value)) {
                const localIdentifier = this.originalLocalId(value.measureHeaderItem.localIdentifier);
                const measure = this.originalMeasures[localIdentifier]!;
                const format = measureFormat(measure) || value.measureHeaderItem.format;
                const name = measureAlias(measure) || measureTitle(measure) || value.measureHeaderItem.name;

                return {
                    measureHeaderItem: {
                        ...value.measureHeaderItem,
                        localIdentifier,
                        format,
                        name,
                    },
                };
            }

            return;
        });
    };

    /**
     * Derived measures or arithmetic measures have the 'name' in result header defaulted to measure
     * localId. This method deals with it. It creates a copy of headers with the measure headers denormalized,
     * values replaced with the contents of alias or title (whichever comes first).
     *
     * @param headerItems - headers to denormalize, copy will be done
     * @returns new headers
     */
    public denormalizeHeaders = (headerItems: IResultHeader[][][]): IResultHeader[][][] => {
        return cloneDeepWith(headerItems, value => {
            if (isResultMeasureHeader(value)) {
                const newHeader: IResultMeasureHeader = {
                    measureHeaderItem: {
                        name: this.fillOriginalMeasureTitle(value.measureHeaderItem.name),
                        order: value.measureHeaderItem.order,
                    },
                };

                return newHeader;
            }

            return;
        });
    };

    private originalLocalId = (normalized: string): string => {
        const value = this.state.n2oMap[normalized];

        invariant(value, `mapping from normalized to real localId does not exist. Normalized: ${normalized}`);

        return value!;
    };

    private fillOriginalMeasureTitle = (name: string): string => {
        const originalLocalId = this.state.n2oMap[name];

        if (!originalLocalId) {
            return name;
        }

        const measure = this.originalMeasures[originalLocalId];

        if (!measure) {
            return name;
        }

        return measureAlias(measure) || measureTitle(measure) || name;
    };
}

/**
 * The normalization of execution definition means stripping away all the detail that is unnecessary for the
 * backend:
 *
 * -  attribute / measure alias
 * -  measure title
 * -  measure format
 * -  custom-crafted local IDs
 *
 * The code does the job by _mutating_ a clone of the original definition. The mutation approach, while not
 * backed by functionality in sdk-model and therefore somewhat hacky, is a simpler one for this task.
 *
 * The main reason behind that is the occurrence of attribute and measure objects in multiple parts of the
 * execution definition: same attributes and measures are referenced from both buckets and the attributes and measures
 * props of the execution definition. Mutating values means that after normalizing values the execution definition
 * is fully normalized.
 *
 * @internal
 */
export class Normalizer {
    public static normalize(def: IExecutionDefinition): NormalizationState {
        const n = new Normalizer(def);

        return n.normalize();
    }

    public readonly normalized: IExecutionDefinition;

    /**
     * original to normalized local id map
     */
    private readonly o2nMap: LocalIdMap = {};

    /**
     * normalized to original local id map
     */
    private readonly n2oMap: LocalIdMap = {};

    private constructor(public readonly original: IExecutionDefinition) {
        const copy = cloneDeep(this.original);

        // throw away noop filters
        const filters = copy.filters.filter(f => {
            if (isNegativeAttributeFilter(f)) {
                return !filterIsEmpty(f);
            } else if (isMeasureValueFilter(f)) {
                return measureValueFilterCondition(f) !== undefined;
            }

            return true;
        });

        this.normalized = {
            ...copy,
            filters,
        };
    }

    /**
     * Creates a new mapping between original local ID and the proposed normalized local ID. This method
     * ensures uniqueness of the normalized local ID. If the proposed normalized local ID is taken, it will
     * append a suffix to make a unique local ID.
     *
     * This can happen if the original execution definition contains same measure / attribute multiple times,
     * each time using different local ID.
     */
    private createUniqueMapping = (original: string, normalized: string): string => {
        invariant(!this.o2nMap[original], `duplicate localId used in execution definition: ${original}`);

        let uniqueNormalized = normalized;
        let attempt = 1;

        while (this.n2oMap[uniqueNormalized]) {
            uniqueNormalized = `${normalized}_${attempt}`;
            attempt += 1;
        }

        this.o2nMap[original] = uniqueNormalized;
        this.n2oMap[uniqueNormalized] = original;

        return uniqueNormalized;
    };

    private normalizedLocalId = (original: string): string => {
        const value = this.o2nMap[original];

        invariant(value, `dangling localId reference. Target: ${original}`);

        return value!;
    };

    private maybeNormalizedLocalId = (original: string): string | undefined => {
        return this.o2nMap[original];
    };

    private normalizeAttributes = () => {
        this.normalized.attributes.forEach(attr => {
            delete attr.attribute.alias;

            const originalLocalId = attributeLocalId(attr);
            const normalizedLocalId = attributeLocalId(modifyAttribute(attr, m => m.defaultLocalId()));

            attr.attribute.localIdentifier = this.createUniqueMapping(originalLocalId, normalizedLocalId);
        });
    };

    /**
     * Simple measure normalization will toss away noop filters. There is nothing else to do.
     */
    private normalizeSimple = (def: IMeasureDefinition) => {
        if (!def.measureDefinition.filters) {
            return;
        }

        def.measureDefinition.filters = def.measureDefinition.filters?.filter(filter => {
            return !isNegativeAttributeFilter(filter) || !filterIsEmpty(filter);
        });
    };

    private normalizePoP = (def: IPoPMeasureDefinition): boolean => {
        const normalizedId = this.maybeNormalizedLocalId(def.popMeasureDefinition.measureIdentifier);

        if (!normalizedId) {
            return false;
        }

        def.popMeasureDefinition.measureIdentifier = normalizedId;

        return true;
    };

    private normalizePreviousPeriod = (def: IPreviousPeriodMeasureDefinition): boolean => {
        const normalizedId = this.maybeNormalizedLocalId(def.previousPeriodMeasure.measureIdentifier);

        if (!normalizedId) {
            return false;
        }

        def.previousPeriodMeasure.measureIdentifier = normalizedId;

        return true;
    };

    private normalizeArithmetic = (def: IArithmeticMeasureDefinition): boolean => {
        const normalizedIds = def.arithmeticMeasure.measureIdentifiers.map(this.maybeNormalizedLocalId);

        if (normalizedIds.some(id => id === undefined)) {
            return false;
        }

        def.arithmeticMeasure.measureIdentifiers = normalizedIds as Identifier[];

        return true;
    };

    /*
     * Measure normalization is somewhat trickier, it is a multi-stage
     */
    private normalizeMeasures = () => {
        let toNormalize: IMeasure[] = [];
        toNormalize.push(...this.normalized.measures);

        while (toNormalize.length > 0) {
            const nextRound: IMeasure[] = [];

            for (const measure of toNormalize) {
                const definition = measure.measure.definition;
                let definitionNormalized = false;

                if (isPoPMeasureDefinition(definition)) {
                    definitionNormalized = this.normalizePoP(definition);
                } else if (isPreviousPeriodMeasureDefinition(definition)) {
                    definitionNormalized = this.normalizePreviousPeriod(definition);
                } else if (isArithmeticMeasureDefinition(definition)) {
                    definitionNormalized = this.normalizeArithmetic(definition);
                } else {
                    this.normalizeSimple(definition);

                    definitionNormalized = true;
                }

                if (definitionNormalized) {
                    /*
                     * Now that the definition is normalized, the measure localId can be set to the default - which
                     * is generated based on contents of alias, title, format + definition
                     */

                    delete measure.measure.alias;
                    delete measure.measure.title;
                    delete measure.measure.format;

                    const originalLocalId = measureLocalId(measure);
                    const newLocalId = measureLocalId(modifyMeasure(measure, m => m.defaultLocalId()));

                    measure.measure.localIdentifier = this.createUniqueMapping(originalLocalId, newLocalId);
                } else {
                    nextRound.push(measure);
                }
            }

            invariant(
                nextRound.length !== toNormalize.length,
                `measure normalization failed. there are either dangling references or cycles between measures: ${nextRound
                    .map(measureLocalId)
                    .join(", ")}`,
            );

            toNormalize = nextRound;
        }
    };

    private normalizeFilters = () => {
        this.normalized.filters.forEach(filter => {
            if (isMeasureValueFilter(filter)) {
                const ref = filter.measureValueFilter.measure;

                if (isLocalIdRef(ref)) {
                    ref.localIdentifier = this.normalizedLocalId(ref.localIdentifier);
                }
            }
        });
    };

    private normalizeSorts = () => {
        this.normalized.sortBy.forEach(sort => {
            if (isAttributeSort(sort)) {
                sort.attributeSortItem.attributeIdentifier = this.normalizedLocalId(
                    sort.attributeSortItem.attributeIdentifier,
                );
            } else if (isMeasureSort(sort)) {
                sort.measureSortItem.locators.forEach(locator => {
                    if (isAttributeLocator(locator)) {
                        locator.attributeLocatorItem.attributeIdentifier = this.normalizedLocalId(
                            locator.attributeLocatorItem.attributeIdentifier,
                        );
                    } else {
                        locator.measureLocatorItem.measureIdentifier = this.normalizedLocalId(
                            locator.measureLocatorItem.measureIdentifier,
                        );
                    }
                });
            }
        });
    };

    private normalizeDimensions = () => {
        this.normalized.dimensions.forEach(dim => {
            dim.itemIdentifiers = dim.itemIdentifiers.map(item => {
                if (item === MeasureGroupIdentifier) {
                    return item;
                } else {
                    return this.normalizedLocalId(item);
                }
            });

            if (dim.totals) {
                dim.totals.forEach(total => {
                    total.attributeIdentifier = this.normalizedLocalId(total.attributeIdentifier);
                    total.measureIdentifier = this.normalizedLocalId(total.measureIdentifier);
                });
            }
        });
    };

    private normalize = (): NormalizationState => {
        this.normalizeAttributes();
        this.normalizeMeasures();
        this.normalizeFilters();
        this.normalizeSorts();
        this.normalizeDimensions();

        return {
            normalized: this.normalized,
            original: this.original,
            n2oMap: this.n2oMap,
        };
    };
}
