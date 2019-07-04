// (C) 2019 GoodData Corporation
import flow = require("lodash/flow");
import identity = require("lodash/identity");
import isArray = require("lodash/isArray");
import isObject = require("lodash/isObject");
import isString = require("lodash/isString");
import { VisualizationInput, AFM } from "@gooddata/typings";
import stringifyObject = require("stringify-object");

const stringify = (input: any) =>
    stringifyObject(input, {
        singleQuotes: false,
        inlineCharacterLimit: 50,
        indent: "    ",
    });

const ARRAY_JOINER = ", ";

const getObjQualifierValue = (value: VisualizationInput.ObjQualifier): string =>
    (value as any).uri || (value as any).identifier;

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

const addFilters = ({ filters }: { filters?: VisualizationInput.IFilter[] }) => (value: string) =>
    filters ? `${value}.filters(${filters.map(getModelNotationFor).join(ARRAY_JOINER)})` : value;

const addLocators = ({ locators }: { locators?: AFM.LocatorItem[] }) => (value: string) => {
    const attributeLocators = locators.filter(
        l => !AFM.isMeasureLocatorItem(l),
    ) as AFM.IAttributeLocatorItem[];
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
const convertAttribute: Converter<VisualizationInput.IAttribute> = ({ visualizationAttribute }) =>
    flow([addAlias(visualizationAttribute), addLocalIdentifier(visualizationAttribute)])(
        `Model.attribute("${getObjQualifierValue(visualizationAttribute.displayForm)}")`,
    );

const baseMeasureDotAdders = (measure: VisualizationInput.IMeasure["measure"]) => [
    addAlias(measure),
    addFormat(measure),
    addLocalIdentifier(measure),
    addTitle(measure),
];

const convertSimpleMeasure = (
    measure: VisualizationInput.IMeasure["measure"],
    definition: VisualizationInput.IMeasureDefinition,
) =>
    flow([
        ...baseMeasureDotAdders(measure),
        addAggregation(definition.measureDefinition),
        addFilters(definition.measureDefinition),
        addRatio(definition.measureDefinition),
    ])(`Model.measure("${getObjQualifierValue(definition.measureDefinition.item)}")`);

const convertArithmeticMeasure = (
    measure: VisualizationInput.IMeasure["measure"],
    definition: VisualizationInput.IArithmeticMeasureDefinition,
) =>
    flow(baseMeasureDotAdders(measure))(
        `Model.arithmeticMeasure(${stringify(definition.arithmeticMeasure.measureIdentifiers)}, "${
            definition.arithmeticMeasure.operator
        }")`,
    );

const convertPopMeasure = (
    measure: VisualizationInput.IMeasure["measure"],
    definition: VisualizationInput.IPoPMeasureDefinition,
) =>
    flow(baseMeasureDotAdders(measure))(
        `Model.popMeasure("${definition.popMeasureDefinition.measureIdentifier}", "${getObjQualifierValue(
            definition.popMeasureDefinition.popAttribute,
        )}")`,
    );

const convertPreviousPeriodMeasure = (
    measure: VisualizationInput.IMeasure["measure"],
    definition: VisualizationInput.IPreviousPeriodMeasureDefinition,
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

const convertMeasure: Converter<VisualizationInput.IMeasure> = ({ measure }) => {
    const { definition } = measure;
    if (VisualizationInput.isMeasureDefinition(definition)) {
        return convertSimpleMeasure(measure, definition);
    } else if (VisualizationInput.isArithmeticMeasureDefinition(definition)) {
        return convertArithmeticMeasure(measure, definition);
    } else if (VisualizationInput.isPopMeasureDefinition(definition)) {
        return convertPopMeasure(measure, definition);
    } else if (VisualizationInput.isPreviousPeriodMeasureDefinition(definition)) {
        return convertPreviousPeriodMeasure(measure, definition);
    }
};

const convertAttributeSortItem: Converter<AFM.IAttributeSortItem> = ({ attributeSortItem }) =>
    addAggregation(attributeSortItem)(
        `Model.attributeSortItem("${attributeSortItem.attributeIdentifier}", "${
            attributeSortItem.direction
        }")`,
    );

const convertMeasureSortItem: Converter<AFM.IMeasureSortItem> = ({ measureSortItem }) => {
    const measureLocator = measureSortItem.locators.find(l =>
        AFM.isMeasureLocatorItem(l),
    ) as AFM.IMeasureLocatorItem;
    return addLocators(measureSortItem)(
        `Model.measureSortItem("${measureLocator.measureLocatorItem.measureIdentifier}", "${
            measureSortItem.direction
        }")`,
    );
};

const convertAbsoluteDateFilter: Converter<VisualizationInput.IAbsoluteDateFilter> = ({
    absoluteDateFilter: { dataSet, from, to },
}) => {
    const args = [getObjQualifierValue(dataSet), from, to].filter(identity).map(stringify);
    return `Model.absoluteDateFilter(${args.join(ARRAY_JOINER)})`;
};

const convertRelativeDateFilter: Converter<VisualizationInput.IRelativeDateFilter> = ({
    relativeDateFilter: { dataSet, granularity, from, to },
}) => {
    const args = [getObjQualifierValue(dataSet), granularity, from, to].filter(identity).map(stringify);
    return `Model.relativeDateFilter(${args.join(ARRAY_JOINER)})`;
};

const convertPositiveAttributeFilter: Converter<VisualizationInput.IPositiveAttributeFilter> = ({
    positiveAttributeFilter: { displayForm, in: inValues, textFilter },
}) => {
    const args = [getObjQualifierValue(displayForm), inValues, textFilter].filter(identity).map(stringify);
    return `Model.positiveAttributeFilter(${args.join(ARRAY_JOINER)})`;
};

const convertNegativeAttributeFilter: Converter<VisualizationInput.INegativeAttributeFilter> = ({
    negativeAttributeFilter: { displayForm, notIn, textFilter },
}) => {
    const args = [getObjQualifierValue(displayForm), notIn, textFilter].filter(identity).map(stringify);
    return `Model.negativeAttributeFilter(${args.join(ARRAY_JOINER)})`;
};

export const getModelNotationFor = (data: any): string => {
    if (isArray(data)) {
        return `[${data.map(getModelNotationFor).join(ARRAY_JOINER)}]`;
    } else if (VisualizationInput.isAttribute(data)) {
        return convertAttribute(data);
    } else if (VisualizationInput.isMeasure(data)) {
        return convertMeasure(data);
    } else if (AFM.isAttributeSortItem(data)) {
        return convertAttributeSortItem(data);
    } else if (AFM.isMeasureSortItem(data)) {
        return convertMeasureSortItem(data);
    } else if (VisualizationInput.isAbsoluteDateFilter(data)) {
        return convertAbsoluteDateFilter(data);
    } else if (VisualizationInput.isRelativeDateFilter(data)) {
        return convertRelativeDateFilter(data);
    } else if (VisualizationInput.isPositiveAttributeFilter(data)) {
        return convertPositiveAttributeFilter(data);
    } else if (VisualizationInput.isNegativeAttributeFilter(data)) {
        return convertNegativeAttributeFilter(data);
    }

    return isObject(data) || isString(data) ? stringify(data) : data;
};
