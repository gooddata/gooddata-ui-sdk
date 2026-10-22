// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type JsonApiPublisherDocumentOutWithLinks } from "@gooddata/api-client-tiger";
import {
    type IPublisherContentNotSupportedDetails,
    PublisherContentNotSupportedError,
} from "@gooddata/sdk-backend-spi";
import { type IPublisherDocumentDefinitionV2, idRef } from "@gooddata/sdk-model";

import {
    convertPublisherDocumentTemplateToBackendV2,
    convertPublisherDocumentToBackendV2,
    convertPublisherPageTemplateToBackendV2,
} from "../toBackend/PublisherConverterV2.js";

import {
    convertPublisherDocumentListItemV2,
    convertPublisherDocumentTemplateV2,
    convertPublisherDocumentV2,
    convertPublisherPageTemplateV2,
} from "./PublisherConverterV2.js";
import {
    absolutePeriodDocumentV2,
    auditRelationshipsV2,
    auditUsersV2,
    documentOutV2,
    documentTemplateOutV2,
    documentTemplateV2,
    pageTemplateOutV2,
    pageTemplateV2,
    parentOriginMetaV2,
    relativePeriodDocumentV2,
} from "./publisherV2.fixture.js";

const brokenContent = { pages: [{ id: "page_a", layout: { type: "chart", id: "w" } }] };

const versionIssue = { path: "version", message: 'Expected "2", got "3".' };

function notSupportedDetails(convert: () => unknown): IPublisherContentNotSupportedDetails {
    try {
        convert();
    } catch (error) {
        expect(error).toBeInstanceOf(PublisherContentNotSupportedError);
        return (error as PublisherContentNotSupportedError).details;
    }
    throw new Error("Expected PublisherContentNotSupportedError, nothing was thrown.");
}

describe("PublisherConverterV2 document period round-trip", () => {
    it.each<[string, IPublisherDocumentDefinitionV2]>([
        ["absolute", absolutePeriodDocumentV2],
        ["relative", relativePeriodDocumentV2],
    ])("round-trips a document with an %s period through the backend attributes", (_, definition) => {
        const attributes = convertPublisherDocumentToBackendV2(definition);

        const loaded = convertPublisherDocumentV2({ id: "doc1", type: "document", attributes });

        expect(loaded.period).toEqual(definition.period);
        expect(loaded).toEqual({ ...definition, ref: idRef("doc1", "document"), isLocked: false });
    });
});

describe("PublisherConverterV2 metadata", () => {
    it.each<[string, () => { isLocked?: boolean }]>([
        [
            "document",
            () => convertPublisherDocumentV2({ ...documentOutV2("doc1"), meta: parentOriginMetaV2 }),
        ],
        [
            "document template",
            () =>
                convertPublisherDocumentTemplateV2({
                    ...documentTemplateOutV2("template1"),
                    meta: parentOriginMetaV2,
                }),
        ],
        [
            "page template",
            () =>
                convertPublisherPageTemplateV2({ ...pageTemplateOutV2("layout1"), meta: parentOriginMetaV2 }),
        ],
    ])("locks a %s inherited from the parent workspace", (_, convert) => {
        expect(convert().isLocked).toBe(true);
    });

    it("leaves a native document unlocked", () => {
        const loaded = convertPublisherDocumentV2({
            ...documentOutV2("doc1"),
            meta: { origin: { originType: "NATIVE", originId: "ws1" } },
        });

        expect(loaded.isLocked).toBe(false);
    });

    it("reads the creator and the last editor from the included users", () => {
        const loaded = convertPublisherDocumentV2(
            { ...documentOutV2("doc1"), relationships: auditRelationshipsV2 },
            auditUsersV2,
        );

        expect(loaded.createdBy).toEqual({
            ref: idRef("alice"),
            login: "alice",
            email: "alice@example.com",
            firstName: "Alice",
            lastName: "Novak",
        });
        expect(loaded.updatedBy).toEqual({
            ref: idRef("bob"),
            login: "bob",
            email: "bob@example.com",
            firstName: "Bob",
            lastName: "Svoboda",
        });
    });
});

