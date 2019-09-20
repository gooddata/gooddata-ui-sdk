// (C) 2018 GoodData Corporation
import {
    absoluteDateFilter,
    attributeFilter,
    negativeAttributeFilter,
    positiveAttributeFilter,
    relativeDateFilter,
} from "../filters";

describe("Filters", () => {
    describe("positiveAttributeFilter", () => {
        it("should generate correct filter", () => {
            expect(positiveAttributeFilter("foo", ["bar", "baz"])).toEqual({
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    in: { uris: ["bar", "baz"] },
                },
            });
        });

        it("should generate correct textual filter", () => {
            expect(positiveAttributeFilter("foo", ["bar", "baz"], true)).toEqual({
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    in: { values: ["bar", "baz"] },
                },
            });
        });
    });

    describe("negativeAttributeFilter", () => {
        it("should generate correct filter", () => {
            expect(negativeAttributeFilter("foo", ["bar", "baz"])).toEqual({
                negativeAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    notIn: { uris: ["bar", "baz"] },
                },
            });
        });
        it("should generate correct textual filter", () => {
            expect(negativeAttributeFilter("foo", ["bar", "baz"], true)).toEqual({
                negativeAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    notIn: { values: ["bar", "baz"] },
                },
            });
        });
    });

    describe("attributeFilter", () => {
        it("should generate correct positive filter", () => {
            expect(attributeFilter("foo").inUris("uri1", "uri2")).toEqual({
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    in: { uris: ["uri1", "uri2"] },
                },
            });
        });
        it("should generate correct positive textual filter", () => {
            expect(attributeFilter("foo").in("value1", "value2")).toEqual({
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    in: { values: ["value1", "value2"] },
                },
            });
        });
        it("should generate correct negative positive filter", () => {
            expect(attributeFilter("foo").notInUris("uri1", "uri2")).toEqual({
                negativeAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    notIn: { uris: ["uri1", "uri2"] },
                },
            });
        });
        it("should generate correct negative textual filter", () => {
            expect(attributeFilter("foo").notIn("value1", "value2")).toEqual({
                negativeAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    notIn: { values: ["value1", "value2"] },
                },
            });
        });
    });

    describe("absoluteDateFilter", () => {
        it("should generate correct filter", () => {
            expect(absoluteDateFilter("foo", "2018-01-01", "2018-12-31")).toEqual({
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

    describe("relativeDateFilter", () => {
        it("should generate correct filter", () => {
            expect(relativeDateFilter("foo", "quarter", 1, 3)).toEqual({
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
