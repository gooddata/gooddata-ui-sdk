// (C) 2019 GoodData Corporation

import { Account } from "../../../__mocks__/model";
import { newNegativeAttributeFilter, newPositiveAttributeFilter } from "../factory";
import { filterIsEmpty } from "../index";

describe("filterIsEmpty", () => {
    const Scenarios: Array<[boolean, string, any]> = [
        [true, "no items in positive filter", newPositiveAttributeFilter(Account.Name, [])],
        [true, "no items in negative filter", newNegativeAttributeFilter(Account.Name, [])],
        [false, "values in positive filter", newPositiveAttributeFilter(Account.Name, ["value1"])],
        [false, "values in negative filter", newNegativeAttributeFilter(Account.Name, ["value1"])],
        [false, "uris in positive filter", newPositiveAttributeFilter(Account.Name, { uris: ["/uri1"] })],
        [false, "uris in negative filter", newNegativeAttributeFilter(Account.Name, { uris: ["/uri1"] })],
    ];

    it.each(Scenarios)("should return %s when %s", (expectedResult, _desc, input) => {
        expect(filterIsEmpty(input)).toBe(expectedResult);
    });
});
