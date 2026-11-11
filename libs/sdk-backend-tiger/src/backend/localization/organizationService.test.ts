// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    ActionsApi_OrganizationLocalizationIssueWorkspaces,
    ActionsApi_OrganizationLocalizationIssues,
    ActionsApi_OrganizationLocalizationUsageUsers,
    ActionsApi_OrganizationLocalizationUsageWorkspaces,
} from "@gooddata/api-client-tiger/endpoints/actions";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

import { TigerOrganizationLocalizationService } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/actions", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    ActionsApi_OrganizationLocalizationIssueWorkspaces: vi.fn(),
    ActionsApi_OrganizationLocalizationIssues: vi.fn(),
    ActionsApi_OrganizationLocalizationUsageUsers: vi.fn(),
    ActionsApi_OrganizationLocalizationUsageWorkspaces: vi.fn(),
}));

const issuesEndpoint = vi.mocked(ActionsApi_OrganizationLocalizationIssues);
const issueWorkspacesEndpoint = vi.mocked(ActionsApi_OrganizationLocalizationIssueWorkspaces);
const usageWorkspacesEndpoint = vi.mocked(ActionsApi_OrganizationLocalizationUsageWorkspaces);
const usageUsersEndpoint = vi.mocked(ActionsApi_OrganizationLocalizationUsageUsers);

const authCall = vi.fn((callback) =>
    callback({ axios: {}, basePath: "" }),
) as unknown as TigerAuthenticatedCallGuard;

const respond = <T>(data: T) => Promise.resolve({ data }) as never;

const issueWorkspaces = {
    totalCount: 1,
    workspaces: [
        {
            id: "bergmann",
            name: "Bergmann",
            childrenCount: 0,
            bySetting: {
                LOCALE: { content: { value: "de-DE" }, source: "WORKSPACE" },
                METADATA_LOCALE: { content: { value: "de-AT" }, source: "WORKSPACE" },
                DATA_LOCALE: { content: { value: null }, source: "DEFAULT" },
            },
        },
    ],
};

describe("TigerOrganizationLocalizationService", () => {
    const service = new TigerOrganizationLocalizationService(authCall);

    beforeEach(() => {
        vi.clearAllMocks();
        issueWorkspacesEndpoint.mockReturnValue(respond(issueWorkspaces));
    });

    it("reads the localization issues of the organization with the number of workspaces", async () => {
        issuesEndpoint.mockReturnValue(
            respond({ issues: [{ type: "METADATA_MISSING_TRANSLATION", locale: "de-AT", workspaces: 4 }] }),
        );

        expect(await service.getIssues()).toEqual({
            issues: [{ type: "METADATA_MISSING_TRANSLATION", locale: "de-AT", workspaces: 4 }],
        });
        expect(issuesEndpoint).toHaveBeenCalledWith(expect.anything(), expect.anything());
    });

    it.each([
        ["available", "METADATA_LANGUAGE_MISMATCH"],
        ["variant", "METADATA_MISSING_TRANSLATION"],
        ["missing", "METADATA_MISSING_TRANSLATION"],
    ] as const)(
        "lists the workspaces behind a %s validation from the issue %s",
        async (translation, type) => {
            const { workspaces, totalCount } = await service.getUsageWorkspaces({
                value: "de-AT",
                setting: "METADATA_LOCALE",
                translation,
                name: "berg",
                page: 2,
                size: 10,
            });

            expect(issueWorkspacesEndpoint).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
                type,
                locale: "de-AT",
                name: "berg",
                page: 2,
                size: 10,
            });
            expect(usageWorkspacesEndpoint).not.toHaveBeenCalled();
            expect(totalCount).toBe(1);
            expect(workspaces.map((workspace) => workspace.id)).toEqual(["bergmann"]);
        },
    );

    it("lists nothing behind a validation without a language", async () => {
        const page = await service.getUsageWorkspaces({ translation: "missing" });

        expect(page).toEqual({ workspaces: [], totalCount: 0 });
        expect(issueWorkspacesEndpoint).not.toHaveBeenCalled();
    });

    it("lists the workspaces behind a usage count from the usage endpoint", async () => {
        usageWorkspacesEndpoint.mockReturnValue(respond({ workspaces: [], totalCount: 0 }));

        await service.getUsageWorkspaces({ value: "de-DE", setting: "LOCALE" });

        expect(usageWorkspacesEndpoint).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
            value: "de-DE",
            setting: "LOCALE",
        });
        expect(issueWorkspacesEndpoint).not.toHaveBeenCalled();
    });

    it("lists nobody behind a validation, as the backend reports no people for it", async () => {
        const page = await service.getUsageUsers({ value: "de-AT", translation: "missing" });

        expect(page).toEqual({ users: [], totalCount: 0 });
        expect(usageUsersEndpoint).not.toHaveBeenCalled();
    });
});
