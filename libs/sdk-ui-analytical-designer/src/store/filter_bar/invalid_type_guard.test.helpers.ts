// (C) 2007-2026 GoodData Corporation

const cases: Array<[boolean, string, unknown]> = [
    [false, "null", null],
    [false, "undefined", undefined],
    [false, "empty object", {}],
    [false, "array", []],
    [false, "string", "bleh"],
    [false, "number", 42],
    [false, "boolean", true],
    [false, "function", () => false],
];

/**
 * The non-values every type guard must reject, typed as the guard's declared input so a scenario
 * table can mix them with the real inputs. The cast is the point: these are deliberately NOT
 * that type.
 */
export function invalidTypeGuardInputs<T>(): Array<[boolean, string, T]> {
    return cases as Array<[boolean, string, T]>;
}
