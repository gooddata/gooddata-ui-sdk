// (C) 2007-2019 GoodData Corporation
import { VisualizationObject } from '@gooddata/typings';
import isEmpty = require('lodash/isEmpty');
import omit = require('lodash/omit');
import isArray = require('lodash/isArray');
import isObject = require('lodash/isObject');
import isString = require('lodash/isString');
import stringify = require('json-stable-stringify');
import { v4 as uuid } from 'uuid';

import { IProperties } from './interfaces';
import { isUri } from './DataLayer/helpers/uri';

/*
 * Helpers
 */
const getReferenceValue = (id: string, references: VisualizationObject.IReferenceItems) => references[id];
const getReferenceId = (value: string, references: VisualizationObject.IReferenceItems) =>
    Object.keys(references).find(id => references[id] === value);

type IdGenerator = () => string;

const defaultIdGenerator: IdGenerator = () => uuid().replace(/-/g, '');

type StringTransformation = (value: string) => string;

/**
 * Recursively traverses the object and tries to apply a conversion to every string value
 */
const traverse = (obj: any, convert: StringTransformation): any => {
    if (isArray(obj)) {
        return obj.map(a => traverse(a, convert));
    } else if (isObject(obj)) {
        return Object.keys(obj).reduce((result, key) => {
            result[key] = traverse(obj[key], convert);
            return result;
        }, {} as any);
    } else if (isString(obj)) {
        return convert(obj);
    } else {
        return obj;
    }
};

interface IConversionResult {
    convertedProperties: IProperties;
    convertedReferences: VisualizationObject.IReferenceItems;
}

type ConversionFunction = (
    originalProperties: IProperties,
    originalReferences: VisualizationObject.IReferenceItems,
    idGenerator: IdGenerator
) => IConversionResult;

export type ReferenceConverter = (
    mdObject: VisualizationObject.IVisualizationObject,
    idGenerator?: IdGenerator
) => VisualizationObject.IVisualizationObject;

const createConverter = (conversionFunction: ConversionFunction): ReferenceConverter =>
    (
        mdObject: VisualizationObject.IVisualizationObject,
        idGenerator: IdGenerator = defaultIdGenerator
    ): VisualizationObject.IVisualizationObject => {
        const { content } = mdObject;
        if (!content) {
            return mdObject;
        }

        const { properties } = content;
        if (!properties) {
            return mdObject;
        }

        // prepare result objects
        const originalProperties: IProperties = JSON.parse(properties);
        const originalReferences = content.references || {};

        const { convertedProperties, convertedReferences } =
            conversionFunction(originalProperties, originalReferences, idGenerator);

        // set the new properties and references
        const referencesProp = isEmpty(convertedReferences) ? undefined : { references: convertedReferences };

        return {
            ...mdObject,
            content: {
                ...omit(mdObject.content, 'references') as VisualizationObject.IVisualizationObjectContent,
                properties: stringify(convertedProperties),
                ...referencesProp
            }
        };
    };

/*
 * Conversion from References to URIs
 */
const convertReferenceToUri = (references: VisualizationObject.IReferenceItems): StringTransformation => value =>
    getReferenceValue(value, references) || value;

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
        convertedReferences: originalReferences
    };
});

/*
 * Conversion from URIs to References
 */
const createUriToReferenceConverter =
    (originalReferences: VisualizationObject.IReferenceItems, idGenerator: IdGenerator) => {
        const convertedReferences: VisualizationObject.IReferenceItems = {};

        return {
            convertedReferences,
            conversion: (value: string) => {
                if (!isUri(value)) {
                    return value;
                }

                const id = getReferenceId(value, originalReferences) // try to reuse original references
                    || getReferenceId(value, convertedReferences) // or use already converted new references
                    || idGenerator(); // or get a completely new id

                convertedReferences[id] = value;
                return id;
            }
        };
    };

/**
 * Converts URIs to reference based values
 *
 * @param mdObject The object to convert properties of
 * @param [idGenerator=uuid] Function that returns unique ids
 */
export const convertUrisToReferences = createConverter((originalProperties, originalReferences, idGenerator) => {
    const converter = createUriToReferenceConverter(originalReferences, idGenerator);
    const convertedProperties = traverse(originalProperties, converter.conversion);

    return {
        convertedProperties,
        convertedReferences: converter.convertedReferences
    };
});
