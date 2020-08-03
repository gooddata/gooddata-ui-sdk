// (C) 2020 GoodData Corporation

import { ITotal, TotalType } from "@gooddata/sdk-model";

export const createColumnTotal = (
    measureLocalIdentifier: string,
    attributeLocalIdentifier: string,
    type: TotalType = "sum",
): ITotal => {
    return {
        measureIdentifier: measureLocalIdentifier,
        type,
        attributeIdentifier: attributeLocalIdentifier,
    };
};
