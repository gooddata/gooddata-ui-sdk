// (C) 2019-2020 GoodData Corporation

import { InvariantError } from "ts-invariant";
import { bucketItemLocalId } from "../bucketItem.js";
import { Account, Won } from "../../../../__mocks__/model.js";
import { attributeLocalId } from "../../attribute/index.js";
import { measureLocalId } from "../../measure/index.js";

describe("bucketItemLocalId", () => {
    it("should throw InvariantError if bucketItem is invalid type", () => {
        expect(() => bucketItemLocalId({} as any)).toThrowError(InvariantError);
    });

    it("should return valid localIdentifier for attribute bucketItem ", () => {
        expect(bucketItemLocalId(Account.Name)).toBe(attributeLocalId(Account.Name));
    });

    it("should return valid localIdentifier for measure bucketItem ", () => {
        expect(bucketItemLocalId(Won)).toBe(measureLocalId(Won));
    });
});
