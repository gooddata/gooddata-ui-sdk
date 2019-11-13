// (C) 2007-2019 GoodData Corporation
import { VisualizationProperties } from "@gooddata/sdk-model";
import { GdcVisualizationObject } from "@gooddata/gd-bear-model";
import { isUri } from "@gooddata/gd-bear-client";
import isEmpty = require("lodash/isEmpty");
import omit = require("lodash/omit");
import isArray = require("lodash/isArray");
import isObject = require("lodash/isObject");
import isString = require("lodash/isString");
import * as uuid from "uuid";
import { deserializeProperties, serializeProperties } from "./PropertiesConverter";

/*
 * Helpers
 */
const getReferenceValue = (id: string, references: GdcVisualizationObject.IReferenceItems) => references[id];
const getReferenceId = (value: string, references: GdcVisualizationObject.IReferenceItems) =>
    Object.keys(references).find(id => references[id] === value);

type IdGenerator = () => string;

const defaultIdGenerator: IdGenerator = () => uuid.v4().replace(/-/g, "");

type StringTransformation = (value: string) => string;

/**
 * Recursively traverses the object and tries to apply a conversion to every string value
 */
const traverse = (obj: any, convert: StringTransformation): any => {
    if (isArray(obj)) {
        return obj.map(a => traverse(a, convert));
    } else if (isObject(obj)) {
        return Object.keys(obj).reduce(
            (result, key) => {
                result[key] = traverse((obj as any)[key], convert);
                return result;
            },
            {} as any,
        );
    } else if (isString(obj)) {
        return convert(obj);
    } else {
        return obj;
    }
};

interface IConversionResult {
    convertedProperties: VisualizationProperties;
    convertedReferences: GdcVisualizationObject.IReferenceItems;
}

type ConversionFunction = (
    originalProperties: VisualizationProperties,
    originalReferences: GdcVisualizationObject.IReferenceItems,
    idGenerator: IdGenerator,
) => IConversionResult;

export type ReferenceConverter = (
    mdObject: GdcVisualizationObject.IVisualizationObject,
    idGenerator?: IdGenerator,
) => GdcVisualizationObject.IVisualizationObject;

const createConverter = (conversionFunction: ConversionFunction): ReferenceConverter => (
    mdObject: GdcVisualizationObject.IVisualizationObject,
    idGenerator: IdGenerator = defaultIdGenerator,
): GdcVisualizationObject.IVisualizationObject => {
    const { content } = mdObject;
    if (!content) {
        return mdObject;
    }

    const { properties } = content;
    if (!properties) {
        return mdObject;
    }

    // prepare result objects
    const originalProperties = deserializeProperties(properties);
    const originalReferences = content.references || {};

    const { convertedProperties, convertedReferences } = conversionFunction(
        originalProperties,
        originalReferences,
        idGenerator,
    );

    // set the new properties and references
    const referencesProp = isEmpty(convertedReferences) ? undefined : { references: convertedReferences };

    return {
        ...mdObject,
        content: {
            ...(omit(mdObject.content, "references") as GdcVisualizationObject.IVisualizationObjectContent),
            properties: serializeProperties(convertedProperties),
            ...referencesProp,
        },
    };
};

/*
 * Conversion from References to URIs
 */
const convertReferenceToUri = (
    references: GdcVisualizationObject.IReferenceItems,
): StringTransformation => value => getReferenceValue(value, references) || value;

/**
 * Converts reference based values to actual URIs
 *
 * @param mdObject The object to convert properties of
 * @param [idGenerator=uuid] Function that returns unique ids
 */
export const convertReferencesToUris = createConverter((originalProperties, originalReferences) => {
    const convertedProperties = traverse(originalProperties, convertReferenceToUri(originalReferences));

    return {
        convertedProperties,
        convertedReferences: originalReferences,
    };
});

/*
 * Conversion from URIs to References
 */
const createUriToReferenceConverter = (
    originalReferences: GdcVisualizationObject.IReferenceItems,
    idGenerator: IdGenerator,
) => {
    const convertedReferences: GdcVisualizationObject.IReferenceItems = {};

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
 * @param mdObject The object to convert properties of
 * @param [idGenerator=uuid] Function that returns unique ids
 */
export const convertUrisToReferences = createConverter(
    (originalProperties, originalReferences, idGenerator) => {
        const converter = createUriToReferenceConverter(originalReferences, idGenerator);
        const convertedProperties = traverse(originalProperties, converter.conversion);

        return {
            convertedProperties,
            convertedReferences: converter.convertedReferences,
        };
    },
);
