// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { removeAccessConfirmKind } from "./removeAccessConfirm.js";

type Row = Parameters<typeof removeAccessConfirmKind>[0];
type Access = Parameters<typeof removeAccessConfirmKind>[1];

const OTHER: Row = { id: "user:other", level: "VIEW" };
const SELF: Row = { id: "user:self", isSelf: true, level: "VIEW" };

const RESTRICTED: Access = {
    selfManagedGranteeId: SELF.id,
    generalAccess: "RESTRICTED",
    workspaceLevel: "VIEW",
};
const WORKSPACE_VIEW: Access = { ...RESTRICTED, generalAccess: "WORKSPACE" };

describe("removeAccessConfirmKind", () => {
    describe("another grantee", () => {
        it("warns they lose access when nothing else grants it", () => {
            expect(removeAccessConfirmKind(OTHER, RESTRICTED)).toBe("loseAccess");
            expect(removeAccessConfirmKind({ ...OTHER, level: "EDIT" }, RESTRICTED)).toBe("loseAccess");
        });

        it("says parent workspace access stays, whatever its level", () => {
            const covered: Row = { ...OTHER, level: "EDIT", inheritedLevel: "EDIT" };
            const lower: Row = { ...OTHER, level: "EDIT", inheritedLevel: "VIEW" };

            expect(removeAccessConfirmKind(covered, RESTRICTED)).toBe("inheritedStays");
            expect(removeAccessConfirmKind(lower, RESTRICTED)).toBe("inheritedStays");
            expect(removeAccessConfirmKind(lower, WORKSPACE_VIEW)).toBe("inheritedStays");
        });

        it("says workspace-wide access stays while general access is all workspace members", () => {
            expect(removeAccessConfirmKind(OTHER, WORKSPACE_VIEW)).toBe("workspaceStays");
        });
    });

    describe("the caller's own self-managed row", () => {
        it("warns they lose access when nothing else grants it", () => {
            expect(removeAccessConfirmKind(SELF, RESTRICTED)).toBe("selfLoseAccess");
            expect(removeAccessConfirmKind({ ...SELF, level: "SHARE" }, RESTRICTED)).toBe("selfLoseAccess");
        });

        it("adds the edit warning for a caller who holds edit", () => {
            expect(removeAccessConfirmKind({ ...SELF, level: "EDIT" }, RESTRICTED)).toBe(
                "selfLoseEditAccess",
            );
        });

        it("warns of a restriction when the access kept is lower", () => {
            const inheritedLower: Row = { ...SELF, level: "EDIT", inheritedLevel: "VIEW" };

            expect(removeAccessConfirmKind(inheritedLower, RESTRICTED)).toBe("selfRestrict");
            expect(removeAccessConfirmKind({ ...SELF, level: "EDIT" }, WORKSPACE_VIEW)).toBe("selfRestrict");
        });

        it("says which access stays when it keeps at least the same level", () => {
            const inheritedSame: Row = { ...SELF, level: "EDIT", inheritedLevel: "EDIT" };
            const workspaceEdit: Access = { ...WORKSPACE_VIEW, workspaceLevel: "EDIT" };

            expect(removeAccessConfirmKind(inheritedSame, RESTRICTED)).toBe("inheritedStays");
            expect(removeAccessConfirmKind(SELF, WORKSPACE_VIEW)).toBe("workspaceStays");
            expect(removeAccessConfirmKind({ ...SELF, level: "SHARE" }, workspaceEdit)).toBe(
                "workspaceStays",
            );
        });
    });

    it("asks nothing for the caller's own row when the role gives them access", () => {
        const manager: Access = { ...RESTRICTED, selfManagedGranteeId: undefined };

        expect(removeAccessConfirmKind(SELF, manager)).toBeUndefined();
        expect(removeAccessConfirmKind(OTHER, manager)).toBe("loseAccess");
    });
});
