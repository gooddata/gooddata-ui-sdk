// (C) 2019-2025 GoodData Corporation

import { invert, isEmpty } from "lodash-es";

import { type ObjectType } from "@gooddata/sdk-model";

import { type TigerObjectType } from "./index.js";

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
const validCompatibleTypes = Object.values(tigerIdTypeToObjectType);

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
