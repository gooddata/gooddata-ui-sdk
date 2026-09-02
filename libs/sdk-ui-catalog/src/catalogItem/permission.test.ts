// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { AccessGranularPermission, ISettings, IWorkspacePermissions } from "@gooddata/sdk-model";

import { canEditCatalogItem, canShareCatalogItem } from "./permission.js";
import type { ICatalogItem } from "./types.js";

const metricFlag: ISettings = { enableMetricPermissions: true };
const columnFlag: ISettings = { enableColumnLevelPermissions: true };
const bothFlags: ISettings = { enableMetricPermissions: true, enableColumnLevelPermissions: true };

function buildPermissions(overrides: Partial<IWorkspacePermissions> = {}): IWorkspacePermissions {
    return {
        canCreateVisualization: false,
        canManageProject: false,
        ...overrides,
    } as IWorkspacePermissions;
}

function buildItem(
    overrides: {
        type?: ICatalogItem["type"];
        isLocked?: boolean;
        isEditable?: boolean;
        permissions?: AccessGranularPermission[];
    } = {},
): ICatalogItem {
    return {
        identifier: "obj.id",
        type: "insight",
        visualizationType: "column",
        title: "Title",
        description: "Desc",
        tags: [],
        createdBy: "user",
        updatedBy: "user",
        createdAt: null,
        updatedAt: null,
        isLocked: false,
        isEditable: true,
        ...overrides,
    } as ICatalogItem;
}

describe("canEditCatalogItem", () => {
    it("returns false when workspace permissions are missing", () => {
        const item = buildItem();
        expect(canEditCatalogItem(undefined, item)).toBe(false);
    });

    it("returns false when item is missing", () => {
        const perms = buildPermissions();
        expect(canEditCatalogItem(perms, undefined)).toBe(false);
    });

    it("returns false when item is locked", () => {
        const perms = buildPermissions({ canManageProject: true });
        const item = buildItem({ isLocked: true });
        // locked wins even if user can manage project
        expect(canEditCatalogItem(perms, item)).toBe(false);
    });

    it("returns true for canManageProject on editable, unlocked item of any type", () => {
        const perms = buildPermissions({ canManageProject: true });
        const item = buildItem({ type: "measure" });
        expect(canEditCatalogItem(perms, item)).toBe(true);
    });

    it("returns false when item is not editable", () => {
        const perms = buildPermissions({ canCreateVisualization: true });
        const item = buildItem({ isEditable: false });
        expect(canEditCatalogItem(perms, item)).toBe(false);
    });

    it("allows edit for canCreateVisualization on insight", () => {
        const perms = buildPermissions({ canCreateVisualization: true });
        const item = buildItem({ type: "insight" });
        expect(canEditCatalogItem(perms, item)).toBe(true);
    });

    it("allows edit for canCreateVisualization on analyticalDashboard", () => {
        const perms = buildPermissions({ canCreateVisualization: true });
        const item = buildItem({ type: "analyticalDashboard" });
        expect(canEditCatalogItem(perms, item)).toBe(true);
    });

    it("disallows edit for canCreateVisualization on disallowed types", () => {
        const perms = buildPermissions({ canCreateVisualization: true });
        const disallowedTypes: ICatalogItem["type"][] = ["measure", "fact", "attribute"];

        for (const type of disallowedTypes) {
            const item = buildItem({ type });
            expect(canEditCatalogItem(perms, item)).toBe(false);
        }
    });

    it("returns false when user lacks both manage project and create visualization", () => {
        const perms = buildPermissions();
        const item = buildItem({ type: "insight" });
        expect(canEditCatalogItem(perms, item)).toBe(false);
    });

    describe("with metric permissions enabled", () => {
        it("allows edit of a metric the user has EDIT on", () => {
            const perms = buildPermissions();
            const item = buildItem({ type: "measure", permissions: ["VIEW", "EDIT"] });
            expect(canEditCatalogItem(perms, item, metricFlag)).toBe(true);
        });

        it("disallows edit of a metric the user has no EDIT on", () => {
            const perms = buildPermissions();
            const item = buildItem({ type: "measure", permissions: ["VIEW", "SHARE"] });
            expect(canEditCatalogItem(perms, item, metricFlag)).toBe(false);
        });

        it("disallows edit of a metric whose permissions were not loaded", () => {
            const perms = buildPermissions();
            const item = buildItem({ type: "measure" });
            expect(canEditCatalogItem(perms, item, metricFlag)).toBe(false);
        });

        it("keeps the metric locked state winning", () => {
            const perms = buildPermissions();
            const item = buildItem({ type: "measure", permissions: ["EDIT"], isLocked: true });
            expect(canEditCatalogItem(perms, item, metricFlag)).toBe(false);
        });

        it("leaves other types on the workspace permissions", () => {
            const perms = buildPermissions();
            const item = buildItem({ type: "fact", isEditable: true });
            expect(canEditCatalogItem(perms, item, metricFlag)).toBe(false);
        });

        it("ignores the metric own EDIT with the flag off", () => {
            const perms = buildPermissions();
            const item = buildItem({ type: "measure", permissions: ["EDIT"] });
            expect(canEditCatalogItem(perms, item)).toBe(false);
        });
    });
});

