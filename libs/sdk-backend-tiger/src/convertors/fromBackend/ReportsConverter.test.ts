// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type {
    JsonApiReportOutWithLinks,
    JsonApiReportPageLayoutOutWithLinks,
    JsonApiReportTemplateOutWithLinks,
    JsonApiUserIdentifierOutWithLinks,
} from "@gooddata/api-client-tiger";
import { idRef } from "@gooddata/sdk-model";

import { convertReport, convertReportPageLayout, convertReportTemplate } from "./ReportsConverter.js";

const pageContent = { version: "1", layout: { type: "slot", slotId: "s1" }, slots: [] };
const reportContent = { version: "1", pages: [] };

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

describe("convertReportPageLayout", () => {
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

        expect(convertReportPageLayout(entity)).toEqual({
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

        expect(convertReportPageLayout(entity).isLocked).toBe(true);
    });
});

describe("convertReportTemplate", () => {
    it("converts a template", () => {
        const entity = {
            id: "template1",
            type: "reportTemplate",
            attributes: { title: "Quarterly", content: reportContent },
        } as unknown as JsonApiReportTemplateOutWithLinks;

        expect(convertReportTemplate(entity)).toEqual({
            type: "reportTemplate",
            ref: idRef("template1", "reportTemplate"),
            title: "Quarterly",
            description: undefined,
            tags: undefined,
            content: reportContent,
            isLocked: false,
        });
    });
});

describe("convertReport", () => {
    it("converts a report with its period and variable values", () => {
        const entity = {
            id: "report1",
            type: "report",
            attributes: {
                title: "Q1",
                periodStart: "2026-01-01",
                periodEnd: "2026-03-31",
                content: reportContent,
                variableValues: { brand: "Levi's" },
            },
        } as unknown as JsonApiReportOutWithLinks;

        expect(convertReport(entity)).toEqual({
            type: "report",
            ref: idRef("report1", "report"),
            title: "Q1",
            description: undefined,
            tags: undefined,
            periodStart: "2026-01-01",
            periodEnd: "2026-03-31",
            content: reportContent,
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
                content: reportContent,
                variableValues: null,
            },
        } as unknown as JsonApiReportOutWithLinks;

        expect(convertReport(entity).variableValues).toBeUndefined();
    });
});

describe("report audit fields", () => {
    const layout = {
        id: "layout1",
        type: "reportPageLayout",
        attributes: { title: "Cover", content: pageContent, ...auditAttributes },
        relationships: auditRelationships,
    } as unknown as JsonApiReportPageLayoutOutWithLinks;

    const template = {
        id: "template1",
        type: "reportTemplate",
        attributes: { title: "Quarterly", content: reportContent, ...auditAttributes },
        relationships: auditRelationships,
    } as unknown as JsonApiReportTemplateOutWithLinks;

    const report = {
        id: "report1",
        type: "report",
        attributes: {
            title: "Q1",
            periodStart: "2026-01-01",
            periodEnd: "2026-03-31",
            content: reportContent,
            ...auditAttributes,
        },
        relationships: auditRelationships,
    } as unknown as JsonApiReportOutWithLinks;

    it.each([
        ["page layout", () => convertReportPageLayout(layout, auditIncluded)],
        ["template", () => convertReportTemplate(template, auditIncluded)],
        ["report", () => convertReport(report, auditIncluded)],
    ])("resolves the audit dates and users of a %s", (_name, convert) => {
        expect(convert()).toMatchObject({
            created: "2026-01-02 03:04:05",
            updated: "2026-02-03 04:05:06",
            createdBy: expectedCreatedBy,
            updatedBy: expectedUpdatedBy,
        });
    });

    it.each([
        ["page layout", () => convertReportPageLayout(layout)],
        ["template", () => convertReportTemplate(template)],
        ["report", () => convertReport(report)],
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
                content: reportContent,
                createdAt: null,
                modifiedAt: null,
            },
        } as unknown as JsonApiReportOutWithLinks;

        const converted = convertReport(entity);
        expect(converted.created).toBeUndefined();
        expect(converted.updated).toBeUndefined();
    });
});
