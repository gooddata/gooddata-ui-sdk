// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { AccessGranularPermission, IGranularRulesAccess } from "@gooddata/sdk-model";

import {
    composeEffectiveWorkspaceAccess,
    deriveGeneralAccess,
    deriveInheritedWorkspaceLevel,
    deriveWorkspacePermissionLevel,
} from "../accessSummary.js";

const rule = (
    permissions: AccessGranularPermission[],
    inheritedPermissions: AccessGranularPermission[] = [],
): IGranularRulesAccess => ({ type: "allWorkspaceUsers", permissions, inheritedPermissions });

describe("deriveGeneralAccess", () => {
    it("is RESTRICTED without any allWorkspaceUsers rule", () => {
        expect(deriveGeneralAccess([])).toBe("RESTRICTED");
    });

    it("is WORKSPACE when the rule holds a direct permission", () => {
        expect(deriveGeneralAccess([rule(["VIEW"])])).toBe("WORKSPACE");
    });

    it("is RESTRICTED when the rule holds inherited permissions only", () => {
        expect(deriveGeneralAccess([rule([], ["VIEW"])])).toBe("RESTRICTED");
    });

    it("finds a direct grant in any rule entry when the hierarchy returns several", () => {
        // With workspace hierarchy the backend returns one allWorkspaceUsers entry per
        // granting workspace — a parent's inherited-only entry must not shadow this
        // workspace's own grant.
        expect(deriveGeneralAccess([rule([], ["VIEW"]), rule(["VIEW"])])).toBe("WORKSPACE");
    });
});

describe("deriveWorkspacePermissionLevel", () => {
    it("is VIEW when the direct rule holds VIEW only", () => {
        expect(deriveWorkspacePermissionLevel([rule(["VIEW"])])).toBe("VIEW");
    });

    it("is SHARE when any rule entry holds a direct SHARE", () => {
        expect(deriveWorkspacePermissionLevel([rule([], ["VIEW"]), rule(["SHARE", "VIEW"])])).toBe("SHARE");
    });
});

describe("deriveInheritedWorkspaceLevel", () => {
    it("is undefined without any rule", () => {
        expect(deriveInheritedWorkspaceLevel([])).toBeUndefined();
    });

    it("is undefined when the rule holds direct permissions only", () => {
        expect(deriveInheritedWorkspaceLevel([rule(["VIEW"])])).toBeUndefined();
    });

    it("is VIEW when a rule entry inherits VIEW", () => {
        expect(deriveInheritedWorkspaceLevel([rule([], ["VIEW"])])).toBe("VIEW");
    });

    it("is SHARE when any rule entry inherits SHARE", () => {
        expect(deriveInheritedWorkspaceLevel([rule(["VIEW"]), rule([], ["SHARE", "VIEW"])])).toBe("SHARE");
    });
});

describe("composeEffectiveWorkspaceAccess", () => {
    it("stays RESTRICTED/VIEW without direct or inherited access", () => {
        expect(composeEffectiveWorkspaceAccess("RESTRICTED", "VIEW", undefined)).toEqual({
            generalAccess: "RESTRICTED",
            workspaceLevel: "VIEW",
        });
    });

    it("passes the direct grant through when nothing is inherited", () => {
        expect(composeEffectiveWorkspaceAccess("WORKSPACE", "SHARE", undefined)).toEqual({
            generalAccess: "WORKSPACE",
            workspaceLevel: "SHARE",
        });
    });

    it("is WORKSPACE when access is inherited only", () => {
        expect(composeEffectiveWorkspaceAccess("RESTRICTED", "VIEW", "VIEW")).toEqual({
            generalAccess: "WORKSPACE",
            workspaceLevel: "VIEW",
        });
    });

    it("pins the level to SHARE when SHARE is inherited over a direct VIEW", () => {
        expect(composeEffectiveWorkspaceAccess("WORKSPACE", "VIEW", "SHARE")).toEqual({
            generalAccess: "WORKSPACE",
            workspaceLevel: "SHARE",
        });
    });

    it("keeps a direct SHARE over an inherited VIEW", () => {
        expect(composeEffectiveWorkspaceAccess("WORKSPACE", "SHARE", "VIEW")).toEqual({
            generalAccess: "WORKSPACE",
            workspaceLevel: "SHARE",
        });
    });
});
