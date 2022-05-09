// (C) 2019-2022 GoodData Corporation
import { DEFAULT_DATE_FORMAT, DEFAULT_DATE_FORMAT_WITH_TIME } from "../../../constants/Platform";
import {
    getDateFilterRepresentation,
    getDateFilterTitleUsingTranslator,
    getDateFilterTitle,
} from "../DateFilterTitle";
import { IDateAndMessageTranslator } from "../Translators";
import {
    allTimeFilter,
    absoluteFormFilter,
    absoluteFormFilterOneDay,
    absolutePresetFilter,
    relativePresetFilter,
    absoluteFormFilterWithTime,
    absoluteFormFilterWithTimeInOneDay,
} from "./fixtures";
import { DateFilterGranularity } from "@gooddata/sdk-model";
import { IUiRelativeDateFilterForm } from "../../../interfaces";

const serializingTranslator: IDateAndMessageTranslator = {
    formatDate: (id, options) => `${id}__${JSON.stringify(options)}`,
    formatMessage: (id: any, values: any) => `${id.id}__${JSON.stringify(values)}`,
};

describe("getDateFilterTitleUsingTranslator", () => {
    it("should return the correct translation for allTime filter", () => {
        const expected = "filters.allTime.title__undefined";
        const actual = getDateFilterTitleUsingTranslator(
            allTimeFilter,
            serializingTranslator,
            DEFAULT_DATE_FORMAT,
        );
        expect(actual).toEqual(expected);
    });

    describe("with disabled time", () => {
        it("should return the correct translation for absolute form filter", () => {
            const actual = getDateFilterTitleUsingTranslator(
                absoluteFormFilter,
                serializingTranslator,
                DEFAULT_DATE_FORMAT,
            );
            expect(actual).toEqual("01/01/2019 – 02/01/2019");
        });

        it("should return the correct translation for absolute form filter for one day", () => {
            const actual = getDateFilterTitleUsingTranslator(
                absoluteFormFilterOneDay,
                serializingTranslator,
                DEFAULT_DATE_FORMAT,
            );
            expect(actual).toEqual("01/01/2019");
        });
    });

    describe("with enabled time", () => {
        it("should return the correct translation for absolute form filter", () => {
            const actual = getDateFilterTitleUsingTranslator(
                absoluteFormFilterWithTime,
                serializingTranslator,
                DEFAULT_DATE_FORMAT_WITH_TIME,
            );
            expect(actual).toEqual("01/01/2019, 01:00 – 02/01/2019, 16:55");
        });

        it("should return the correct translation for absolute form filter for one day", () => {
            const actual = getDateFilterTitleUsingTranslator(
                absoluteFormFilterWithTimeInOneDay,
                serializingTranslator,
                DEFAULT_DATE_FORMAT_WITH_TIME,
            );
            expect(actual).toEqual("01/01/2019, 00:00 – 23:59");
        });
    });

    it("should return the correct translation for absolute preset filter", () => {
        const expected = "foo";
        const actual = getDateFilterTitleUsingTranslator(
            absolutePresetFilter,
            serializingTranslator,
            DEFAULT_DATE_FORMAT,
        );
        expect(actual).toEqual(expected);
    });

    type RelativeFilterTestData = [number, number, DateFilterGranularity, string, any];
    it.each([
        // days
        [0, 0, "GDC.time.date", "filters.thisDay.title", undefined],
        [-1, -1, "GDC.time.date", "filters.lastDay.title", undefined],
        [1, 1, "GDC.time.date", "filters.nextDay.title", undefined],
        [-6, 0, "GDC.time.date", "filters.lastNDays", { n: 7 }],
        [0, 6, "GDC.time.date", "filters.nextNDays", { n: 7 }],
        [-6, -2, "GDC.time.date", "filters.interval.days.past", { from: 6, to: 2 }],
        [-6, -6, "GDC.time.date", "filters.interval.days.past.sameValue", { value: 6 }],
        [2, 6, "GDC.time.date", "filters.interval.days.future", { from: 2, to: 6 }],
        [6, 6, "GDC.time.date", "filters.interval.days.future.sameValue", { value: 6 }],
        [-5, 5, "GDC.time.date", "filters.interval.days.mixed", { from: 5, to: 5 }],
        // weeks
        [0, 0, "GDC.time.week_us", "filters.thisWeek.title", undefined],
        [-1, -1, "GDC.time.week_us", "filters.lastWeek.title", undefined],
        [1, 1, "GDC.time.week_us", "filters.nextWeek.title", undefined],
        [-6, 0, "GDC.time.week_us", "filters.lastNWeeks", { n: 7 }],
        [0, 6, "GDC.time.week_us", "filters.nextNWeeks", { n: 7 }],
        [-6, -2, "GDC.time.week_us", "filters.interval.weeks.past", { from: 6, to: 2 }],
        [-6, -6, "GDC.time.week_us", "filters.interval.weeks.past.sameValue", { value: 6 }],
        [2, 6, "GDC.time.week_us", "filters.interval.weeks.future", { from: 2, to: 6 }],
        [6, 6, "GDC.time.week_us", "filters.interval.weeks.future.sameValue", { value: 6 }],
        [-5, 5, "GDC.time.week_us", "filters.interval.weeks.mixed", { from: 5, to: 5 }],
        // months
        [0, 0, "GDC.time.month", "filters.thisMonth.title", undefined],
        [-1, -1, "GDC.time.month", "filters.lastMonth.title", undefined],
        [1, 1, "GDC.time.month", "filters.nextMonth.title", undefined],
        [-6, 0, "GDC.time.month", "filters.lastNMonths", { n: 7 }],
        [0, 6, "GDC.time.month", "filters.nextNMonths", { n: 7 }],
        [-6, -2, "GDC.time.month", "filters.interval.months.past", { from: 6, to: 2 }],
        [-6, -6, "GDC.time.month", "filters.interval.months.past.sameValue", { value: 6 }],
        [2, 6, "GDC.time.month", "filters.interval.months.future", { from: 2, to: 6 }],
        [6, 6, "GDC.time.month", "filters.interval.months.future.sameValue", { value: 6 }],
        [-5, 5, "GDC.time.month", "filters.interval.months.mixed", { from: 5, to: 5 }],
        // quarters
        [0, 0, "GDC.time.quarter", "filters.thisQuarter.title", undefined],
        [-1, -1, "GDC.time.quarter", "filters.lastQuarter.title", undefined],
        [1, 1, "GDC.time.quarter", "filters.nextQuarter.title", undefined],
        [-6, 0, "GDC.time.quarter", "filters.lastNQuarters", { n: 7 }],
        [0, 6, "GDC.time.quarter", "filters.nextNQuarters", { n: 7 }],
        [-6, -2, "GDC.time.quarter", "filters.interval.quarters.past", { from: 6, to: 2 }],
        [-6, -6, "GDC.time.quarter", "filters.interval.quarters.past.sameValue", { value: 6 }],
        [2, 6, "GDC.time.quarter", "filters.interval.quarters.future", { from: 2, to: 6 }],
        [6, 6, "GDC.time.quarter", "filters.interval.quarters.future.sameValue", { value: 6 }],
        [-5, 5, "GDC.time.quarter", "filters.interval.quarters.mixed", { from: 5, to: 5 }],
        // years
        [0, 0, "GDC.time.year", "filters.thisYear.title", undefined],
        [-1, -1, "GDC.time.year", "filters.lastYear.title", undefined],
        [1, 1, "GDC.time.year", "filters.nextYear.title", undefined],
        [-6, 0, "GDC.time.year", "filters.lastNYears", { n: 7 }],
        [0, 6, "GDC.time.year", "filters.nextNYears", { n: 7 }],
        [-6, -2, "GDC.time.year", "filters.interval.years.past", { from: 6, to: 2 }],
        [2, 6, "GDC.time.year", "filters.interval.years.future", { from: 2, to: 6 }],
        [-5, 5, "GDC.time.year", "filters.interval.years.mixed", { from: 5, to: 5 }],
    ] as RelativeFilterTestData[])(
        "should return the correct translation for relative form filter (from: %i, to: %i, granularity: %s)",
        (
            from: number,
            to: number,
            granularity: DateFilterGranularity,
            expectedId: string,
            expectedValues: any,
        ) => {
            const filter: IUiRelativeDateFilterForm = {
                localIdentifier: "RELATIVE_FORM",
                type: "relativeForm",
                granularity,
                from,
                to,
                name: "",
                visible: true,
            };

            const expected = `${expectedId}__${JSON.stringify(expectedValues)}`;
            const actual = getDateFilterTitleUsingTranslator(
                filter,
                serializingTranslator,
                DEFAULT_DATE_FORMAT,
            );
            expect(actual).toEqual(expected);
        },
    );

    it("should return the correct translation for relative preset filter with name", () => {
        const expected = "foo";
        const actual = getDateFilterTitleUsingTranslator(
            relativePresetFilter,
            serializingTranslator,
            DEFAULT_DATE_FORMAT,
        );
        expect(actual).toEqual(expected);
    });

    it("should return the correct translation for relative preset filter with empty name", () => {
        const filter = { ...relativePresetFilter, name: "" };
        const expectedId = "filters.interval.days.mixed";
        const expectedValues = { from: 5, to: 5 };
        const expected = `${expectedId}__${JSON.stringify(expectedValues)}`;
        const actual = getDateFilterTitleUsingTranslator(filter, serializingTranslator, DEFAULT_DATE_FORMAT);
        expect(actual).toEqual(expected);
    });
});

