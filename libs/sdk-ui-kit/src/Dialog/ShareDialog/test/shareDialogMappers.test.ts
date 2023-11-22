// (C) 2021-2023 GoodData Corporation
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { IUser, uriRef, IListedDashboard, ShareStatus, IGranularAccessGrantee } from "@gooddata/sdk-model";
import { ReferenceRecordings } from "@gooddata/reference-workspace";

import {
    availableUserAccessGrantee,
    availableUserGroupAccessGrantee,
    grantees,
    granularGrantees,
    granularUserAccess,
    granularUserGroupAccess,
    groupAccessGrantee,
    groupAll,
    owner,
    user,
    userAccessGrantee,
    workspaceUser,
    defaultUser,
    granularRule,
} from "../ShareDialogBase/test/GranteeMock.js";
import { GranteeItem, IGranteeUser } from "../ShareDialogBase/types.js";
import { GranteeGroupAll } from "../ShareDialogBase/utils.js";
import {
    mapGranteesToGranularAccessGrantees,
    mapGranteesToShareStatus,
    mapOwnerToGrantee,
    mapShareStatusToGroupAll,
    mapUserFullName,
    mapWorkspaceUserGroupToGrantee,
    mapWorkspaceUserToGrantee,
    mapAccessGranteeDetailToGrantee,
    mapSharedObjectToAffectedSharedObject,
} from "../shareDialogMappers.js";
import { describe, it, expect } from "vitest";

const SimpleDashboardWithReferences = ReferenceRecordings.Recordings.metadata.dashboards.dash_aaRaEZRWdRpQ
    .obj as IDashboardWithReferences;

const SimpleDashboard: IListedDashboard = {
    ref: SimpleDashboardWithReferences.dashboard.ref,
    identifier: SimpleDashboardWithReferences.dashboard.identifier,
    uri: SimpleDashboardWithReferences.dashboard.uri,
    title: SimpleDashboardWithReferences.dashboard.title,
    description: SimpleDashboardWithReferences.dashboard.description,
    updated: SimpleDashboardWithReferences.dashboard.updated,
    created: SimpleDashboardWithReferences.dashboard.created,
    tags: SimpleDashboardWithReferences.dashboard.tags,
    shareStatus: "public",
    isLocked: true,
    availability: "full",
};

