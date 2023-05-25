// (C) 2019-2022 GoodData Corporation
import compact from "lodash/compact.js";
import flow from "lodash/flow.js";
import isNil from "lodash/isNil.js";
import isString from "lodash/isString.js";
import stringifyObject from "stringify-object";
import { isUriRef, ObjRefInScope, isIdentifierRef } from "../../objRef/index.js";
import {
    isMeasureLocator,
    IAttributeLocatorItem,
    isAttributeSort,
    isMeasureSort,
    IAttributeSortItem,
    IMeasureSortItem,
    IMeasureLocatorItem,
    isAttributeAreaSort,
} from "../base/sort.js";
import {
    IFilter,
    isAbsoluteDateFilter,
    isRelativeDateFilter,
    isPositiveAttributeFilter,
    isNegativeAttributeFilter,
    IAbsoluteDateFilter,
    IRelativeDateFilter,
    IPositiveAttributeFilter,
    INegativeAttributeFilter,
    isMeasureValueFilter,
    IMeasureValueFilter,
    isComparisonCondition,
    isRangeCondition,
    isRankingFilter,
    IRankingFilter,
} from "../filter/index.js";
import {
    isMeasureDefinition,
    isArithmeticMeasureDefinition,
    isPoPMeasureDefinition,
    isPreviousPeriodMeasureDefinition,
    isMeasure,
    IMeasure,
    IMeasureDefinition,
    IArithmeticMeasureDefinition,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
} from "../measure/index.js";
import { isAttribute, IAttribute } from "../attribute/index.js";
import { isTotal, ITotal } from "../base/totals.js";

const commonStringifySettings = {
    singleQuotes: false,
    inlineCharacterLimit: 50,
    indent: "    ",
};

const stringify = (input: any) => stringifyObject(input, commonStringifySettings);

const ARRAY_JOINER = ", ";

const stringifyObjRef = (ref: ObjRefInScope): string => {
    if (isUriRef(ref)) {
        return `uriRef("${ref.uri}")`;
    } else if (isIdentifierRef(ref)) {
        return ref.type ? `idRef("${ref.identifier}", "${ref.type}")` : `idRef("${ref.identifier}")`;
    } else {
        return `localIdRef("${ref.localIdentifier}")`;
    }
};

type Converter<T> = (input: T) => string;

// dot suffix handling e. g. ".localIdentifier(...)"
// is curried explicitly to allow easier composition in cases where more than one dot suffix is supported
const addStringBuilderSegment =
    (identifier: string, helperName = identifier) =>
    (objToConvert: any) =>
    (value: string) =>
        objToConvert[identifier]
            ? `${value}.${helperName}("${objToConvert[identifier].split("\n").join("\\n")}")`
            : value;

const addAggregation = addStringBuilderSegment("aggregation");
const addAlias = addStringBuilderSegment("alias");
const addFormat = addStringBuilderSegment("format");
const addLocalId = addStringBuilderSegment("localIdentifier", "localId");
const addTitle = addStringBuilderSegment("title");

const addFilters =
    ({ filters }: { filters?: IFilter[] }) =>
    (value: string) =>
        filters?.length
            ? `${value}.filters(${filters.map((f) => factoryNotationFor(f)).join(ARRAY_JOINER)})`
            : value;

const addRatio =
    ({ computeRatio }: { computeRatio?: boolean }) =>
    (value: string) =>
        computeRatio ? `${value}.ratio()` : value;

const getBuilder = <T>(defaultBuilder: string, builderSegmentHandlers: Array<Converter<T>>) => {
    const builder = flow(builderSegmentHandlers)(defaultBuilder);
    return builder === defaultBuilder ? "undefined" : builder;
};

// converters for each supported object to Model notation string
const convertAttribute: Converter<IAttribute> = ({ attribute }) => {
    const builder = getBuilder("a => a", [addAlias(attribute), addLocalId(attribute)]);
    return `newAttribute(${stringifyObjRef(attribute.displayForm)}, ${builder})`;
};

const baseMeasureDotAdders = (measure: IMeasure["measure"]) => [
    addAlias(measure),
    addFormat(measure),
    addLocalId(measure),
    addTitle(measure),
];

const convertSimpleMeasure = (measure: IMeasure["measure"], definition: IMeasureDefinition) => {
    const builder = getBuilder("m => m", [
        ...baseMeasureDotAdders(measure),
        addAggregation(definition.measureDefinition),
        addFilters(definition.measureDefinition),
        addRatio(definition.measureDefinition),
    ]);
    return `newMeasure(${stringifyObjRef(definition.measureDefinition.item)}, ${builder})`;
};

