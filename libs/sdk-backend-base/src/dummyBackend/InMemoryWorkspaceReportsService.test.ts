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

    it("round-trips and deletes the brand kit", async () => {
        const service = new InMemoryWorkspaceReportsService();
        await expect(service.getBrandKit()).resolves.toBeUndefined();

        const kit = { version: "1" as const, assets: { logo: "https://cdn.example.com/logo.svg" } };
        await service.setBrandKit(kit);
        await expect(service.getBrandKit()).resolves.toEqual(kit);

        await service.deleteBrandKit();
        await expect(service.getBrandKit()).resolves.toBeUndefined();
    });

    it("stores an empty kit, refuses a foreign one and sanitizes the one it stores", async () => {
        const service = new InMemoryWorkspaceReportsService();
        await service.setBrandKit({
            version: "1",
            assets: { logo: "https://cdn.example.com/logo.svg", images: "no" },
        } as never);
        await expect(service.getBrandKit()).resolves.toEqual({
            version: "1",
            assets: { logo: "https://cdn.example.com/logo.svg" },
        });

        // A kit that carries nothing is what a workspace holds before anyone fills one in, so it
        // stores rather than throwing; only a value that is no version 1 kit at all is refused.
        await service.setBrandKit({ version: "1" });
        await expect(service.getBrandKit()).resolves.toEqual({ version: "1" });
        expect(() => service.setBrandKit({ version: "2" } as never)).toThrow(/not a valid brand kit/);
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
