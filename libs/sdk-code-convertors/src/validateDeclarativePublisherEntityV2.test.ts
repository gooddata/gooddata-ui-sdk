// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type DeclarativePublisherDocumentV2,
    type DeclarativePublisherPageTemplateV2,
} from "./declarativePublisherTypesV2.js";
import {
    validateDeclarativePublisherEntityV2,
    validateDeclarativePublisherEntityWithOptionalKindV2,
} from "./validateDeclarativePublisherEntityV2.js";

function unknownKind(kind: string) {
    return {
        path: "type",
        message: `Unknown kind "${kind}"; expected document, documentTemplate or pageTemplate.`,
    };
}

const pageTemplate: DeclarativePublisherPageTemplateV2 = {
    id: "two_charts",
    version: "2",
    title: "Two charts",
    content: { layout: { type: "row", children: [] } },
};

describe("validateDeclarativePublisherEntityV2", () => {
    it("accepts a stored entity of the given kind named by its id", () => {
        expect(validateDeclarativePublisherEntityV2(pageTemplate, "pageTemplate")).toEqual([]);
    });

    it("reports a type key next to a given kind", () => {
        expect(
            validateDeclarativePublisherEntityV2({ ...pageTemplate, type: "pageTemplate" }, "pageTemplate"),
        ).toEqual([{ path: "type", message: 'Unknown key "type".' }]);
    });

    it("validates the content as the given kind", () => {
        const issues = validateDeclarativePublisherEntityV2(pageTemplate, "document");

        expect(issues.map(({ path }) => path)).toEqual(["content.layout", "period"]);
    });

    it("reports a default. id on a page template not flagged as a default, on the id", () => {
        expect(
            validateDeclarativePublisherEntityV2({ ...pageTemplate, id: "default.cover" }, "pageTemplate"),
        ).toEqual([
            {
                path: "id",
                message: 'Ids starting with "default." are reserved for the backend\'s defaults.',
            },
        ]);
    });

    it("reports a document under a default. id", () => {
        const document: DeclarativePublisherDocumentV2 = {
            id: "default.x",
            version: "2",
            title: "Northwind",
            period: { type: "absolute", granularity: "GDC.time.date", from: "2026-01-01", to: "2026-06-30" },
            content: { pages: [] },
        };

        expect(validateDeclarativePublisherEntityV2(document, "document").map(({ path }) => path)).toEqual([
            "id",
        ]);
    });

    it("accepts an id of 255 characters", () => {
        expect(
            validateDeclarativePublisherEntityV2({ ...pageTemplate, id: "a".repeat(255) }, "pageTemplate"),
        ).toEqual([]);
    });

    it.each([
        ["256 characters", "a".repeat(256)],
        ["a leading dot", ".two_charts"],
    ])("reports an id with %s", (_, id) => {
        expect(validateDeclarativePublisherEntityV2({ ...pageTemplate, id }, "pageTemplate")).toEqual([
            {
                path: "id",
                message: `Expected an id of 1 to 255 letters, digits, dots, underscores or hyphens, not starting with a dot, got ${JSON.stringify(id)}.`,
            },
        ]);
    });

    it("validates the content when the id is not valid", () => {
        const issues = validateDeclarativePublisherEntityV2(
            { ...pageTemplate, id: ".two_charts", version: "3" },
            "pageTemplate",
        );

        expect(issues.map(({ path }) => path)).toEqual(["id", "version"]);
    });

    it("accepts a default page template under its reserved id when the kind is given", () => {
        expect(
            validateDeclarativePublisherEntityV2(
                { ...pageTemplate, isDefault: true, id: "default.cover" },
                "pageTemplate",
            ),
        ).toEqual([]);
    });

    it.each(["document", "documentTemplate"] as const)("reports isDefault on a %s", (kind) => {
        expect(
            validateDeclarativePublisherEntityV2({ ...pageTemplate, isDefault: true }, kind),
        ).toContainEqual({
            path: "isDefault",
            message: 'Unknown key "isDefault".',
        });
    });

    it("reports a metadata key next to a given kind", () => {
        expect(
            validateDeclarativePublisherEntityV2({ ...pageTemplate, isLocked: true }, "pageTemplate"),
        ).toEqual([{ path: "isLocked", message: 'Unknown key "isLocked".' }]);
    });

    it("reports a missing id and a reference the stored shape does not have", () => {
        const { id: _, ...withoutId } = pageTemplate;

        expect(
            validateDeclarativePublisherEntityV2({ ...withoutId, ref: { identifier: "x" } }, "pageTemplate"),
        ).toEqual([
            { path: "ref", message: 'Unknown key "ref".' },
            { path: "id", message: 'Missing required key "id".' },
        ]);
    });

    it.each([
        ["an empty string", ""],
        ["an object reference", { identifier: "two_charts" }],
        ["null", null],
    ])("reports an id that is %s", (_, id) => {
        expect(validateDeclarativePublisherEntityV2({ ...pageTemplate, id }, "pageTemplate")).toEqual([
            { path: "id", message: `Expected a non-empty string, got ${JSON.stringify(id)}.` },
        ]);
    });

    it("reports content issues with the validator's paths", () => {
        const issues = validateDeclarativePublisherEntityV2(
            { ...pageTemplate, version: "3" },
            "pageTemplate",
        );

        expect(issues.map(({ path }) => path)).toEqual(["version"]);
    });
});

describe("validateDeclarativePublisherEntityWithOptionalKindV2", () => {
    it("reads the kind from the entity's own type when none is given", () => {
        expect(
            validateDeclarativePublisherEntityWithOptionalKindV2({ ...pageTemplate, type: "pageTemplate" }),
        ).toEqual([]);
    });

    it("asks for the kind when neither a kind nor a type is given", () => {
        expect(validateDeclarativePublisherEntityWithOptionalKindV2(pageTemplate)).toEqual([
            {
                path: "type",
                message:
                    'The stored shape has no "type" key; pass the kind ("document", "documentTemplate" or "pageTemplate") to the validator.',
            },
        ]);
    });

    it("still reports id issues when asking for the kind", () => {
        const issues = validateDeclarativePublisherEntityWithOptionalKindV2({
            ...pageTemplate,
            id: ".two_charts",
        });

        expect(issues.map(({ path }) => path)).toEqual(["id", "type"]);
    });

    it("accepts a default page template with its own type and flag when no kind is given", () => {
        expect(
            validateDeclarativePublisherEntityWithOptionalKindV2({
                ...pageTemplate,
                type: "pageTemplate",
                isDefault: true,
                id: "default.cover",
            }),
        ).toEqual([]);
    });

    it.each(["page_template", "nonsense"])("reports the kind %s as unknown", (kind) => {
        expect(validateDeclarativePublisherEntityWithOptionalKindV2(pageTemplate, kind)).toEqual([
            unknownKind(kind),
        ]);
    });

    it("reports a key the stored shape does not have when the kind comes from the type", () => {
        expect(
            validateDeclarativePublisherEntityWithOptionalKindV2({
                ...pageTemplate,
                type: "pageTemplate",
                created: "2020",
            }),
        ).toEqual([{ path: "created", message: 'Unknown key "created".' }]);
    });

    it("reports a type that names no kind", () => {
        expect(
            validateDeclarativePublisherEntityWithOptionalKindV2({ ...pageTemplate, type: "page_template" }),
        ).toEqual([unknownKind("page_template")]);
    });
});
