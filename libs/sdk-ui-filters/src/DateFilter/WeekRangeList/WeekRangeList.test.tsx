// (C) 2026 GoodData Corporation

import { useState } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type WeekStart } from "@gooddata/sdk-model";

import { IntlDecorator } from "../DateRangePicker/IntlDecorators.js";
import { type IPeriodRange } from "../PeriodRangePicker/types.js";

import { WeekRangeList } from "./WeekRangeList.js";

const JUMP_DELAY = 300;
const ROW_HEIGHT = 30;
const LIST_HEIGHT = 8 * ROW_HEIGHT;

interface IRenderOptions {
    range?: IPeriodRange;
    weekStart?: WeekStart;
    withoutApply?: boolean;
}

function renderList({ range = {}, weekStart, withoutApply }: IRenderOptions = {}) {
    const onRangeChange = vi.fn();
    const onValidityChange = vi.fn();
    const onParentKeyDown = vi.fn();
    const submitForm = vi.fn();
    let setParentRange: (range: IPeriodRange) => void = () => {};
    let setParentWeekStart: (weekStart: WeekStart) => void = () => {};

    function Harness() {
        const [currentRange, setCurrentRange] = useState(range);
        const [currentWeekStart, setCurrentWeekStart] = useState(weekStart);
        setParentRange = setCurrentRange;
        setParentWeekStart = setCurrentWeekStart;

        return (
            <div onKeyDown={onParentKeyDown}>
                <WeekRangeList
                    range={currentRange}
                    onRangeChange={(newRange) => {
                        onRangeChange(newRange);
                        setCurrentRange(newRange);
                    }}
                    weekStart={currentWeekStart}
                    isMobile={false}
                    onValidityChange={onValidityChange}
                    withoutApply={withoutApply}
                    submitForm={submitForm}
                />
            </div>
        );
    }

    const { unmount } = render(IntlDecorator(<Harness />));

    return {
        unmount,
        onRangeChange,
        onValidityChange,
        onParentKeyDown,
        submitForm,
        replaceRange: (newRange: IPeriodRange) => act(() => setParentRange(newRange)),
        replaceWeekStart: (newWeekStart: WeekStart) => act(() => setParentWeekStart(newWeekStart)),
    };
}

const search = () => screen.getByRole("combobox");
const list = () => screen.getByRole("listbox");
const option = (start: string) => document.querySelector<HTMLElement>(`[role="option"][id$="-${start}"]`);
const headings = () =>
    Array.from(document.querySelectorAll(".s-week-range-list-heading")).map((heading) => heading.textContent);
const selectedStarts = () =>
    Array.from(document.querySelectorAll('[role="option"][aria-selected="true"]')).map((selected) =>
        selected.id.slice(-10),
    );
const activeStart = () => search().getAttribute("aria-activedescendant")?.slice(-10);

function type(text: string) {
    fireEvent.change(search(), { target: { value: text } });
    act(() => {
        vi.advanceTimersByTime(JUMP_DELAY);
    });
}

function press(key: string) {
    return fireEvent.keyDown(search(), { key });
}

