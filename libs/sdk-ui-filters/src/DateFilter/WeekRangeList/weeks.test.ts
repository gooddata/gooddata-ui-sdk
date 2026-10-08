// (C) 2026 GoodData Corporation

import { addDays, format, parseISO } from "date-fns";
import { describe, expect, it } from "vitest";

import { type WeekStart } from "@gooddata/sdk-model";

import { resolvePeriodBoundaries } from "../utils/StaticPeriodConversions.js";

import {
    type IWeek,
    type IWeekRow,
    type IWeekSelection,
    type WeekListRow,
    createOpeningWeekWindow,
    createWeekWindow,
    extendWeekWindow,
    formatMonthHeading,
    formatWeekAccessibleName,
    formatWeekLabel,
    getOpeningDay,
    getWeek,
    getWeekMonth,
    getWeekRows,
    jumpWeekWindow,
    periodRangeToWeekSelection,
    readJumpText,
    selectWeek,
    trimWeekWindow,
    weekSelectionToPeriodRange,
    widenWeekWindow,
} from "./weeks.js";

const weekStarts: WeekStart[] = ["Sunday", "Monday"];
const twentyYears = { firstMonth: "2016-01", lastMonth: "2035-12" };

const headings = (rows: WeekListRow[]) => rows.flatMap((row) => (row.type === "heading" ? [row.month] : []));
const weeks = (rows: WeekListRow[]) => rows.filter((row): row is IWeekRow => row.type === "week");
const week = (start: string, end: string): IWeek => ({ start, end });

describe("getWeek", () => {
    it.each(weekStarts)("gives the date filter's week of every day of 2026 with %s", (weekStart) => {
        for (let dayOfYear = 1; dayOfYear <= 365; dayOfYear++) {
            const day = format(new Date(2026, 0, dayOfYear), "yyyy-MM-dd");
            const { from, to } = resolvePeriodBoundaries("GDC.time.week_us", day, day, weekStart);

            expect(getWeek(day, weekStart)).toEqual({ start: from, end: to });
        }
    });
});

describe("getWeekMonth", () => {
    it.each([
        ["Sunday", "2026-12-27", "2027-01-02", "2026-12"],
        ["Sunday", "2027-01-31", "2027-02-06", "2027-02"],
        ["Monday", "2026-12-28", "2027-01-03", "2026-12"],
    ] as [WeekStart, string, string, string][])(
        "lists the %s week %s - %s under %s",
        (weekStart, start, end, month) => {
            expect(getWeek(start, weekStart)).toEqual(week(start, end));
            expect(getWeekMonth(week(start, end))).toBe(month);
        },
    );
});

describe("getWeekRows", () => {
    it.each(weekStarts)("gives every month four or five weeks for twenty years with %s", (weekStart) => {
        const rows = getWeekRows(twentyYears, weekStart);
        const weeksByMonth = new Map<string, IWeekRow[]>();
        let month = "";
        rows.forEach((row) => {
            if (row.type === "heading") {
                month = row.month;
                weeksByMonth.set(month, []);
            } else {
                weeksByMonth.get(month)!.push(row);
            }
        });

        expect([...weeksByMonth.keys()]).toHaveLength(240);
        expect(headings(rows).at(0)).toBe("2016-01");
        expect(headings(rows).at(-1)).toBe("2035-12");
        weeksByMonth.forEach((monthWeeks, listedMonth) => {
            expect([4, 5]).toContain(monthWeeks.length);
            monthWeeks.forEach((row) => expect(getWeekMonth(row)).toBe(listedMonth));
        });
    });

    it.each(weekStarts)("gives consecutive weeks with unique keys with %s", (weekStart) => {
        const rows = getWeekRows(twentyYears, weekStart);
        const weekRows = weeks(rows);

        weekRows.forEach((row) =>
            expect(row).toEqual({ type: "week", key: row.start, ...getWeek(row.start, weekStart) }),
        );
        weekRows
            .slice(1)
            .forEach((row, index) =>
                expect(row.start).toBe(format(addDays(parseISO(weekRows[index].end), 1), "yyyy-MM-dd")),
            );
        expect(new Set(rows.map((row) => row.key)).size).toBe(rows.length);
    });

    it("gives Sunday weeks from Sunday to Saturday", () => {
        expect(weeks(getWeekRows({ firstMonth: "2026-12", lastMonth: "2027-01" }, "Sunday")).at(4)).toEqual({
            type: "week",
            key: "2026-12-27",
            start: "2026-12-27",
            end: "2027-01-02",
        });
    });

    it("gives Monday weeks from Monday to Sunday", () => {
        expect(weeks(getWeekRows({ firstMonth: "2026-12", lastMonth: "2027-01" }, "Monday")).at(4)).toEqual({
            type: "week",
            key: "2026-12-28",
            start: "2026-12-28",
            end: "2027-01-03",
        });
    });
});

