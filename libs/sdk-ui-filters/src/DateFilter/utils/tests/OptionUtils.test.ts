// (C) 2019-2022 GoodData Corporation
import {
    IAbsoluteDateFilterPreset,
    IRelativeDateFilterPresetOfGranularity,
    IAbsoluteDateFilterForm,
    IRelativeDateFilterForm,
    IAllTimeDateFilterOption,
} from "@gooddata/sdk-model";

import { IDateFilterOptionsByType } from "../../interfaces";
import {
    getDateFilterOptionGranularity,
    filterVisibleDateFilterOptions,
    sanitizePresetIntervals,
} from "../OptionUtils";
import { absoluteFormFilter, relativePresetFilter } from "../Translations/tests/fixtures";

describe("optionUtils", () => {
    describe("getDateFilterOptionGranularity", () => {
        it("should return date filter value", () => {
            expect(getDateFilterOptionGranularity(absoluteFormFilter)).toEqual(undefined);
            expect(getDateFilterOptionGranularity(relativePresetFilter)).toEqual("GDC.time.date");
        });
    });
});

describe("filterVisibleDateFilterOptions", () => {
    describe("all time filter", () => {
        const visibleAllTime: IAllTimeDateFilterOption = {
            localIdentifier: "ALL_TIME",
            name: "",
            type: "allTime",
            visible: true,
        };

        const hiddenAllTime: IAllTimeDateFilterOption = {
            ...visibleAllTime,
            visible: false,
        };

        it("should preserve visible all time filter", () => {
            const input: IDateFilterOptionsByType = {
                allTime: visibleAllTime,
            };

            expect(filterVisibleDateFilterOptions(input)).toEqual(input);
        });

        it("should discard hidden all time filter", () => {
            const input: IDateFilterOptionsByType = {
                allTime: hiddenAllTime,
            };

            const expected = {};

            expect(filterVisibleDateFilterOptions(input)).toEqual(expected);
        });
    });

    describe("absolute form", () => {
        const visibleAbsoluteForm: IAbsoluteDateFilterForm = {
            localIdentifier: "ABSOLUTE_FORM",
            name: "",
            type: "absoluteForm",
            visible: true,
        };

        const hiddenAbsoluteForm: IAbsoluteDateFilterForm = {
            ...visibleAbsoluteForm,
            visible: false,
        };

        it("should preserve visible absolute form", () => {
            const input: IDateFilterOptionsByType = {
                absoluteForm: visibleAbsoluteForm,
            };

            expect(filterVisibleDateFilterOptions(input)).toEqual(input);
        });

        it("should discard hidden absolute form", () => {
            const input: IDateFilterOptionsByType = {
                absoluteForm: hiddenAbsoluteForm,
            };

            const expected = {};

            expect(filterVisibleDateFilterOptions(input)).toEqual(expected);
        });
    });

    describe("relative form", () => {
        const visibleRelativeForm: IRelativeDateFilterForm = {
            localIdentifier: "RELATIVE_FORM",
            name: "",
            type: "relativeForm",
            availableGranularities: ["GDC.time.date"],
            visible: true,
        };

        const hiddenAbsoluteForm: IRelativeDateFilterForm = {
            ...visibleRelativeForm,
            visible: false,
        };

        it("should preserve visible relative form", () => {
            const input: IDateFilterOptionsByType = {
                relativeForm: visibleRelativeForm,
            };

            expect(filterVisibleDateFilterOptions(input)).toEqual(input);
        });

        it("should discard hidden relative form", () => {
            const input: IDateFilterOptionsByType = {
                relativeForm: hiddenAbsoluteForm,
            };

            const expected = {};

            expect(filterVisibleDateFilterOptions(input)).toEqual(expected);
        });
    });

    describe("absolute preset", () => {
        const visiblePreset: IAbsoluteDateFilterPreset = {
            from: "2019-01-01",
            localIdentifier: "YEAR_2019",
            name: "The year 2019",
            to: "2019-12-31",
            type: "absolutePreset",
            visible: true,
        };

        const hiddenPreset: IAbsoluteDateFilterPreset = {
            ...visiblePreset,
            visible: false,
        };

        it("should preserve visible preset", () => {
            const input: IDateFilterOptionsByType = {
                absolutePreset: [visiblePreset],
            };

            expect(filterVisibleDateFilterOptions(input)).toEqual(input);
        });

        it("should discard hidden preset", () => {
            const input: IDateFilterOptionsByType = {
                absolutePreset: [visiblePreset, hiddenPreset],
            };

            const expected: IDateFilterOptionsByType = {
                absolutePreset: [visiblePreset],
            };

            expect(filterVisibleDateFilterOptions(input)).toEqual(expected);
        });

        it("should discard the absolute preset section altogether if it has no visible preset", () => {
            const input: IDateFilterOptionsByType = {
                absolutePreset: [hiddenPreset],
            };

            const expected: IDateFilterOptionsByType = {};

            expect(filterVisibleDateFilterOptions(input)).toEqual(expected);
        });
    });

    describe("relative preset", () => {
        const visibleMonthPreset: IRelativeDateFilterPresetOfGranularity<"GDC.time.month"> = {
            from: 0,
            granularity: "GDC.time.month",
            localIdentifier: "THIS_MONTH",
            to: 0,
            type: "relativePreset",
            name: "",
            visible: true,
        };

        const hiddenMonthPreset: IRelativeDateFilterPresetOfGranularity<"GDC.time.month"> = {
            ...visibleMonthPreset,
            visible: false,
        };

        const visibleYearPreset: IRelativeDateFilterPresetOfGranularity<"GDC.time.year"> = {
            from: -1,
            granularity: "GDC.time.year",
            localIdentifier: "LAST_YEAR",
            to: -1,
            type: "relativePreset",
            name: "",
            visible: true,
        };

        it("should preserve visible relative preset", () => {
            const input: IDateFilterOptionsByType = {
                relativePreset: {
                    "GDC.time.month": [visibleMonthPreset],
                },
            };

            expect(filterVisibleDateFilterOptions(input)).toEqual(input);
        });

        it("should discard invisible relative preset", () => {
            const input: IDateFilterOptionsByType = {
                relativePreset: {
                    "GDC.time.month": [visibleMonthPreset, hiddenMonthPreset],
                },
            };

            const expected = {
                relativePreset: {
                    "GDC.time.month": [visibleMonthPreset],
                },
            };

            expect(filterVisibleDateFilterOptions(input)).toEqual(expected);
        });

        it("should discard a relative preset granularity altogether if it has no visible items", () => {
            const input: IDateFilterOptionsByType = {
                relativePreset: {
                    "GDC.time.month": [hiddenMonthPreset],
                    "GDC.time.year": [visibleYearPreset],
                },
            };

            const expected = {
                relativePreset: {
                    "GDC.time.year": [visibleYearPreset],
                },
            };

            expect(filterVisibleDateFilterOptions(input)).toEqual(expected);
        });

        it("should discard the relative preset section altogether if it has no visible preset in any granularity", () => {
            const input: IDateFilterOptionsByType = {
                relativePreset: {
                    "GDC.time.month": [hiddenMonthPreset],
                },
            };

            const expected = {};

            expect(filterVisibleDateFilterOptions(input)).toEqual(expected);
        });
    });
});

