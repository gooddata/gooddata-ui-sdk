// (C) 2019-2022 GoodData Corporation
import compact from "lodash/compact";
import flow from "lodash/flow";
import isArray from "lodash/isArray";
import isObject from "lodash/isObject";
import isString from "lodash/isString";
import stringifyObject from "stringify-object";
import { isUriRef, ObjRefInScope, isIdentifierRef } from "../../objRef";
import {
    isMeasureLocator,
    IAttributeLocatorItem,
    isAttributeSort,
    isMeasureSort,
    IAttributeSortItem,
    IMeasureSortItem,
    IMeasureLocatorItem,
    isAttributeAreaSort,
} from "../base/sort";
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
} from "../filter";
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
} from "../measure";
import { isAttribute, IAttribute } from "../attribute";

const stringify = (input: any) =>
    stringifyObject(input, {
        singleQuotes: false,
        inlineCharacterLimit: 50,
        indent: "    ",
    });

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
        objToConvert[identifier] ? `${value}.${helperName}("${objToConvert[identifier]}")` : value;

const addAggregation = addStringBuilderSegment("aggregation");
const addAlias = addStringBuilderSegment("alias");
const addFormat = addStringBuilderSegment("format");
const addLocalId = addStringBuilderSegment("localIdentifier", "localId");
const addTitle = addStringBuilderSegment("title");

const addFilters =
    ({ filters }: { filters?: IFilter[] }) =>
    (value: string) =>
        filters ? `${value}.filters(${filters.map(factoryNotationFor).join(ARRAY_JOINER)})` : value;

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
    `newAttributeSort("${attributeSortItem.attributeIdentifier}", "${
        attributeSortItem.direction
    }", ${!!attributeSortItem.aggregation})`;

const convertMeasureSortItem: Converter<IMeasureSortItem> = ({ measureSortItem }) => {
    const locators = measureSortItem.locators || [];
    const measureLocator = locators.find((l) => isMeasureLocator(l)) as IMeasureLocatorItem;
    const attributeLocators = locators.filter((l) => !isMeasureLocator(l)) as IAttributeLocatorItem[];

    return `newMeasureSort("${measureLocator.measureLocatorItem.measureIdentifier}", "${
        measureSortItem.direction
    }", ${stringify(attributeLocators)})`;
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
    const restArgs = compact([granularity, from, to]).map(stringify);
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
        return `newMeasureValueFilter(${ref}, "${condition.comparison.operator}", ${condition.comparison.value})`;
    } else if (isRangeCondition(condition)) {
        return `newMeasureValueFilter(${ref}, "${condition.range.operator}", ${condition.range.from}, ${condition.range.to})`;
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

/**
 * Returns a code for generating the provided input using convenience factory methods where possible.
 * @param data - data to return the generating code for
 * @public
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const factoryNotationFor = (data: any): string => {
    if (isArray(data)) {
        return `[${data.map(factoryNotationFor).join(ARRAY_JOINER)}]`;
    } else if (isAttribute(data)) {
        return convertAttribute(data);
    } else if (isMeasure(data)) {
        return convertMeasure(data);
    } else if (isAttributeAreaSort(data)) {
        return convertAttributeAreaSortItem(data);
    } else if (isAttributeSort(data)) {
        return convertAttributeSortItem(data);
    } else if (isMeasureSort(data)) {
        return convertMeasureSortItem(data);
    } else if (isAbsoluteDateFilter(data)) {
        return convertAbsoluteDateFilter(data);
    } else if (isRelativeDateFilter(data)) {
        return convertRelativeDateFilter(data);
    } else if (isPositiveAttributeFilter(data)) {
        return convertPositiveAttributeFilter(data);
    } else if (isNegativeAttributeFilter(data)) {
        return convertNegativeAttributeFilter(data);
    } else if (isMeasureValueFilter(data)) {
        return convertMeasureValueFilter(data);
    } else if (isRankingFilter(data)) {
        return convertRankingFilter(data);
    }

    return isObject(data) || isString(data) ? stringify(data) : data;
};
