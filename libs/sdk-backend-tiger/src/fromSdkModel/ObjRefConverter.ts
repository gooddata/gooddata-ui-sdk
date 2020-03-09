// (C) 2007-2020 GoodData Corporation

import { UnexpectedError } from "@gooddata/sdk-backend-spi";
import { ObjectType } from "@gooddata/sdk-model";
import { TigerObjectType } from "../types";

const tigerTypeByObjectType: {
    [objectType in ObjectType]: TigerObjectType;
} = {
    attribute: "attributes",
    measure: "metrics",
    fact: "facts",
    displayForm: "labels",
    dataSet: "datasets",
    tag: "tags",
};

export const convertObjectType = (objectType: ObjectType): TigerObjectType => {
    const tigerType = tigerTypeByObjectType[objectType];

    if (!tigerType) {
        throw new UnexpectedError(
            `Cannot convert ObjectType ${tigerType} to TigerType - mapping for type ${tigerType} not found!`,
        );
    }
    return tigerType;
};