describe("WeekRangeList", () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        vi.setSystemTime(new Date(2026, 8, 29, 12));
        vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("rendering", () => {
        it("lists the weeks of two years around today under their months", () => {
            renderList();

            expect(headings().at(0)).toBe("September 2024");
            expect(headings().at(-1)).toBe("September 2028");
            expect(headings()).toHaveLength(49);
            expect(screen.getAllByRole("option")).toHaveLength(213);
        });

        it("labels a week by its days and names it by its full dates", () => {
            renderList();

            expect(option("2026-12-27")).toHaveTextContent("Dec 27 – Jan 2");
            expect(option("2026-12-27")).toHaveAttribute("aria-label", "December 27, 2026 – January 2, 2027");
        });

        it("lists Monday to Sunday weeks with Monday", () => {
            renderList({ weekStart: "Monday" });

            expect(option("2026-12-28")).toHaveTextContent("Dec 28 – Jan 3");
            expect(option("2026-12-27")).toBeNull();
        });
    });

    describe("clicks", () => {
        it("reports the first clicked week as a range of one week", () => {
            const { onRangeChange } = renderList();

            fireEvent.click(option("2026-07-26")!);

            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-07-26", to: "2026-08-01" });
            expect(selectedStarts()).toEqual(["2026-07-26"]);
        });

        it("closes the range at an earlier second week", () => {
            const { onRangeChange } = renderList();

            fireEvent.click(option("2026-07-26")!);
            fireEvent.click(option("2026-07-05")!);

            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-07-05", to: "2026-08-01" });
            expect(selectedStarts()).toEqual(["2026-07-05", "2026-07-12", "2026-07-19", "2026-07-26"]);
        });

        it("starts over at the third click", () => {
            const { onRangeChange } = renderList();

            fireEvent.click(option("2026-07-26")!);
            fireEvent.click(option("2026-07-05")!);
            fireEvent.click(option("2026-08-09")!);

            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-08-09", to: "2026-08-15" });
            expect(selectedStarts()).toEqual(["2026-08-09"]);
        });

        it("previews the range up to the hovered week without selecting it", () => {
            renderList();

            fireEvent.click(option("2026-07-26")!);
            fireEvent.mouseMove(option("2026-08-09")!);

            const inRange = Array.from(document.querySelectorAll(".gd-week-range-list__week--in-range"));
            expect(inRange.map((row) => row.id.slice(-10))).toEqual([
                "2026-07-26",
                "2026-08-02",
                "2026-08-09",
            ]);
            expect(selectedStarts()).toEqual(["2026-07-26"]);
        });

        it.each([
            ["a month heading", () => document.querySelector(".s-week-range-list-heading")!],
            ["a week", () => option("2026-07-05")!],
            ["the list itself", list],
        ])("keeps the focus in the jump field on a mousedown on %s", (_, target) => {
            renderList();

            expect(fireEvent.mouseDown(target())).toBe(false);
        });
    });

    describe("keyboard", () => {
        it("moves the active week over weeks and skips the month headings", () => {
            renderList();

            press("ArrowDown");
            expect(activeStart()).toBe("2026-09-27");

            press("ArrowDown");
            expect(activeStart()).toBe("2026-10-04");

            press("ArrowUp");
            expect(activeStart()).toBe("2026-09-27");

            press("PageDown");
            expect(activeStart()).toBe("2026-10-25");
        });

        it("selects the active week on Enter and keeps the event to itself", () => {
            const { onRangeChange, onParentKeyDown } = renderList();

            press("ArrowDown");
            const isNotPrevented = press("Enter");

            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-09-27", to: "2026-10-03" });
            expect(isNotPrevented).toBe(false);
            expect(onParentKeyDown).not.toHaveBeenCalled();
        });

        it("applies a closed range on Enter on one of its weeks", () => {
            const { onRangeChange, submitForm } = renderList();

            fireEvent.click(option("2026-07-26")!);
            fireEvent.click(option("2026-07-05")!);
            fireEvent.mouseMove(option("2026-07-12")!);
            press("Enter");

            expect(submitForm).toHaveBeenCalledTimes(1);
            expect(onRangeChange).toHaveBeenCalledTimes(2);
            expect(selectedStarts()).toEqual(["2026-07-05", "2026-07-12", "2026-07-19", "2026-07-26"]);
        });

        it("starts a new range on Enter on a week of a closed range without an Apply button", () => {
            const { onRangeChange, submitForm } = renderList({ withoutApply: true });

            fireEvent.click(option("2026-07-26")!);
            fireEvent.click(option("2026-07-05")!);
            fireEvent.mouseMove(option("2026-07-12")!);
            press("Enter");

            expect(submitForm).not.toHaveBeenCalled();
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-07-12", to: "2026-07-18" });
            expect(selectedStarts()).toEqual(["2026-07-12"]);
        });

        it("selects a typed week of a closed range on Enter instead of applying the range", () => {
            const { onRangeChange, submitForm } = renderList();

            fireEvent.click(option("2026-07-26")!);
            fireEvent.click(option("2026-07-05")!);
            type("07/14/2026");
            press("Enter");

            expect(submitForm).not.toHaveBeenCalled();
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-07-12", to: "2026-07-18" });
        });

        it("starts a new range on Enter outside a closed range", () => {
            const { onRangeChange, submitForm } = renderList();

            fireEvent.click(option("2026-07-26")!);
            fireEvent.click(option("2026-07-05")!);
            fireEvent.mouseMove(option("2026-08-09")!);
            press("Enter");

            expect(submitForm).not.toHaveBeenCalled();
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-08-09", to: "2026-08-15" });
        });

        it("closes an open range on Enter without applying it", () => {
            const { onRangeChange, submitForm } = renderList();

            fireEvent.click(option("2026-07-26")!);
            fireEvent.mouseMove(option("2026-08-09")!);
            press("Enter");

            expect(submitForm).not.toHaveBeenCalled();
            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-07-26", to: "2026-08-15" });
        });

        it("applies a closed range on Enter with nothing typed or active", () => {
            const { onRangeChange, submitForm } = renderList({
                range: { from: "2026-07-05", to: "2026-08-01" },
            });

            press("Enter");

            expect(submitForm).toHaveBeenCalledTimes(1);
            expect(onRangeChange).not.toHaveBeenCalled();
        });

        it("leaves Enter with nothing typed or active to the parent without an Apply button", () => {
            const { onRangeChange, onParentKeyDown, submitForm } = renderList({
                range: { from: "2026-07-05", to: "2026-08-01" },
                withoutApply: true,
            });

            expect(press("Enter")).toBe(true);
            expect(onParentKeyDown).toHaveBeenCalledTimes(1);
            expect(submitForm).not.toHaveBeenCalled();
            expect(onRangeChange).not.toHaveBeenCalled();
        });

        it("leaves Enter with nothing typed or active to the parent while a range is open", () => {
            const { onRangeChange, onParentKeyDown, submitForm } = renderList();

            fireEvent.click(option("2026-07-05")!);

            expect(press("Enter")).toBe(true);
            expect(onParentKeyDown).toHaveBeenCalledTimes(1);
            expect(submitForm).not.toHaveBeenCalled();
            expect(onRangeChange).toHaveBeenCalledTimes(1);
            expect(selectedStarts()).toEqual(["2026-07-05"]);
        });

        it("leaves Home and End to the caret", () => {
            const { onParentKeyDown } = renderList();

            expect(press("Home")).toBe(true);
            expect(onParentKeyDown).not.toHaveBeenCalled();
        });
    });

    describe("jump", () => {
        it("makes the week of a typed date active", () => {
            renderList();

            type("12/29/2026");

            expect(activeStart()).toBe("2026-12-27");
            expect(selectedStarts()).toEqual([]);
        });

        it("selects the typed week on Enter before the jump has run", () => {
            const { onRangeChange } = renderList();

            fireEvent.change(search(), { target: { value: "12/29/2026" } });
            press("Enter");

            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-12-27", to: "2027-01-02" });
        });

        it("selects the week moved to from a typed date on Enter", () => {
            const { onRangeChange } = renderList();

            type("12/29/2026");
            press("ArrowDown");
            press("Enter");

            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2027-01-03", to: "2027-01-09" });
        });

        it("does not jump to the typed date again once a week is selected", () => {
            renderList();

            type("04/15/2026");
            fireEvent.mouseMove(option("2026-07-05")!);
            fireEvent.click(option("2026-07-05")!);

            expect(activeStart()).toBe("2026-07-05");
        });

        it("replaces the listed years while nothing is selected", () => {
            renderList();

            type("12/29/2040");

            expect(activeStart()).toBe("2040-12-23");
            expect(headings().at(0)).toBe("December 2038");
            expect(option("2026-09-27")).toBeNull();
        });

        it("keeps the listed years once a week is selected", () => {
            renderList();

            fireEvent.click(option("2026-07-26")!);
            type("12/29/2030");

            expect(activeStart()).toBe("2030-12-29");
            expect(option("2026-07-26")).toHaveAttribute("aria-selected", "true");
            expect(headings().at(0)).toBe("September 2024");
        });

        it("keeps the listed years when the field is emptied", () => {
            renderList();

            type("12/29/2040");
            type("");

            expect(headings().at(0)).toBe("December 2038");
        });
    });

    describe("errors", () => {
        it("shows the format error once the field is left", () => {
            renderList();

            type("abc");
            expect(screen.queryByText(/Invalid date/)).toBeNull();

            fireEvent.blur(search());

            expect(screen.getByText("Error: Invalid date — use MM/dd/YYYY format.")).toBeInTheDocument();
            expect(search()).toHaveAttribute("aria-invalid", "true");
        });

        it.each(["abc", "01/01/1850"])(
            "shows the error of %s on Enter and neither selects nor applies the active week",
            (text) => {
                const { onRangeChange, submitForm } = renderList({
                    range: { from: "2026-07-05", to: "2026-08-01" },
                });

                fireEvent.mouseMove(option("2026-07-12")!);
                type(text);
                press("Enter");

                expect(screen.getByText(/Error: Invalid date/)).toBeInTheDocument();
                expect(onRangeChange).not.toHaveBeenCalled();
                expect(submitForm).not.toHaveBeenCalled();
            },
        );

        it("shows the range error once the field is left and does not jump", () => {
            renderList();

            type("01/01/1850");
            fireEvent.blur(search());

            expect(
                screen.getByText("Error: Invalid date — use a date from 1900 to 2100."),
            ).toBeInTheDocument();
            expect(activeStart()).toBeUndefined();
            expect(headings().at(0)).toBe("September 2024");
        });

        it("hides the error while the field is edited again", () => {
            renderList();

            type("abc");
            fireEvent.blur(search());
            type("12/29/2026");

            expect(screen.queryByText(/Invalid date/)).toBeNull();
        });
    });

    describe("validity", () => {
        it("is valid only once a week is selected", () => {
            const { onValidityChange } = renderList();

            expect(onValidityChange).toHaveBeenLastCalledWith(false);

            fireEvent.click(option("2026-07-26")!);

            expect(onValidityChange).toHaveBeenLastCalledWith(true);
        });

        it("is valid once the list is gone", () => {
            const { onValidityChange, unmount } = renderList();

            expect(onValidityChange).toHaveBeenLastCalledWith(false);

            unmount();

            expect(onValidityChange).toHaveBeenLastCalledWith(true);
        });
    });

    describe("stored range", () => {
        it("selects the stored weeks and lists the years around them only", () => {
            renderList({ range: { from: "2010-03-07", to: "2010-03-13" } });

            expect(selectedStarts()).toEqual(["2010-03-07"]);
            expect(headings().at(0)).toBe("March 2008");
            expect(headings().at(-1)).toBe("March 2012");
        });

        it("applies the stored range on Enter on one of its weeks", () => {
            const { onRangeChange, submitForm } = renderList({
                range: { from: "2010-03-07", to: "2010-03-13" },
            });

            fireEvent.mouseMove(option("2010-03-07")!);
            press("Enter");

            expect(submitForm).toHaveBeenCalledTimes(1);
            expect(onRangeChange).not.toHaveBeenCalled();
        });

        it("selects and previews nothing for a range that is not whole weeks", () => {
            const { onValidityChange } = renderList({ range: { from: "2026-07-22", to: "2026-07-28" } });

            expect(selectedStarts()).toEqual([]);
            expect(screen.getByText("Preview: –")).toBeInTheDocument();
            expect(onValidityChange).toHaveBeenLastCalledWith(false);
        });

        it("follows a range the parent replaces", () => {
            const { replaceRange } = renderList({ range: { from: "2026-07-05", to: "2026-07-11" } });

            replaceRange({ from: "2026-08-09", to: "2026-08-22" });

            expect(selectedStarts()).toEqual(["2026-08-09", "2026-08-16"]);
            expect(screen.getByText("Preview: 08/09/2026 – 08/22/2026")).toBeInTheDocument();
        });

        it("drops an open range when the parent replaces the range", () => {
            const { onRangeChange, replaceRange } = renderList();

            fireEvent.click(option("2026-07-26")!);
            replaceRange({ from: "2026-08-09", to: "2026-08-15" });
            fireEvent.click(option("2026-07-05")!);

            expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-07-05", to: "2026-07-11" });
        });

        it("keeps the active day in its week of the new week start", () => {
            const { replaceWeekStart } = renderList();

            type("12/29/2026");
            replaceWeekStart("Monday");

            expect(activeStart()).toBe("2026-12-28");
            expect(option("2026-12-27")).toBeNull();
        });
    });

    describe("scrolling", () => {
        beforeEach(() => {
            vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (
                this: HTMLElement,
            ) {
                return Array.from(this.parentElement?.children ?? []).indexOf(this) * ROW_HEIGHT;
            });
            vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(ROW_HEIGHT);
            vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(LIST_HEIGHT);
            vi.spyOn(Element.prototype, "scrollHeight", "get").mockImplementation(function (this: Element) {
                return this.children.length * ROW_HEIGHT;
            });
        });

        const rowOffset = (start: string) => option(start)!.offsetTop - list().scrollTop;
        const topRow = () => list().children[Math.floor(list().scrollTop / ROW_HEIGHT)];
        const nearStart = () => 100;
        const nearEnd = () => list().scrollHeight - LIST_HEIGHT - 100;

        function scrollTo(scrollTop: () => number) {
            list().scrollTop = scrollTop();
            fireEvent.scroll(list());
        }

        it("centres the stored week on open", () => {
            renderList({ range: { from: "2026-07-05", to: "2026-07-11" } });

            expect(rowOffset("2026-07-05")).toBe((LIST_HEIGHT - ROW_HEIGHT) / 2);
        });

        it("centres the week of a typed date", () => {
            renderList({ range: { from: "2026-07-05", to: "2026-07-11" } });

            type("03/07/2010");

            expect(rowOffset("2010-03-07")).toBe((LIST_HEIGHT - ROW_HEIGHT) / 2);
        });

        it("adds a year at the start and keeps the visible rows in place", () => {
            renderList();
            const element = list();
            const rowCount = element.children.length;

            element.scrollTop = 100;
            fireEvent.scroll(element);

            const addedRows = element.children.length - rowCount;
            expect(headings().at(0)).toBe("September 2023");
            expect(addedRows).toBeGreaterThan(60);
            expect(element.scrollTop).toBe(100 + addedRows * ROW_HEIGHT);
        });

        it("adds a year at the end and keeps the scroll position", () => {
            renderList();
            const element = list();
            const scrollTop = element.scrollHeight - element.clientHeight - 100;

            element.scrollTop = scrollTop;
            fireEvent.scroll(element);

            expect(headings().at(-1)).toBe("September 2029");
            expect(element.scrollTop).toBe(scrollTop);
        });

        it.each([
            ["start", nearStart, "September 2017", "September 2027"],
            ["end", nearEnd, "September 2025", "September 2035"],
        ])(
            "extends at the %s past ten years by dropping a year at the other side and keeps the shown rows",
            (_, scrollPosition, firstHeading, lastHeading) => {
                renderList();
                for (let extension = 0; extension < 6; extension++) {
                    scrollTo(scrollPosition);
                }

                list().scrollTop = scrollPosition();
                const shownRow = topRow();
                fireEvent.scroll(list());

                expect(headings().at(0)).toBe(firstHeading);
                expect(headings().at(-1)).toBe(lastHeading);
                expect(topRow()).toBe(shownRow);
            },
        );
    });
});
