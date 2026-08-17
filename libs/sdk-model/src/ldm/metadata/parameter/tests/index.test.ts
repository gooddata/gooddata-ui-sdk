// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IParameterDefinition,
    getParameterAllowedValueTitle,
    getParameterAllowedValues,
    getParameterValueTitle,
    isStringParameterDefinition,
    isValidNumberParameterValue,
    isValidParameterValue,
    isValidStringParameterValue,
    parameterValueMatchesType,
    sanitizeParameterValue,
} from "../index.js";

describe("isValidNumberParameterValue", () => {
    it("returns true for a value within min/max bounds", () => {
        expect(isValidNumberParameterValue(5, { min: 0, max: 10 })).toBe(true);
    });

    it("returns false for a value below min", () => {
        expect(isValidNumberParameterValue(-1, { min: 0, max: 10 })).toBe(false);
    });

    it("returns false for a value above max", () => {
        expect(isValidNumberParameterValue(11, { min: 0, max: 10 })).toBe(false);
    });

    it("treats bounds as inclusive (== min and == max are valid)", () => {
        expect(isValidNumberParameterValue(0, { min: 0, max: 10 })).toBe(true);
        expect(isValidNumberParameterValue(10, { min: 0, max: 10 })).toBe(true);
    });

    it("treats a missing bound as unbounded on that side", () => {
        expect(isValidNumberParameterValue(1000, { min: 0 })).toBe(true);
        expect(isValidNumberParameterValue(-1, { min: 0 })).toBe(false);
        expect(isValidNumberParameterValue(-1000, { max: 10 })).toBe(true);
        expect(isValidNumberParameterValue(11, { max: 10 })).toBe(false);
    });

    it("returns true for any finite value when there are no constraints", () => {
        expect(isValidNumberParameterValue(42)).toBe(true);
        expect(isValidNumberParameterValue(-42, {})).toBe(true);
    });

    it("returns false for non-finite values regardless of constraints", () => {
        expect(isValidNumberParameterValue(NaN)).toBe(false);
        expect(isValidNumberParameterValue(Infinity)).toBe(false);
        expect(isValidNumberParameterValue(-Infinity)).toBe(false);
        expect(isValidNumberParameterValue(Infinity, { min: 0 })).toBe(false);
    });
});

describe("isValidStringParameterValue", () => {
    it("treats minLength/maxLength bounds as inclusive", () => {
        expect(isValidStringParameterValue("Plan", { minLength: 4, maxLength: 4 })).toBe(true);
        expect(isValidStringParameterValue("Pla", { minLength: 4 })).toBe(false);
        expect(isValidStringParameterValue("Plans", { maxLength: 4 })).toBe(false);
    });

    it("requires membership when a non-empty allowedValues list is present", () => {
        const allowedValues = [{ value: "Actual" }, { value: "Plan", title: "Plan scenario" }];
        expect(isValidStringParameterValue("Plan", { allowedValues })).toBe(true);
        expect(isValidStringParameterValue("Forecast", { allowedValues })).toBe(false);
    });

    it("enforces length bounds and membership together", () => {
        const constraints = {
            minLength: 1,
            maxLength: 5,
            allowedValues: [{ value: "Plan" }, { value: "Forecast" }],
        };
        expect(isValidStringParameterValue("Plan", constraints)).toBe(true);
        expect(isValidStringParameterValue("Forecast", constraints)).toBe(false);
        expect(isValidStringParameterValue("Actual", constraints)).toBe(false);
    });

    it("treats an empty allowedValues list as free text", () => {
        expect(isValidStringParameterValue("Anything", { allowedValues: [] })).toBe(true);
        expect(isValidStringParameterValue("Anything", { maxLength: 3, allowedValues: [] })).toBe(false);
    });

    it("accepts any value when no constraints are given", () => {
        expect(isValidStringParameterValue("Anything")).toBe(true);
        expect(isValidStringParameterValue("", {})).toBe(true);
    });
});

