// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { buildReferenceContext, buildReferencedContext } from "../referencedObjects.js";

describe("buildReferencedContext", () => {
    it("should return context with referenced objects", () => {
        const referencedObjects = [
            {
                context: { type: "WIDGET", ref: { identifier: "w1" } },
                objects: [{ type: "WIDGET", ref: { identifier: "w2" } }],
            },
        ] as any;
        const result = buildReferencedContext(referencedObjects);
        expect(result).toEqual({ referencedObjects });
    });
});

describe("buildReferenceContext", () => {
    it("should return reference group", () => {
        const context = { type: "WIDGET", ref: { identifier: "w1" } } as any;
        const objects = [{ type: "WIDGET", ref: { identifier: "w2" } }] as any;
        const result = buildReferenceContext(objects, context);
        expect(result).toEqual({ context, objects });
    });
});
