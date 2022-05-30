// (C) 2021-2022 GoodData Corporation
import { TigerObjectType } from "../../types";
import { TigerCompatibleObjectType } from "../../types/refTypeMapping";
import { toObjectType } from "../fromBackend/ObjRefConverter";
import { toTigerType } from "../toBackend/ObjRefConverter";

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
