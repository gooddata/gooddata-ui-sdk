import { DataLayer } from '@gooddata/gooddata-js';

const { Uri: { isUri } } = DataLayer;

export const createMeasureBucketItem = (qualifierString, localIdentifier, alias) => {
    const aliasProp = alias ? { alias } : {};
    return {
        measure: {
            localIdentifier: localIdentifier || qualifierString,
            definition: {
                measureDefinition: {
                    item: {
                        [isUri(qualifierString) ? 'uri' : 'identifier']: qualifierString
                    }
                }
            },
            ...aliasProp
        }
    };
};

export const createAttributeBucketItem = (qualifierString, localIdentifier, alias) => {
    const aliasProp = alias ? { alias } : {};
    return {
        visualizationAttribute: {
            localIdentifier: qualifierString,
            displayForm: {
                [isUri(qualifierString) ? 'uri' : 'identifier']: qualifierString
            }
        },
        ...aliasProp
    };
};

export const createPositiveAttributeFilter = (qualifierString, values) => {
    return {
        positiveAttributeFilter: {
            displayForm: {
                [isUri(qualifierString) ? 'uri' : 'identifier']: qualifierString
            },
            in: values
        }
    };
};

export const createNegativeAttributeFilter = (qualifierString, values) => {
    return {
        negativeAttributeFilter: {
            displayForm: {
                [isUri(qualifierString) ? 'uri' : 'identifier']: qualifierString
            },
            notIn: values
        }
    };
};

export const createAttributeSortItem = (attributeIdentifier, direction = 'asc', aggregation) => {
    const aggregationSpread = aggregation ? { aggregation } : {};
    return {
        attributeSortItem: {
            direction,
            attributeIdentifier,
            ...aggregationSpread
        }
    };
};

export const createMeasureSortItem = (measureIdentifier, direction = 'desc', attributeLocatorIdentifier, attributeLocatorValue) => {
    const attributeLocatorSpread = attributeLocatorIdentifier && attributeLocatorValue
        ? [{
            attributeLocatorItem: {
                attributeIdentifier: attributeLocatorIdentifier,
                element: attributeLocatorValue
            }
        }]
        : [];

    return {
        measureSortItem: {
            direction,
            locators: [
                ...attributeLocatorSpread,
                {
                    measureLocatorItem: {
                        measureIdentifier
                    }
                }
            ]
        }
    };
};
