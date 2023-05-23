// (C) 2019-2020 GoodData Corporation

import { InvalidInputTestCases } from "../../../__mocks__/typeGuards.js";
import { isWidgetAlert, isWidgetAlertDefinition } from "../alert.js";
import { widgetAlert, widgetAlertDefinitionToCreate, widgetAlertDefinitionToUpdate } from "./alerts.fixtures";

describe("dashboard widget alerts type guards", () => {
    describe("isWidgetAlert", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "widget alert", widgetAlert],
            [false, "widget alert definition - create", widgetAlertDefinitionToCreate],
            [false, "widget alert definition - modify", widgetAlertDefinitionToUpdate],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isWidgetAlert(input)).toBe(expectedResult);
        });
    });

    describe("isWidgetAlertDefinition", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "widget alert", widgetAlert],
            [true, "widget alert definition - create", widgetAlertDefinitionToCreate],
            [true, "widget alert definition - modify", widgetAlertDefinitionToUpdate],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isWidgetAlertDefinition(input)).toBe(expectedResult);
        });
    });
});