describe("week window", () => {
    it("spans two years around today", () => {
        const window = createWeekWindow(["2026-09-29"]);

        expect(window).toEqual({ firstMonth: "2024-09", lastMonth: "2028-09" });
        weekStarts.forEach((weekStart) => {
            const monthHeadings = headings(getWeekRows(window, weekStart));

            expect(monthHeadings.at(0)).toBe("2024-09");
            expect(monthHeadings.at(-1)).toBe("2028-09");
        });
    });

    it("spans two years around the earliest and the latest day", () => {
        expect(createWeekWindow(["2026-09-29", "2010-03-07", "2010-03-13"])).toEqual({
            firstMonth: "2008-03",
            lastMonth: "2028-09",
        });
    });

    it.each(weekStarts)("adds a year of months at the start with %s", (weekStart) => {
        const window = createWeekWindow(["2026-09-29"]);
        const extended = extendWeekWindow(window, "start");
        const rows = getWeekRows(window, weekStart);
        const extendedRows = getWeekRows(extended, weekStart);

        expect(extended).toEqual({ firstMonth: "2023-09", lastMonth: "2028-09" });
        expect(headings(extendedRows)).toHaveLength(headings(rows).length + 12);
        expect(extendedRows.slice(-rows.length)).toEqual(rows);
    });

    it.each(weekStarts)("adds a year of months at the end with %s", (weekStart) => {
        const window = createWeekWindow(["2026-09-29"]);
        const extended = extendWeekWindow(window, "end");
        const rows = getWeekRows(window, weekStart);
        const extendedRows = getWeekRows(extended, weekStart);

        expect(extended).toEqual({ firstMonth: "2024-09", lastMonth: "2029-09" });
        expect(headings(extendedRows)).toHaveLength(headings(rows).length + 12);
        expect(extendedRows.slice(0, rows.length)).toEqual(rows);
    });

    it.each(["2024-09-01", "2026-09-29", "2028-09-20"])(
        "keeps the window for the day %s inside it",
        (day) => {
            const window = createWeekWindow(["2026-09-29"]);

            expect(widenWeekWindow(window, day, "Sunday")).toBe(window);
        },
    );

    it.each([
        ["2040-05-15", "2024-09", "2042-05"],
        ["2001-01-10", "1999-01", "2028-09"],
    ])("widens the window by two years around the day %s", (day, firstMonth, lastMonth) => {
        expect(widenWeekWindow(createWeekWindow(["2026-09-29"]), day, "Sunday")).toEqual({
            firstMonth,
            lastMonth,
        });
    });
});

describe("trimWeekWindow", () => {
    it.each(["start", "end"] as ("start" | "end")[])(
        "returns the same window of ten years when trimming at the %s",
        (side) => {
            const window = { firstMonth: "2024-09", lastMonth: "2034-09" };

            expect(trimWeekWindow(window, side)).toBe(window);
        },
    );

    it.each([
        ["start", { firstMonth: "2025-09", lastMonth: "2035-09" }],
        ["end", { firstMonth: "2024-09", lastMonth: "2034-09" }],
    ] as ["start" | "end", { firstMonth: string; lastMonth: string }][])(
        "drops a year of months at the %s of a window over ten years",
        (side, window) => {
            expect(trimWeekWindow({ firstMonth: "2024-09", lastMonth: "2035-09" }, side)).toEqual(window);
        },
    );
});

describe("listed years", () => {
    it.each(weekStarts)("lists the weeks of 1900-01-01 and 2100-12-31 at the ends with %s", (weekStart) => {
        const firstWeek = weeks(getWeekRows(createWeekWindow(["1900-01-01"]), weekStart)).at(0)!;
        const lastWeek = weeks(getWeekRows(createWeekWindow(["2100-12-31"]), weekStart)).at(-1)!;

        expect(firstWeek).toMatchObject(getWeek("1900-01-01", weekStart));
        expect(lastWeek).toMatchObject(getWeek("2100-12-31", weekStart));
    });

    it.each([
        ["1901-06-15", { firstMonth: "1900-01", lastMonth: "1903-06" }],
        ["2099-06-15", { firstMonth: "2097-06", lastMonth: "2100-12" }],
        ["1850-03-01", { firstMonth: "1900-01", lastMonth: "1902-01" }],
        ["9999-12-31", { firstMonth: "2098-12", lastMonth: "2100-12" }],
    ])("keeps the window around %s within the listed years", (day, window) => {
        expect(createWeekWindow([day])).toEqual(window);
    });

    it.each([
        ["start", { firstMonth: "1900-01", lastMonth: "1903-06" }],
        ["end", { firstMonth: "2097-06", lastMonth: "2100-12" }],
    ] as ["start" | "end", { firstMonth: string; lastMonth: string }][])(
        "returns the same window when extending at the %s bound",
        (side, window) => {
            expect(extendWeekWindow(window, side)).toBe(window);
        },
    );

    it("extends up to the bound", () => {
        expect(extendWeekWindow({ firstMonth: "1900-06", lastMonth: "1903-06" }, "start")).toEqual({
            firstMonth: "1900-01",
            lastMonth: "1903-06",
        });
    });
});

