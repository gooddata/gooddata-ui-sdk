// (C) 2020-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IPublisherDocumentSummaryV2 } from "@gooddata/sdk-backend-spi";
import { type IWorkspacePermissions, idRef } from "@gooddata/sdk-model";

import { createAnalyticalDashboard, createListedDashboard } from "../../tests/constants.test.helpers.js";
import { privateDashboards, publicDashboards } from "../../tests/dashboard.test.helpers.js";

import {
    getAccessibleDocumentIds,
    getInsightUsageOnDashboards,
    isDocumentShown,
} from "./insight_usage_helpers.js";
import { getInsightUsageOnDashboardsSelector } from "./insight_usage_selectors.js";
import { type IInsightUsage } from "./insight_usage_state.js";

describe("insight usage on dashboards", () => {
    describe("getInsightUsageOnDashboards", () => {
        it("should process and correctly sort provided dashboards", () => {
            const dashboards = [
                createAnalyticalDashboard("Sale2", "Bee2", 2),
                createAnalyticalDashboard("akh", "Bee4", 4),
                createAnalyticalDashboard("Bcd", "Bee5", 5),
                createAnalyticalDashboard("Sale1", "Bee1", 1),
                createAnalyticalDashboard("bdf", "Bee7", 7),
                createAnalyticalDashboard("Abc", "Bee6", 6),
                createAnalyticalDashboard("Selected Dashboard", "Bee3", 3),
            ];
            const allUserDashboards = [
                createListedDashboard("Sale2", "Bee2", 2),
                createListedDashboard("akh", "Bee4", 4),
                createListedDashboard("Bcd", "Bee5", 5),
                createListedDashboard("Sale1", "Bee1", 1),
                createListedDashboard("bdf", "Bee7", 7),
                createListedDashboard("Abc", "Bee6", 6),
                createListedDashboard("Selected Dashboard", "Bee3", 3),
            ];

            const result = getInsightUsageOnDashboards(dashboards, allUserDashboards);
            expect(result).toMatchSnapshot();
        });
    });

    describe("getInsightUsageOnDashboardsSelector", () => {
        it.each([[null], [undefined]])(
            "should return default object when usage info is %s",
            (usageInfo: IInsightUsage) => {
                const result = getInsightUsageOnDashboardsSelector.resultFunc(usageInfo, "id");
                expect(result).toMatchSnapshot();
            },
        );

        it("should return expected object from usage info from state", () => {
            const insightUsage: IInsightUsage = {
                allUserDashboards: [...publicDashboards, ...privateDashboards],
                referencedDashboards: [
                    createAnalyticalDashboard("Sale", "Bee", 123),
                    createAnalyticalDashboard("Revenue", "id3", 124),
                ],
                referencedDocuments: [],
                accessibleDocumentIds: [],
            };
            const result = getInsightUsageOnDashboardsSelector.resultFunc(insightUsage, "id3");
            expect(result).toMatchSnapshot();
        });
    });

    describe("isDocumentShown", () => {
        const viewer = { canCreateDocument: false, canManageProject: false } as IWorkspacePermissions;
        const creator = { canCreateDocument: true, canManageProject: false } as IWorkspacePermissions;
        const manager = { canCreateDocument: false, canManageProject: true } as IWorkspacePermissions;
        const own = { createdBy: { login: "me" } } as IPublisherDocumentSummaryV2;
        const others = { createdBy: { login: "someone" } } as IPublisherDocumentSummaryV2;
        const inheritedOwn = { ...own, isLocked: true };

        it.each([
            ["anyone's document to a user who may create documents", others, creator, true],
            ["an inherited document to a user who may create documents", inheritedOwn, creator, true],
            ["anyone's document when permissions are unknown", others, null, true],
            ["the user's own document", own, viewer, true],
            ["someone else's document to a manager", others, manager, true],
        ])("shows %s", (_, document, permissions, expected) => {
            expect(isDocumentShown(document, "me", permissions)).toBe(expected);
        });

        it.each([
            ["someone else's document", others, viewer],
            ["an inherited document, even the user's own", inheritedOwn, viewer],
            ["an inherited document to a manager", inheritedOwn, manager],
            ["a document without a creator", {} as IPublisherDocumentSummaryV2, viewer],
        ])("hides %s from a user who may not create documents", (_, document, permissions) => {
            expect(isDocumentShown(document, "me", permissions)).toBe(false);
        });
    });

    describe("getAccessibleDocumentIds", () => {
        it("returns the ids of the documents the user may open", () => {
            const documents = [
                { ref: idRef("mine", "document"), createdBy: { login: "me" } },
                { ref: idRef("theirs", "document"), createdBy: { login: "someone" } },
            ] as IPublisherDocumentSummaryV2[];
            const permissions = {
                canCreateDocument: false,
                canManageProject: false,
            } as IWorkspacePermissions;

            expect(getAccessibleDocumentIds(documents, "me", permissions)).toEqual(["mine"]);
        });
    });
});
