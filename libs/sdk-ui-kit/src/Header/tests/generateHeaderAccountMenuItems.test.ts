// (C) 2021 GoodData Corporation
import { generateHeaderAccountMenuItems } from "../generateHeaderAccountMenuItems";
import { getAccountMenuFeatureFlagsMock, getWorkspacePermissionsMock } from "./mock";

describe("generateHeaderAccountMenuItems", () => {
    it("should return account, dic and logout items if workspace id is specified ", () => {
        const items = generateHeaderAccountMenuItems(
            getWorkspacePermissionsMock(true, true),
            {
                displayAccountPage: true,
            },
            "TestWorkspaceId",
        );
        expect(items).toEqual([
            {
                className: "s-account",
                href: "/#s=/gdc/projects/TestWorkspaceId|accountPage|",
                key: "gs.header.account",
            },
            { className: "s-dic", href: "/admin/disc/", key: "gs.header.dic" },
            { className: "s-logout", key: "gs.header.logout" },
        ]);
    });

    it("should return dic and logout items of account menu if workspace id is not specified", () => {
        const items = generateHeaderAccountMenuItems(getWorkspacePermissionsMock(true, true), {
            displayAccountPage: true,
        });
        expect(items).toEqual([
            { className: "s-dic", href: "/admin/disc/", key: "gs.header.dic" },
            { className: "s-logout", key: "gs.header.logout" },
        ]);
    });

    it("should return dic and logout items of account menu if workspace id is undefined", () => {
        const items = generateHeaderAccountMenuItems(
            getWorkspacePermissionsMock(true, true),
            {
                displayAccountPage: true,
            },
            undefined,
        );
        expect(items).toEqual([
            { className: "s-dic", href: "/admin/disc/", key: "gs.header.dic" },
            { className: "s-logout", key: "gs.header.logout" },
        ]);
    });

    it("should return dic and logout items if user doesn't have canInitData permission", () => {
        const items = generateHeaderAccountMenuItems(
            getWorkspacePermissionsMock(false, true),
            {
                displayAccountPage: true,
            },
            "TestWorkspaceId",
        );
        expect(items).toEqual([
            {
                className: "s-account",
                href: "/#s=/gdc/projects/TestWorkspaceId|accountPage|",
                key: "gs.header.account",
            },
            { className: "s-logout", key: "gs.header.logout" },
        ]);
    });

    it("should return dic and logout items with workspace in uri if user doesn't have canInitData permission and enableRenamingProjectToWorkspace is true", () => {
        const items = generateHeaderAccountMenuItems(
            getWorkspacePermissionsMock(false, true),
            {
                displayAccountPage: true,
            },
            "TestWorkspaceId",
            undefined,
            getAccountMenuFeatureFlagsMock(true, true, false, true, "enterprise", true),
        );
        expect(items).toEqual([
            {
                className: "s-account",
                href: "/#s=/gdc/workspaces/TestWorkspaceId|accountPage|",
                key: "gs.header.account",
            },
            { className: "s-logout", key: "gs.header.logout" },
        ]);
    });

    it("should return dic and logout items if user doesn't have displayAccountPage is true", () => {
        const items = generateHeaderAccountMenuItems(
            getWorkspacePermissionsMock(true, true),
            {
                displayAccountPage: false,
            },
            "TestWorkspaceId",
        );
        expect(items).toEqual([
            { className: "s-dic", href: "/admin/disc/", key: "gs.header.dic" },
            { className: "s-logout", key: "gs.header.logout" },
        ]);
    });

    it("should return logout item if user doesn't have canInitData permission and displayAccountPage is false", () => {
        const items = generateHeaderAccountMenuItems(
            getWorkspacePermissionsMock(false, true),
            {
                displayAccountPage: false,
            },
            "TestWorkspaceId",
        );
        expect(items).toEqual([{ className: "s-logout", key: "gs.header.logout" }]);
    });

    it("should return logout item if showOnlyLogoutItem is true", () => {
        const items = generateHeaderAccountMenuItems(
            getWorkspacePermissionsMock(true, true),
            {
                displayAccountPage: true,
            },
            "TestWorkspaceId",
            true,
        );
        expect(items).toEqual([{ className: "s-logout", key: "gs.header.logout" }]);
    });
});
