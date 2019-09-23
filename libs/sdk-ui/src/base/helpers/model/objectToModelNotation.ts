// (C) 2019 GoodData Corporation
import flow = require("lodash/flow");
import identity = require("lodash/identity");
import isArray = require("lodash/isArray");
import isObject = require("lodash/isObject");
import isString = require("lodash/isString");
import stringifyObject = require("stringify-object");
import {
    IAttributeLocatorItem,
    ObjQualifier,
    IAttribute,
    IMeasure,
    IMeasureDefinition,
    IArithmeticMeasureDefinition,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    isMeasureDefinition,
    isArithmeticMeasureDefinition,
    isPreviousPeriodMeasureDefinition,
    isPoPMeasureDefinition,
    IMeasureLocatorItem,
    isMeasure,
    isAbsoluteDateFilter,
    isRelativeDateFilter,
    isPositiveAttributeFilter,
    isNegativeAttributeFilter,
    IAbsoluteDateFilter,
    IRelativeDateFilter,
    IPositiveAttributeFilter,
    INegativeAttributeFilter,
    isAttribute,
    isMeasureSort,
    isAttributeSort,
    isMeasureLocator,
    IMeasureSortItem,
    IAttributeSortItem,
    LocatorItem,
    IFilter,
} from "@gooddata/sdk-model";

const stringify = (input: any) =>
    stringifyObject(input, {
        singleQuotes: false,
        inlineCharacterLimit: 50,
        indent: "    ",
    });

const ARRAY_JOINER = ", ";

const getObjQualifierValue = (value: ObjQualifier): string => (value as any).uri || (value as any).identifier;

// dot suffix handling e. g. ".localIdentifier(...)"
// is curried explicitly to allow easier composition in cases where more than one dot suffix is supported
const addStringDotItem = (identifier: string, helperName = identifier) => (objToConvert: any) => (
    value: string,
) => (objToConvert[identifier] ? `${value}.${helperName}("${objToConvert[identifier]}")` : value);

const addAggregation = addStringDotItem("aggregation");
const addAlias = addStringDotItem("alias");
const addFormat = addStringDotItem("format");
const addLocalIdentifier = addStringDotItem("localIdentifier");
const addTitle = addStringDotItem("title");

const addFilters = ({ filters }: { filters?: IFilter[] }) => (value: string) =>
    filters ? `${value}.filters(${filters.map(getModelNotationFor).join(ARRAY_JOINER)})` : value;

const addLocators = ({ locators }: { locators?: LocatorItem[] }) => (value: string) => {
    const attributeLocators = locators.filter(l => !isMeasureLocator(l)) as IAttributeLocatorItem[];
    return attributeLocators && attributeLocators.length
        ? `${value}.attributeLocators(${attributeLocators
              .map(a => stringify(a.attributeLocatorItem))
              .join(ARRAY_JOINER)})`
        : value;
};

const addRatio = ({ computeRatio }: { computeRatio?: boolean }) => (value: string) =>
    computeRatio ? `${value}.ratio()` : value;

// converters for each supported object to Model notation string
type Converter<T> = (input: T) => string;
const convertAttribute: Converter<IAttribute> = ({ attribute }) =>
    flow([addAlias(attribute), addLocalIdentifier(attribute)])(
        `Model.attribute("${getObjQualifierValue(attribute.displayForm)}")`,
    );

const baseMeasureDotAdders = (measure: IMeasure["measure"]) => [
    addAlias(measure),
    addFormat(measure),
    addLocalIdentifier(measure),
    addTitle(measure),
];

const convertSimpleMeasure = (measure: IMeasure["measure"], definition: IMeasureDefinition) =>
    flow([
        ...baseMeasureDotAdders(measure),
        addAggregation(definition.measureDefinition),
        addFilters(definition.measureDefinition),
        addRatio(definition.measureDefinition),
    ])(`Model.measure("${getObjQualifierValue(definition.measureDefinition.item)}")`);

