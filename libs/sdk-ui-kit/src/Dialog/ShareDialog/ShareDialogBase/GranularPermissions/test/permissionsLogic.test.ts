// (C) 2023 GoodData Corporation

import { getEffectivePermission, getPermissionTypeItems } from "../permissionsLogic";
import { IGranularPermissionTypeItem } from "../../types";
import { CurrentUserPermissions } from "../../../types";

describe("permissions logic", () => {
    describe("getEffectivePermission", () => {
        it.each`
            direct       | inherited   | expected
            ${["SHARE"]} | ${["EDIT"]} | ${"EDIT"}
            ${["SHARE"]} | ${["VIEW"]} | ${"SHARE"}
            ${["VIEW"]}  | ${["VIEW"]} | ${"VIEW"}
        `("returns the highest of inherited and direct permissions", ({ direct, inherited, expected }) => {
            const result = getEffectivePermission(direct, inherited, false);

            expect(result).toEqual(expected);
        });

        it("fails when incomplete permissions are provided", () => {
            const getResult = () => getEffectivePermission([], [], false);

            expect(getResult).toThrow();
        });

        it.each`
            direct       | inherited   | expected
            ${["SHARE"]} | ${["EDIT"]} | ${"SHARE"}
            ${["SHARE"]} | ${["VIEW"]} | ${"SHARE"}
            ${["VIEW"]}  | ${["VIEW"]} | ${"VIEW"}
        `("returns up to SHARE when dashboard is locked", ({ direct, inherited, expected }) => {
            const result = getEffectivePermission(direct, inherited, true);

            expect(result).toEqual(expected);
        });
    });

    describe("getPermissionTypeItems", () => {
        const editUserPermissions: CurrentUserPermissions = {
            canEditDashboard: true,
            canShareDashboard: true,
            canViewDashboard: true,
        };

        const viewUserPermissions: CurrentUserPermissions = {
            canEditDashboard: false,
            canShareDashboard: false,
            canViewDashboard: true,
        };

        it("returns all items for user with edit right", () => {
            const resultEdit = getPermissionTypeItems(editUserPermissions, false);

            expect(resultEdit).toEqual<IGranularPermissionTypeItem[]>([
                {
                    id: "EDIT",
                    hidden: false,
                    disabled: false,
                },
                {
                    id: "SHARE",
                    disabled: false,
                    hidden: false,
                },
                {
                    id: "VIEW",
                    disabled: false,
                    hidden: false,
                },
            ]);
        });

        it("hides Edit & share when the dashboard is locked", () => {
            const resultEdit = getPermissionTypeItems(editUserPermissions, true);

            expect(resultEdit).toEqual<IGranularPermissionTypeItem[]>([
                {
                    id: "EDIT",
                    disabled: false,
                    hidden: true,
                },
                {
                    id: "SHARE",
                    disabled: false,
                    hidden: false,
                },
                {
                    id: "VIEW",
                    disabled: false,
                    hidden: false,
                },
            ]);
        });

        it("returns all items for user with view right", () => {
            const resultView = getPermissionTypeItems(viewUserPermissions, false);

            expect(resultView).toEqual<IGranularPermissionTypeItem[]>([
                {
                    id: "EDIT",
                    disabled: true,
                    hidden: false,
                },
                {
                    id: "SHARE",
                    disabled: true,
                    hidden: false,
                },
                {
                    id: "VIEW",
                    disabled: false,
                    hidden: false,
                },
            ]);
        });
    });
});
