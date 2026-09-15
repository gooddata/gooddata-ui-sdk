// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type WorkspacePermissions } from "../../types.js";

import {
    getGranularPermissions,
    getImplicitGranularPermissions,
    isPermissionDisabled,
    removeRedundantPermissions,
} from "./granularPermissionUtils.js";
import { getGranularPermissionTitle } from "./locales.js";

describe("granularPermissionUtils", () => {
    describe("getImplicitGranularPermissions", () => {
        it("implies nothing for VIEW", () => {
            expect(getImplicitGranularPermissions("VIEW")).toEqual([]);
        });

        it("implies CREATE_VISUALIZATION and CREATE_FILTER_VIEW for ANALYZE", () => {
            expect(getImplicitGranularPermissions("ANALYZE")).toEqual([
                "CREATE_VISUALIZATION",
                "CREATE_FILTER_VIEW",
            ]);
        });

        it("implies every granular permission except the AI assistant for MANAGE", () => {
            const implied = getImplicitGranularPermissions("MANAGE");

            expect(implied).toContain("CREATE_VISUALIZATION");
            expect(implied).toContain("CREATE_METRIC");
            expect(implied).not.toContain("USE_AI_ASSISTANT");
        });
    });

    describe("isPermissionDisabled", () => {
        it("locks the permissions ANALYZE implies and nothing else", () => {
            expect(isPermissionDisabled("CREATE_VISUALIZATION", "ANALYZE", [])).toBe(true);
            expect(isPermissionDisabled("CREATE_FILTER_VIEW", "ANALYZE", [])).toBe(true);
            expect(isPermissionDisabled("CREATE_METRIC", "ANALYZE", [])).toBe(false);
        });

        it("leaves CREATE_VISUALIZATION grantable under VIEW", () => {
            expect(isPermissionDisabled("CREATE_VISUALIZATION", "VIEW", [])).toBe(false);
        });

        it("locks CREATE_VISUALIZATION under MANAGE", () => {
            expect(isPermissionDisabled("CREATE_VISUALIZATION", "MANAGE", [])).toBe(true);
        });
    });

    describe("removeRedundantPermissions", () => {
        it("drops CREATE_VISUALIZATION under ANALYZE, keeps explicit grants", () => {
            const permissions: WorkspacePermissions = [
                "ANALYZE",
                "VIEW",
                "CREATE_VISUALIZATION",
                "CREATE_FILTER_VIEW",
                "EXPORT",
            ];

            expect(removeRedundantPermissions(permissions)).toEqual(["ANALYZE", "EXPORT"]);
        });

        it("keeps CREATE_VISUALIZATION granted on top of VIEW", () => {
            const permissions: WorkspacePermissions = ["VIEW", "CREATE_VISUALIZATION"];

            expect(removeRedundantPermissions(permissions)).toEqual(permissions);
        });

        it("collapses MANAGE to itself", () => {
            const permissions: WorkspacePermissions = ["MANAGE", "CREATE_VISUALIZATION", "EXPORT"];

            expect(removeRedundantPermissions(permissions)).toEqual(["MANAGE"]);
        });
    });

    describe("getGranularPermissions", () => {
        it("shows CREATE_VISUALIZATION as included for ANALYZE", () => {
            expect(getGranularPermissions(["ANALYZE"])).toContain("CREATE_VISUALIZATION");
        });

        it("shows an explicit CREATE_VISUALIZATION grant for VIEW", () => {
            expect(getGranularPermissions(["VIEW", "CREATE_VISUALIZATION"])).toEqual([
                "CREATE_VISUALIZATION",
            ]);
        });
    });

    describe("getGranularPermissionTitle", () => {
        it("resolves the CREATE_VISUALIZATION label", () => {
            expect(getGranularPermissionTitle("CREATE_VISUALIZATION").id).toBe(
                "userManagement.workspace.permission.createVisualization",
            );
        });
    });
});