describe("convertPublisherDocumentV2", () => {
    it("rejects a stored version this frontend does not read", () => {
        const details = notSupportedDetails(() =>
            convertPublisherDocumentV2(documentOutV2("doc1", { version: "3" })),
        );

        expect(details.version).toBe("3");
        expect(details.ref).toEqual(idRef("doc1", "document"));
        expect(details.issues).toEqual([versionIssue]);
    });

    it("reports only the version of an unknown version, not its content", () => {
        const details = notSupportedDetails(() =>
            convertPublisherDocumentV2(documentOutV2("doc1", { version: "3", content: brokenContent })),
        );

        expect(details.issues).toEqual([versionIssue]);
    });

    it.each<[string, Partial<JsonApiPublisherDocumentOutWithLinks["attributes"]>]>([
        ["an empty description", { description: "" }],
        ["empty tags", { tags: [] }],
        ["tags of empty strings", { tags: ["", ""] }],
    ])("reads %s as absent", (_, attributes) => {
        const loaded = convertPublisherDocumentV2(documentOutV2("doc1", attributes));

        expect(loaded).not.toHaveProperty("description");
        expect(loaded).not.toHaveProperty("tags");
    });

    it("drops the empty strings from the tags", () => {
        const loaded = convertPublisherDocumentV2(documentOutV2("doc1", { tags: ["finance", ""] }));

        expect(loaded.tags).toEqual(["finance"]);
    });

    it("drops repeated tags, keeping the first of each", () => {
        const loaded = convertPublisherDocumentV2(
            documentOutV2("doc1", { tags: ["finance", "finance", "ops"] }),
        );

        expect(loaded.tags).toEqual(["finance", "ops"]);
    });

    it.each<[string, string, Partial<JsonApiPublisherDocumentOutWithLinks["attributes"]>]>([
        ["an empty title", "doc1", { title: "" }],
        ["a title of 200 emoji", "doc1", { title: "😀".repeat(200) }],
        ["a default. id", "default.x", {}],
    ])("loads and lists a stored document with %s", (_, id, attributes) => {
        const stored = documentOutV2(id, attributes);

        expect(convertPublisherDocumentV2(stored).ref).toEqual(idRef(id, "document"));
        expect(convertPublisherDocumentListItemV2(stored).supported).toBe(true);
    });

    it("rejects broken content with the paths of the issues", () => {
        const details = notSupportedDetails(() =>
            convertPublisherDocumentV2(documentOutV2("doc1", { content: brokenContent })),
        );

        expect(details.version).toBe("2");
        expect(details.issues.map((issue) => issue.path)).toEqual(["content.pages[0].layout.type"]);
    });

    it("ignores areRelationsValid in the stored attributes", () => {
        const loaded = convertPublisherDocumentV2(documentOutV2("doc1", { areRelationsValid: false }));

        expect(loaded).not.toHaveProperty("areRelationsValid");
        expect(loaded.title).toBe(absolutePeriodDocumentV2.title);
    });
});

describe("convertPublisherPageTemplateV2", () => {
    it("marks a page template whose id starts with default. as a default", () => {
        expect(convertPublisherPageTemplateV2(pageTemplateOutV2("default.cover")).isDefault).toBe(true);
    });

    it("does not mark other page templates as a default", () => {
        const loaded = convertPublisherPageTemplateV2(pageTemplateOutV2("mine.default"));

        expect(loaded).not.toHaveProperty("isDefault");
    });

    it("rejects an unknown version", () => {
        const details = notSupportedDetails(() =>
            convertPublisherPageTemplateV2(pageTemplateOutV2("layout1", { version: "1" })),
        );

        expect(details.version).toBe("1");
    });
});

