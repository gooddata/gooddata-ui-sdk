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
                    in: ["bar", "baz"],
                },
            });
        });

        it("should generate correct textual filter", () => {
            expect(positiveAttributeFilter("foo", ["bar", "baz"], true)).toEqual({
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    in: ["bar", "baz"],
                    textFilter: true,
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
                    notIn: ["bar", "baz"],
                },
            });
        });
        it("should generate correct textual filter", () => {
            expect(negativeAttributeFilter("foo", ["bar", "baz"], true)).toEqual({
                negativeAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    notIn: ["bar", "baz"],
                    textFilter: true,
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
                    in: ["uri1", "uri2"],
                    textFilter: false,
                },
            });
        });
        it("should generate correct positive textual filter", () => {
            expect(attributeFilter("foo").in("value1", "value2")).toEqual({
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    in: ["value1", "value2"],
                    textFilter: true,
                },
            });
        });
        it("should generate correct negative positive filter", () => {
            expect(attributeFilter("foo").notInUris("uri1", "uri2")).toEqual({
                negativeAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    notIn: ["uri1", "uri2"],
                    textFilter: false,
                },
            });
        });
        it("should generate correct negative textual filter", () => {
            expect(attributeFilter("foo").notIn("value1", "value2")).toEqual({
                negativeAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    notIn: ["value1", "value2"],
                    textFilter: true,
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
