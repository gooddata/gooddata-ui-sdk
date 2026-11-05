// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IWorkspacePermissions, idRef } from "@gooddata/sdk-model";

import { canManageInsightAccess, canShareInsight, insightAccessTarget } from "./insight_access_selector.js";

const admin = { canManageProject: true, canAnalyzeWorkspace: true } as IWorkspacePermissions;
const analyst = { canManageProject: false, canAnalyzeWorkspace: true } as IWorkspacePermissions;
const target = { kind: "insight", ref: idRef("bars", "insight") } as const;

describe("insightAccessTarget", () => {
    it("addresses a saved visualization by its identifier", () => {
        expect(insightAccessTarget.resultFunc(true, "bars")).toEqual(target);
    });

    it("has nothing to address before the visualization exists", () => {
        expect(insightAccessTarget.resultFunc(false, undefined)).toBeUndefined();
    });
});

describe("canShareInsight", () => {
    const canShare = canShareInsight.resultFunc;

    it("follows the visualization's own SHARE for a saved one", () => {
        expect(canShare(true, target, ["VIEW", "EDIT", "SHARE"], analyst, true)).toBe(true);
        expect(canShare(true, target, ["VIEW", "EDIT"], analyst, true)).toBe(false);
        expect(canShare(true, target, undefined, admin, true)).toBe(true);
    });

    it("lets whoever may create it draft the access of an unsaved one", () => {
        expect(canShare(true, undefined, undefined, analyst, true)).toBe(true);
        expect(canShare(true, undefined, undefined, analyst, false)).toBe(false);
    });

    it("is off until the workspace permissions are loaded", () => {
        expect(canShare(true, undefined, undefined, null, true)).toBe(false);
    });
});

describe("canManageInsightAccess", () => {
    const gate = canManageInsightAccess.resultFunc;

    it("is off without the flag, even for a user who may share", () => {
        expect(gate(false, false, false, true)).toBe(false);
    });

    it("leaves sharing to the host in embedded and dashboard-hosted editors", () => {
        expect(gate(true, true, false, true)).toBe(false);
        expect(gate(true, false, true, true)).toBe(false);
    });

    it("follows the share permission otherwise", () => {
        expect(gate(true, false, false, true)).toBe(true);
        expect(gate(true, false, false, false)).toBe(false);
    });
});
