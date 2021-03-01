// (C) 2019-2021 GoodData Corporation

import { ObjectType } from "@gooddata/sdk-model";
import invert from "lodash/invert";
import isEmpty from "lodash/isEmpty";
import values from "lodash/values";
import { TigerObjectType } from "./index";

export type TigerCompatibleObjectType = Exclude<ObjectType, "tag" | "insight">;

export const tigerIdTypeToObjectType: {
    [tigerType in TigerObjectType]: TigerCompatibleObjectType;
} = {
    attribute: "attribute",
    metric: "measure",
    label: "displayForm",
    dataset: "dataSet",
    fact: "fact",
    variable: "variable",
    analyticalDashboard: "analyticalDashboard",
    visualizationObject: "visualizationObject",
    filterContext: "filterContext",
};

export const objectTypeToTigerIdType = invert(tigerIdTypeToObjectType) as {
    [objectType in TigerCompatibleObjectType]: TigerObjectType;
};

const validTigerTypes = Object.keys(tigerIdTypeToObjectType);
const validCompatibleTypes = values(tigerIdTypeToObjectType);

export const isTigerCompatibleType = (obj: any): obj is TigerObjectType => {
    return !isEmpty(obj) && validCompatibleTypes.some((type) => type === obj);
};

export const isTigerType = (obj: any): obj is TigerObjectType => {
    return !isEmpty(obj) && validTigerTypes.some((type) => type === obj);
};
