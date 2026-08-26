// (C) 2019-2026 GoodData Corporation

import { invert, isEmpty } from "lodash-es";

import { type ObjectType } from "@gooddata/sdk-model";

import { type TigerAfmType, type TigerObjectType } from "./index.js";

/**
 * @alpha
 */
export type TigerCompatibleObjectType = Exclude<ObjectType, "tag">;

/**
 * @alpha
 */
export type TigerAfmCompatibleObjectType = Extract<
    TigerCompatibleObjectType,
    "attribute" | "computedAttribute" | "measure" | "displayForm" | "dataSet" | "fact" | "variable"
>;

/**
 * @alpha
 */
export const tigerIdTypeToObjectType: {
    [tigerType in TigerObjectType]: TigerCompatibleObjectType;
} = {
    attribute: "attribute",
    computedAttribute: "computedAttribute",
    metric: "measure",
    label: "displayForm",
    dataset: "dataSet",
    fact: "fact",
    prompt: "variable",
    analyticalDashboard: "analyticalDashboard",
    visualizationObject: "insight",
    filterContext: "filterContext",
    dashboardPlugin: "dashboardPlugin",
    parameter: "parameter",
};

/**
 * @alpha
 */
export const objectTypeToTigerIdType = invert(tigerIdTypeToObjectType) as {
    [objectType in TigerCompatibleObjectType]: TigerObjectType;
};

/**
 * @alpha
 */
export const objectTypeToTigerAfmType: Record<TigerAfmCompatibleObjectType, TigerAfmType> = {
    attribute: "attribute",
    // a computed attribute is referenced by its own type, not as a label - it has no real labels
    computedAttribute: "computedAttribute",
    measure: "metric",
    displayForm: "label",
    dataSet: "dataset",
    fact: "fact",
    variable: "prompt",
};

const validTigerTypes = Object.keys(tigerIdTypeToObjectType);
const validCompatibleTypes = Object.values(tigerIdTypeToObjectType);
const validCompatibleAfmTypes = Object.keys(objectTypeToTigerAfmType) as TigerAfmCompatibleObjectType[];

/**
 * @alpha
 */
export const isTigerCompatibleType = (obj: unknown): obj is TigerObjectType => {
    return !isEmpty(obj) && validCompatibleTypes.some((type) => type === obj);
};

export const isTigerAfmCompatibleType = (obj: unknown): obj is TigerAfmCompatibleObjectType => {
    return !isEmpty(obj) && validCompatibleAfmTypes.some((type) => type === obj);
};

/**
 * @alpha
 */
export const isTigerType = (obj: unknown): obj is TigerObjectType => {
    return !isEmpty(obj) && validTigerTypes.some((type) => type === obj);
};