describe("opening window", () => {
    const today = "2026-09-29";

    it.each([
        ["no range", {}, { firstMonth: "2024-09", lastMonth: "2028-09" }],
        [
            "a range in 2010",
            { from: "2010-03-07", to: "2010-03-13" },
            { firstMonth: "2008-03", lastMonth: "2012-03" },
        ],
        [
            "a range of six years",
            { from: "2020-01-05", to: "2025-12-27" },
            { firstMonth: "2018-01", lastMonth: "2027-12" },
        ],
        [
            "a range over six years",
            { from: "2020-01-05", to: "2026-06-27" },
            { firstMonth: "2018-01", lastMonth: "2022-01" },
        ],
        ["a range without to", { from: "2010-03-07" }, { firstMonth: "2008-03", lastMonth: "2012-03" }],
        [
            "a range not of whole weeks",
            { from: "2010-03-10", to: "2010-03-12" },
            { firstMonth: "2008-03", lastMonth: "2012-03" },
        ],
        [
            "a from that does not parse",
            { from: "2010-03", to: "2010-03-13" },
            { firstMonth: "2024-09", lastMonth: "2028-09" },
        ],
    ])("lists the months around %s", (_, range, window) => {
        expect(createOpeningWeekWindow(range, today)).toEqual(window);
    });

    it.each([
        ["the stored from", { from: "2010-03-07", to: "2010-03-13" }, "2010-03-07"],
        ["the stored from in the listed years", { from: "1850-03-03", to: "1850-03-09" }, "1900-01-01"],
        ["today", {}, today],
    ])("centres %s", (_, range, day) => {
        expect(getOpeningDay(range, today)).toBe(day);
    });
});

describe("jumpWeekWindow", () => {
    const window = { firstMonth: "2024-09", lastMonth: "2028-09" };

    it("replaces the window while nothing is selected", () => {
        expect(jumpWeekWindow(window, "2030-12-29", "Sunday", false)).toEqual({
            firstMonth: "2028-12",
            lastMonth: "2032-12",
        });
    });

    it("widens the window once a selection exists", () => {
        expect(jumpWeekWindow(window, "2030-12-29", "Sunday", true)).toEqual({
            firstMonth: "2024-09",
            lastMonth: "2032-12",
        });
    });

    it("replaces the window when widening would span more than ten years", () => {
        expect(jumpWeekWindow(window, "2040-05-15", "Sunday", true)).toEqual({
            firstMonth: "2038-05",
            lastMonth: "2042-05",
        });
    });

    it.each([false, true])("keeps the window for a day inside it with a selection %s", (hasSelection) => {
        expect(jumpWeekWindow(window, "2026-12-29", "Monday", hasSelection)).toBe(window);
    });
});

describe("selectWeek", () => {
    const july19 = week("2026-07-19", "2026-07-25");
    const july26 = week("2026-07-26", "2026-08-01");
    const august9 = week("2026-08-09", "2026-08-15");

    it("selects the first clicked week alone and anchors it", () => {
        expect(selectWeek(undefined, july26)).toEqual({
            from: "2026-07-26",
            to: "2026-08-01",
            anchor: july26,
        });
    });

    it.each([
        ["an earlier", july19, { from: "2026-07-19", to: "2026-08-01" }],
        ["a later", august9, { from: "2026-07-26", to: "2026-08-15" }],
        ["the anchored", july26, { from: "2026-07-26", to: "2026-08-01" }],
    ])("closes the range at %s second week", (_, second, expected) => {
        expect(selectWeek(selectWeek(undefined, july26), second)).toEqual(expected);
    });

    it("starts over at the third click", () => {
        const closed = selectWeek(selectWeek(undefined, july26), august9);

        expect(selectWeek(closed, july19)).toEqual({ from: "2026-07-19", to: "2026-07-25", anchor: july19 });
    });

    it("reports the days from the first week's first day to the last week's last day", () => {
        const selection = selectWeek(
            selectWeek(undefined, getWeek("2026-12-27", "Sunday")),
            getWeek("2027-01-17", "Sunday"),
        );

        expect(weekSelectionToPeriodRange(selection)).toStrictEqual({ from: "2026-12-27", to: "2027-01-23" });
    });
});

