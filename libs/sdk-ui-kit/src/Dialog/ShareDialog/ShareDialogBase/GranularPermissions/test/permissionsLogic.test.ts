// (C) 2023 GoodData Corporation

import { getEffectivePermission, getGranteePossibilities } from "../permissionsLogic";
import { IGranteePermissionsPossibilities, IGranularGrantee } from "../../types";
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

    describe("getGranteePossibilities", () => {
        const editUserPermissions: CurrentUserPermissions = {
            canEditDashboard: true,
            canEditLockedDashboard: true,
            canShareDashboard: true,
            canShareLockedDashboard: true,
            canViewDashboard: true,
        };

        const shareUserPermissions: CurrentUserPermissions = {
            canEditDashboard: false,
            canEditLockedDashboard: false,
            canShareDashboard: true,
            canShareLockedDashboard: true,
            canViewDashboard: true,
        };

        const viewUserPermissions: CurrentUserPermissions = {
            canEditDashboard: false,
            canEditLockedDashboard: false,
            canShareDashboard: false,
            canShareLockedDashboard: false,
            canViewDashboard: true,
        };

        const granteeDirectEdit = {
            permissions: ["EDIT"],
            inheritedPermissions: [],
            type: "granularUser",
        } as IGranularGrantee;

        const granteeDirectEditIndirectEdit = {
            permissions: ["EDIT"],
            inheritedPermissions: ["EDIT"],
            type: "granularUser",
        } as IGranularGrantee;

        const granteeDirectShare = {
            permissions: ["SHARE"],
            inheritedPermissions: [],
            type: "granularUser",
        } as IGranularGrantee;

        const granteeDirectViewIndirectShare = {
            permissions: ["VIEW"],
            inheritedPermissions: ["SHARE"],
            type: "granularUser",
        } as IGranularGrantee;

        const groupDirectViewIndirectShare = {
            permissions: ["VIEW"],
            inheritedPermissions: ["SHARE"],
            type: "granularGroup",
        } as IGranularGrantee;

        const granteeIndirectView = {
            permissions: [],
            inheritedPermissions: ["VIEW"],
            type: "granularUser",
        } as IGranularGrantee;

        const granteeIndirectShare = {
            permissions: [],
            inheritedPermissions: ["SHARE"],
            type: "granularUser",
        } as IGranularGrantee;

        it("allows all changes for user with EDIT permission", () => {
            const locked = false;

            const possibilities = getGranteePossibilities(granteeDirectEdit, editUserPermissions, locked);

            expect(possibilities).toEqual<IGranteePermissionsPossibilities>({
                assign: {
                    effective: "EDIT",
                    items: [
                        {
                            id: "EDIT",
                            hidden: false,
                            enabled: true,
                            tooltip: "",
                        },
                        {
                            id: "SHARE",
                            hidden: false,
                            enabled: true,
                            tooltip: "",
                        },
                        {
                            id: "VIEW",
                            hidden: false,
                            enabled: true,
                            tooltip: "",
                        },
                    ],
                },
                remove: {
                    enabled: true,
                    tooltip: "",
                },
                change: {
                    enabled: true,
                    tooltip: "",
                },
            });
        });

        it("disables permissions options higher that user's permission and sets appropriate tooltip for it", () => {
            const locked = false;

            const possibilities = getGranteePossibilities(granteeDirectShare, shareUserPermissions, locked);

            expect(possibilities).toEqual<IGranteePermissionsPossibilities>({
                assign: {
                    effective: "SHARE",
                    items: [
                        {
                            id: "EDIT",
                            hidden: false,
                            enabled: false,
                            tooltip: "shareDialog.share.granular.grantee.tooltip.cannotGrantHigher",
                        },
                        {
                            id: "SHARE",
                            hidden: false,
                            enabled: true,
                            tooltip: "",
                        },
                        {
                            id: "VIEW",
                            hidden: false,
                            enabled: true,
                            tooltip: "",
                        },
                    ],
                },
                remove: {
                    enabled: true,
                    tooltip: "",
                },
                change: {
                    enabled: true,
                    tooltip: "",
                },
            });
        });

        it("disables user's options lower that permissions obtained indirectly from a user group", () => {
            const locked = false;

            const possibilities = getGranteePossibilities(
                granteeDirectViewIndirectShare,
                editUserPermissions,
                locked,
            );

            expect(possibilities).toEqual<IGranteePermissionsPossibilities>({
                assign: {
                    effective: "SHARE",
                    items: [
                        {
                            id: "EDIT",
                            hidden: false,
                            enabled: true,
                            tooltip: "",
                        },
                        {
                            id: "SHARE",
                            hidden: false,
                            enabled: true,
                            tooltip: "",
                        },
                        {
                            id: "VIEW",
                            hidden: false,
                            enabled: false,
                            tooltip: "shareDialog.share.granular.grantee.tooltip.cannotGrantLowerForUser",
                        },
                    ],
                },
                remove: {
                    enabled: true,
                    tooltip: "",
                },
                change: {
                    enabled: true,
                    tooltip: "",
                },
            });
        });

        it("disables group's options lower that permissions obtained indirectly from a user group", () => {
            const locked = false;

            const possibilities = getGranteePossibilities(
                groupDirectViewIndirectShare,
                editUserPermissions,
                locked,
            );

            expect(possibilities).toEqual<IGranteePermissionsPossibilities>({
                assign: {
                    effective: "SHARE",
                    items: [
                        {
                            id: "EDIT",
                            hidden: false,
                            enabled: true,
                            tooltip: "",
                        },
                        {
                            id: "SHARE",
                            hidden: false,
                            enabled: true,
                            tooltip: "",
                        },
                        {
                            id: "VIEW",
                            hidden: false,
                            enabled: false,
                            tooltip: "shareDialog.share.granular.grantee.tooltip.cannotGrantLowerForGroup",
                        },
                    ],
                },
                remove: {
                    enabled: true,
                    tooltip: "",
                },
                change: {
                    enabled: true,
                    tooltip: "",
                },
            });
        });

        it("hides Edit & share when the dashboard is locked", () => {
            const locked = true;

            const possibilities = getGranteePossibilities(granteeDirectEdit, editUserPermissions, locked);

            expect(possibilities).toEqual<IGranteePermissionsPossibilities>({
                assign: {
                    effective: "SHARE",
                    items: [
                        {
                            id: "EDIT",
                            hidden: true,
                            enabled: true,
                            tooltip: "",
                        },
                        {
                            id: "SHARE",
                            hidden: false,
                            enabled: true,
                            tooltip: "",
                        },
                        {
                            id: "VIEW",
                            hidden: false,
                            enabled: true,
                            tooltip: "",
                        },
                    ],
                },
                remove: {
                    enabled: true,
                    tooltip: "",
                },
                change: {
                    enabled: true,
                    tooltip: "",
                },
            });
        });

        it("disables all changes when the current user(VIEW) has lower permission than the grantee(EDIT)", () => {
            const locked = false;

            const possibilities = getGranteePossibilities(granteeDirectEdit, viewUserPermissions, locked);

            expect(possibilities).toEqual<IGranteePermissionsPossibilities>({
                assign: {
                    effective: "EDIT",
                    items: [
                        {
                            id: "EDIT",
                            hidden: false,
                            enabled: false,
                            tooltip: "shareDialog.share.granular.grantee.tooltip.cannotGrantHigher",
                        },
                        {
                            id: "SHARE",
                            hidden: false,
                            enabled: false,
                            tooltip: "shareDialog.share.granular.grantee.tooltip.cannotGrantHigher",
                        },
                        {
                            id: "VIEW",
                            hidden: false,
                            enabled: true,
                            tooltip: "",
                        },
                    ],
                },
                remove: {
                    enabled: false,
                    tooltip: "shareDialog.share.granular.grantee.tooltip.cannotChangeHigher",
                },
                change: {
                    enabled: false,
                    tooltip: "shareDialog.share.granular.grantee.tooltip.cannotChangeHigher",
                },
            });
        });

        it("disables removing permission from parent but allows to upgrade it in current workspace", () => {
            const locked = true;

            const possibilities = getGranteePossibilities(granteeIndirectView, editUserPermissions, locked);

            expect(possibilities).toEqual<IGranteePermissionsPossibilities>({
                assign: {
                    effective: "VIEW",
                    items: [
                        {
                            id: "EDIT",
                            hidden: true,
                            enabled: true,
                            tooltip: "",
                        },
                        {
                            id: "SHARE",
                            hidden: false,
                            enabled: true,
                            tooltip: "",
                        },
                        {
                            id: "VIEW",
                            hidden: false,
                            enabled: true,
                            tooltip: "",
                        },
                    ],
                },
                remove: {
                    enabled: false,
                    tooltip: "shareDialog.share.granular.grantee.tooltip.cannotRemoveFromParent",
                },
                change: {
                    enabled: true,
                    tooltip: "",
                },
            });
        });

        it("disables all changes when neither upgrade nor remove is available", () => {
            const locked = true;

            const possibilities = getGranteePossibilities(granteeIndirectShare, editUserPermissions, locked);

            expect(possibilities).toEqual<IGranteePermissionsPossibilities>({
                assign: {
                    effective: "SHARE",
                    items: [
                        {
                            id: "EDIT",
                            hidden: true,
                            enabled: true,
                            tooltip: "",
                        },
                        {
                            id: "SHARE",
                            hidden: false,
                            enabled: true,
                            tooltip: "",
                        },
                        {
                            id: "VIEW",
                            hidden: false,
                            enabled: false,
                            tooltip: "shareDialog.share.granular.grantee.tooltip.cannotGrantLowerForUser",
                        },
                    ],
                },
                remove: {
                    enabled: false,
                    tooltip: "shareDialog.share.granular.grantee.tooltip.cannotRemoveFromParent",
                },
                change: {
                    enabled: false,
                    tooltip: "shareDialog.share.granular.grantee.tooltip.noChangeAvailable",
                },
            });
        });

        it("disables all changes when all options are disabled due to overlapping conditions", () => {
            const locked = false;

            const possibilities = getGranteePossibilities(
                granteeDirectEditIndirectEdit,
                shareUserPermissions,
                locked,
            );

            expect(possibilities).toEqual<IGranteePermissionsPossibilities>({
                assign: {
                    effective: "EDIT",
                    items: [
                        {
                            id: "EDIT",
                            hidden: false,
                            enabled: false,
                            tooltip: "shareDialog.share.granular.grantee.tooltip.cannotGrantHigher",
                        },
                        {
                            id: "SHARE",
                            hidden: false,
                            enabled: false,
                            tooltip: "shareDialog.share.granular.grantee.tooltip.cannotGrantLowerForUser",
                        },
                        {
                            id: "VIEW",
                            hidden: false,
                            enabled: false,
                            tooltip: "shareDialog.share.granular.grantee.tooltip.cannotGrantLowerForUser",
                        },
                    ],
                },
                remove: {
                    enabled: false,
                    tooltip: "shareDialog.share.granular.grantee.tooltip.cannotChangeHigher",
                },
                change: {
                    enabled: false,
                    tooltip: "shareDialog.share.granular.grantee.tooltip.cannotChangeHigher",
                },
            });
        });
    });
});
