// (C) 2007-2018 GoodData Corporation
import { DataLayer } from '@gooddata/gooddata-js';
import { chunk } from 'lodash';

const { Uri: { isUri } } = DataLayer;

const getQualifierObject = qualifierString => ({
    [(isUri(qualifierString) ? 'uri' : 'identifier')]: qualifierString
});

export const createMeasureBucketItem = (qualifierString, localIdentifier, alias) => {
    const aliasProp = alias ? { alias } : {};
    return {
        measure: {
            localIdentifier: localIdentifier || qualifierString,
            definition: {
                measureDefinition: {
                    item: getQualifierObject(qualifierString)
                }
            },
            ...aliasProp
        }
    };
};

export const createSamePeriodMeasureBucketItem = (masterLocalIdentifier, attributeDFQualifier, alias) => {
    const aliasProp = alias ? { alias } : {};
    return {
        measure: {
            localIdentifier: `${masterLocalIdentifier}_sp`,
            definition: {
                popMeasureDefinition: {
                    measureIdentifier: masterLocalIdentifier,
                    popAttribute: {
                        [isUri(attributeDFQualifier) ? 'uri' : 'identifier']: attributeDFQualifier
                    }
                }
            },
            ...aliasProp
        }
    };
};

export const createPreviousPeriodMeasureBucketItem = (masterLocalIdentifier, dateDataSetQualifier, alias) => {
    const aliasProp = alias ? { alias } : {};
    return {
        measure: {
            localIdentifier: `${masterLocalIdentifier}_pp`,
            definition: {
                previousPeriodMeasure: {
                    measureIdentifier: masterLocalIdentifier,
                    dateDataSets: [
                        {
                            dataSet: {
                                [isUri(dateDataSetQualifier) ? 'uri' : 'identifier']: dateDataSetQualifier
                            },
                            periodsAgo: 1
                        }
                    ]
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
            displayForm: getQualifierObject(qualifierString),
            ...aliasProp
        }
    };
};

export const createPositiveAttributeFilter = (qualifierString, values) => {
    return {
        positiveAttributeFilter: {
            displayForm: getQualifierObject(qualifierString),
            in: values
        }
    };
};

export const createNegativeAttributeFilter = (qualifierString, values) => {
    return {
        negativeAttributeFilter: {
            displayForm: getQualifierObject(qualifierString),
            notIn: values
        }
    };
};

export const createRelativeDateFilter = (dateDataSetQualifier, granularity, from, to) => {
    return {
        relativeDateFilter: {
            dataSet: {
                [isUri(dateDataSetQualifier) ? 'uri' : 'identifier']: dateDataSetQualifier
            },
            granularity,
            from,
            to
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

/* createMeasureSortItem
 * This helps build measure sort items. This enables sorting data by measure.
 * If you are sorting data that have measures and attributes in the same dimension,
 * you need to also specify attribute locators. Attribute locators are pairs of
 * attributeIdentifiers and attributeValueUris. They need to be in the same order
 * as defined in the dimension.
 */
export const createMeasureSortItem = (measureIdentifier, direction = 'desc', attributeLocators = []) => {
    const attributeLocatorSpread = chunk(attributeLocators, 2)
        .map(([attributeLocatorIdentifier, attributeLocatorValue]) => {
            return {
                attributeLocatorItem: {
                    attributeIdentifier: attributeLocatorIdentifier,
                    element: attributeLocatorValue
                }
            };
        });

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

export const createColumnTotal = (measureLocalIdentifier, attributeLocalIdentifier, type = 'sum') => {
    return {
        measureIdentifier: measureLocalIdentifier,
        type,
        attributeIdentifier: attributeLocalIdentifier
    };
};