describe("periodRangeToWeekSelection", () => {
    it.each([
        ["Sunday", "2026-07-19", "2026-07-25"],
        ["Sunday", "2026-07-19", "2026-08-08"],
        ["Monday", "2026-07-20", "2026-07-26"],
    ] as [WeekStart, string, string][])("selects the %s weeks %s - %s", (weekStart, from, to) => {
        expect(periodRangeToWeekSelection({ from, to }, weekStart)).toStrictEqual<IWeekSelection>({
            from,
            to,
        });
    });

    it.each([
        ["Monday", "2026-07-19", "2026-07-25"],
        ["Sunday", "2026-07-20", "2026-07-26"],
        ["Sunday", "2026-07-22", "2026-07-28"],
        ["Sunday", "2026-07-26", "2026-07-25"],
        ["Sunday", "2026-07-19", undefined],
        ["Sunday", undefined, "2026-07-25"],
        ["Sunday", "2026-07-19 00:00", "2026-07-25 23:59"],
        ["Sunday", "2026-7-19", "2026-07-25"],
    ] as [WeekStart, string | undefined, string | undefined][])(
        "selects nothing under %s for %s - %s",
        (weekStart, from, to) => {
            expect(periodRangeToWeekSelection({ from, to }, weekStart)).toBeUndefined();
        },
    );

    it.each([
        ["Sunday", "1850-03-03", "1850-03-09"],
        ["Sunday", "1899-12-24", "1900-01-06"],
        ["Monday", "2101-01-03", "2101-01-09"],
        ["Sunday", "9999-12-26", "9999-12-31"],
    ] as [WeekStart, string, string][])(
        "selects nothing under %s for the weeks %s - %s outside the listed years",
        (weekStart, from, to) => {
            expect(periodRangeToWeekSelection({ from, to }, weekStart)).toBeUndefined();
        },
    );

    it.each([
        ["Sunday", "1899-12-31", "1900-01-06"],
        ["Monday", "2100-12-27", "2101-01-02"],
    ] as [WeekStart, string, string][])("selects the %s edge week %s - %s", (weekStart, from, to) => {
        expect(periodRangeToWeekSelection({ from, to }, weekStart)).toStrictEqual({ from, to });
    });
});

describe("labels", () => {
    it.each([
        ["2026-12-27", "2027-01-02", "Dec 27 – Jan 2"],
        ["2027-01-03", "2027-01-09", "Jan 3 – Jan 9"],
    ])("labels the week %s - %s by its days", (start, end, label) => {
        expect(formatWeekLabel(week(start, end), "en-US")).toBe(label);
    });

    it("names the week by its full days", () => {
        expect(formatWeekAccessibleName(week("2026-12-27", "2027-01-02"), "en-US")).toBe(
            "December 27, 2026 – January 2, 2027",
        );
    });

    it("names the month with its year", () => {
        expect(formatMonthHeading("2026-12", "en-US")).toBe("December 2026");
    });
});

describe("readJumpText", () => {
    it.each([
        ["12/29/2026", "MM/dd/yyyy", "2026-12-29"],
        [" 12/29/2026 ", "MM/dd/yyyy", "2026-12-29"],
        ["29.12.2026", "dd.MM.yyyy", "2026-12-29"],
        ["01/01/1900", "MM/dd/yyyy", "1900-01-01"],
        ["12/31/2100", "MM/dd/yyyy", "2100-12-31"],
    ])("reads %s in %s as %s", (text, dateFormat, day) => {
        expect(readJumpText(text, dateFormat)).toEqual({ day });
    });

    it.each(["abc", "12/29", "12/29/20", "2026-12-29"])("reads %s as the format error", (text) => {
        expect(readJumpText(text, "MM/dd/yyyy")).toEqual({ error: "format" });
    });

    it.each(["01/01/1850", "12/31/1899", "01/01/2101", "12/31/9999"])(
        "reads %s as the range error",
        (text) => {
            expect(readJumpText(text, "MM/dd/yyyy")).toEqual({ error: "range" });
        },
    );

    it.each(["", "  "])("reads nothing from %j", (text) => {
        expect(readJumpText(text, "MM/dd/yyyy")).toBeUndefined();
    });
});
