// (C) 2020 GoodData Corporation
import { transformExecutionResult } from "../result";
import { createDefaultDateFormatter } from "../../dateFormatting/defaultDateFormatter";
import { mockResult, mockDimensions } from "./result.fixture";

describe("transformExecutionResult", () => {
    it("should format date dimensions values", () => {
        const actual = transformExecutionResult(mockResult, mockDimensions, createDefaultDateFormatter());
        expect(actual).toMatchSnapshot();
    });
});
