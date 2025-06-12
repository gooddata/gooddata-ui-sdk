// (C) 2019-2022 GoodData Corporation

import { ObjectType } from "@gooddata/sdk-model";
import invert from "lodash/invert.js";
import isEmpty from "lodash/isEmpty.js";
import values from "lodash/values.js";
import { TigerObjectType } from "./index.js";

/**
 * @alpha
 */
export type TigerCompatibleObjectType = Exclude<ObjectType, "tag">;

/**
 * @alpha
 */
export const tigerIdTypeToObjectType: {
    [tigerType in TigerObjectType]: TigerCompatibleObjectType;
} = {
    attribute: "attribute",
    metric: "measure",
    label: "displayForm",
    dataset: "dataSet",
    fact: "fact",
    prompt: "variable",
    analyticalDashboard: "analyticalDashboard",
    visualizationObject: "insight",
    filterContext: "filterContext",
    dashboardPlugin: "dashboardPlugin",
};

/**
 * @alpha
 */
export const objectTypeToTigerIdType = invert(tigerIdTypeToObjectType) as {
    [objectType in TigerCompatibleObjectType]: TigerObjectType;
};

const validTigerTypes = Object.keys(tigerIdTypeToObjectType);
const validCompatibleTypes = values(tigerIdTypeToObjectType);

/**
 * @alpha
 */
export const isTigerCompatibleType = (obj: unknown): obj is TigerObjectType => {
    return !isEmpty(obj) && validCompatibleTypes.some((type) => type === obj);
};

/**
 * @alpha
 */
export const isTigerType = (obj: unknown): obj is TigerObjectType => {
    return !isEmpty(obj) && validTigerTypes.some((type) => type === obj);
};
