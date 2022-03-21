// (C) 2022 GoodData Corporation
import { removeUseless } from "../removeUseless";

describe("removeUseless", () => {
    it("should handle a simple case", () => {
        const input = { foo: {}, bar: 42 };
        expect(removeUseless(input)).toEqual({ bar: 42 });
    });

    it("should handle arrays", () => {
        const input = { foo: [] as const, bar: [42] };
        expect(removeUseless(input)).toEqual({ bar: [42] });
    });

    it("should handle nested useless objects", () => {
        const input = { foo: [{}] as const, bar: [42, {}, { baz: undefined }] };
        expect(removeUseless(input)).toEqual({ bar: [42] });
    });

    const emptyButUsefulScenarios: Array<[string, any]> = [
        ["empty string", ""],
        ["false", false],
        ["zero", 0],
    ];

    it.each(emptyButUsefulScenarios)("should keep empty but useful thing in: %s", (_, value) => {
        const input = { foo: value };
        expect(removeUseless(input)).toEqual(input);
    });
});