const convertArithmeticMeasure = (measure: IMeasure["measure"], definition: IArithmeticMeasureDefinition) => {
    const builder = getBuilder("m => m", baseMeasureDotAdders(measure));
    return `newArithmeticMeasure(${stringify(definition.arithmeticMeasure.measureIdentifiers)}, "${
        definition.arithmeticMeasure.operator
    }", ${builder})`;
};

const convertPopMeasure = (measure: IMeasure["measure"], definition: IPoPMeasureDefinition) => {
    const builder = getBuilder("m => m", baseMeasureDotAdders(measure));
    return `newPopMeasure("${definition.popMeasureDefinition.measureIdentifier}", ${stringifyObjRef(
        definition.popMeasureDefinition.popAttribute,
    )}, ${builder})`;
};

const convertPreviousPeriodMeasure = (
    measure: IMeasure["measure"],
    definition: IPreviousPeriodMeasureDefinition,
) => {
    const builder = getBuilder("m => m", baseMeasureDotAdders(measure));
    const stringifiedDateDatasets = definition.previousPeriodMeasure.dateDataSets
        ?.map(
            (s) => `{
    dataSet: ${stringifyObjRef(s.dataSet)},
    periodsAgo: ${s.periodsAgo}
}`,
        )
        .join(ARRAY_JOINER);
    return `newPreviousPeriodMeasure("${definition.previousPeriodMeasure.measureIdentifier}", [${stringifiedDateDatasets}], ${builder})`;
};

const convertMeasure: Converter<IMeasure> = ({ measure }) => {
    const { definition } = measure;
    if (isMeasureDefinition(definition)) {
        return convertSimpleMeasure(measure, definition);
    } else if (isArithmeticMeasureDefinition(definition)) {
        return convertArithmeticMeasure(measure, definition);
    } else if (isPoPMeasureDefinition(definition)) {
        return convertPopMeasure(measure, definition);
    } else if (isPreviousPeriodMeasureDefinition(definition)) {
        return convertPreviousPeriodMeasure(measure, definition);
    }
    throw new Error("Unknown measure type");
};

const convertAttributeAreaSortItem: Converter<IAttributeSortItem> = ({ attributeSortItem }) =>
    `newAttributeAreaSort("${attributeSortItem.attributeIdentifier}", "${attributeSortItem.direction}", "${attributeSortItem.aggregation}")`;

const convertAttributeSortItem: Converter<IAttributeSortItem> = ({ attributeSortItem }) =>
    `newAttributeSort("${attributeSortItem.attributeIdentifier}", "${attributeSortItem.direction}")`;

const convertMeasureSortItem: Converter<IMeasureSortItem> = ({ measureSortItem }) => {
    const locators = measureSortItem.locators || [];
    const measureLocator = locators.find((l) => isMeasureLocator(l)) as IMeasureLocatorItem;
    const attributeLocators = locators.filter((l) => !isMeasureLocator(l)) as IAttributeLocatorItem[];

    const params = compact([
        `"${measureLocator.measureLocatorItem.measureIdentifier}"`,
        `"${measureSortItem.direction}"`,
        attributeLocators?.length > 0 && stringify(attributeLocators),
    ]);

    return `newMeasureSort(${params.join(ARRAY_JOINER)})`;
};

const convertAbsoluteDateFilter: Converter<IAbsoluteDateFilter> = ({
    absoluteDateFilter: { dataSet, from, to },
}) => {
    const restArgs = compact([from, to]).map(stringify);
    return `newAbsoluteDateFilter(${[stringifyObjRef(dataSet), ...restArgs].join(ARRAY_JOINER)})`;
};

const convertRelativeDateFilter: Converter<IRelativeDateFilter> = ({
    relativeDateFilter: { dataSet, granularity, from, to },
}) => {
    // cannot use lodash compact, that would remove 0 values which we want to keep here
    const restArgs = [granularity, from, to].filter((item) => !isNil(item)).map(stringify);
    return `newRelativeDateFilter(${[stringifyObjRef(dataSet), ...restArgs].join(ARRAY_JOINER)})`;
};

