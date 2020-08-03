// (C) 2019-2020 GoodData Corporation
import { Account, Won } from "../../../../__mocks__/model";
import {
    newAbsoluteDateFilter,
    newMeasureValueFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
} from "../factory";
import { localIdRef } from "../../../objRef/factory";

describe("filter factory", () => {
    describe("newPositiveAttributeFilter", () => {
        it("should generate correct uri filter", () => {
            expect(newPositiveAttributeFilter("foo", { uris: ["bar", "baz"] })).toMatchSnapshot();
        });

        it("should generate correct value filter", () => {
            expect(newPositiveAttributeFilter("foo", { values: ["bar", "baz"] })).toMatchSnapshot();
        });

        it("should generate correct value filter when input is array of values", () => {
            expect(newPositiveAttributeFilter("foo", ["bar", "baz"])).toMatchSnapshot();
        });

        it("should generate correct filter attribute object is on input", () => {
            expect(newPositiveAttributeFilter(Account.Name, ["bar", "baz"])).toMatchSnapshot();
        });
    });

    describe("newNegativeAttributeFilter", () => {
        it("should generate correct filter", () => {
            expect(newNegativeAttributeFilter("foo", { uris: ["bar", "baz"] })).toMatchSnapshot();
        });
        it("should generate correct textual filter", () => {
            expect(newNegativeAttributeFilter("foo", { values: ["bar", "baz"] })).toMatchSnapshot();
        });
        it("should generate correct textual filter when input is array of values", () => {
            expect(newNegativeAttributeFilter("foo", ["bar", "baz"])).toMatchSnapshot();
        });
        it("should generate correct filter when input is IAttribute instance", () => {
            expect(newNegativeAttributeFilter(Account.Name, ["bar", "baz"])).toMatchSnapshot();
        });
    });

    describe("newAbsoluteDateFilter", () => {
        it("should generate correct filter", () => {
            expect(newAbsoluteDateFilter("foo", "2018-01-01", "2018-12-31")).toMatchSnapshot();
        });
    });

    describe("newRelativeDateFilter", () => {
        it("should generate correct filter", () => {
            expect(newRelativeDateFilter("foo", "GDC.time.month", 1, 3)).toMatchSnapshot();
        });
    });

    describe("newMeasureValueFilter", () => {
        it("should generate comparison filter for measure object", () => {
            expect(newMeasureValueFilter(Won, "EQUAL_TO", 11)).toMatchSnapshot();
        });
        it("should generate comparison filter for measure identifier", () => {
            expect(newMeasureValueFilter(localIdRef("measureObjLocalId"), "EQUAL_TO", 11)).toMatchSnapshot();
        });
        it("should generate comparison filter for measure local identifier", () => {
            expect(newMeasureValueFilter(localIdRef("measureObjLocalId"), "EQUAL_TO", 11)).toMatchSnapshot();
        });
        it("should generate comparison filter for measure object with treatNullValuesAs", () => {
            expect(newMeasureValueFilter(Won, "EQUAL_TO", 11, 42)).toMatchSnapshot();
        });
        it("should generate range filter for measure object", () => {
            expect(newMeasureValueFilter(Won, "BETWEEN", 0, 100)).toMatchSnapshot();
        });
        it("should generate ranger filter for measure identifier", () => {
            expect(
                newMeasureValueFilter(localIdRef("measureObjLocalId"), "BETWEEN", 0, 100),
            ).toMatchSnapshot();
        });
        it("should generate ranger filter for measure local identifier", () => {
            expect(newMeasureValueFilter("measureObjLocalId", "BETWEEN", 0, 100)).toMatchSnapshot();
        });
        it("should generate range filter for measure object with treatNullValuesAs", () => {
            expect(newMeasureValueFilter(Won, "BETWEEN", 0, 100, 42)).toMatchSnapshot();
        });
    });
});
