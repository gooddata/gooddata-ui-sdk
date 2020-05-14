// (C) 2019-2020 GoodData Corporation

import { uriRef } from "@gooddata/sdk-model";
import { InvalidInputTestCases } from "../../../../__mocks__/typeGuards";
import { IWidget, isWidget } from "../widget";

const testWidget: IWidget = {
    ref: uriRef("/widget"),
    insight: uriRef("/insight"),
    type: "insight",
    title: "",
    uri: "",
    identifier: "",
    description: "",
    alerts: [],
    drills: [],
    ignoreDashboardFilters: [],
};

describe("dashboard type guards", () => {
    describe("isWidget", () => {
        const Scenarios: Array<[boolean, string, IWidget | any]> = [
            ...InvalidInputTestCases,
            [true, "widget", testWidget],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isWidget(input)).toBe(expectedResult);
        });
    });
});
