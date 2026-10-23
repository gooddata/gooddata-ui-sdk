// (C) 2021-2026 GoodData Corporation

// oxlint-disable typescript-eslint/require-array-sort-compare

import { describe, expect, it } from "vitest";
import { Range } from "vscode-languageserver";

import { createDecoration, decorate } from "./decorations.js";
import { ldmObjects } from "./tests/metadata.test.helpers.js";

describe("business name decorations", () => {
    it("each type of LDM object has a corresponding decoration", () => {
        const query = "SELECT CORREL({fact/1}, {metric/2}) BY {attribute/3}, {label/4};";
        const decorations = decorate(query, ldmObjects);
        expect(decorations.sort()).toEqual(
            [
                createDecoration(Range.create(0, 14, 0, 22), "fact title", "fact"),
                createDecoration(Range.create(0, 24, 0, 34), "measure title", "metric"),
                createDecoration(Range.create(0, 39, 0, 52), "attribute title", "attribute"),
                createDecoration(Range.create(0, 54, 0, 63), "label title", "label"),
            ].sort(),
        );
    });

    it("date LDM objects have their own decoration type", () => {
        const query = "SELECT COUNT({attribute/date.year}) WHERE {label/date.year} <= CURRENT(YEAR)";
        const decorations = decorate(query, ldmObjects);
        expect(decorations.sort()).toEqual(
            [
                createDecoration(Range.create(0, 13, 0, 34), "Date - Year", "dateAttribute"),
                createDecoration(Range.create(0, 42, 0, 59), "Date - Year", "dateLabel"),
            ].sort(),
        );
    });

    it("non-existent LDM objects get no decorations", () => {
        const query = "SELECT SUM({fact/i.dont.exist})";
        const decorations = decorate(query, ldmObjects);
        expect(decorations.length).toBe(0);
    });
});
