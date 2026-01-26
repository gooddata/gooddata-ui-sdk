// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type TigerObjectType } from "../../types/index.js";
import { type TigerCompatibleObjectType } from "../../types/refTypeMapping.js";
import { toObjectType } from "../fromBackend/ObjRefConverter.js";
import { toTigerType } from "../toBackend/ObjRefConverter.js";

const mapping: [TigerCompatibleObjectType, TigerObjectType][] = [
    ["attribute", "attribute"],
    ["measure", "metric"],
    ["displayForm", "label"],
    ["dataSet", "dataset"],
    ["fact", "fact"],
    ["variable", "prompt"],
    ["insight", "visualizationObject"],
    ["filterContext", "filterContext"],
];

describe("ObjectConverters", () => {
    it.each(mapping)(" toTigerAfmType(%s).toBe(%s)", (objectType, tigerType) => {
        expect(toTigerType(objectType)).toBe(tigerType);
    });

    it.each(mapping)(" toObjectType(%s).toBe(%s)", (objectType, tigerType) => {
        expect(toObjectType(tigerType)).toBe(objectType);
    });
});
