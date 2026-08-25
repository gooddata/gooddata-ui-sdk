// (C) 2026 GoodData Corporation

import { act, fireEvent, render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type ICatalogDateDataset, idRef } from "@gooddata/sdk-model";

import { DateDatasetDropdown, type IDateDatasetDropdownProps } from "./DateDatasetDropdown.js";

const DefaultLocale = "en-US";

function makeDateDataset(id: string, title: string): ICatalogDateDataset {
    return {
        type: "dateDataset",
        relevance: 0,
        dateAttributes: [],
        dataSet: {
            id,
            title,
            uri: `/gdc/md/${id}`,
            ref: idRef(id),
            description: "",
            production: true,
            deprecated: false,
            unlisted: false,
        },
    } as unknown as ICatalogDateDataset;
}

function renderComponent(props: Partial<IDateDatasetDropdownProps>) {
    const defaultProps: IDateDatasetDropdownProps = {
        widgetRef: idRef("widget"),
        relatedDateDatasets: [],
        onDateDatasetChange: () => {},
        width: 0,
        unrelatedDateDatasets: [],
    };
    return render(
        <IntlProvider key={DefaultLocale} locale={DefaultLocale} messages={{}}>
            <DateDatasetDropdown {...defaultProps} {...props} />
        </IntlProvider>,
    );
}

