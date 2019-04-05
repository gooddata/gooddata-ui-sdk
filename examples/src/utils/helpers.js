// (C) 2007-2019 GoodData Corporation

export const createColumnTotal = (measureLocalIdentifier, attributeLocalIdentifier, type = "sum") => {
    return {
        measureIdentifier: measureLocalIdentifier,
        type,
        attributeIdentifier: attributeLocalIdentifier,
    };
};