const convertArithmeticMeasure = (measure: IMeasure["measure"], definition: IArithmeticMeasureDefinition) =>
    flow(baseMeasureDotAdders(measure))(
        `Model.arithmeticMeasure(${stringify(definition.arithmeticMeasure.measureIdentifiers)}, "${
            definition.arithmeticMeasure.operator
        }")`,
    );

const convertPopMeasure = (measure: IMeasure["measure"], definition: IPoPMeasureDefinition) =>
    flow(baseMeasureDotAdders(measure))(
        `Model.popMeasure("${definition.popMeasureDefinition.measureIdentifier}", "${getObjQualifierValue(
            definition.popMeasureDefinition.popAttribute,
        )}")`,
    );

const convertPreviousPeriodMeasure = (
    measure: IMeasure["measure"],
    definition: IPreviousPeriodMeasureDefinition,
) =>
    flow(baseMeasureDotAdders(measure))(
        `Model.previousPeriodMeasure("${definition.previousPeriodMeasure.measureIdentifier}", [${definition
            .previousPeriodMeasure.dateDataSets &&
            definition.previousPeriodMeasure.dateDataSets
                .map(s =>
                    stringify({
                        dataSet: getObjQualifierValue(s.dataSet),
                        periodsAgo: s.periodsAgo,
                    }),
                )
                .join(ARRAY_JOINER)}])`,
    );

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
};

const convertAttributeSortItem: Converter<IAttributeSortItem> = ({ attributeSortItem }) =>
    addAggregation(attributeSortItem)(
        `Model.attributeSortItem("${attributeSortItem.attributeIdentifier}", "${attributeSortItem.direction}")`,
    );

const convertMeasureSortItem: Converter<IMeasureSortItem> = ({ measureSortItem }) => {
    const measureLocator = measureSortItem.locators.find(l => isMeasureLocator(l)) as IMeasureLocatorItem;
    return addLocators(measureSortItem)(
        `Model.measureSortItem("${measureLocator.measureLocatorItem.measureIdentifier}", "${measureSortItem.direction}")`,
    );
};

const convertAbsoluteDateFilter: Converter<IAbsoluteDateFilter> = ({
    absoluteDateFilter: { dataSet, from, to },
}) => {
    const args = [getObjQualifierValue(dataSet), from, to].filter(identity).map(stringify);
    return `Model.absoluteDateFilter(${args.join(ARRAY_JOINER)})`;
};

const convertRelativeDateFilter: Converter<IRelativeDateFilter> = ({
    relativeDateFilter: { dataSet, granularity, from, to },
}) => {
    const args = [getObjQualifierValue(dataSet), granularity, from, to].filter(identity).map(stringify);
    return `Model.relativeDateFilter(${args.join(ARRAY_JOINER)})`;
};

const convertPositiveAttributeFilter: Converter<IPositiveAttributeFilter> = ({
    positiveAttributeFilter: { displayForm, in: inValues },
}) => {
    const args = [getObjQualifierValue(displayForm), inValues].filter(identity).map(stringify);
    return `Model.positiveAttributeFilter(${args.join(ARRAY_JOINER)})`;
};

const convertNegativeAttributeFilter: Converter<INegativeAttributeFilter> = ({
    negativeAttributeFilter: { displayForm, notIn },
}) => {
    const args = [getObjQualifierValue(displayForm), notIn].filter(identity).map(stringify);
    return `Model.negativeAttributeFilter(${args.join(ARRAY_JOINER)})`;
};

export const getModelNotationFor = (data: any): string => {
    if (isArray(data)) {
        return `[${data.map(getModelNotationFor).join(ARRAY_JOINER)}]`;
    } else if (isAttribute(data)) {
        return convertAttribute(data);
    } else if (isMeasure(data)) {
        return convertMeasure(data);
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
    }

    return isObject(data) || isString(data) ? stringify(data) : data;
};
