// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { loadColor, loadColorDefinitions, loadColorMapping, saveColorMapping } from "../configUtils.js";
import { CoreErrorCode, type ICoreError } from "../errors.js";

const guid = (value: string) => ({ type: "guid" as const, value });

const codeOf = (act: () => unknown) => {
    try {
        act();
        return null;
    } catch (err: unknown) {
        return (err as ICoreError).code;
    }
};

describe("loadColor", () => {
    // A palette entry resolves by `guidEquals`, which normalizes padding only for purely numeric guids.
    it.each(["5", "05", "0", "005", "20"])(
        "takes the palette guid %s, which resolves to an entry",
        (value) => {
            expect(loadColor("EMEA", guid(value))?.value).toBe(Number.parseInt(value, 10));
        },
    );

    it.each(["guid5", "brand", "-5", " 5", "5.0", "1e3", "+5", ""])(
        "refuses the palette guid %o, which would resolve to no entry",
        (value) => {
            expect(codeOf(() => loadColor("EMEA", guid(value)))).toBe(CoreErrorCode.ItemNotSupported);
        },
    );

    it.each([
        ["positive", 1],
        ["negative", -1],
        ["equals", 0],
    ])("takes the comparison outcome %s, which a headline stores", (value, expected) => {
        expect(loadColor(value as string, guid(value as string), "enum")?.value).toBe(expected);
    });

    it("keeps each vocabulary to its own caller", () => {
        expect(codeOf(() => loadColor("EMEA", guid("positive")))).toBe(CoreErrorCode.ItemNotSupported);
        expect(codeOf(() => loadColor("equals", guid("5"), "enum"))).toBe(CoreErrorCode.ItemNotSupported);
    });

    it("refuses a colour of a kind it has no form for", () => {
        const unknown = { type: "hsl", value: "x" } as unknown as Parameters<typeof loadColor>[1];

        expect(codeOf(() => loadColor("EMEA", unknown))).toBe(CoreErrorCode.ItemNotSupported);
    });
});

describe("loadColorMapping", () => {
    it("pads a palette guid back to two digits, which resolves to the same entry", () => {
        const mapping = loadColorMapping([{ id: "EMEA", color: guid("5") }]);

        expect(saveColorMapping(mapping.toJSON())).toEqual([{ id: "EMEA", color: guid("05") }]);
    });

    it("round-trips a colour given as rgb", () => {
        const rgb = { type: "rgb" as const, value: { r: 20, g: 178, b: 226 } };
        const mapping = loadColorMapping([{ id: "EMEA", color: rgb }]);

        expect(saveColorMapping(mapping.toJSON())).toEqual([{ id: "EMEA", color: rgb }]);
    });

    it("refuses a mapping of the empty element, whose id no key can spell", () => {
        expect(codeOf(() => loadColorMapping([{ id: null, color: guid("5") }]))).toBe(
            CoreErrorCode.ItemNotSupported,
        );
    });

    it("keeps an empty string id, which names a real element", () => {
        expect(loadColorMapping([{ id: "", color: guid("5") }]).toJSON()).toEqual({ "": 5 });
    });
});

describe("loadColorDefinitions", () => {
    const definition = "properties.color.positive";

    it("takes a palette guid for a definition slot", () => {
        expect(loadColorDefinitions([{ id: definition, color: guid("5") }]).toJSON()).toEqual({
            positive: 5,
        });
    });

    it("refuses a definition slot's palette guid that resolves to no entry", () => {
        expect(codeOf(() => loadColorDefinitions([{ id: definition, color: guid("brand") }]))).toBe(
            CoreErrorCode.ItemNotSupported,
        );
    });

    it("refuses a slot it does not name, reporting which", () => {
        try {
            loadColorDefinitions([{ id: "properties.color.other", color: guid("5") }]);
            expect.fail("Should have thrown error");
        } catch (err: unknown) {
            expect((err as ICoreError).code).toBe(CoreErrorCode.ItemNotSupported);
            expect((err as ICoreError).message).toContain("properties.color.other");
        }
    });
});
