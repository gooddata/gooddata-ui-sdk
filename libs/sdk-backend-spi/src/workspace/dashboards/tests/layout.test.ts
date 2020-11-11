// (C) 2019-2020 GoodData Corporation

import { InvalidInputTestCases } from "../../../../__mocks__/typeGuards";
import {
    isFluidLayout,
    isFluidLayoutDefinition,
    isLayoutWidget,
    isLayoutWidgetDefinition,
    isSectionHeader,
    SectionHeader,
} from "../layout";
import { fluidLayout, fluidLayoutDefinition, layoutWidget, layoutWidgetDefinition } from "./layout.fixtures";

describe("layout type guards", () => {
    describe("isLayoutWidget", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "layout widget", layoutWidget],
            [false, "layout widget definition", layoutWidgetDefinition],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isLayoutWidget(input)).toBe(expectedResult);
        });
    });

    describe("isLayoutWidgetDefinition", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "layout widget", layoutWidget],
            [true, "layout widget definition", layoutWidgetDefinition],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isLayoutWidgetDefinition(input)).toBe(expectedResult);
        });
    });

    describe("isFluidLayout", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "fluid layout", fluidLayout],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isFluidLayout(input)).toBe(expectedResult);
        });
    });

    describe("isFluidLayoutDefinition", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "fluid layout definition", fluidLayoutDefinition],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isFluidLayoutDefinition(input)).toBe(expectedResult);
        });
    });

    describe("isSectionHeader", () => {
        const Scenarios: Array<[boolean, string, SectionHeader]> = [
            ...InvalidInputTestCases,
            [true, "section header", { title: "Title" }],
            [false, "section description", { description: "Title" }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isSectionHeader(input)).toBe(expectedResult);
        });
    });
});
