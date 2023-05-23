// (C) 2020 GoodData Corporation

import { Account, Won } from "../../../../__mocks__/model.js";
import { newMeasureValueFilter, newNegativeAttributeFilter } from "../factory.js";
import { filterFingerprint, isFilterRelevantForFingerprinting } from "../fingerprint.js";

describe("isFilterRelevantForFingerprinting", () => {
    it("should return false for noop measure value filter", () => {
        const EmptyMvf = newMeasureValueFilter(Won, "EQUAL_TO", 0);
        delete EmptyMvf.measureValueFilter.condition;

        expect(isFilterRelevantForFingerprinting(EmptyMvf)).toEqual(false);
    });

    it("should return false for noop negative attribute filter", () => {
        expect(isFilterRelevantForFingerprinting(newNegativeAttributeFilter(Account.Name, []))).toEqual(
            false,
        );
    });
});

describe("filterFingerprint", () => {
    it("should return nothing for noop measure value filter", () => {
        const EmptyMvf = newMeasureValueFilter(Won, "EQUAL_TO", 0);
        delete EmptyMvf.measureValueFilter.condition;

        expect(filterFingerprint(EmptyMvf)).toBeUndefined();
    });

    it("should return nothing for noop negative attribute filter", () => {
        expect(filterFingerprint(newNegativeAttributeFilter(Account.Name, []))).toBeUndefined();
    });
});
