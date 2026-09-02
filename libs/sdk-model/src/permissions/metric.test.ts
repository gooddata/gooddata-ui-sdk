// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type AccessGranularPermission } from "../accessControl/index.js";

import { type IWorkspacePermissions } from "./index.js";
import { canEditMetric, canShareMetric } from "./metric.js";

const admin = { canManageProject: true } as IWorkspacePermissions;
const nonAdmin = { canManageProject: false } as IWorkspacePermissions;

const ALL: (AccessGranularPermission[] | undefined)[] = [
    undefined,
    [],
    ["VIEW"],
    ["SHARE"],
    ["EDIT"],
    ["VIEW", "SHARE", "EDIT"],
];

describe("canEditMetric", () => {
    it.each(ALL.map((p) => [p]))(
        "with the flag off ignores the metric's permissions (%j)",
        (metricPermissions) => {
            // the only thing that decided editing before the flag was canManageProject
            expect(canEditMetric(metricPermissions, admin, false)).toBe(true);
            expect(canEditMetric(metricPermissions, nonAdmin, false)).toBe(false);
        },
    );

    it.each(ALL.map((p) => [p]))("with the flag on keeps the admin editing (%j)", (metricPermissions) => {
        expect(canEditMetric(metricPermissions, admin, true)).toBe(true);
    });

    it("with the flag on grants a non-admin edit only through EDIT", () => {
        expect(canEditMetric(["EDIT"], nonAdmin, true)).toBe(true);
        expect(canEditMetric(["VIEW", "SHARE", "EDIT"], nonAdmin, true)).toBe(true);

        expect(canEditMetric(["SHARE"], nonAdmin, true)).toBe(false);
        expect(canEditMetric(["VIEW"], nonAdmin, true)).toBe(false);
        expect(canEditMetric([], nonAdmin, true)).toBe(false);
        expect(canEditMetric(undefined, nonAdmin, true)).toBe(false);
    });
});

describe("canShareMetric", () => {
    it.each(ALL.map((p) => [p]))("stays off entirely with the flag off (%j)", (metricPermissions) => {
        expect(canShareMetric(metricPermissions, admin, false)).toBe(false);
        expect(canShareMetric(metricPermissions, nonAdmin, false)).toBe(false);
    });

    it.each(ALL.map((p) => [p]))("with the flag on keeps the admin sharing (%j)", (metricPermissions) => {
        expect(canShareMetric(metricPermissions, admin, true)).toBe(true);
    });

    it("with the flag on grants a non-admin share only through SHARE", () => {
        expect(canShareMetric(["SHARE"], nonAdmin, true)).toBe(true);

        // no hierarchy: EDIT alone does not imply SHARE
        expect(canShareMetric(["EDIT"], nonAdmin, true)).toBe(false);
        expect(canShareMetric(["VIEW"], nonAdmin, true)).toBe(false);
        expect(canShareMetric([], nonAdmin, true)).toBe(false);
        expect(canShareMetric(undefined, nonAdmin, true)).toBe(false);
    });
});
