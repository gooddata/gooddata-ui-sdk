// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    PublisherTextVariablesV2,
    getPublisherTextPlaceholdersV2,
    publisherTextPlaceholderV2,
    resolvePublisherTextPlaceholdersV2,
} from "./variables.js";

describe("getPublisherTextPlaceholdersV2", () => {
    it("reads back every variable from its marker", () => {
        const text = PublisherTextVariablesV2.map(publisherTextPlaceholderV2).join(" ");

        expect(getPublisherTextPlaceholdersV2(text)).toEqual(PublisherTextVariablesV2);
    });

    it("lists each name once, in order of first use", () => {
        expect(getPublisherTextPlaceholdersV2("{periodEnd}: {documentName}, {periodEnd}, {revenue}")).toEqual(
            ["periodEnd", "documentName", "revenue"],
        );
    });

    it("skips braces that hold no name", () => {
        expect(getPublisherTextPlaceholdersV2("{} { documentName } {2024} {document-name}")).toEqual([]);
    });
});

describe("resolvePublisherTextPlaceholdersV2", () => {
    it("replaces every marker of a variable with its value", () => {
        expect(
            resolvePublisherTextPlaceholdersV2("{documentName}, page {currentPageNumber} of {documentName}", {
                documentName: "Q3",
                currentPageNumber: "2",
            }),
        ).toBe("Q3, page 2 of Q3");
    });

    it("replaces a marker with an empty value", () => {
        expect(
            resolvePublisherTextPlaceholdersV2("[{documentDescription}]", { documentDescription: "" }),
        ).toBe("[]");
    });

    it("keeps a marker with no value as typed", () => {
        expect(
            resolvePublisherTextPlaceholdersV2("{documentName} by {exportedBy}", { documentName: "Q3" }),
        ).toBe("Q3 by {exportedBy}");
    });

    it("keeps an unknown name and a name every object inherits as typed", () => {
        expect(resolvePublisherTextPlaceholdersV2("{revenue} {toString} {constructor}", {})).toBe(
            "{revenue} {toString} {constructor}",
        );
    });
});
