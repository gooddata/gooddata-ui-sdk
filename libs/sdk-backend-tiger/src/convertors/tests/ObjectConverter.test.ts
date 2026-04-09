// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { type TigerAfmType, type TigerObjectType } from "../../types/index.js";
import {
    type TigerAfmCompatibleObjectType,
    type TigerCompatibleObjectType,
} from "../../types/refTypeMapping.js";
import { toObjectType } from "../fromBackend/ObjRefConverter.js";
import { toAfmIdentifier, toObjQualifier, toTigerType } from "../toBackend/ObjRefConverter.js";

const tigerAfmMapping: [TigerAfmCompatibleObjectType, TigerAfmType][] = [
    ["attribute", "attribute"],
    ["measure", "metric"],
    ["displayForm", "label"],
    ["dataSet", "dataset"],
    ["fact", "fact"],
    ["variable", "prompt"],
];
const mapping: [TigerCompatibleObjectType, TigerObjectType][] = [
    ...tigerAfmMapping,
    ["parameter", "parameter"],
    ["insight", "visualizationObject"],
    ["filterContext", "filterContext"],
];

describe("ObjectConverters", () => {
    it.each(mapping)(" toTigerType(%s).toBe(%s)", (objectType, tigerType) => {
        expect(toTigerType(objectType)).toBe(tigerType);
    });

    it.each(mapping)(" toObjectType(%s).toBe(%s)", (objectType, tigerType) => {
        expect(toObjectType(tigerType)).toBe(objectType);
    });

    it("should convert filter context refs used during dashboard save", () => {
        expect(toObjQualifier(idRef("filterContextId", "filterContext"))).toEqual({
            identifier: {
                id: "filterContextId",
                type: "filterContext",
            },
        });
    });

    it("should convert parameter refs as Tiger object identifiers", () => {
        expect(toObjQualifier(idRef("parameterId", "parameter"))).toEqual({
            identifier: {
                id: "parameterId",
                type: "parameter",
            },
        });
    });

    it("should reject parameter refs in AFM conversion", () => {
        expect(() => toAfmIdentifier(idRef("parameterId", "parameter"))).toThrow(
            "Cannot convert parameter to AFM type",
        );
    });
});
