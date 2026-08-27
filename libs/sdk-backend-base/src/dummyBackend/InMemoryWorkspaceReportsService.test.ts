// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { BuiltInReportPageLayouts, idRef, newAdHocReportDefinition } from "@gooddata/sdk-model";

import { InMemoryWorkspaceReportsService } from "./InMemoryWorkspaceReportsService.js";

describe("InMemoryWorkspaceReportsService", () => {
    it("serves built-in pages", async () => {
        const service = new InMemoryWorkspaceReportsService();

        const pages = await service.getReportPageLayouts();

        expect(pages).toHaveLength(BuiltInReportPageLayouts.length);
        expect(pages.every((page) => page.isBuiltIn)).toBe(true);
        await expect(service.getReportPageLayout(BuiltInReportPageLayouts[0]!.ref)).resolves.toBe(
            BuiltInReportPageLayouts[0],
        );
    });

    it("rejects update and delete of built-in pages", async () => {
        const service = new InMemoryWorkspaceReportsService();
        const builtIn = BuiltInReportPageLayouts[0]!;

        expect(() => service.deleteReportPageLayout(builtIn.ref)).toThrow(/built-in/);
        expect(() => service.updateReportPageLayout(builtIn)).toThrow(/built-in/);
    });

    it("round-trips a custom page", async () => {
        const service = new InMemoryWorkspaceReportsService();

        const created = await service.createReportPageLayout({
            type: "reportPageLayout",
            title: "Custom",
            content: { version: "1", layout: { type: "slotRef", slotId: "a" }, slots: [] },
        });
        expect(created.ref).toBeDefined();

        const pages = await service.getReportPageLayouts();
        expect(pages).toHaveLength(BuiltInReportPageLayouts.length + 1);

        await service.deleteReportPageLayout(created.ref);
        await expect(service.getReportPageLayouts()).resolves.toHaveLength(BuiltInReportPageLayouts.length);
    });

    it("round-trips templates and reports", async () => {
        const service = new InMemoryWorkspaceReportsService();

        const template = await service.createReportTemplate({
            type: "reportTemplate",
            title: "Template",
            content: { version: "1", pages: [] },
        });
        const report = await service.createReport(
            newAdHocReportDefinition({
                title: "Report",
                periodStart: "2026-01-01",
                periodEnd: "2026-03-31",
            }),
        );

        await expect(service.getReportTemplate(template.ref)).resolves.toEqual(template);
        await expect(service.getReport(report.ref)).resolves.toEqual(report);

        await service.deleteReportTemplate(template.ref);
        await service.deleteReport(report.ref);
        await expect(service.getReportTemplates()).resolves.toEqual([]);
        await expect(service.getReports()).resolves.toEqual([]);
    });

    it("resolves typed and untyped identifier refs to the same object", async () => {
        const service = new InMemoryWorkspaceReportsService();

        const created = await service.createReport(
            newAdHocReportDefinition({
                title: "Report",
                periodStart: "2026-01-01",
                periodEnd: "2026-03-31",
            }),
        );
        const untypedRef = idRef((created.ref as { identifier: string }).identifier);

        await expect(service.getReport(untypedRef)).resolves.toEqual(created);
        await service.deleteReport(untypedRef);
        expect(() => service.getReport(created.ref)).toThrow(/does not exist/);
    });

    it("rejects creating an object whose ref already exists", async () => {
        const service = new InMemoryWorkspaceReportsService();

        const definition = newAdHocReportDefinition({
            title: "Report",
            periodStart: "2026-01-01",
            periodEnd: "2026-03-31",
        });
        const created = await service.createReport(definition);

        expect(() => service.createReport({ ...definition, ref: created.ref })).toThrow(/already exists/);
        expect(() =>
            service.createReportPageLayout({
                type: "reportPageLayout",
                title: "Clash",
                ref: BuiltInReportPageLayouts[0]!.ref,
                content: { version: "1", layout: { type: "slotRef", slotId: "a" }, slots: [] },
            }),
        ).toThrow(/built-in/);
    });

    it("detaches stored state from caller-held objects", async () => {
        const service = new InMemoryWorkspaceReportsService();

        const definition = newAdHocReportDefinition({
            title: "Report",
            periodStart: "2026-01-01",
            periodEnd: "2026-03-31",
        });
        const created = await service.createReport(definition);

        created.content.pages.push({
            localIdentifier: "mutated",
            layout: { type: "slotRef", slotId: "a" },
            slots: [],
        });

        const fetched = await service.getReport(created.ref);
        expect(fetched.content.pages).toEqual([]);
    });

    it("rehydrates state from the persistence hook and saves after mutations", async () => {
        let stored: string | null = null;
        const persistence = {
            load: () => stored,
            save: (value: string) => {
                stored = value;
            },
        };

        const service = new InMemoryWorkspaceReportsService(persistence);
        const created = await service.createReport(
            newAdHocReportDefinition({
                title: "Persisted",
                periodStart: "2026-01-01",
                periodEnd: "2026-03-31",
            }),
        );
        expect(stored).not.toBeNull();

        const rehydrated = new InMemoryWorkspaceReportsService(persistence);
        await expect(rehydrated.getReport(created.ref)).resolves.toEqual(created);

        await rehydrated.deleteReport(created.ref);
        const afterDelete = new InMemoryWorkspaceReportsService(persistence);
        expect(() => afterDelete.getReport(created.ref)).toThrow(/does not exist/);
    });

    it("reads persisted state through on every operation", async () => {
        let stored: string | null = null;
        const persistence = {
            load: () => stored,
            save: (value: string) => {
                stored = value;
            },
        };

        const first = new InMemoryWorkspaceReportsService(persistence);
        const second = new InMemoryWorkspaceReportsService(persistence);

        const fromFirst = await first.createReport(
            newAdHocReportDefinition({ title: "A", periodStart: "2026-01-01", periodEnd: "2026-01-31" }),
        );
        const fromSecond = await second.createReport(
            newAdHocReportDefinition({ title: "B", periodStart: "2026-01-01", periodEnd: "2026-01-31" }),
        );

        const titles = (await first.getReports()).map((report) => report.title);
        expect(titles).toEqual(expect.arrayContaining(["A", "B"]));
        expect(fromFirst.ref).not.toEqual(fromSecond.ref);
    });

    it("keeps working when the storage throws", async () => {
        const service = new InMemoryWorkspaceReportsService({
            load: () => {
                throw new Error("storage blocked");
            },
            save: () => {
                throw new Error("quota exceeded");
            },
        });

        const created = await service.createReport(
            newAdHocReportDefinition({
                title: "Report",
                periodStart: "2026-01-01",
                periodEnd: "2026-01-31",
            }),
        );
        await expect(service.getReport(created.ref)).resolves.toEqual(created);
    });

    it("keeps mutations after a save failure instead of losing them to read-through", async () => {
        const service = new InMemoryWorkspaceReportsService({
            load: () => null,
            save: () => {
                throw new Error("quota exceeded");
            },
        });

        const created = await service.createReport(
            newAdHocReportDefinition({
                title: "Report",
                periodStart: "2026-01-01",
                periodEnd: "2026-01-31",
            }),
        );

        await expect(service.getReport(created.ref)).resolves.toEqual(created);
        await expect(service.getReports()).resolves.toHaveLength(1);
    });

    it("ignores persisted state of an unexpected shape", async () => {
        const service = new InMemoryWorkspaceReportsService({
            load: () => JSON.stringify({ pageLayouts: {}, reports: 42 }),
            save: () => {},
        });

        await expect(service.getReports()).resolves.toEqual([]);
        await expect(service.getReportPageLayouts()).resolves.toHaveLength(BuiltInReportPageLayouts.length);
    });

    it("keeps current state when a persisted entry is malformed", async () => {
        let stored: string | null = null;
        const persistence = {
            load: () => stored,
            save: (value: string) => {
                stored = value;
            },
        };
        const service = new InMemoryWorkspaceReportsService(persistence);
        const created = await service.createReport(
            newAdHocReportDefinition({
                title: "Report",
                periodStart: "2026-01-01",
                periodEnd: "2026-01-31",
            }),
        );

        stored = JSON.stringify({ pageLayouts: [], templates: [], reports: [{}] });

        await expect(service.getReport(created.ref)).resolves.toEqual(created);
    });

    it("starts empty on corrupted persisted state", () => {
        const service = new InMemoryWorkspaceReportsService({
            load: () => "not-json{",
            save: () => {},
        });
        expect(() => service.getReport(idRef("missing"))).toThrow(/does not exist/);
    });

    it("throws on unknown refs and locked objects", async () => {
        const service = new InMemoryWorkspaceReportsService();

        expect(() => service.getReport(idRef("missing"))).toThrow(/does not exist/);

        const created = await service.createReport(
            newAdHocReportDefinition({
                title: "Locked",
                periodStart: "2026-01-01",
                periodEnd: "2026-01-31",
            }),
        );
        await service.updateReport({ ...created, isLocked: true });
        expect(() => service.deleteReport(created.ref)).toThrow(/locked/);
    });
});