describe("sanitizePresetIntervals", () => {
    describe("absolute preset", () => {
        const sanePreset: IAbsoluteDateFilterPreset = {
            from: "2019-01-01",
            localIdentifier: "YEAR_2019",
            name: "The year 2019",
            to: "2019-12-31",
            type: "absolutePreset",
            visible: true,
        };

        const twistedPreset: IAbsoluteDateFilterPreset = {
            ...sanePreset,
            from: sanePreset.to,
            to: sanePreset.from,
        };

        it("should preserve sane preset", () => {
            const input: IDateFilterOptionsByType = {
                absolutePreset: [sanePreset],
            };

            expect(sanitizePresetIntervals(input)).toEqual(input);
        });

        it("should fix twisted preset", () => {
            const input: IDateFilterOptionsByType = {
                absolutePreset: [twistedPreset],
            };

            const expected: IDateFilterOptionsByType = {
                absolutePreset: [sanePreset],
            };

            expect(sanitizePresetIntervals(input)).toEqual(expected);
        });
    });

    describe("relative preset", () => {
        const sanePreset: IRelativeDateFilterPresetOfGranularity<"GDC.time.month"> = {
            from: -10,
            granularity: "GDC.time.month",
            localIdentifier: "THIS_MONTH",
            to: 0,
            type: "relativePreset",
            name: "",
            visible: true,
        };

        const twistedPreset: IRelativeDateFilterPresetOfGranularity<"GDC.time.month"> = {
            ...sanePreset,
            from: sanePreset.to,
            to: sanePreset.from,
        };

        it("should preserve sane preset", () => {
            const input: IDateFilterOptionsByType = {
                relativePreset: {
                    "GDC.time.month": [sanePreset],
                },
            };

            expect(sanitizePresetIntervals(input)).toEqual(input);
        });

        it("should fix twisted preset", () => {
            const input: IDateFilterOptionsByType = {
                relativePreset: {
                    "GDC.time.month": [twistedPreset],
                },
            };

            const expected = {
                relativePreset: {
                    "GDC.time.month": [sanePreset],
                },
            };

            expect(sanitizePresetIntervals(input)).toEqual(expected);
        });
    });
});
