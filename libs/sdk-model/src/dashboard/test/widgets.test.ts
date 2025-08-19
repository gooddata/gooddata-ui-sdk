// (C) 2019-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { widget, widgetDefinition } from "./widgets.fixtures.js";
import { InvalidInputTestCases } from "../../../__mocks__/typeGuards.js";
import { isWidget, isWidgetDefinition } from "../widget.js";

describe("widget type guards", () => {
    describe("isWidget", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "widget", widget],
            [false, "widget definition", widgetDefinition],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isWidget(input)).toBe(expectedResult);
        });
    });

    describe("isWidgetDefinition", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "widget", widget],
            [true, "widget definition", widgetDefinition],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isWidgetDefinition(input)).toBe(expectedResult);
        });
    });
});