describe("convertPublisherDocumentTemplateV2", () => {
    it("rejects content that holds both pages and sections", () => {
        const details = notSupportedDetails(() =>
            convertPublisherDocumentTemplateV2(
                documentTemplateOutV2("template1", { content: { pages: [], sections: [] } }),
            ),
        );

        expect(details.issues.map((issue) => issue.path)).toEqual(["content"]);
    });
});

describe("convertPublisherDocumentListItemV2", () => {
    it("lists a readable document as supported", () => {
        const item = convertPublisherDocumentListItemV2(documentOutV2("doc1"));

        expect(item).toEqual({
            supported: true,
            document: convertPublisherDocumentV2(documentOutV2("doc1")),
        });
    });

    it("lists an unreadable document as an unsupported summary without period or content", () => {
        const item = convertPublisherDocumentListItemV2(
            documentOutV2("doc1", { version: "3", description: "Old one" }),
        );

        if (item.supported) {
            throw new Error("Expected an unsupported item.");
        }
        expect(item.summary).toEqual({
            ref: idRef("doc1", "document"),
            title: absolutePeriodDocumentV2.title,
            description: "Old one",
            version: "3",
            isLocked: false,
        });
        expect(item.summary).not.toHaveProperty("period");
        expect(item.summary).not.toHaveProperty("content");
        expect(item.error).toBeInstanceOf(PublisherContentNotSupportedError);
        expect(item.error.details.version).toBe("3");
    });

    it("reports only the version of an unknown version, not its content", () => {
        const item = convertPublisherDocumentListItemV2(
            documentOutV2("doc1", { version: "3", content: brokenContent }),
        );

        expect(item.supported ? [] : item.error.details.issues).toEqual([versionIssue]);
    });

    it("lists a document with an empty description and empty tags as supported", () => {
        const item = convertPublisherDocumentListItemV2(
            documentOutV2("doc1", { description: "", tags: [""] }),
        );

        expect(item.supported).toBe(true);
    });

    it("lists a document with repeated tags as supported", () => {
        const item = convertPublisherDocumentListItemV2(
            documentOutV2("doc1", { tags: ["finance", "finance", "ops"] }),
        );

        expect(item.supported).toBe(true);
    });
});

describe("PublisherConverterV2 toBackend", () => {
    it("rejects an invalid document before it reaches the backend", () => {
        const details = notSupportedDetails(() =>
            convertPublisherDocumentToBackendV2({ ...absolutePeriodDocumentV2, title: "" }),
        );

        expect(details.title).toBe("");
        expect(details.issues.map((issue) => issue.path)).toEqual(["title"]);
    });

    it("leaves out empty tags", () => {
        const attributes = convertPublisherDocumentToBackendV2({ ...absolutePeriodDocumentV2, tags: [] });

        expect(attributes).not.toHaveProperty("tags");
    });

    it("leaves out the empty tags of a template", () => {
        expect(convertPublisherPageTemplateToBackendV2({ ...pageTemplateV2, tags: [] })).not.toHaveProperty(
            "tags",
        );
        expect(
            convertPublisherDocumentTemplateToBackendV2({ ...documentTemplateV2, tags: [] }),
        ).not.toHaveProperty("tags");
    });

    it.each([
        [
            "a document",
            () =>
                convertPublisherDocumentToBackendV2({ ...absolutePeriodDocumentV2, ref: idRef("default.x") }),
        ],
        [
            "a document template",
            () =>
                convertPublisherDocumentTemplateToBackendV2({
                    ...convertPublisherDocumentTemplateV2(documentTemplateOutV2("template1")),
                    ref: idRef("default.x"),
                }),
        ],
        [
            "a page template",
            () =>
                convertPublisherPageTemplateToBackendV2({
                    ...convertPublisherPageTemplateV2(pageTemplateOutV2("layout1")),
                    ref: idRef("default.x"),
                }),
        ],
    ])("rejects saving %s under a default. id", (_, save) => {
        expect(notSupportedDetails(save).issues.map((issue) => issue.path)).toEqual(["ref"]);
    });
});
