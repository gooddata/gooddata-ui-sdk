// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type {
    JsonApiReportOutWithLinks,
    JsonApiReportPageLayoutOutWithLinks,
    JsonApiReportTemplateOutWithLinks,
    JsonApiUserIdentifierOutWithLinks,
} from "@gooddata/api-client-tiger";
import { idRef } from "@gooddata/sdk-model";

import {
    convertPublisherDocument,
    convertPublisherDocumentTemplate,
    convertPublisherPageLayout,
} from "./PublisherConverter.js";

const pageContent = { version: "1", layout: { type: "slot", slotId: "s1" }, slots: [] };
const documentContent = { version: "1", pages: [] };

const auditAttributes = { createdAt: "2026-01-02 03:04:05", modifiedAt: "2026-02-03 04:05:06" };
const auditRelationships = {
    createdBy: { data: { id: "author", type: "userIdentifier" } },
    modifiedBy: { data: { id: "editor", type: "userIdentifier" } },
};
const auditIncluded = [
    {
        id: "author",
        type: "userIdentifier",
        attributes: { firstname: "Ada", lastname: "Lovelace", email: "ada@example.com" },
    },
    {
        id: "editor",
        type: "userIdentifier",
        attributes: { firstname: "Grace", lastname: "Hopper", email: "grace@example.com" },
    },
] as unknown as JsonApiUserIdentifierOutWithLinks[];

const expectedCreatedBy = {
    ref: idRef("author"),
    login: "author",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
};
const expectedUpdatedBy = {
    ref: idRef("editor"),
    login: "editor",
    firstName: "Grace",
    lastName: "Hopper",
    email: "grace@example.com",
};

describe("convertPublisherPageLayout", () => {
    it("converts a native layout", () => {
        const entity = {
            id: "layout1",
            type: "reportPageLayout",
            attributes: {
                title: "Cover",
                description: "The cover",
                tags: ["brand"],
                content: pageContent,
            },
        } as unknown as JsonApiReportPageLayoutOutWithLinks;

        expect(convertPublisherPageLayout(entity)).toEqual({
            type: "reportPageLayout",
            ref: idRef("layout1", "reportPageLayout"),
            title: "Cover",
            description: "The cover",
            tags: ["brand"],
            content: pageContent,
            isLocked: false,
        });
    });

    it("locks a layout inherited from a parent workspace", () => {
        const entity = {
            id: "layout1",
            type: "reportPageLayout",
            meta: { origin: { originType: "PARENT", originId: "parent" } },
            attributes: { title: "Cover", content: pageContent },
        } as unknown as JsonApiReportPageLayoutOutWithLinks;

        expect(convertPublisherPageLayout(entity).isLocked).toBe(true);
    });
});

describe("convertPublisherDocumentTemplate", () => {
    it("converts a template", () => {
        const entity = {
            id: "template1",
            type: "reportTemplate",
            attributes: { title: "Quarterly", content: documentContent },
        } as unknown as JsonApiReportTemplateOutWithLinks;

        expect(convertPublisherDocumentTemplate(entity)).toEqual({
            type: "reportTemplate",
            ref: idRef("template1", "reportTemplate"),
            title: "Quarterly",
            description: undefined,
            tags: undefined,
            content: documentContent,
            isLocked: false,
        });
    });
});

describe("convertPublisherDocument", () => {
    it("converts a document with its period and variable values", () => {
        const entity = {
            id: "report1",
            type: "report",
            attributes: {
                title: "Q1",
                periodStart: "2026-01-01",
                periodEnd: "2026-03-31",
                content: documentContent,
                variableValues: { brand: "Levi's" },
            },
        } as unknown as JsonApiReportOutWithLinks;

        expect(convertPublisherDocument(entity)).toEqual({
            type: "report",
            ref: idRef("report1", "report"),
            title: "Q1",
            description: undefined,
            tags: undefined,
            periodStart: "2026-01-01",
            periodEnd: "2026-03-31",
            content: documentContent,
            variableValues: { brand: "Levi's" },
            isLocked: false,
        });
    });

    it("drops a null variableValues so the model keeps the field optional", () => {
        const entity = {
            id: "report1",
            type: "report",
            attributes: {
                title: "Q1",
                periodStart: "2026-01-01",
                periodEnd: "2026-03-31",
                content: documentContent,
                variableValues: null,
            },
        } as unknown as JsonApiReportOutWithLinks;

        expect(convertPublisherDocument(entity).variableValues).toBeUndefined();
    });
});

describe("publisher audit fields", () => {
    const layout = {
        id: "layout1",
        type: "reportPageLayout",
        attributes: { title: "Cover", content: pageContent, ...auditAttributes },
        relationships: auditRelationships,
    } as unknown as JsonApiReportPageLayoutOutWithLinks;

    const template = {
        id: "template1",
        type: "reportTemplate",
        attributes: { title: "Quarterly", content: documentContent, ...auditAttributes },
        relationships: auditRelationships,
    } as unknown as JsonApiReportTemplateOutWithLinks;

    const publisherDocument = {
        id: "report1",
        type: "report",
        attributes: {
            title: "Q1",
            periodStart: "2026-01-01",
            periodEnd: "2026-03-31",
            content: documentContent,
            ...auditAttributes,
        },
        relationships: auditRelationships,
    } as unknown as JsonApiReportOutWithLinks;

    it.each([
        ["page layout", () => convertPublisherPageLayout(layout, auditIncluded)],
        ["template", () => convertPublisherDocumentTemplate(template, auditIncluded)],
        ["document", () => convertPublisherDocument(publisherDocument, auditIncluded)],
    ])("resolves the audit dates and users of a %s", (_name, convert) => {
        expect(convert()).toMatchObject({
            created: "2026-01-02 03:04:05",
            updated: "2026-02-03 04:05:06",
            createdBy: expectedCreatedBy,
            updatedBy: expectedUpdatedBy,
        });
    });

    it.each([
        ["page layout", () => convertPublisherPageLayout(layout)],
        ["template", () => convertPublisherDocumentTemplate(template)],
        ["document", () => convertPublisherDocument(publisherDocument)],
    ])("leaves the users of a %s undefined when the include was omitted", (_name, convert) => {
        const converted = convert();
        expect(converted.createdBy).toBeUndefined();
        expect(converted.updatedBy).toBeUndefined();
        expect(converted.created).toBe("2026-01-02 03:04:05");
    });

    it("drops null audit dates so the model keeps the fields optional", () => {
        const entity = {
            id: "report1",
            type: "report",
            attributes: {
                title: "Q1",
                periodStart: "2026-01-01",
                periodEnd: "2026-03-31",
                content: documentContent,
                createdAt: null,
                modifiedAt: null,
            },
        } as unknown as JsonApiReportOutWithLinks;

        const converted = convertPublisherDocument(entity);
        expect(converted.created).toBeUndefined();
        expect(converted.updated).toBeUndefined();
    });
});
