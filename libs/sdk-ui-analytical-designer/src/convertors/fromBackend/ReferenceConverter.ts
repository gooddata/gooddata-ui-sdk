// (C) 2007-2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

import { type VisualizationProperties } from "@gooddata/sdk-model";

type IReferenceItems = Record<string, string>;

const REG_URI_OBJ = /\/gdc\/md\/\S+\/obj\/\d+/;

/**
 * Tests whether the provided string looks like a URI of a metadata object on GoodData platform
 *
 * @param value - string to test
 * @public
 */
export const isUri = (value: string): boolean => REG_URI_OBJ.test(value);

/*
 * Helpers
 */
const getReferenceValue = (id: string, references: IReferenceItems) => references[id];
const getReferenceId = (value: string, references: IReferenceItems) =>
    Object.keys(references).find((id) => references[id] === value);

/**
 * @internal
 */
export type IdGenerator = () => string;

const defaultIdGenerator: IdGenerator = () => uuidv4().replace(/-/g, "");

type StringTransformation = (value: string) => string;

/**
 * Recursively traverses the object and tries to apply a conversion to every string value
 */
const traverse = <T>(obj: T, convert: StringTransformation): T => {
    if (Array.isArray(obj)) {
        return obj.map((a) => traverse(a, convert)) as T;
    } else if (obj !== null && typeof obj === "object") {
        return Object.keys(obj).reduce((result: Record<string, unknown>, key) => {
            result[key] = traverse((obj as Record<string, unknown>)[key], convert);
            return result;
        }, {}) as T;
    } else if (typeof obj === "string") {
        return convert(obj) as T;
    } else {
        return obj;
    }
};

/**
 * @internal
 */
export interface IConversionData {
    properties: VisualizationProperties;
    references: IReferenceItems;
}

type ConversionFunction = (conversionData: IConversionData, idGenerator: IdGenerator) => IConversionData;

/**
 * @internal
 */
export type ReferenceConverter = (
    conversionData: IConversionData,
    idGenerator?: IdGenerator,
) => IConversionData;

const createConverter =
    (conversionFunction: ConversionFunction): ReferenceConverter =>
    (conversionData, idGenerator = defaultIdGenerator) => {
        return conversionFunction(conversionData, idGenerator);
    };

/*
 * Conversion from References to URIs
 */
const convertReferenceToUri =
    (references: IReferenceItems): StringTransformation =>
    (value) =>
        getReferenceValue(value, references) || value;

/**
 * Converts URIs to reference based values
 *
 * @param conversionData - Data to convert
 * @param idGenerator - Function that returns unique ids, defaults to uuid
 *
 * @internal
 */
export const convertReferencesToUris = createConverter(({ references, properties }) => {
    return {
        properties: traverse(properties, convertReferenceToUri(references)),
        references,
    };
});

/*
 * Conversion from URIs to References
 */
const createUriToReferenceConverter = (originalReferences: IReferenceItems, idGenerator: IdGenerator) => {
    const convertedReferences: IReferenceItems = {};

    return {
        convertedReferences,
        conversion: (value: string) => {
            if (!isUri(value)) {
                return value;
            }

            const id =
                getReferenceId(value, originalReferences) || // try to reuse original references
                getReferenceId(value, convertedReferences) || // or use already converted new references
                idGenerator(); // or get a completely new id

            convertedReferences[id] = value;
            return id;
        },
    };
};

/**
 * Converts URIs to reference based values
 *
 * @param conversionData - Data to convert
 * @param idGenerator - Function that returns unique ids, defaults to uuid
 * @internal
 */
export const convertUrisToReferences = createConverter(({ properties, references }, idGenerator) => {
    const converter = createUriToReferenceConverter(references, idGenerator);

    return {
        properties: traverse(properties, converter.conversion),
        references: converter.convertedReferences,
    };
});
