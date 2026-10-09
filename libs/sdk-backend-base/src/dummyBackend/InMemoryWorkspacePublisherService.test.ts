// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { BuiltInPublisherPageLayouts, idRef, newAdHocPublisherDocumentDefinition } from "@gooddata/sdk-model";

import { InMemoryWorkspacePublisherService } from "./InMemoryWorkspacePublisherService.js";

describe("InMemoryWorkspacePublisherService", () => {
    it("serves built-in pages", async () => {
        const service = new InMemoryWorkspacePublisherService();

        const pages = await service.getPageLayouts();

        expect(pages).toHaveLength(BuiltInPublisherPageLayouts.length);
        expect(pages.every((page) => page.isBuiltIn)).toBe(true);
        await expect(service.getPageLayout(BuiltInPublisherPageLayouts[0]!.ref)).resolves.toBe(
            BuiltInPublisherPageLayouts[0],
        );
    });

    it("rejects update and delete of built-in pages", async () => {
        const service = new InMemoryWorkspacePublisherService();
        const builtIn = BuiltInPublisherPageLayouts[0]!;

        expect(() => service.deletePageLayout(builtIn.ref)).toThrow(/built-in/);
        expect(() => service.updatePageLayout(builtIn)).toThrow(/built-in/);
    });

    it("round-trips a custom page", async () => {
        const service = new InMemoryWorkspacePublisherService();

        const created = await service.createPageLayout({
            type: "reportPageLayout",
            title: "Custom",
            content: { version: "1", layout: { type: "slotRef", slotId: "a" }, slots: [] },
        });
        expect(created.ref).toBeDefined();

        const pages = await service.getPageLayouts();
        expect(pages).toHaveLength(BuiltInPublisherPageLayouts.length + 1);

        await service.deletePageLayout(created.ref);
        await expect(service.getPageLayouts()).resolves.toHaveLength(BuiltInPublisherPageLayouts.length);
    });

    it("round-trips templates and documents", async () => {
        const service = new InMemoryWorkspacePublisherService();

        const template = await service.createDocumentTemplate({
            type: "reportTemplate",
            title: "Template",
            content: { version: "1", pages: [] },
        });
        const publisherDocument = await service.createDocument(
            newAdHocPublisherDocumentDefinition({
                title: "Report",
                periodStart: "2026-01-01",
                periodEnd: "2026-03-31",
            }),
        );

        await expect(service.getDocumentTemplate(template.ref)).resolves.toEqual(template);
        await expect(service.getDocument(publisherDocument.ref)).resolves.toEqual(publisherDocument);

        await service.deleteDocumentTemplate(template.ref);
        await service.deleteDocument(publisherDocument.ref);
        await expect(service.getDocumentTemplates()).resolves.toEqual([]);
        await expect(service.getDocuments()).resolves.toEqual([]);
    });

    it("resolves typed and untyped identifier refs to the same object", async () => {
        const service = new InMemoryWorkspacePublisherService();

        const created = await service.createDocument(
            newAdHocPublisherDocumentDefinition({
                title: "Report",
                periodStart: "2026-01-01",
                periodEnd: "2026-03-31",
            }),
        );
        const untypedRef = idRef((created.ref as { identifier: string }).identifier);

        await expect(service.getDocument(untypedRef)).resolves.toEqual(created);
        await service.deleteDocument(untypedRef);
        expect(() => service.getDocument(created.ref)).toThrow(/does not exist/);
    });

    it("rejects creating an object whose ref already exists", async () => {
        const service = new InMemoryWorkspacePublisherService();

        const definition = newAdHocPublisherDocumentDefinition({
            title: "Report",
            periodStart: "2026-01-01",
            periodEnd: "2026-03-31",
        });
        const created = await service.createDocument(definition);

        expect(() => service.createDocument({ ...definition, ref: created.ref })).toThrow(/already exists/);
        expect(() =>
            service.createPageLayout({
                type: "reportPageLayout",
                title: "Clash",
                ref: BuiltInPublisherPageLayouts[0]!.ref,
                content: { version: "1", layout: { type: "slotRef", slotId: "a" }, slots: [] },
            }),
        ).toThrow(/built-in/);
    });

    it("detaches stored state from caller-held objects", async () => {
        const service = new InMemoryWorkspacePublisherService();

        const definition = newAdHocPublisherDocumentDefinition({
            title: "Report",
            periodStart: "2026-01-01",
            periodEnd: "2026-03-31",
        });
        const created = await service.createDocument(definition);

        created.content.pages.push({
            localIdentifier: "mutated",
            layout: { type: "slotRef", slotId: "a" },
            slots: [],
        });

        const fetched = await service.getDocument(created.ref);
        expect(fetched.content.pages).toEqual([]);
    });

    it("throws on unknown refs and locked objects", async () => {
        const service = new InMemoryWorkspacePublisherService();

        expect(() => service.getDocument(idRef("missing"))).toThrow(/does not exist/);

        const created = await service.createDocument(
            newAdHocPublisherDocumentDefinition({
                title: "Locked",
                periodStart: "2026-01-01",
                periodEnd: "2026-01-31",
            }),
        );
        await service.updateDocument({ ...created, isLocked: true });
        expect(() => service.deleteDocument(created.ref)).toThrow(/locked/);
    });
});
