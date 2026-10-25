// (C) 2026 GoodData Corporation

// @vitest-environment node

import { type Action } from "redux";
import { describe, expect, it } from "vitest";

import { nullableLeaf } from "./nullable_leaf.js";

interface IValue {
    name: string;
}

const WRITE = "test/write";
const CLEAR = "test/clear";
const VALUE: IValue = { name: "parked" };

function domainReducer(state: IValue | undefined, action: Action): IValue | undefined {
    if (action.type === WRITE) {
        return VALUE;
    }
    if (action.type === CLEAR) {
        return undefined;
    }
    return state;
}

const mounted = nullableLeaf(domainReducer);

describe("nullableLeaf", () => {
    it("initializes to null when the domain reducer answers undefined", () => {
        expect(mounted(undefined, { type: "@@INIT" })).toBeNull();
    });

    it("hands a stored null to the domain reducer as undefined", () => {
        const spied = nullableLeaf((state: IValue | undefined) => {
            expect(state).toBeUndefined();
            return state;
        });

        spied(null, { type: "any" });
    });

    it("stores a cleared value as null, never undefined", () => {
        expect(mounted(VALUE, { type: CLEAR })).toBeNull();
    });

    it("preserves the identity of an unchanged value — the no-op signal", () => {
        expect(mounted(VALUE, { type: "unrelated" })).toBe(VALUE);
        expect(mounted(null, { type: "unrelated" })).toBeNull();
    });

    it("writes the domain value through by reference", () => {
        expect(mounted(null, { type: WRITE })).toBe(VALUE);
    });
});