describe("isValidParameterValue", () => {
    it("validates a NUMBER value against the definition's min/max", () => {
        const definition: IParameterDefinition = {
            type: "NUMBER",
            defaultValue: 5,
            constraints: { min: 0, max: 10 },
        };
        expect(isValidParameterValue(definition, 5)).toBe(true);
        expect(isValidParameterValue(definition, 11)).toBe(false);
    });

    it("accepts any string for a STRING definition without constraints", () => {
        const definition: IParameterDefinition = { type: "STRING", defaultValue: "Actual" };
        expect(isValidParameterValue(definition, "Plan")).toBe(true);
        expect(isValidParameterValue(definition, "")).toBe(true);
    });

    it("honors minLength/maxLength for a STRING definition", () => {
        const definition: IParameterDefinition = {
            type: "STRING",
            defaultValue: "Actual",
            constraints: { minLength: 1, maxLength: 5 },
        };
        expect(isValidParameterValue(definition, "Plan")).toBe(true);
        expect(isValidParameterValue(definition, "")).toBe(false);
        expect(isValidParameterValue(definition, "TooLong")).toBe(false);
    });

    it("rejects a value whose type does not match the definition", () => {
        const numberDefinition: IParameterDefinition = { type: "NUMBER", defaultValue: 5 };
        const stringDefinition: IParameterDefinition = { type: "STRING", defaultValue: "Actual" };
        expect(isValidParameterValue(numberDefinition, "Plan")).toBe(false);
        expect(isValidParameterValue(stringDefinition, 5)).toBe(false);
    });

    it("requires membership when a STRING definition's constraints have allowedValues", () => {
        const definition: IParameterDefinition = {
            type: "STRING",
            defaultValue: "Actual",
            constraints: { allowedValues: [{ value: "Actual" }, { value: "Plan", title: "Plan scenario" }] },
        };
        expect(isValidParameterValue(definition, "Plan")).toBe(true);
        expect(isValidParameterValue(definition, "Forecast")).toBe(false);
    });

    it("treats an empty allowedValues list as free text restricted only by the length bounds", () => {
        const definition: IParameterDefinition = {
            type: "STRING",
            defaultValue: "Actual",
            constraints: { maxLength: 6, allowedValues: [] },
        };
        expect(isValidParameterValue(definition, "Actual")).toBe(true);
        expect(isValidParameterValue(definition, "Plan")).toBe(true);
        expect(isValidParameterValue(definition, "TooLong")).toBe(false);
    });

    it("still enforces minLength/maxLength alongside allowedValues membership", () => {
        const definition: IParameterDefinition = {
            type: "STRING",
            defaultValue: "Actual",
            constraints: {
                minLength: 1,
                maxLength: 5,
                allowedValues: [{ value: "Plan" }, { value: "Forecast" }],
            },
        };
        expect(isValidParameterValue(definition, "Plan")).toBe(true);
        expect(isValidParameterValue(definition, "Forecast")).toBe(false);
    });
});

describe("sanitizeParameterValue", () => {
    it("passes a valid value through and recovers an invalid one to the default", () => {
        const definition: IParameterDefinition = {
            type: "NUMBER",
            defaultValue: 5,
            constraints: { min: 0, max: 10 },
        };
        expect(sanitizeParameterValue(definition, 7)).toBe(7);
        expect(sanitizeParameterValue(definition, 999)).toBe(5);
        expect(sanitizeParameterValue(definition, "Plan")).toBe(5);
    });

    it("passes a valid STRING value through and recovers an invalid one to the string default", () => {
        const definition: IParameterDefinition = {
            type: "STRING",
            defaultValue: "Actual",
            constraints: { maxLength: 5 },
        };
        expect(sanitizeParameterValue(definition, "Plan")).toBe("Plan");
        expect(sanitizeParameterValue(definition, 7)).toBe("Actual");
        expect(sanitizeParameterValue(definition, "TooLong")).toBe("Actual");
    });

    it("recovers an out-of-set STRING value to the default when allowedValues is present", () => {
        const definition: IParameterDefinition = {
            type: "STRING",
            defaultValue: "Actual",
            constraints: { allowedValues: [{ value: "Actual" }, { value: "Plan" }] },
        };
        expect(sanitizeParameterValue(definition, "Plan")).toBe("Plan");
        expect(sanitizeParameterValue(definition, "Forecast")).toBe("Actual");
    });
});

