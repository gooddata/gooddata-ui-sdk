// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type AccessGranularPermission } from "../accessControl/index.js";

import { type IWorkspacePermissions } from "./index.js";
import { canEditVisualization, canShareVisualization } from "./visualization.js";

const admin = { canManageProject: true, canCreateVisualization: true } as IWorkspacePermissions;
const analyst = { canManageProject: false, canCreateVisualization: true } as IWorkspacePermissions;
const nonAdmin = { canManageProject: false, canCreateVisualization: false } as IWorkspacePermissions;

const ALL: (AccessGranularPermission[] | undefined)[] = [
    undefined,
    [],
    ["VIEW"],
    ["SHARE"],
    ["EDIT"],
    ["VIEW", "SHARE", "EDIT"],
];

describe("canEditVisualization", () => {
    it.each(ALL.map((p) => [p]))(
        "with the flag off lets the workspace role decide, not the visualization's permissions (%j)",
        (visualizationPermissions) => {
            expect(canEditVisualization(visualizationPermissions, admin, false)).toBe(true);
            expect(canEditVisualization(visualizationPermissions, analyst, false)).toBe(true);
            expect(canEditVisualization(visualizationPermissions, nonAdmin, false)).toBe(false);
        },
    );

    it.each(ALL.map((p) => [p]))(
        "with the flag on keeps the admin editing (%j)",
        (visualizationPermissions) => {
            expect(canEditVisualization(visualizationPermissions, admin, true)).toBe(true);
        },
    );

    it("with the flag on grants a non-admin edit only through EDIT", () => {
        expect(canEditVisualization(["EDIT"], nonAdmin, true)).toBe(true);
        expect(canEditVisualization(["VIEW", "SHARE", "EDIT"], nonAdmin, true)).toBe(true);

        expect(canEditVisualization(["SHARE"], nonAdmin, true)).toBe(false);
        expect(canEditVisualization(["VIEW"], nonAdmin, true)).toBe(false);
        expect(canEditVisualization([], nonAdmin, true)).toBe(false);
        expect(canEditVisualization(undefined, nonAdmin, true)).toBe(false);
    });

    it("with the flag on the workspace role no longer decides", () => {
        expect(canEditVisualization(["VIEW"], analyst, true)).toBe(false);
        expect(canEditVisualization(undefined, analyst, true)).toBe(false);
    });
});

describe("canShareVisualization", () => {
    it.each(ALL.map((p) => [p]))("stays off entirely with the flag off (%j)", (visualizationPermissions) => {
        expect(canShareVisualization(visualizationPermissions, admin, false)).toBe(false);
        expect(canShareVisualization(visualizationPermissions, nonAdmin, false)).toBe(false);
    });

    it.each(ALL.map((p) => [p]))(
        "with the flag on keeps the admin sharing (%j)",
        (visualizationPermissions) => {
            expect(canShareVisualization(visualizationPermissions, admin, true)).toBe(true);
        },
    );

    it("with the flag on grants a non-admin share only through SHARE", () => {
        expect(canShareVisualization(["SHARE"], nonAdmin, true)).toBe(true);

        // no hierarchy: EDIT alone does not imply SHARE
        expect(canShareVisualization(["EDIT"], nonAdmin, true)).toBe(false);
        expect(canShareVisualization(["VIEW"], nonAdmin, true)).toBe(false);
        expect(canShareVisualization([], nonAdmin, true)).toBe(false);
        expect(canShareVisualization(undefined, nonAdmin, true)).toBe(false);
    });
});
