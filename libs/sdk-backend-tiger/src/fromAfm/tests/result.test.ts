// (C) 2020 GoodData Corporation
import { transformExecutionResult, TransformerResult } from "../result";
import { defaultValueDateFormatter } from "../../dateFormatting/dateValueFormatter";
import { mockResult, mockDimensions } from "./result.fixture";

describe("transformExecutionResult", () => {
    it("should format date dimensions values", () => {
        const actual = transformExecutionResult(mockResult, mockDimensions, defaultValueDateFormatter);
        const expected: TransformerResult = {
            count: [1, 2],
            data: [["20.0", "40.2"]],
            headerItems: [
                [
                    [
                        {
                            measureHeaderItem: {
                                name: "m_1",
                                order: 0,
                            },
                        },
                    ],
                ],
                [
                    [
                        {
                            attributeHeaderItem: {
                                uri: "/fake/1906-4",
                                name: "Q4/1906",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                uri: "/fake/1910-1",
                                name: "Q1/1910",
                            },
                        },
                    ],
                ],
            ],
            offset: [0, 0],
            total: [1, 2],
        };

        expect(actual).toEqual(expected);
    });
});
