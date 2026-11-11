// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    ActionsApi_WorkspaceLocalizationIssues,
    ActionsApi_WorkspaceLocalizationStatistics,
    ActionsApi_WorkspaceLocalizationUsage,
    ActionsApi_WorkspaceLocalizationUsageUsers,
} from "@gooddata/api-client-tiger/endpoints/actions";
import {
    EntitiesApi_GetAllEntitiesWorkspaces,
    EntitiesApi_GetEntityWorkspaces,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

import { TigerWorkspaceLocalizationService } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/actions", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    ActionsApi_WorkspaceLocalizationIssues: vi.fn(),
    ActionsApi_WorkspaceLocalizationStatistics: vi.fn(),
    ActionsApi_WorkspaceLocalizationUsage: vi.fn(),
    ActionsApi_WorkspaceLocalizationUsageUsers: vi.fn(),
}));
vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    EntitiesApi_GetEntityWorkspaces: vi.fn(),
    EntitiesApi_GetAllEntitiesWorkspaces: vi.fn(),
}));

const issuesEndpoint = vi.mocked(ActionsApi_WorkspaceLocalizationIssues);
const statisticsEndpoint = vi.mocked(ActionsApi_WorkspaceLocalizationStatistics);
const usageEndpoint = vi.mocked(ActionsApi_WorkspaceLocalizationUsage);
const usersEndpoint = vi.mocked(ActionsApi_WorkspaceLocalizationUsageUsers);
const workspaceEndpoint = vi.mocked(EntitiesApi_GetEntityWorkspaces);
const workspacesEndpoint = vi.mocked(EntitiesApi_GetAllEntitiesWorkspaces);

const authCall = vi.fn((callback) =>
    callback({ axios: {}, basePath: "" }),
) as unknown as TigerAuthenticatedCallGuard;

const respond = <T>(data: T) => Promise.resolve({ data }) as never;

describe("TigerWorkspaceLocalizationService", () => {
    const service = new TigerWorkspaceLocalizationService(authCall, "bergmann");

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("reads the localization issues of the workspace", async () => {
        issuesEndpoint.mockReturnValue(
            respond({ issues: [{ type: "METADATA_LANGUAGE_MISMATCH", locale: "de-DE" }] }),
        );

        expect(await service.getIssues()).toEqual({
            issues: [{ type: "METADATA_LANGUAGE_MISMATCH", locale: "de-DE" }],
        });
        expect(issuesEndpoint).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
            workspaceId: "bergmann",
        });
    });

    it("reads the translated texts of the workspace and its parents with the coverage", async () => {
        statisticsEndpoint.mockReturnValue(
            respond({
                data: { locales: [] },
                metadata: {
                    locales: [{ locale: "de-DE" }],
                    workspaces: [
                        {
                            id: "retail",
                            name: "Retail",
                            parentId: null,
                            total: 20,
                            locales: [{ locale: "de-DE", translated: 12 }],
                        },
                        {
                            id: "bergmann",
                            name: "Bergmann",
                            parentId: "retail",
                            total: 1000,
                            locales: [{ locale: "de-DE", translated: 640 }],
                        },
                    ],
                },
            }),
        );

        const { workspaces, totalCount } = await service.getStatisticsWorkspaces();

        expect(statisticsEndpoint).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
            workspaceId: "bergmann",
            includeCoverage: true,
        });
        expect(totalCount).toBe(2);
        expect(workspaces.map((workspace) => [workspace.id, workspace.metadata.total])).toEqual([
            ["retail", 20],
            ["bergmann", 1000],
        ]);
    });

    it("pages the rows", async () => {
        statisticsEndpoint.mockReturnValue(
            respond({
                data: { locales: [] },
                metadata: {
                    locales: [],
                    workspaces: ["a", "b", "c"].map((id) => ({
                        id,
                        name: id,
                        parentId: null,
                        total: 1,
                        locales: [],
                    })),
                },
            }),
        );

        const page = await service.getStatisticsWorkspaces({ page: 1, size: 2 });

        expect(page.totalCount).toBe(3);
        expect(page.workspaces.map((workspace) => workspace.id)).toEqual(["c"]);
    });

    describe("the workspaces behind a validation", () => {
        beforeEach(() => {
            usageEndpoint.mockReturnValue(
                respond({
                    settings: {
                        LOCALE: { content: { value: "de-DE" }, source: "WORKSPACE" },
                        METADATA_LOCALE: { content: { value: "en-US" }, source: "DEFAULT" },
                        DATA_LOCALE: { content: {}, source: "DEFAULT" },
                    },
                    values: [],
                }),
            );
            workspaceEndpoint.mockReturnValue(
                respond({
                    data: {
                        id: "bergmann",
                        attributes: { name: "Bergmann" },
                        relationships: { parent: { data: null } },
                        meta: { hierarchy: { childrenCount: 0 } },
                    },
                }),
            );
            workspacesEndpoint.mockReturnValue(respond({ data: [] }));
        });

        it("is the workspace itself, also when its own settings do not match the language", async () => {
            const page = await service.getUsageWorkspaces({
                value: "de-DE",
                setting: "METADATA_LOCALE",
                translation: "available",
            });

            expect(page.totalCount).toBe(1);
            expect(page.workspaces[0].id).toBe("bergmann");
        });

        it("keeps filtering by the settings when no validation asks", async () => {
            const page = await service.getUsageWorkspaces({ value: "de-DE", setting: "METADATA_LOCALE" });

            expect(page.totalCount).toBe(0);
        });

        it("still filters by name", async () => {
            const page = await service.getUsageWorkspaces({ translation: "available", name: "nobody" });

            expect(page.totalCount).toBe(0);
        });
    });

    describe("the people behind a validation", () => {
        it("is nobody, because the backend reports no people for a validation", async () => {
            const page = await service.getUsageUsers({
                value: "de-DE",
                setting: "METADATA_LOCALE",
                translation: "available",
            });

            expect(page).toEqual({ users: [], totalCount: 0 });
            expect(usersEndpoint).not.toHaveBeenCalled();
        });

        it("still lists the members of the workspace when no validation asks", async () => {
            usersEndpoint.mockReturnValue(respond({ users: [], totalCount: 0 }));

            await service.getUsageUsers({ value: "de-DE", setting: "LOCALE" });

            expect(usersEndpoint).toHaveBeenCalledWith(
                expect.anything(),
                expect.anything(),
                expect.objectContaining({ workspaceId: "bergmann", value: "de-DE", setting: "LOCALE" }),
            );
        });
    });
});
