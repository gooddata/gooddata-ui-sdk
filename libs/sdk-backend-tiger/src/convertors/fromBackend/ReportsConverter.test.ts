// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type {
    JsonApiReportOutWithLinks,
    JsonApiReportPageLayoutOutWithLinks,
    JsonApiReportTemplateOutWithLinks,
} from "@gooddata/api-client-tiger";
import { idRef } from "@gooddata/sdk-model";

import { convertReport, convertReportPageLayout, convertReportTemplate } from "./ReportsConverter.js";

const pageContent = { version: "1", layout: { type: "slot", slotId: "s1" }, slots: [] };
const reportContent = { version: "1", pages: [] };

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
