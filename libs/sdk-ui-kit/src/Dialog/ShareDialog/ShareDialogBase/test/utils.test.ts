// (C) 2021-2023 GoodData Corporation
import { idRef, IUser, uriRef } from "@gooddata/sdk-model";
import { createIntlMock } from "@gooddata/sdk-ui";
import { CurrentUserPermissions } from "../../types.js";
import {
    getGranteeItemTestId,
    getGranteeLabel,
    getGranularPermissionFromUserPermissions,
    getIsGranteeCurrentUser,
    notInArrayFilter,
    sortGranteesByName,
} from "../utils.js";
import { current, granularRule, groupAll, owner, user } from "./GranteeMock.js";
import { describe, it, expect } from "vitest";

describe("utils", () => {
    describe("getGranteeItemTestId", () => {
        it("should return default test id ", () => {
            expect(getGranteeItemTestId(user)).toEqual("s-gd-grantee-item-id-userid1");
        });

        it("should return default test id for option", () => {
            expect(getGranteeItemTestId(user, "option")).toEqual("s-gd-grantee-item-id-option-userid1");
        });
    });

    describe("notInArrayFilter", () => {
        it("should return grantees that are not in array ", () => {
            const array = [user, owner, current];
            const notInArray = [current];
            const result = [user, owner];
            expect(notInArrayFilter(array, notInArray)).toEqual(result);
        });
    });

    describe("sortGranteesByName", () => {
        it("should return sorted grantees array by name", () => {
            const intl = createIntlMock();
            const array = [user, groupAll, owner, current];
            const result = [groupAll, current, owner, user];
            expect(array.sort(sortGranteesByName(intl))).toEqual(result);
        });
    });

    describe("getGranteeLabel", () => {
        it("should return grantee name", () => {
            const intl = createIntlMock();
            expect(getGranteeLabel(user, intl)).toEqual("User Name");
        });

        it("should return grantee name for group all", () => {
            const intl = createIntlMock();
            expect(getGranteeLabel(groupAll, intl)).toEqual("All users");
        });

        it("should return granular grantee name for group all", () => {
            const intl = createIntlMock();
            expect(getGranteeLabel(granularRule, intl)).toEqual("All users");
        });
    });

    describe("getGranularPermissionFromUserPermissions", () => {
        it.each([
            [
                "can edit object",
                {
                    canEditAffectedObject: true,
                    canEditLockedAffectedObject: true,
                    canShareAffectedObject: true,
                    canShareLockedAffectedObject: true,
                    canViewAffectedObject: true,
                },
                "EDIT",
            ],
            [
                "cannot edit locked object",
                {
                    canEditAffectedObject: true,
                    canEditLockedAffectedObject: false,
                    canShareAffectedObject: true,
                    canShareLockedAffectedObject: true,
                    canViewAffectedObject: true,
                },
                "EDIT",
            ],
            [
                "can share object",
                {
                    canEditAffectedObject: false,
                    canEditLockedAffectedObject: false,
                    canShareAffectedObject: true,
                    canShareLockedAffectedObject: true,
                    canViewAffectedObject: true,
                },
                "SHARE",
            ],
            [
                "cannot share locked object",
                {
                    canEditAffectedObject: false,
                    canEditLockedAffectedObject: false,
                    canShareAffectedObject: true,
                    canShareLockedAffectedObject: false,
                    canViewAffectedObject: true,
                },
                "SHARE",
            ],
            [
                "can view object",
                {
                    canEditAffectedObject: false,
                    canEditLockedAffectedObject: false,
                    canShareAffectedObject: false,
                    canShareLockedAffectedObject: false,
                    canViewAffectedObject: true,
                },
                "VIEW",
            ],
            [
                "has no permission",
                {
                    canEditAffectedObject: false,
                    canEditLockedAffectedObject: false,
                    canShareAffectedObject: false,
                    canShareLockedAffectedObject: false,
                    canViewAffectedObject: false,
                },
                undefined,
            ],
        ])(
            "should return correct granular permission when user %s",
            (_label: string, userPermissions: CurrentUserPermissions, expected: string | undefined) => {
                expect(getGranularPermissionFromUserPermissions(userPermissions)).toEqual(expected);
            },
        );
    });

    describe("getIsGranteeCurrentUser", () => {
        const userWithUriRef: IUser = {
            ref: uriRef("user-uri"),
            login: "user-id",
            email: "user-email",
        };

        const userWithIdRef: IUser = {
            ref: idRef("user-id"),
            login: "user-id",
            email: "user-email",
        };

        it("should return true when grantee ref matches user ref", () => {
            const granteeRef = uriRef("user-uri");
            expect(getIsGranteeCurrentUser(granteeRef, userWithUriRef)).toBe(true);
        });

        it("should return true when grantee ref matches user login", () => {
            const granteeRef = idRef("user-id");
            expect(getIsGranteeCurrentUser(granteeRef, userWithUriRef)).toBe(true);
        });

        it("should return false when grantee ref does not match uri nor login", () => {
            const granteeRef = uriRef("user-uri");
            expect(getIsGranteeCurrentUser(granteeRef, userWithIdRef)).toBe(false);
        });
    });
});
