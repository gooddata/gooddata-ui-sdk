// (C) 2019 GoodData Corporation

/**
 * Contains
 */
export const InvalidInputTestCases: Array<[boolean, string, any]> = [
    [false, "null", null],
    [false, "undefined", undefined],
    [false, "empty object", {}],
    [false, "array", []],
    [false, "string", "bleh"],
];
