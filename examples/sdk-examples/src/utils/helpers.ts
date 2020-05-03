// (C) 2020 GoodData Corporation

export const createColumnTotal = (
    measureLocalIdentifier: string,
    attributeLocalIdentifier: string,
    type = "sum",
) => {
    return {
        measureIdentifier: measureLocalIdentifier,
        type,
        attributeIdentifier: attributeLocalIdentifier,
    };
};