describe("getDateFilterTitle", () => {
    it("should return title build using real translations for some date option", () => {
        const filter = { ...relativePresetFilter, name: "" };
        const expected = "From 5 days ago to 5 days ahead";
        const actual = getDateFilterTitle(filter, "en-US", DEFAULT_DATE_FORMAT);
        expect(actual).toEqual(expected);
    });

    describe("with disabled time", () => {
        it("should return title with desired format", () => {
            const filter = { ...absoluteFormFilter };
            const expected = "01/01/2019 – 02/01/2019";
            const actual = getDateFilterTitle(filter, "en-US", DEFAULT_DATE_FORMAT);
            expect(actual).toEqual(expected);
        });
    });

    describe("with enabled time", () => {
        it("should return title containing time with desired format", () => {
            const filter = { ...absoluteFormFilterWithTime };
            const expected = "01/01/2019, 01:00 – 02/01/2019, 16:55";
            const actual = getDateFilterTitle(filter, "en-US", DEFAULT_DATE_FORMAT_WITH_TIME);
            expect(actual).toEqual(expected);
        });
    });
});

describe("getDateFilterRepresentation", () => {
    describe("with disabled time", () => {
        it("should return title with desired format", () => {
            const filter = { ...absoluteFormFilter };
            const expected = "01/01/2019 – 02/01/2019";
            const actual = getDateFilterRepresentation(filter, "en-US", DEFAULT_DATE_FORMAT);
            expect(actual).toEqual(expected);
        });
    });

    describe("with enabled time", () => {
        it("should return title containing time with desired format", () => {
            const filter = { ...absoluteFormFilterWithTime };
            const expected = "01/01/2019, 01:00 – 02/01/2019, 16:55";
            const actual = getDateFilterRepresentation(filter, "en-US", DEFAULT_DATE_FORMAT_WITH_TIME);
            expect(actual).toEqual(expected);
        });
    });
});
