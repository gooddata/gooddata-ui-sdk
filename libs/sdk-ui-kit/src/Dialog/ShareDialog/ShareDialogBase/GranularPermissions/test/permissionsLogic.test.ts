// (C) 2023 GoodData Corporation

import { getEffectivePermission, getGranteePossibilities } from "../permissionsLogic.js";
import { IGranteePermissionsPossibilities, IGranularGrantee } from "../../types.js";
import { CurrentUserPermissions } from "../../../types.js";
import { describe, it, expect } from "vitest";

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
        `("returns up to SHARE when object is locked", ({ direct, inherited, expected }) => {
            const result = getEffectivePermission(direct, inherited, true);

            expect(result).toEqual(expected);
        });
    });

    describe("getGranteePossibilities", () => {
        const granteeTypes = ["granularUser", "granularGroup"];

        const editUserPermissions: CurrentUserPermissions = {
            canEditAffectedObject: true,
            canEditLockedAffectedObject: true,
            canShareAffectedObject: true,
            canShareLockedAffectedObject: true,
            canViewAffectedObject: true,
        };

        const shareUserPermissions: CurrentUserPermissions = {
            canEditAffectedObject: false,
            canEditLockedAffectedObject: false,
            canShareAffectedObject: true,
            canShareLockedAffectedObject: true,
            canViewAffectedObject: true,
        };

        const viewUserPermissions: CurrentUserPermissions = {
            canEditAffectedObject: false,
            canEditLockedAffectedObject: false,
            canShareAffectedObject: false,
            canShareLockedAffectedObject: false,
            canViewAffectedObject: true,
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

        function getMockGrantee(baseGrantee: Partial<IGranularGrantee>, type: string): IGranularGrantee {
            return {
                ...baseGrantee,
                type,
            } as IGranularGrantee;
        }

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

        it.each(granteeTypes)(
            "disables %s options lower that permissions obtained indirectly from a user group",
            (type) => {
                const locked = false;

                const possibilities = getGranteePossibilities(
                    getMockGrantee(granteeDirectViewIndirectShare, type),
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
                                tooltip: `shareDialog.share.granular.${type}.tooltip.cannotGrantLower`,
                            },
                        ],
                    },
                    remove: {
                        enabled: false,
                        tooltip: `shareDialog.share.granular.granular${
                            type === "granularUser" ? "User" : "Group"
                        }.tooltip.cannotRemoveFromParent`,
                    },
                    change: {
                        enabled: true,
                        tooltip: "",
                    },
                });
            },
        );

        it("hides Edit & share when the object is locked", () => {
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

        it.each(granteeTypes)(
            "disables all changes when the current user(VIEW) has lower permission than the grantee(EDIT)",
            (type) => {
                const locked = false;

                const possibilities = getGranteePossibilities(
                    getMockGrantee(granteeDirectEdit, type),
                    viewUserPermissions,
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
                        tooltip: `shareDialog.share.granular.${type}.tooltip.cannotChangeHigher`,
                    },
                    change: {
                        enabled: false,
                        tooltip: `shareDialog.share.granular.${type}.tooltip.cannotChangeHigher`,
                    },
                });
            },
        );

        it.each(granteeTypes)(
            "disables removing %s permission from parent but allows to upgrade it in current workspace",
            (type) => {
                const locked = true;

                const possibilities = getGranteePossibilities(
                    getMockGrantee(granteeIndirectView, type),
                    editUserPermissions,
                    locked,
                );

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
                        tooltip: `shareDialog.share.granular.${type}.tooltip.cannotRemoveFromParent`,
                    },
                    change: {
                        enabled: true,
                        tooltip: "",
                    },
                });
            },
        );

        it.each(granteeTypes)(
            "disables all changes of a %s when neither upgrade nor remove is available",
            (type) => {
                const locked = true;

                const possibilities = getGranteePossibilities(
                    getMockGrantee(granteeIndirectShare, type),
                    editUserPermissions,
                    locked,
                );

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
                                tooltip: `shareDialog.share.granular.${type}.tooltip.cannotGrantLower`,
                            },
                        ],
                    },
                    remove: {
                        enabled: false,
                        tooltip: `shareDialog.share.granular.${type}.tooltip.cannotRemoveFromParent`,
                    },
                    change: {
                        enabled: false,
                        tooltip: `shareDialog.share.granular.${type}.tooltip.noChangeAvailable`,
                    },
                });
            },
        );

        it.each(granteeTypes)(
            "disables all changes when all options are disabled due to overlapping conditions",
            (type) => {
                const locked = false;

                const possibilities = getGranteePossibilities(
                    getMockGrantee(granteeDirectEditIndirectEdit, type),
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
                                tooltip: `shareDialog.share.granular.${type}.tooltip.cannotGrantLower`,
                            },
                            {
                                id: "VIEW",
                                hidden: false,
                                enabled: false,
                                tooltip: `shareDialog.share.granular.${type}.tooltip.cannotGrantLower`,
                            },
                        ],
                    },
                    remove: {
                        enabled: false,
                        tooltip: `shareDialog.share.granular.${type}.tooltip.cannotChangeHigher`,
                    },
                    change: {
                        enabled: false,
                        tooltip: `shareDialog.share.granular.${type}.tooltip.cannotChangeHigher`,
                    },
                });
            },
        );
    });
});
