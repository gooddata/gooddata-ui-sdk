// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { groupParametersByTag } from "./groupParametersByTag.js";

const collator = new Intl.Collator("en-US");

function shape(groups: ReturnType<typeof groupParametersByTag>) {
    return groups.map((group) => [group.tag, group.parameters.map((parameter) => parameter.title)]);
}

describe("groupParametersByTag", () => {
    it("returns no groups for no parameters", () => {
        expect(groupParametersByTag([], "Ungrouped", collator)).toEqual([]);
    });

    it("sorts groups by tag and parameters by title", () => {
        const groups = groupParametersByTag(
            [
                { title: "Zeta", tags: ["sales"] },
                { title: "Alpha", tags: ["sales"] },
                { title: "Mid", tags: ["finance"] },
            ],
            "Ungrouped",
            collator,
        );

        expect(shape(groups)).toEqual([
            ["finance", ["Mid"]],
            ["sales", ["Alpha", "Zeta"]],
        ]);
    });

    it("merges tags that differ only in case or surrounding whitespace, keeping the first spelling", () => {
        const groups = groupParametersByTag(
            [
                { title: "A", tags: ["Sales"] },
                { title: "B", tags: [" sales "] },
                { title: "C", tags: ["SALES"] },
            ],
            "Ungrouped",
            collator,
        );

        expect(shape(groups)).toEqual([["Sales", ["A", "B", "C"]]]);
    });

    it("lists a parameter under each of its distinct tags once", () => {
        const groups = groupParametersByTag(
            [{ title: "Both", tags: ["one", "two", "ONE"] }],
            "Ungrouped",
            collator,
        );

        expect(shape(groups)).toEqual([
            ["one", ["Both"]],
            ["two", ["Both"]],
        ]);
    });

    it("puts untagged and blank-tagged parameters last under the ungrouped label", () => {
        const groups = groupParametersByTag(
            [{ title: "Blank", tags: ["  "] }, { title: "None" }, { title: "Tagged", tags: ["z"] }],
            "Ungrouped",
            collator,
        );

        expect(shape(groups)).toEqual([
            ["z", ["Tagged"]],
            ["Ungrouped", ["Blank", "None"]],
        ]);
    });
});
