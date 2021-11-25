// (C) 2021 GoodData Corporation
import { ShareStatus } from "@gooddata/sdk-backend-spi";

import { IUser, uriRef } from "@gooddata/sdk-model";
import { groupAll, owner, user } from "../ShareDialogBase/test/GranteeMock";
import { GranteeItem, IGranteeUser } from "../ShareDialogBase/types";
import { GranteeGroupAll } from "../ShareDialogBase/utils";
import {
    mapGranteesToShareStatus,
    mapOwnerToGrantee,
    mapShareStatusToGroupAll,
    mapUserFullName,
} from "../shareDialogMappers";

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
});
