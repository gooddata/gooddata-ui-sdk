// (C) 2021-2022 GoodData Corporation
import { TigerObjectType } from "../../types/index.js";
import { TigerCompatibleObjectType } from "../../types/refTypeMapping.js";
import { toObjectType } from "../fromBackend/ObjRefConverter.js";
import { toTigerType } from "../toBackend/ObjRefConverter.js";
import { describe, expect, test } from "vitest";

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
    test.each(mapping)(" toTigerAfmType(%s).toBe(%s)", (objectType, tigerType) => {
        expect(toTigerType(objectType)).toBe(tigerType);
    });

    test.each(mapping)(" toObjectType(%s).toBe(%s)", (objectType, tigerType) => {
        expect(toObjectType(tigerType)).toBe(objectType);
    });
});
