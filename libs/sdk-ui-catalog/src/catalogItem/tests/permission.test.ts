// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IWorkspacePermissions } from "@gooddata/sdk-model";

import { canEditCatalogItem } from "../permission.js";
import type { ICatalogItem } from "../types.js";

function buildPermissions(overrides: Partial<IWorkspacePermissions> = {}): IWorkspacePermissions {
    return {
        canCreateVisualization: false,
        canManageProject: false,
        ...overrides,
    } as IWorkspacePermissions;
}

function buildItem(overrides: Partial<ICatalogItem> = {}): ICatalogItem {
    return {
        identifier: "obj.id",
        type: "insight",
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
    };
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
});
