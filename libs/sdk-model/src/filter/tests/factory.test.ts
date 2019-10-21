// (C) 2019 GoodData Corporation
import { Account } from "../../../__mocks__/model";
import {
    newAbsoluteDateFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
} from "../factory";

describe("filter factory", () => {
    describe("newPositiveAttributeFilter", () => {
        it("should generate correct uri filter", () => {
            expect(newPositiveAttributeFilter("foo", { uris: ["bar", "baz"] })).toEqual({
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    in: { uris: ["bar", "baz"] },
                },
            });
        });

        it("should generate correct value filter", () => {
            expect(newPositiveAttributeFilter("foo", { values: ["bar", "baz"] })).toEqual({
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    in: { values: ["bar", "baz"] },
                },
            });
        });

        it("should generate correct value filter when input is array of values", () => {
            expect(newPositiveAttributeFilter("foo", ["bar", "baz"])).toEqual({
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    in: { values: ["bar", "baz"] },
                },
            });
        });

        it("should generate correct filter attribute object is on input", () => {
            expect(newPositiveAttributeFilter(Account.Name, ["bar", "baz"])).toEqual({
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: "label.account.id.name",
                    },
                    in: { values: ["bar", "baz"] },
                },
            });
        });
    });

    describe("newNegativeAttributeFilter", () => {
        it("should generate correct filter", () => {
            expect(newNegativeAttributeFilter("foo", { uris: ["bar", "baz"] })).toEqual({
                negativeAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    notIn: { uris: ["bar", "baz"] },
                },
            });
        });
        it("should generate correct textual filter", () => {
            expect(newNegativeAttributeFilter("foo", { values: ["bar", "baz"] })).toEqual({
                negativeAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    notIn: { values: ["bar", "baz"] },
                },
            });
        });
        it("should generate correct textual filter when input is array of values", () => {
            expect(newNegativeAttributeFilter("foo", ["bar", "baz"])).toEqual({
                negativeAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    notIn: { values: ["bar", "baz"] },
                },
            });
        });
        it("should generate correct filter when input is IAttribute instance", () => {
            expect(newNegativeAttributeFilter(Account.Name, ["bar", "baz"])).toEqual({
                negativeAttributeFilter: {
                    displayForm: {
                        identifier: "label.account.id.name",
                    },
                    notIn: { values: ["bar", "baz"] },
                },
            });
        });
    });

    describe("newAbsoluteDateFilter", () => {
        it("should generate correct filter", () => {
            expect(newAbsoluteDateFilter("foo", "2018-01-01", "2018-12-31")).toEqual({
                absoluteDateFilter: {
                    dataSet: {
                        identifier: "foo",
                    },
                    from: "2018-01-01",
                    to: "2018-12-31",
                },
            });
        });
    });

    describe("newRelativeDateFilter", () => {
        it("should generate correct filter", () => {
            expect(newRelativeDateFilter("foo", "quarter", 1, 3)).toEqual({
                relativeDateFilter: {
                    dataSet: {
                        identifier: "foo",
                    },
                    granularity: "quarter",
                    from: 1,
                    to: 3,
                },
            });
        });
    });
});
