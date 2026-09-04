// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type AccessGranteeDetail,
    type AccessGranularPermission,
    type IGranularRulesAccess,
    idRef,
} from "@gooddata/sdk-model";

import {
    accessListToSummary,
    composeEffectiveWorkspaceAccess,
    deriveGeneralAccess,
    deriveInheritedWorkspaceLevel,
    deriveWorkspacePermissionLevel,
    draftToSummary,
    summaryToShareLevel,
} from "./accessSummary.js";
import type { IObjectAccessSummary } from "./types.js";

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

    it("is EDIT when a rule entry holds a direct EDIT over SHARE", () => {
        expect(deriveWorkspacePermissionLevel([rule(["SHARE", "VIEW"]), rule(["EDIT", "VIEW"])])).toBe(
            "EDIT",
        );
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

    it("is EDIT when a rule entry inherits EDIT over SHARE", () => {
        expect(deriveInheritedWorkspaceLevel([rule([], ["SHARE"]), rule([], ["EDIT", "VIEW"])])).toBe("EDIT");
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

    it("keeps a direct EDIT over an inherited SHARE", () => {
        expect(composeEffectiveWorkspaceAccess("WORKSPACE", "EDIT", "SHARE")).toEqual({
            generalAccess: "WORKSPACE",
            workspaceLevel: "EDIT",
        });
    });

    it("pins the level to EDIT when EDIT is inherited over a direct VIEW", () => {
        expect(composeEffectiveWorkspaceAccess("WORKSPACE", "VIEW", "EDIT")).toEqual({
            generalAccess: "WORKSPACE",
            workspaceLevel: "EDIT",
        });
    });
});

const summary = (granteeCount: number, selfIsGrantee = false): IObjectAccessSummary => ({
    generalAccess: "RESTRICTED",
    workspaceLevel: "VIEW",
    granteeCount,
    selfIsGrantee,
});

describe("summaryToShareLevel", () => {
    it("is WORKSPACE whenever the workspace rule grants access", () => {
        expect(summaryToShareLevel({ ...summary(0), generalAccess: "WORKSPACE" })).toBe("WORKSPACE");
    });

    it("is PRIVATE with no grantees", () => {
        expect(summaryToShareLevel(summary(0))).toBe("PRIVATE");
    });

    it("is PRIVATE when the caller holds the only grant", () => {
        expect(summaryToShareLevel(summary(1, true))).toBe("PRIVATE");
    });

    it("is SHARED once somebody else holds one too", () => {
        expect(summaryToShareLevel(summary(2, true))).toBe("SHARED");
    });

    it("is SHARED for someone else's grant alone", () => {
        expect(summaryToShareLevel(summary(1))).toBe("SHARED");
    });
});

describe("accessListToSummary", () => {
    const userGrant = (login: string): AccessGranteeDetail =>
        ({
            type: "granularUser",
            user: { ref: idRef(login), login, uri: `/${login}` },
            permissions: ["VIEW"],
            inheritedPermissions: [],
        }) as unknown as AccessGranteeDetail;

    it("marks the caller's own grant", () => {
        const s = accessListToSummary({ grants: [userGrant("jane"), userGrant("john")] }, idRef("jane"));
        expect(s).toMatchObject({ granteeCount: 2, selfIsGrantee: true });
        expect(summaryToShareLevel(s)).toBe("SHARED");
    });

    it("reports no self grant when the caller is unknown", () => {
        expect(accessListToSummary({ grants: [userGrant("jane")] })).toMatchObject({
            granteeCount: 1,
            selfIsGrantee: false,
        });
    });
});

describe("draftToSummary", () => {
    it("never counts the caller, who is not in their own draft", () => {
        expect(draftToSummary({ granteeEdits: {}, ruleEdit: undefined }, "RESTRICTED")).toMatchObject({
            granteeCount: 0,
            selfIsGrantee: false,
        });
    });

    it("is PRIVATE before anything is drafted — a new object starts restricted", () => {
        const s = draftToSummary({ granteeEdits: {}, ruleEdit: undefined }, "RESTRICTED");

        expect(summaryToShareLevel(s)).toBe("PRIVATE");
    });

    it("counts added grantees and falls back to the caller's starting access", () => {
        const draft = {
            granteeEdits: {
                "user:jane": {
                    kind: "added" as const,
                    grantee: {} as never,
                    pending: false,
                },
            },
            ruleEdit: undefined,
        };
        const s = draftToSummary(draft, "RESTRICTED");
        expect(s).toMatchObject({ granteeCount: 1, generalAccess: "RESTRICTED" });
        expect(summaryToShareLevel(s)).toBe("SHARED");
    });

    it("takes general access from the rule edit once it is touched", () => {
        const s = draftToSummary(
            { granteeEdits: {}, ruleEdit: { generalAccess: "WORKSPACE", level: "VIEW", pending: false } },
            "RESTRICTED",
        );
        expect(summaryToShareLevel(s)).toBe("WORKSPACE");
    });
});
