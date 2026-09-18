// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { idRef, uriRef } from "@gooddata/sdk-model";

import { findDisabledComputedAttributeRef } from "./computedAttributesEnabledValidation.js";

const computedAttribute = idRef("ca.id", "computedAttribute");
const label = idRef("label.id", "displayForm");

function run(refs: Parameters<typeof findDisabledComputedAttributeRef>[0], enabled: boolean | undefined) {
    const saga = findDisabledComputedAttributeRef(refs);
    let step = saga.next();
    // the saga selects the setting only when a computed attribute is referenced
    const selected = !step.done;
    if (selected) {
        step = saga.next(enabled);
    }
    return { selected, result: step.value };
}

describe("findDisabledComputedAttributeRef", () => {
    it("lets commands without a computed attribute reference through without reading the setting", () => {
        expect(run([label, uriRef("/gdc/md/1"), undefined], undefined)).toEqual({
            selected: false,
            result: undefined,
        });
    });

    it("lets a computed attribute reference through when the setting is on", () => {
        expect(run([label, computedAttribute], true)).toEqual({ selected: true, result: undefined });
    });

    it("reports the computed attribute reference when the setting is off", () => {
        expect(run([label, computedAttribute], false)).toEqual({ selected: true, result: computedAttribute });
    });
});
