// (C) 2019-2020 GoodData Corporation
import { validateFilterOption } from "../OptionValidation";
import {
    IExtendedDateFilterErrors,
    IUiAbsoluteDateFilterForm,
    IUiRelativeDateFilterForm,
    DateFilterOption,
} from "../../interfaces";

describe("validateFilterOption", () => {
    describe("absoluteForm validation", () => {
        it("should validate semantically correct form", () => {
            const filter: IUiAbsoluteDateFilterForm = {
                from: "2019-01-01",
                to: "2019-30-01",
                localIdentifier: "ABSOLUTE_FORM",
                type: "absoluteForm",
                name: "",
                visible: true,
            };
            const expected: IExtendedDateFilterErrors = {};
            const actual = validateFilterOption(filter);
            expect(actual).toEqual(expected);
        });

        it("should not validate semantically incorrect from (with message)", () => {
            const filter: IUiAbsoluteDateFilterForm = {
                from: undefined,
                to: "2019-30-01",
                localIdentifier: "ABSOLUTE_FORM",
                type: "absoluteForm",
                name: "",
                visible: true,
            };
            const expected: IExtendedDateFilterErrors = {
                absoluteForm: {
                    from: "filters.staticPeriod.incorrectFormat",
                },
            };
            const actual = validateFilterOption(filter);
            expect(actual).toEqual(expected);
        });

        it("should not validate semantically incorrect to (with message)", () => {
            const filter: IUiAbsoluteDateFilterForm = {
                from: "2019-30-01",
                to: undefined,
                localIdentifier: "ABSOLUTE_FORM",
                type: "absoluteForm",
                name: "",
                visible: true,
            };
            const expected: IExtendedDateFilterErrors = {
                absoluteForm: {
                    to: "filters.staticPeriod.incorrectFormat",
                },
            };
            const actual = validateFilterOption(filter);
            expect(actual).toEqual(expected);
        });

        it("should not validate form without from specified (without message)", () => {
            const filter: IUiAbsoluteDateFilterForm = {
                from: null,
                to: "2019-30-01",
                localIdentifier: "ABSOLUTE_FORM",
                type: "absoluteForm",
                name: "",
                visible: true,
            };
            const expected: IExtendedDateFilterErrors = {
                absoluteForm: {},
            };
            const actual = validateFilterOption(filter);
            expect(actual).toEqual(expected);
        });

        it("should not validate form without to specified (without message)", () => {
            const filter: IUiAbsoluteDateFilterForm = {
                from: "2019-30-01",
                to: null,
                localIdentifier: "ABSOLUTE_FORM",
                type: "absoluteForm",
                name: "",
                visible: true,
            };
            const expected: IExtendedDateFilterErrors = {
                absoluteForm: {},
            };
            const actual = validateFilterOption(filter);
            expect(actual).toEqual(expected);
        });

        it("should not validate hidden form (without message)", () => {
            const filter: IUiAbsoluteDateFilterForm = {
                from: "2019-01-01",
                to: "2019-30-01",
                localIdentifier: "ABSOLUTE_FORM",
                type: "absoluteForm",
                name: "",
                visible: false,
            };
            const expected: IExtendedDateFilterErrors = {
                absoluteForm: {},
            };
            const actual = validateFilterOption(filter);
            expect(actual).toEqual(expected);
        });
    });

    describe("relativeForm validation", () => {
        it("should validate semantically correct form", () => {
            const filter: IUiRelativeDateFilterForm = {
                from: 5,
                to: 5,
                localIdentifier: "RELATIVE_FORM",
                type: "relativeForm",
                granularity: "GDC.time.date",
                availableGranularities: ["GDC.time.date"],
                name: "",
                visible: true,
            };
            const expected: IExtendedDateFilterErrors = {};
            const actual = validateFilterOption(filter);
            expect(actual).toEqual(expected);
        });

        it("should validate semantically correct form with zeroes", () => {
            const filter: IUiRelativeDateFilterForm = {
                from: 0,
                to: 0,
                localIdentifier: "RELATIVE_FORM",
                type: "relativeForm",
                granularity: "GDC.time.date",
                availableGranularities: ["GDC.time.date"],
                name: "",
                visible: true,
            };
            const expected: IExtendedDateFilterErrors = {};
            const actual = validateFilterOption(filter);
            expect(actual).toEqual(expected);
        });

        it("should not validate form without from specified", () => {
            const filter: IUiRelativeDateFilterForm = {
                to: 5,
                localIdentifier: "RELATIVE_FORM",
                type: "relativeForm",
                granularity: "GDC.time.date",
                availableGranularities: ["GDC.time.date"],
                name: "",
                visible: true,
            };
            const expected: IExtendedDateFilterErrors = {
                relativeForm: {},
            };
            const actual = validateFilterOption(filter);
            expect(actual).toEqual(expected);
        });

        it("should not validate form without to specified", () => {
            const filter: IUiRelativeDateFilterForm = {
                from: 5,
                localIdentifier: "RELATIVE_FORM",
                type: "relativeForm",
                granularity: "GDC.time.date",
                availableGranularities: ["GDC.time.date"],
                name: "",
                visible: true,
            };
            const expected: IExtendedDateFilterErrors = {
                relativeForm: {},
            };
            const actual = validateFilterOption(filter);
            expect(actual).toEqual(expected);
        });

        it("should not validate hidden form (without message)", () => {
            const filter: IUiRelativeDateFilterForm = {
                from: 5,
                to: 5,
                localIdentifier: "RELATIVE_FORM",
                type: "relativeForm",
                granularity: "GDC.time.date",
                availableGranularities: ["GDC.time.date"],
                name: "",
                visible: false,
            };
            const expected: IExtendedDateFilterErrors = {
                relativeForm: {},
            };
            const actual = validateFilterOption(filter);
            expect(actual).toEqual(expected);
        });
    });

    describe("non-form validation", () => {
        it.each([
            [
                "relative preset",
                {
                    from: 5,
                    to: 5,
                    localIdentifier: "RELATIVE_PRESET",
                    type: "relativePreset",
                    granularity: "GDC.time.date",
                    name: "",
                    visible: true,
                },
            ],
            [
                "absolute preset",
                {
                    from: "2019-01-01",
                    to: "2019-30-01",
                    localIdentifier: "ABSOLUTE_PRESET",
                    type: "absoluteForm",
                    visible: true,
                },
            ],
            [
                "all time",
                {
                    localIdentifier: "ALL_TIME",
                    name: "",
                    type: "allTime",
                    visible: true,
                },
            ],
        ])("should validate visible %s filter", (_, filter: any) => {
            const actual = validateFilterOption(filter);
            const expected: IExtendedDateFilterErrors = {};
            expect(actual).toEqual(expected);
        });

        const Scenarios: Array<[string, DateFilterOption]> = [
            [
                "relative preset",
                {
                    from: 5,
                    to: 5,
                    localIdentifier: "RELATIVE_PRESET",
                    type: "relativePreset",
                    granularity: "GDC.time.date",
                    name: "",
                    visible: false,
                },
            ],
            [
                "absolute preset",
                {
                    from: "2019-01-01",
                    to: "2019-30-01",
                    localIdentifier: "ABSOLUTE_PRESET",
                    type: "absoluteForm",
                    name: "",
                    visible: false,
                },
            ],
            [
                "all time",
                {
                    localIdentifier: "ALL_TIME",
                    name: "",
                    type: "allTime",
                    visible: false,
                },
            ],
        ];

        it.each(Scenarios)("should not validate invisible %s filter", (_, filter: DateFilterOption) => {
            const actual = validateFilterOption(filter);
            const expected: IExtendedDateFilterErrors = {
                [filter.type]: {},
            };
            expect(actual).toEqual(expected);
        });
    });
});