describe("parameterValueMatchesType", () => {
    it("matches values by runtime kind, ignoring constraints", () => {
        const numberDefinition: IParameterDefinition = {
            type: "NUMBER",
            defaultValue: 5,
            constraints: { min: 0, max: 10 },
        };
        const stringDefinition: IParameterDefinition = {
            type: "STRING",
            defaultValue: "Actual",
            constraints: { maxLength: 3 },
        };
        expect(parameterValueMatchesType(numberDefinition, 999)).toBe(true);
        expect(parameterValueMatchesType(numberDefinition, "Plan")).toBe(false);
        expect(parameterValueMatchesType(stringDefinition, "TooLong")).toBe(true);
        expect(parameterValueMatchesType(stringDefinition, 5)).toBe(false);
    });
});

describe("getParameterAllowedValueTitle", () => {
    it("returns the title when present and the value otherwise", () => {
        expect(getParameterAllowedValueTitle({ value: "Plan", title: "Plan scenario" })).toBe(
            "Plan scenario",
        );
        expect(getParameterAllowedValueTitle({ value: "Plan" })).toBe("Plan");
    });
});

describe("getParameterAllowedValues", () => {
    it("returns the allowed values of a STRING definition that enumerates them", () => {
        const allowedValues = [{ value: "Actual" }, { value: "Plan", title: "Plan scenario" }];
        expect(
            getParameterAllowedValues({
                type: "STRING",
                defaultValue: "Actual",
                constraints: { allowedValues },
            }),
        ).toEqual(allowedValues);
    });

    it("returns undefined for a STRING definition with an empty or absent allowed value list", () => {
        expect(
            getParameterAllowedValues({
                type: "STRING",
                defaultValue: "Actual",
                constraints: { allowedValues: [] },
            }),
        ).toBeUndefined();
        expect(
            getParameterAllowedValues({
                type: "STRING",
                defaultValue: "Actual",
                constraints: { maxLength: 10 },
            }),
        ).toBeUndefined();
        expect(getParameterAllowedValues({ type: "STRING", defaultValue: "Actual" })).toBeUndefined();
    });

    it("returns undefined for a NUMBER definition", () => {
        expect(
            getParameterAllowedValues({ type: "NUMBER", defaultValue: 5, constraints: { min: 0 } }),
        ).toBeUndefined();
    });
});

describe("getParameterValueTitle", () => {
    it("returns the matching allowed value's title", () => {
        const definition: IParameterDefinition = {
            type: "STRING",
            defaultValue: "Actual",
            constraints: { allowedValues: [{ value: "Actual" }, { value: "Plan", title: "Plan scenario" }] },
        };
        expect(getParameterValueTitle(definition, "Plan")).toBe("Plan scenario");
    });

    it("returns the value itself when the matching allowed value has no title", () => {
        const definition: IParameterDefinition = {
            type: "STRING",
            defaultValue: "Actual",
            constraints: { allowedValues: [{ value: "Actual" }, { value: "Plan", title: "Plan scenario" }] },
        };
        expect(getParameterValueTitle(definition, "Actual")).toBe("Actual");
    });

    it("returns an out-of-set value as is, without mapping it to the default", () => {
        const definition: IParameterDefinition = {
            type: "STRING",
            defaultValue: "Actual",
            constraints: { allowedValues: [{ value: "Actual", title: "Actual results" }] },
        };
        expect(getParameterValueTitle(definition, "Forecast")).toBe("Forecast");
    });

    it("returns the plain value for a free-text STRING definition", () => {
        expect(getParameterValueTitle({ type: "STRING", defaultValue: "Actual" }, "Anything")).toBe(
            "Anything",
        );
        expect(
            getParameterValueTitle(
                { type: "STRING", defaultValue: "Actual", constraints: { maxLength: 10 } },
                "Anything",
            ),
        ).toBe("Anything");
        expect(
            getParameterValueTitle(
                { type: "STRING", defaultValue: "Actual", constraints: { allowedValues: [] } },
                "Anything",
            ),
        ).toBe("Anything");
    });

    it("stringifies the value for a NUMBER definition", () => {
        const definition: IParameterDefinition = {
            type: "NUMBER",
            defaultValue: 5,
            constraints: { min: 0, max: 10 },
        };
        expect(getParameterValueTitle(definition, 7)).toBe("7");
    });
});

describe("isStringParameterDefinition", () => {
    it("is true for a STRING definition and false for a NUMBER definition", () => {
        expect(isStringParameterDefinition({ type: "STRING", defaultValue: "Actual" })).toBe(true);
        expect(isStringParameterDefinition({ type: "NUMBER", defaultValue: 5 })).toBe(false);
    });
});