describe("canShareCatalogItem", () => {
    it("returns false when workspace permissions or the item are missing", () => {
        expect(canShareCatalogItem(undefined, buildItem({ type: "measure" }), metricFlag)).toBe(false);
        expect(canShareCatalogItem(buildPermissions(), undefined, metricFlag)).toBe(false);
    });

    it("lets an admin share a metric behind the metric flag", () => {
        const perms = buildPermissions({ canManageProject: true });
        expect(canShareCatalogItem(perms, buildItem({ type: "measure" }), metricFlag)).toBe(true);
    });

    it("lets a non-admin share a metric only through SHARE", () => {
        const perms = buildPermissions();
        expect(
            canShareCatalogItem(perms, buildItem({ type: "measure", permissions: ["SHARE"] }), metricFlag),
        ).toBe(true);
        // no hierarchy: EDIT alone does not imply SHARE
        expect(
            canShareCatalogItem(perms, buildItem({ type: "measure", permissions: ["EDIT"] }), metricFlag),
        ).toBe(false);
        expect(canShareCatalogItem(perms, buildItem({ type: "measure", permissions: [] }), metricFlag)).toBe(
            false,
        );
        expect(canShareCatalogItem(perms, buildItem({ type: "measure" }), metricFlag)).toBe(false);
    });

    it("shares no metric at all with the metric flag off, not even for an admin", () => {
        const item = buildItem({ type: "measure", permissions: ["SHARE"] });

        expect(canShareCatalogItem(buildPermissions({ canManageProject: true }), item)).toBe(false);
        expect(canShareCatalogItem(buildPermissions(), item)).toBe(false);
        expect(canShareCatalogItem(buildPermissions(), item, columnFlag)).toBe(false);
    });

    it("gates attributes and facts on the column-level flag, leaving the access list to the backend", () => {
        const perms = buildPermissions();

        expect(canShareCatalogItem(perms, buildItem({ type: "fact" }), columnFlag)).toBe(true);
        expect(canShareCatalogItem(perms, buildItem({ type: "attribute" }), columnFlag)).toBe(true);
        expect(canShareCatalogItem(perms, buildItem({ type: "fact" }))).toBe(false);
        expect(canShareCatalogItem(perms, buildItem({ type: "attribute" }))).toBe(false);
    });

    it("keeps the two flags independent", () => {
        const perms = buildPermissions({ canManageProject: true });
        const measure = buildItem({ type: "measure" });
        const attribute = buildItem({ type: "attribute" });

        expect(canShareCatalogItem(perms, measure, columnFlag)).toBe(false);
        expect(canShareCatalogItem(perms, attribute, metricFlag)).toBe(false);
        expect(canShareCatalogItem(perms, measure, bothFlags)).toBe(true);
        expect(canShareCatalogItem(perms, attribute, bothFlags)).toBe(true);
    });

    it("shares no kind that has no access list, whatever the flags", () => {
        const perms = buildPermissions({ canManageProject: true });

        expect(canShareCatalogItem(perms, buildItem({ type: "insight" }), bothFlags)).toBe(false);
        expect(canShareCatalogItem(perms, buildItem({ type: "analyticalDashboard" }), bothFlags)).toBe(false);
    });
});