describe("DateDatasetDropdown — list width (F1-2702, KD edit mode)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    function mockElementRects(triggerWidth: number, buttonLeft = 100) {
        return vi
            .spyOn(Element.prototype, "getBoundingClientRect")
            .mockImplementation(function (this: Element) {
                const base = { bottom: 0, height: 23, top: 0, x: 0, y: 0, toJSON: () => null };
                if (this.classList.contains("s-date-dataset-width-probe")) {
                    const width = (this.textContent ?? "").length * 8;
                    return { ...base, width, left: 0, right: width };
                }
                if (this.querySelector?.(".s-date-dataset-button")) {
                    return {
                        ...base,
                        width: triggerWidth,
                        left: buttonLeft,
                        right: buttonLeft + triggerWidth,
                    };
                }
                return { ...base, width: 0, left: 0, right: 0 };
            });
    }

    function mockScrollbarWidth(width: number) {
        return vi
            .spyOn(HTMLElement.prototype, "offsetWidth", "get")
            .mockImplementation(function (this: HTMLElement) {
                return this.classList.contains("s-date-dataset-scrollbar-probe") ? width : 0;
            });
    }

    function withInnerWidth(width: number, run: () => void) {
        const original = window.innerWidth;
        Object.defineProperty(window, "innerWidth", { value: width, configurable: true });
        try {
            run();
        } finally {
            Object.defineProperty(window, "innerWidth", { value: original, configurable: true });
        }
    }

    function openDropdown() {
        fireEvent.click(document.querySelector(".s-date-dataset-button")!);
    }

    function getListWidth(): number {
        const list = document.querySelector<HTMLElement>(".dataSets-list")!;
        return Number(list.style.width.replace("px", ""));
    }

    it("grows the open list wider than the trigger to fit a dataset name that still fits under the cap", () => {
        mockElementRects(80);
        const title = "Date dataset with a super long name ABCXYZ";
        renderComponent({ relatedDateDatasets: [makeDateDataset("long", title)] });

        openDropdown();

        expect(getListWidth()).toEqual(title.length * 8);
    });

    it("reserves extra width for the list scrollbar when items overflow the list's max height", () => {
        mockElementRects(80);
        mockScrollbarWidth(17);
        const title = "Some Longer Title";
        renderComponent({
            relatedDateDatasets: Array.from({ length: 20 }, (_, index) =>
                makeDateDataset(`item-${index}`, index === 0 ? title : "Q1"),
            ),
        });

        openDropdown();

        expect(getListWidth()).toEqual(title.length * 8 + 17);
    });

    it("caps the open list width at 350px for a name that would otherwise exceed it", () => {
        mockElementRects(80);
        const veryLongTitle =
            "An extremely long date dataset name that will never fit within the three hundred fifty pixel cap";
        renderComponent({ relatedDateDatasets: [makeDateDataset("verylong", veryLongTitle)] });

        openDropdown();

        expect(getListWidth()).toEqual(350);
    });

    it("never shrinks the open list below the trigger width", () => {
        mockElementRects(220);
        renderComponent({ relatedDateDatasets: [makeDateDataset("short", "Q1")] });

        openDropdown();

        expect(getListWidth()).toEqual(220);
    });

    it("opens leftward to grow past the trigger width when the trigger sits near the right viewport edge", () => {
        withInnerWidth(300, () => {
            mockElementRects(80, 210);
            const title = "A very long date dataset name";
            renderComponent({ relatedDateDatasets: [makeDateDataset("long", title)] });

            openDropdown();

            expect(getListWidth()).toEqual(title.length * 8);
        });
    });

    it("never shrinks the open list below the trigger width, even when neither side has more than a sliver of room", () => {
        withInnerWidth(20, () => {
            mockElementRects(10, 5);
            renderComponent({
                relatedDateDatasets: [makeDateDataset("long", "A very long date dataset name")],
            });

            openDropdown();

            expect(getListWidth()).toEqual(10);
        });
    });

    it("recalculates the open list width after the viewport is resized", () => {
        vi.useFakeTimers();
        try {
            mockElementRects(80);
            const title = "Date dataset with a super long name ABCXYZ";
            renderComponent({ relatedDateDatasets: [makeDateDataset("long", title)] });

            openDropdown();
            expect(getListWidth()).toEqual(title.length * 8);

            withInnerWidth(150, () => {
                act(() => {
                    fireEvent(window, new Event("resize"));
                    vi.advanceTimersByTime(100);
                });

                expect(getListWidth()).toEqual(80);
            });
        } finally {
            vi.useRealTimers();
        }
    });

    // The scroll listener isn't just for user-initiated scrolling: when autoOpen is true,
    // ScrollableItem scrolls the trigger into view in its own effect, which runs *after* this
    // component's mount-time dimension calculation (a layout effect) has already captured the
    // trigger's pre-scroll position. Only a subsequent scroll event — which the scroll-into-view
    // itself dispatches — corrects the dimensions for the trigger's actual, post-scroll position.
    // A resize-only listener would miss this entirely, silently sizing the dropdown for a
    // position the trigger no longer occupies. This test pins down that a scroll event alone
    // (independent of resize) triggers recalculation against the trigger's latest rect.
    it("recalculates using the trigger's latest position when a scroll event arrives after mount, independent of resize", () => {
        vi.useFakeTimers();
        try {
            let triggerHasMoved = false;
            vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
                const base = { bottom: 0, height: 23, top: 0, x: 0, y: 0, toJSON: () => null };
                if (this.classList.contains("s-date-dataset-width-probe")) {
                    const width = (this.textContent ?? "").length * 8;
                    return { ...base, width, left: 0, right: width };
                }
                if (this.querySelector?.(".s-date-dataset-button")) {
                    return triggerHasMoved
                        ? { ...base, width: 20, left: 140, right: 160 }
                        : { ...base, width: 50, left: 0, right: 50 };
                }
                return { ...base, width: 0, left: 0, right: 0 };
            });

            withInnerWidth(300, () => {
                const veryLongTitle =
                    "An extremely long date dataset name that will never fit within the three hundred fifty pixel cap";
                renderComponent({ relatedDateDatasets: [makeDateDataset("verylong", veryLongTitle)] });

                openDropdown();
                const widthBeforeMove = getListWidth();
                expect(widthBeforeMove).toEqual(290);

                triggerHasMoved = true;
                act(() => {
                    fireEvent(window, new Event("scroll"));
                    vi.advanceTimersByTime(100);
                });

                expect(getListWidth()).toEqual(150);
                expect(getListWidth()).not.toEqual(widthBeforeMove);
            });
        } finally {
            vi.useRealTimers();
        }
    });

    it("does not re-measure item titles on resize — only the viewport-dependent width is recalculated", () => {
        vi.useFakeTimers();
        try {
            let widthProbeMeasurements = 0;
            vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
                const base = { bottom: 0, height: 23, top: 0, x: 0, y: 0, toJSON: () => null };
                if (this.classList.contains("s-date-dataset-width-probe")) {
                    widthProbeMeasurements += 1;
                    const width = (this.textContent ?? "").length * 8;
                    return { ...base, width, left: 0, right: width };
                }
                if (this.querySelector?.(".s-date-dataset-button")) {
                    return { ...base, width: 80, left: 100, right: 180 };
                }
                return { ...base, width: 0, left: 0, right: 0 };
            });

            renderComponent({ relatedDateDatasets: [makeDateDataset("long", "A dataset name")] });
            openDropdown();

            const measurementsAfterMount = widthProbeMeasurements;
            expect(measurementsAfterMount).toBeGreaterThan(0);

            withInnerWidth(150, () => {
                act(() => {
                    fireEvent(window, new Event("resize"));
                    vi.advanceTimersByTime(100);
                });
            });

            expect(widthProbeMeasurements).toEqual(measurementsAfterMount);
        } finally {
            vi.useRealTimers();
        }
    });

    it("does not measure the scrollbar width at all when the list never overflows", () => {
        mockElementRects(80);
        let scrollbarProbeCreations = 0;
        vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(
            function (this: HTMLElement) {
                if (this.classList.contains("s-date-dataset-scrollbar-probe")) {
                    scrollbarProbeCreations += 1;
                }
                return 0;
            },
        );

        renderComponent({ relatedDateDatasets: [makeDateDataset("a", "A")] });

        expect(scrollbarProbeCreations).toEqual(0);
    });

    it("only measures the scrollbar width once, even as an already-overflowing item list keeps changing", () => {
        mockElementRects(80);
        let scrollbarProbeCreations = 0;
        vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(
            function (this: HTMLElement) {
                if (this.classList.contains("s-date-dataset-scrollbar-probe")) {
                    scrollbarProbeCreations += 1;
                }
                return 0;
            },
        );

        const overflowingItems = (count: number) =>
            Array.from({ length: count }, (_, index) => makeDateDataset(`item-${index}`, `Q${index}`));

        const { rerender } = renderComponent({ relatedDateDatasets: overflowingItems(20) });
        expect(scrollbarProbeCreations).toEqual(1);

        rerender(
            <IntlProvider key={DefaultLocale} locale={DefaultLocale} messages={{}}>
                <DateDatasetDropdown
                    widgetRef={idRef("widget")}
                    relatedDateDatasets={overflowingItems(21)}
                    onDateDatasetChange={() => {}}
                    width={0}
                    unrelatedDateDatasets={[]}
                />
            </IntlProvider>,
        );

        expect(scrollbarProbeCreations).toEqual(1);
    });
});
