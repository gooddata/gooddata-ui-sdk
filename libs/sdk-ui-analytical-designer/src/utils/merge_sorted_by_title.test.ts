// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { mergeSortedAlphabeticallyByTitle } from "./merge_sorted_by_title.js";

describe("mergeSortedAlphabeticallyByTitle", () => {
    it("merges two independently sorted lists into one alphabetical list", () => {
        const merged = mergeSortedAlphabeticallyByTitle(
            [{ title: "Account" }, { title: "Region" }],
            [{ title: "Performance Tier" }],
            (item) => item.title,
        );

        expect(merged.map((item) => item.title)).toEqual(["Account", "Performance Tier", "Region"]);
    });

    it("leaves the inputs untouched", () => {
        const first = [{ title: "B" }];
        const second = [{ title: "A" }];

        mergeSortedAlphabeticallyByTitle(first, second, (item) => item.title);

        expect(first).toEqual([{ title: "B" }]);
        expect(second).toEqual([{ title: "A" }]);
    });
});