describe("shareDialogMappers", () => {
    describe("mapUserFullName", () => {
        it("should return correct full name", () => {
            const user: IUser = {
                ref: uriRef("userID1"),
                login: "user-login",
                fullName: "User Name",
                firstName: "AAA",
                lastName: "BBB",
            };

            expect(mapUserFullName(user)).toEqual("User Name");
        });

        it("should return correct full name from first name and last name ", () => {
            const user: IUser = {
                ref: uriRef("userID1"),
                login: "user-login",
                firstName: "User",
                lastName: "Name",
            };

            expect(mapUserFullName(user)).toEqual("User Name");
        });
    });

    describe("mapOwnerToGrantee", () => {
        it("should return correct mapped owner and current user", () => {
            const ref = uriRef("userID1");

            const user: IUser = {
                ref: ref,
                login: "user-login",
                email: "email",
                fullName: "Owner Name",
            };

            const result: IGranteeUser = {
                type: "user",
                id: ref,
                email: "email",
                name: "Owner Name",
                isCurrentUser: true,
                isOwner: true,
                status: "Active",
            };

            expect(mapOwnerToGrantee(user, ref)).toEqual(result);
        });

        it("should return correct mapped owner", () => {
            const ref = uriRef("userID1");

            const user: IUser = {
                ref: ref,
                login: "user-login",
                email: "email",
                fullName: "Owner Name",
            };

            const result: IGranteeUser = {
                type: "user",
                id: ref,
                email: "email",
                name: "Owner Name",
                isCurrentUser: false,
                isOwner: true,
                status: "Active",
            };

            expect(mapOwnerToGrantee(user, uriRef("aaaa"))).toEqual(result);
        });
    });

    describe("mapShareStatusToGroupAll", () => {
        it("should return groupAll when status is public", () => {
            expect(mapShareStatusToGroupAll("public")).toEqual(GranteeGroupAll);
        });

        it("should return undefined when status is private", () => {
            expect(mapShareStatusToGroupAll("private")).toEqual(undefined);
        });
    });

    describe("mapGranteesToShareStatus", () => {
        it.each([
            [
                "Group all is missing and not grantees remain",
                Array<GranteeItem>(user),
                Array<GranteeItem>(),
                Array<GranteeItem>(user),
                "private",
            ],
            [
                "Group all is missing and some grantees remain",
                Array<GranteeItem>(user),
                Array<GranteeItem>(owner),
                Array<GranteeItem>(user),
                "shared",
            ],
            [
                "Group all is added",
                Array<GranteeItem>(user),
                Array<GranteeItem>(groupAll),
                Array<GranteeItem>(user),
                "public",
            ],
            [
                "Group all is in grantees",
                Array<GranteeItem>(groupAll),
                Array<GranteeItem>(user),
                Array<GranteeItem>(user),
                "public",
            ],
            [
                "Group all is removed",
                Array<GranteeItem>(groupAll),
                Array<GranteeItem>(user),
                Array<GranteeItem>(groupAll),
                "shared",
            ],
            [
                "Group all is added and removed",
                Array<GranteeItem>(groupAll),
                Array<GranteeItem>(groupAll),
                Array<GranteeItem>(groupAll),
                "public",
            ],

            [
                "Granular rule is removed",
                Array<GranteeItem>(user),
                Array<GranteeItem>(user),
                Array<GranteeItem>(granularRule),
                "shared",
            ],
            [
                "Granular all is added",
                Array<GranteeItem>(granularRule),
                Array<GranteeItem>(user),
                Array<GranteeItem>(user),
                "public",
            ],
        ])(
            "should return correct final status when %s",
            (
                _desc: string,
                grantees: GranteeItem[],
                granteesToAdd: GranteeItem[],
                granteesToDelete: GranteeItem[],
                result: ShareStatus,
            ) => {
                expect(mapGranteesToShareStatus(grantees, granteesToAdd, granteesToDelete)).toEqual(result);
            },
        );
    });

    describe("mapWorkspaceUserToGrantee", () => {
        it("should return correctly mapped workspace user to grantee", () => {
            const expectedGrantee: GranteeItem = {
                email: "john.doe@d.com",
                id: uriRef("john-id"),
                isCurrentUser: false,
                isOwner: false,
                name: "John Doe",
                status: "Active",
                type: "user",
            };

            expect(mapWorkspaceUserToGrantee(availableUserAccessGrantee, defaultUser)).toEqual(
                expectedGrantee,
            );
        });

        it("should return correctly mapped current workspace user to grantee", () => {
            const expectedGrantee: GranteeItem = {
                email: "john.doe@d.com",
                id: uriRef("john-id"),
                isCurrentUser: true,
                isOwner: false,
                name: "John Doe",
                status: "Active",
                type: "user",
            };

            expect(mapWorkspaceUserToGrantee(availableUserAccessGrantee, workspaceUser)).toEqual(
                expectedGrantee,
            );
        });
    });

    describe("mapWorkspaceUserGroupToGrantee", () => {
        it("should return correctly mapped workspace user to grantee", () => {
            const expectedGrantee: GranteeItem = {
                id: uriRef("test-group-id"),
                name: "Test group",
                type: "group",
            };
            expect(mapWorkspaceUserGroupToGrantee(availableUserGroupAccessGrantee)).toEqual(expectedGrantee);
        });
    });

    describe("mapGranteesToGranularAccessGrantees", () => {
        it("should return correctly mapped grantees to granular access grantees", () => {
            const accessGrantees: IGranularAccessGrantee[] = [
                {
                    granteeRef: uriRef("userID1"),
                    type: "granularUser",
                    inheritedPermissions: [],
                    permissions: [],
                },
                {
                    granteeRef: uriRef("groupId"),
                    type: "granularGroup",
                    inheritedPermissions: [],
                    permissions: [],
                },
            ];
            expect(mapGranteesToGranularAccessGrantees(grantees)).toEqual(accessGrantees);
        });

        it("should return correctly mapped grantees to granular access grantees when adding new grantees", () => {
            const accessGrantees: IGranularAccessGrantee[] = [
                {
                    granteeRef: uriRef("userID1"),
                    type: "granularUser",
                    permissions: ["VIEW"],
                    inheritedPermissions: [],
                },
                {
                    granteeRef: uriRef("groupId"),
                    type: "granularGroup",
                    permissions: ["VIEW"],
                    inheritedPermissions: [],
                },
            ];
            expect(mapGranteesToGranularAccessGrantees(grantees, true)).toEqual(accessGrantees);
        });

        it("should return correctly mapped granular grantees to granular access grantees", () => {
            const accessGrantees: IGranularAccessGrantee[] = [
                {
                    granteeRef: uriRef("userID1"),
                    type: "granularUser",
                    permissions: ["VIEW"],
                    inheritedPermissions: ["SHARE"],
                },
                {
                    granteeRef: uriRef("groupId"),
                    type: "granularGroup",
                    permissions: ["EDIT"],
                    inheritedPermissions: [],
                },
            ];
            expect(mapGranteesToGranularAccessGrantees(granularGrantees)).toEqual(accessGrantees);
        });

        it("should return correctly mapped granular grantees and rules to granular access grantees", () => {
            const granteesAndRules = [...granularGrantees, granularRule];
            const accessGrantees: IGranularAccessGrantee[] = [
                {
                    granteeRef: uriRef("userID1"),
                    type: "granularUser",
                    permissions: ["VIEW"],
                    inheritedPermissions: ["SHARE"],
                },
                {
                    granteeRef: uriRef("groupId"),
                    type: "granularGroup",
                    permissions: ["EDIT"],
                    inheritedPermissions: [],
                },
                {
                    granteeRef: {
                        identifier: "allWorkspaceUsers",
                    },
                    type: "allWorkspaceUsers",
                    permissions: ["EDIT"],
                    inheritedPermissions: [],
                } as any,
            ];
            expect(mapGranteesToGranularAccessGrantees(granteesAndRules)).toEqual(accessGrantees);
        });
    });

    describe("mapAccessGranteeDetailToGrantee", () => {
        it("should return correctly mapped IUserAccess to grantee", () => {
            const expectedGrantee: GranteeItem = {
                email: "john.doe@d.com",
                id: uriRef("john-id"),
                isCurrentUser: false,
                isOwner: false,
                name: "John Doe",
                status: "Active",
                type: "user",
            };
            expect(mapAccessGranteeDetailToGrantee(userAccessGrantee, defaultUser)).toEqual(expectedGrantee);
        });

        it("should return correctly mapped current IUserAccess to grantee", () => {
            const expectedGrantee: GranteeItem = {
                email: "john.doe@d.com",
                id: uriRef("john-id"),
                isCurrentUser: true,
                isOwner: false,
                name: "John Doe",
                status: "Active",
                type: "user",
            };
            expect(mapAccessGranteeDetailToGrantee(userAccessGrantee, workspaceUser)).toEqual(
                expectedGrantee,
            );
        });

        it("should return correctly mapped current IUserGroupAccess to grantee", () => {
            const expected: GranteeItem = {
                id: uriRef("test-group-id"),
                name: "Test group",
                type: "group",
            };

            expect(mapAccessGranteeDetailToGrantee(groupAccessGrantee, defaultUser)).toEqual(expected);
        });

        it("should return correctly mapped IGranularUserAccess to grantee", () => {
            const expectedGrantee: GranteeItem = {
                email: "john.doe@d.com",
                id: uriRef("john-id"),
                isCurrentUser: true,
                isOwner: false,
                name: "John Doe",
                status: "Active",
                type: "granularUser",
                permissions: ["VIEW"],
                inheritedPermissions: ["SHARE"],
            };
            expect(mapAccessGranteeDetailToGrantee(granularUserAccess, workspaceUser)).toEqual(
                expectedGrantee,
            );
        });

        it("should return correctly mapped current IGranularUserGroupAccess to grantee", () => {
            const expected: GranteeItem = {
                id: uriRef("test-group-id"),
                name: "Test group",
                type: "granularGroup",
                permissions: ["EDIT"],
                inheritedPermissions: [],
            };

            expect(mapAccessGranteeDetailToGrantee(granularUserGroupAccess, defaultUser)).toEqual(expected);
        });
    });

    describe("mapSharedObjectToAffectedSharedObject", () => {
        it("should map shared object to expected affected shared object", () => {
            const ref = uriRef("userID1");
            const user: IUser = {
                ref: ref,
                login: "user-login",
                firstName: "User",
                lastName: "Name",
            };
            const owner = mapOwnerToGrantee(user, ref);
            const result = mapSharedObjectToAffectedSharedObject(SimpleDashboard, owner, true, false);
            expect(result).toMatchSnapshot();
        });
    });
});
