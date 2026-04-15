// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { createCopiedParameter } from "../parameterCopy.js";

describe("parameterCopy", () => {
    it("appends a copy suffix to titles without one", () => {
        expect(
            createCopiedParameter({
                id: "source_id",
                type: "parameter",
                title: "Title",
                definition: { type: "NUMBER", defaultValue: 1 },
            }),
        ).toMatchObject({
            title: "Title (2)",
            id: "title__2_",
        });
    });

    it("increments a trailing numeric copy suffix", () => {
        expect(
            createCopiedParameter({
                id: "source_id",
                type: "parameter",
                title: "Title (2)",
                definition: { type: "NUMBER", defaultValue: 1 },
            }),
        ).toMatchObject({
            title: "Title (3)",
            id: "title__3_",
        });
    });

    it("only increments clean trailing copy suffixes", () => {
        expect(
            createCopiedParameter({
                id: "source_id",
                type: "parameter",
                title: "Title (2) extra",
                definition: { type: "NUMBER", defaultValue: 1 },
            }),
        ).toMatchObject({
            title: "Title (2) extra (2)",
            id: "title__2__extra__2_",
        });
    });

    it("keeps blank titles blank", () => {
        expect(
            createCopiedParameter({
                id: "source_id",
                type: "parameter",
                title: "",
                definition: { type: "NUMBER", defaultValue: 1 },
            }),
        ).toEqual({
            type: "parameter",
            title: "",
            definition: { type: "NUMBER", defaultValue: 1 },
        });
    });

    it("omits id when the source id is a canonical UUID", () => {
        expect(
            createCopiedParameter({
                id: "123E4567-E89B-12D3-A456-426614174000",
                type: "parameter",
                title: "Title",
                definition: { type: "NUMBER", defaultValue: 1 },
            }),
        ).toEqual({
            type: "parameter",
            title: "Title (2)",
            definition: { type: "NUMBER", defaultValue: 1 },
        });
    });

    it("derives copied id from the copied title for non-UUID source ids", () => {
        expect(
            createCopiedParameter({
                id: "user.edited.id",
                type: "parameter",
                title: "Títle",
                definition: { type: "NUMBER", defaultValue: 1 },
            }),
        ).toMatchObject({
            title: "Títle (2)",
            id: "title__2_",
        });
    });
});
