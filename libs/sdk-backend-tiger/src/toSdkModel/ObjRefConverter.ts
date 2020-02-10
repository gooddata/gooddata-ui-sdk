// (C) 2019-2020 GoodData Corporation
import { ObjectType } from "@gooddata/sdk-model";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";

import { TigerObjectType } from "../types";

const objectTypeByTigerType: {
    [tigerType in TigerObjectType]: ObjectType;
} = {
    attributes: "attribute",
    metrics: "measure",
    facts: "fact",
    labels: "displayForm",
    datasets: "dataSet",
    tags: "tag",
};

export const convertObjectType = (tigerType: TigerObjectType): ObjectType => {
    const objectType = objectTypeByTigerType[tigerType];
    if (!objectType) {
        throw new UnexpectedError(
            `Cannot convert ${tigerType} to ObjectType - mapping for type ${tigerType} not found!`,
        );
    }
    return objectType;
};
