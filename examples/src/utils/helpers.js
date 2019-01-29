// (C) 2007-2018 GoodData Corporation

export const createColumnTotal = (measureLocalIdentifier, attributeLocalIdentifier, type = 'sum') => {
    return {
        measureIdentifier: measureLocalIdentifier,
        type,
        attributeIdentifier: attributeLocalIdentifier
    };
};
