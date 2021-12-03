// (C) 2021 GoodData Corporation
import { ShareStatus } from "@gooddata/sdk-backend-spi";
import { IListedDashboard, IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { IUser, uriRef } from "@gooddata/sdk-model";
import { ReferenceRecordings } from "@gooddata/reference-workspace";

import {
    grantees,
    groupAccessGrantee,
    groupAll,
    owner,
    user,
    userAccessGrantee,
    workSpaceGroup,
    workspaceUser,
} from "../ShareDialogBase/test/GranteeMock";
import { GranteeItem, IGranteeUser } from "../ShareDialogBase/types";
import { GranteeGroupAll } from "../ShareDialogBase/utils";
import {
    mapGranteesToAccessGrantees,
    mapGranteesToShareStatus,
    mapOwnerToGrantee,
    mapShareStatusToGroupAll,
    mapUserFullName,
    mapWorkspaceUserGroupToGrantee,
    mapWorkspaceUserToGrantee,
    mapAccessGranteeDetailToGrantee,
    mapSharedObjectToAffectedSharedObject,
} from "../shareDialogMappers";

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
                name: "John Doe ",
                status: "Active",
                type: "user",
            };

            expect(mapWorkspaceUserToGrantee(workspaceUser, uriRef(""))).toEqual(expectedGrantee);
        });

        it("should return correctly mapped current workspace user to grantee", () => {
            const expectedGrantee: GranteeItem = {
                email: "john.doe@d.com",
                id: uriRef("john-id"),
                isCurrentUser: true,
                isOwner: false,
                name: "John Doe ",
                status: "Active",
                type: "user",
            };

            expect(mapWorkspaceUserToGrantee(workspaceUser, uriRef("john-id"))).toEqual(expectedGrantee);
        });
    });

    describe("mapWorkspaceUserGroupToGrantee", () => {
        it("should return correctly mapped workspace user to grantee", () => {
            const expectedGrantee: GranteeItem = {
                id: uriRef("test-group-id"),
                name: "Test group",
                type: "group",
            };
            expect(mapWorkspaceUserGroupToGrantee(workSpaceGroup)).toEqual(expectedGrantee);
        });
    });

    describe("mapGranteesToAccessGrantees", () => {
        it("should return correctly mapped grantees to access grantees", () => {
            const accessGrantee = [
                { granteeRef: uriRef("userID1"), type: "user" },
                { granteeRef: uriRef("groupId"), type: "group" },
            ];
            expect(mapGranteesToAccessGrantees(grantees)).toEqual(accessGrantee);
        });
    });

    describe("mapAccessGranteeDetailToGrantee", () => {
        it("should return correctly mapped IUserAccess to grantee", () => {
            const expectedGrantee: GranteeItem = {
                email: "john.doe@d.com",
                id: uriRef("john-id"),
                isCurrentUser: false,
                isOwner: false,
                name: "John Doe ",
                status: "Active",
                type: "user",
            };
            expect(mapAccessGranteeDetailToGrantee(userAccessGrantee, uriRef(""))).toEqual(expectedGrantee);
        });

        it("should return correctly mapped current IUserAccess to grantee", () => {
            const expectedGrantee: GranteeItem = {
                email: "john.doe@d.com",
                id: uriRef("john-id"),
                isCurrentUser: true,
                isOwner: false,
                name: "John Doe ",
                status: "Active",
                type: "user",
            };
            expect(mapAccessGranteeDetailToGrantee(userAccessGrantee, uriRef("john-id"))).toEqual(
                expectedGrantee,
            );
        });

        it("should return correctly mapped current IUserGroupAccess to grantee", () => {
            const expected: GranteeItem = {
                id: uriRef("test-group-id"),
                name: "Test group",
                type: "group",
            };

            expect(mapAccessGranteeDetailToGrantee(groupAccessGrantee, uriRef(""))).toEqual(expected);
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
