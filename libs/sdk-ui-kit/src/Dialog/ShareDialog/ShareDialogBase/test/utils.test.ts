// (C) 2021 GoodData Corporation
import { createIntlMock } from "@gooddata/sdk-ui";
import { getGranteeItemTestId, getGranteeLabel, notInArrayFilter, sortGranteesByName } from "../utils";
import { current, groupAll, owner, user } from "./GranteeMock";

describe("utils", () => {
    describe("getGranteeItemTestId", () => {
        it("should return default test id ", () => {
            expect(getGranteeItemTestId(user)).toEqual("s-gd-grantee-item-id-userID1");
        });

        it("should return default test id for option", () => {
            expect(getGranteeItemTestId(user, "option")).toEqual("s-gd-grantee-item-id-option-userID1");
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
    });
});
