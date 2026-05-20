// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IDashboardArbitraryAttributeFilter,
    type IDashboardMatchAttributeFilter,
    type MeasureValueFilterCondition,
    idRef,
    newArbitraryAttributeFilter,
    newMatchAttributeFilter,
} from "@gooddata/sdk-model";

import {
    stringifyMeasureValueFilterCondition,
    stringifyTextFilterSelection,
} from "../resolveDrillToCustomUrl.js";

describe("stringifyTextFilterSelection", () => {
    describe("dashboard arbitrary attribute filter", () => {
        it("should serialize positive filter with values", () => {
            const filter: IDashboardArbitraryAttributeFilter = {
                arbitraryAttributeFilter: {
                    displayForm: idRef("df"),
                    values: ["foo", "bar"],
                    negativeSelection: false,
                },
            };
            expect(stringifyTextFilterSelection(filter)).toBe('IN["foo","bar"]');
        });

        it("should serialize negative filter with values", () => {
            const filter: IDashboardArbitraryAttributeFilter = {
                arbitraryAttributeFilter: {
                    displayForm: idRef("df"),
                    values: ["foo"],
                    negativeSelection: true,
                },
            };
            expect(stringifyTextFilterSelection(filter)).toBe('NOT_IN["foo"]');
        });

        it("should serialize filter with empty values", () => {
            const filter: IDashboardArbitraryAttributeFilter = {
                arbitraryAttributeFilter: {
                    displayForm: idRef("df"),
                    values: [],
                    negativeSelection: false,
                },
            };
            expect(stringifyTextFilterSelection(filter)).toBe("IN[]");
        });

        it("should serialize filter with null values", () => {
            const filter: IDashboardArbitraryAttributeFilter = {
                arbitraryAttributeFilter: {
                    displayForm: idRef("df"),
                    values: [null, "foo"],
                    negativeSelection: false,
                },
            };
            expect(stringifyTextFilterSelection(filter)).toBe('IN[null,"foo"]');
        });
    });

    describe("dashboard match attribute filter", () => {
        it("should serialize positive contains filter", () => {
            const filter: IDashboardMatchAttributeFilter = {
                matchAttributeFilter: {
                    displayForm: idRef("df"),
                    operator: "contains",
                    literal: "hello",
                    negativeSelection: false,
                },
            };
            expect(stringifyTextFilterSelection(filter)).toBe('CONTAINS["hello"]');
        });

        it("should serialize negative contains filter", () => {
            const filter: IDashboardMatchAttributeFilter = {
                matchAttributeFilter: {
                    displayForm: idRef("df"),
                    operator: "contains",
                    literal: "hello",
                    negativeSelection: true,
                },
            };
            expect(stringifyTextFilterSelection(filter)).toBe('NOT_CONTAINS["hello"]');
        });

        it("should serialize startsWith filter", () => {
            const filter: IDashboardMatchAttributeFilter = {
                matchAttributeFilter: {
                    displayForm: idRef("df"),
                    operator: "startsWith",
                    literal: "prefix",
                },
            };
            expect(stringifyTextFilterSelection(filter)).toBe('STARTS_WITH["prefix"]');
        });

        it("should serialize negative endsWith filter", () => {
            const filter: IDashboardMatchAttributeFilter = {
                matchAttributeFilter: {
                    displayForm: idRef("df"),
                    operator: "endsWith",
                    literal: "suffix",
                    negativeSelection: true,
                },
            };
            expect(stringifyTextFilterSelection(filter)).toBe('NOT_ENDS_WITH["suffix"]');
        });
    });

    describe("execution-level arbitrary attribute filter", () => {
        it("should serialize positive filter", () => {
            const filter = newArbitraryAttributeFilter("df", ["val1", "val2"]);
            expect(stringifyTextFilterSelection(filter)).toBe('IN["val1","val2"]');
        });

        it("should serialize negative filter", () => {
            const filter = newArbitraryAttributeFilter("df", ["val1"], true);
            expect(stringifyTextFilterSelection(filter)).toBe('NOT_IN["val1"]');
        });
    });

    describe("execution-level match attribute filter", () => {
        it("should serialize positive contains filter", () => {
            const filter = newMatchAttributeFilter("df", "contains", "test");
            expect(stringifyTextFilterSelection(filter)).toBe('CONTAINS["test"]');
        });

        it("should serialize negative startsWith filter", () => {
            const filter = newMatchAttributeFilter("df", "startsWith", "test", {
                negativeSelection: true,
            });
            expect(stringifyTextFilterSelection(filter)).toBe('NOT_STARTS_WITH["test"]');
        });

        it("should serialize endsWith filter", () => {
            const filter = newMatchAttributeFilter("df", "endsWith", "test");
            expect(stringifyTextFilterSelection(filter)).toBe('ENDS_WITH["test"]');
        });
    });
});

describe("stringifyMeasureValueFilterCondition", () => {
    it("should serialize empty conditions as ALL", () => {
        expect(stringifyMeasureValueFilterCondition(undefined)).toBe("ALL");
        expect(stringifyMeasureValueFilterCondition([])).toBe("ALL");
    });

    it("should serialize a single comparison condition", () => {
        const conditions: MeasureValueFilterCondition[] = [
            {
                comparison: {
                    operator: "GREATER_THAN",
                    value: 100,
                },
            },
        ];

        expect(stringifyMeasureValueFilterCondition(conditions)).toBe("GREATER_THAN(100)");
    });

    it("should serialize a single range condition", () => {
        const conditions: MeasureValueFilterCondition[] = [
            {
                range: {
                    operator: "BETWEEN",
                    from: 10,
                    to: 100,
                },
            },
        ];

        expect(stringifyMeasureValueFilterCondition(conditions)).toBe("BETWEEN(10,100)");
    });

    it("should serialize multiple conditions as OR with pipe separator", () => {
        const conditions: MeasureValueFilterCondition[] = [
            {
                comparison: {
                    operator: "GREATER_THAN",
                    value: 100,
                },
            },
            {
                comparison: {
                    operator: "LESS_THAN",
                    value: 10,
                },
            },
        ];

        expect(stringifyMeasureValueFilterCondition(conditions)).toBe("GREATER_THAN(100)|LESS_THAN(10)");
    });
});
