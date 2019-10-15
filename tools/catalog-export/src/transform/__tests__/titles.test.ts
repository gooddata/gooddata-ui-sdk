// (C) 2007-2019 GoodData Corporation

import { createUniqueVariableName } from "../titles";

describe("createUniqueVariableName", () => {
    describe("title transformation", () => {
        const TEST_DATA: Array<[string, string]> = [
            ["MyMeasure", "my Measure"],
            ["MyMeasure", "My Measure"],
            ["_123MyMeasure", "123My Measure"],
            ["MyMeasure", "My     Measure"],
            ["MyMeasure", "My (Measure)"],
            ["MyMeasure122", "My Measure !122)(.)^(.)!@("],
            ["MyMeasurePlusOne", "My (Measure) Plus One"],
            ["CumulativeCTOClaim1", "Cumulative CTO Claim(1)"],
            ["ERHoursLastWeekVsMED90D", "ER Hours - Last Week vs MED 90D"],
            ["ERWeekendAndHolidayPayment", "ER Weekend&Holiday Payment"],
            ["WeekMonSunCreated", "Week (Mon-Sun) (created)"],
            ["AgentOs", "agent_os"],
            ["NrOfOpportunities", "# Of Opportunities"],
            ["$Spent", "$ - Spent"],
            ["MinExecTime", "min_exec_time"],
        ];

        it.each(TEST_DATA)("should return '%s' when input is '%s'", (expectedResult, input) => {
            expect(createUniqueVariableName(input)).toEqual(expectedResult);
        });
    });

    describe("uniqueness guarantees", () => {
        it("should append 1 if name is taken", () => {
            expect(createUniqueVariableName("Something", { Something: true })).toEqual("Something1");
        });
        it("should append 2 if names are taken", () => {
            expect(createUniqueVariableName("Something", { Something: true, Something1: true })).toEqual(
                "Something2",
            );
        });
        it("should work with transformed title", () => {
            expect(createUniqueVariableName("something", { Something: true })).toEqual("Something1");
        });
    });
});