const convertPositiveAttributeFilter: Converter<IPositiveAttributeFilter> = ({
    positiveAttributeFilter: { displayForm, in: inValues },
}) => {
    const restArgs = compact([inValues]).map(stringify);
    return `newPositiveAttributeFilter(${[stringifyObjRef(displayForm), ...restArgs].join(ARRAY_JOINER)})`;
};

const convertNegativeAttributeFilter: Converter<INegativeAttributeFilter> = ({
    negativeAttributeFilter: { displayForm, notIn },
}) => {
    const restArgs = compact([notIn]).map(stringify);
    return `newNegativeAttributeFilter(${[stringifyObjRef(displayForm), ...restArgs].join(ARRAY_JOINER)})`;
};

const convertMeasureValueFilter: Converter<IMeasureValueFilter> = ({
    measureValueFilter: { measure, condition },
}) => {
    const ref = stringifyObjRef(measure);

    if (isComparisonCondition(condition)) {
        const args = compact([
            ref,
            `"${condition.comparison.operator}"`,
            `${condition.comparison.value}`,
            !isNil(condition.comparison.treatNullValuesAs) && `${condition.comparison.treatNullValuesAs}`,
        ]);
        return `newMeasureValueFilter(${args.join(ARRAY_JOINER)})`;
    } else if (isRangeCondition(condition)) {
        const args = compact([
            ref,
            `"${condition.range.operator}"`,
            `${condition.range.from}`,
            `${condition.range.to}`,
            !isNil(condition.range.treatNullValuesAs) && `${condition.range.treatNullValuesAs}`,
        ]);
        return `newMeasureValueFilter(${args.join(ARRAY_JOINER)})`;
    }

    return `{ measureValueFilter: { measure: ${ref} }`;
};

const convertRankingFilter: Converter<IRankingFilter> = ({
    rankingFilter: { measure, attributes, value, operator },
}) => {
    const attributesString = attributes?.map(stringifyObjRef).join(ARRAY_JOINER);

    const args = [
        stringifyObjRef(measure),
        attributesString && `[${attributesString}]`,
        `"${operator}"`,
        `${value}`,
    ].filter(isString);

    return `newRankingFilter(${args.join(ARRAY_JOINER)})`;
};

const convertTotal: Converter<ITotal> = ({ attributeIdentifier, measureIdentifier, type, alias }) => {
    const args = compact([type, measureIdentifier, attributeIdentifier, alias]).map(stringify);
    return `newTotal(${args.join(ARRAY_JOINER)})`;
};

const factoryNotationForCore = (
    obj: any,
    additionalConversion?: (data: any) => string | undefined,
): string | undefined => {
    if (isAttribute(obj)) {
        return convertAttribute(obj);
    } else if (isMeasure(obj)) {
        return convertMeasure(obj);
    } else if (isAttributeAreaSort(obj)) {
        return convertAttributeAreaSortItem(obj);
    } else if (isAttributeSort(obj)) {
        return convertAttributeSortItem(obj);
    } else if (isMeasureSort(obj)) {
        return convertMeasureSortItem(obj);
    } else if (isAbsoluteDateFilter(obj)) {
        return convertAbsoluteDateFilter(obj);
    } else if (isRelativeDateFilter(obj)) {
        return convertRelativeDateFilter(obj);
    } else if (isPositiveAttributeFilter(obj)) {
        return convertPositiveAttributeFilter(obj);
    } else if (isNegativeAttributeFilter(obj)) {
        return convertNegativeAttributeFilter(obj);
    } else if (isMeasureValueFilter(obj)) {
        return convertMeasureValueFilter(obj);
    } else if (isRankingFilter(obj)) {
        return convertRankingFilter(obj);
    } else if (isTotal(obj)) {
        return convertTotal(obj);
    }

    return additionalConversion?.(obj);
};

/**
 * Returns a code for generating the provided input using convenience factory methods where possible.
 * @param data - data to return the generating code for
 * @param additionalConversion - specify other conversion that will be tried before falling back to standard stringify. return undefined when you want to fall back to standard stringify.
 * @public
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const factoryNotationFor = (
    data: any,
    additionalConversion?: (data: any) => string | undefined,
): string => {
    return (
        // try the custom conversion first, stringify-object does not call the transform on the whole input, only on sub-objects
        factoryNotationForCore(data, additionalConversion) ??
        stringifyObject(data, {
            ...commonStringifySettings,
            transform(obj: any, key, originalResult) {
                return factoryNotationForCore(obj[key], additionalConversion) ?? originalResult;
            },
        })
    );
};
