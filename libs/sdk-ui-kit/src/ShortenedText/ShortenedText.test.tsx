// (C) 2007-2026 GoodData Corporation

import { type RefObject, createRef } from "react";

import { act, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
    type IShortenedTextHandle,
    type IShortenedTextProps,
    ShortenedText,
    getShortenedTitle,
} from "./ShortenedText.js";

describe("ShortenedText", () => {
    const renderShortenedText = (props: IShortenedTextProps) => {
        return render(<ShortenedText {...props} />);
    };

    function createElement(
        width: number,
        scrollWidth: number,
    ): Pick<HTMLElement, "scrollWidth" | "getBoundingClientRect"> {
        return {
            scrollWidth,
            getBoundingClientRect: () => ({
                width,
                bottom: 0,
                height: 0,
                left: 0,
                right: 0,
                toJSON: () => null,
                top: 0,
                x: 0,
                y: 0,
            }),
        };
    }

    const shortText = "t";
    const longText = "this is a very very long text for testing purposes";

    it("should not shorten short text", () => {
        renderShortenedText({
            children: shortText,
            tagName: "div",
            getElement: () => createElement(99.4, 100),
        });

        expect(screen.getByText(shortText)).toBeInTheDocument();
    });

    it("should shorten log text", () => {
        renderShortenedText({
            children: longText,
            tagName: "div",
            getElement: () => createElement(100, 200),
        });
        expect(screen.getByText("…", { exact: false })).toBeInTheDocument();
    });

    it("should expose the full text as the accessible name even when visually truncated", () => {
        // Wrap in a labelled element so we can query the accessible-name computation.
        render(
            <button>
                <ShortenedText tagName="div" getElement={() => createElement(100, 200)}>
                    {longText}
                </ShortenedText>
            </button>,
        );
        // ARIA name computation must include the full (sr-only) text and exclude the
        // visually-truncated text marked with aria-hidden. getByRole({name}) uses the
        // real accessible-name algorithm so this guards the user-visible a11y behavior.
        expect(screen.getByRole("button")).toHaveAccessibleName(longText);
    });

    it("should render shorten text first and than not render shorten text after resize", () => {
        let elementWidth = 120;
        let scrollWidth = 200;

        // first render shorten text
        const { rerender } = renderShortenedText({
            children: longText,
            tagName: "div",
            getElement: () => {
                return createElement(elementWidth, scrollWidth);
            },
        });
        expect(screen.getByText("…", { exact: false })).toBeInTheDocument();

        // change size
        elementWidth = 100;
        scrollWidth = 100;

        rerender(
            <ShortenedText getElement={() => createElement(elementWidth, scrollWidth)}>
                {shortText}
            </ShortenedText>,
        );

        expect(screen.getByText(shortText)).toBeInTheDocument();
    });

    it("should not render shorten text first and than render shorten text after resize", () => {
        let elementWidth = 100;
        let scrollWidth = 100;

        // first render not shorten text
        const { rerender } = renderShortenedText({
            children: shortText,
            tagName: "div",
            getElement: () => {
                return createElement(elementWidth, scrollWidth);
            },
        });
        expect(screen.getByText(shortText)).toBeInTheDocument();

        // change size
        elementWidth = 120;
        scrollWidth = 200;

        rerender(
            <ShortenedText getElement={() => createElement(elementWidth, scrollWidth)}>
                {longText}
            </ShortenedText>,
        );

        expect(screen.getByText("…", { exact: false })).toBeInTheDocument();
    });

    it("should measure the incoming text, not the outgoing one, when children and the container width change together", () => {
        // Emulates a recycled virtualized list row: it gets a new title and a new width in one and
        // the same render (see DateDatasetsListItem, which drives recomputeShortening off `width`).
        const CHAR_WIDTH = 10;
        const wideText = "12345678901234567890"; // 20 chars -> 200px
        const narrowText = "12345678"; // 8 chars -> 80px
        let containerWidth = 300;

        // Unlike the fixed mocks above, scrollWidth follows whatever is really in the DOM, the way a
        // browser measures it. The sr-only copy of the full text is clipped out of the real layout,
        // so only the visible (aria-hidden) part contributes once the text is shortened.
        const getElement = ({ textRef }: { textRef: RefObject<HTMLElement | null> }) => {
            const element = textRef.current;
            if (!element) {
                // Falling back to a 0px measurement here would make every title "fit", so a
                // ref-attachment regression would pass this test instead of failing it.
                throw new Error("ShortenedText text ref is not attached");
            }
            const visible = element.querySelector("[aria-hidden='true']") ?? element;

            return createElement(containerWidth, (visible.textContent ?? "").length * CHAR_WIDTH);
        };

        const { rerender } = render(
            <ShortenedText tagName="div" getElement={getElement}>
                {wideText}
            </ShortenedText>,
        );
        // 200px of text in a 300px container - nothing to shorten.
        expect(screen.getByText(wideText)).toBeInTheDocument();

        // The new title needs 80px and the container is 100px wide, so it still fits and must stay
        // whole. Measuring the outgoing 200px text here would shorten it, and the `customTitle`
        // guard would then latch that wrong result in for good.
        containerWidth = 100;
        rerender(
            <ShortenedText tagName="div" getElement={getElement}>
                {narrowText}
            </ShortenedText>,
        );

        expect(screen.getByText(narrowText)).toBeInTheDocument();
        expect(screen.queryByText("…", { exact: false })).not.toBeInTheDocument();
    });

    it("should restore the full text when recomputeShortening is called after the container grows", () => {
        // start narrow — forces shortening on mount
        let elementWidth = 100;
        let scrollWidth = 200;
        const ref = createRef<IShortenedTextHandle>();

        render(
            <ShortenedText
                ref={ref}
                tagName="div"
                getElement={() => createElement(elementWidth, scrollWidth)}
            >
                {longText}
            </ShortenedText>,
        );
        expect(screen.getByText("…", { exact: false })).toBeInTheDocument();

        // container grows so the full text now fits — emulates the width-prop change driven by
        // InsightListItem's useEffect, which calls recomputeShortening() on the ref.
        elementWidth = 300;
        scrollWidth = 250;

        act(() => {
            ref.current?.recomputeShortening();
        });

        expect(screen.getByText(longText)).toBeInTheDocument();
        expect(screen.queryByText("…", { exact: false })).not.toBeInTheDocument();
    });

    it("should shorten further when recomputeShortening is called after the container shrinks further while already truncated", () => {
        let elementWidth = 250;
        const scrollWidth = 250;
        const ref = createRef<IShortenedTextHandle>();

        render(
            <ShortenedText
                ref={ref}
                tagName="div"
                getElement={() => createElement(elementWidth, scrollWidth)}
            >
                {longText}
            </ShortenedText>,
        );
        expect(screen.getByText(longText)).toBeInTheDocument();

        elementWidth = 100;
        act(() => {
            ref.current?.recomputeShortening();
        });
        const firstShortened = screen.getByText("…", { exact: false }).textContent;

        elementWidth = 20;
        act(() => {
            ref.current?.recomputeShortening();
        });
        const secondShortened = screen.getByText("…", { exact: false }).textContent;

        expect(secondShortened.length).toBeLessThan(firstShortened.length);
    });

    it("should re-measure against the current DOM state, not a stale cached width, when recomputeShortening is called while already truncated and typography changed", () => {
        const elementWidth = 100;
        let scrollWidth = 200;
        const ref = createRef<IShortenedTextHandle>();

        render(
            <ShortenedText
                ref={ref}
                tagName="div"
                getElement={() => createElement(elementWidth, scrollWidth)}
            >
                {longText}
            </ShortenedText>,
        );
        const firstShortened = screen.getByText("…", { exact: false }).textContent;

        scrollWidth = 800;
        act(() => {
            ref.current?.recomputeShortening();
        });
        const secondShortened = screen.getByText("…", { exact: false }).textContent;

        expect(secondShortened.length).toBeLessThan(firstShortened.length);
    });

    it("should render bubble if displayTooltip is true", async () => {
        renderShortenedText({
            children: longText,
            tagName: "div",
            getElement: () => createElement(100, 200),
            displayTooltip: true,
        });

        // Before hover: full text exists once, only in the sr-only a11y span.
        expect(screen.getAllByText(longText)).toHaveLength(1);

        await userEvent.hover(screen.getByText("…", { exact: false }));
        // After hover: full text appears a second time inside the bubble.
        await waitFor(() => {
            expect(screen.getAllByText(longText)).toHaveLength(2);
        });
    });

    it("should not render bubble if displayTooltip is false", async () => {
        renderShortenedText({
            children: longText,
            tagName: "div",
            getElement: () => createElement(100, 200),
            displayTooltip: false,
        });

        await userEvent.hover(screen.getByText("…", { exact: false }));
        // Full text exists only in the sr-only a11y span; no bubble was added on hover.
        expect(screen.getAllByText(longText)).toHaveLength(1);
    });

    describe("getShortenedTitle", () => {
        it("should shorten original title when the text is overflowing the wrapper", () => {
            // big scroll
            expect(
                getShortenedTitle(
                    "abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba",
                    createElement(200, 600),
                ),
            ).toEqual("abcdefg…gfedcba");

            // medium scroll
            expect(
                getShortenedTitle(
                    "abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba",
                    createElement(200, 300),
                ),
            ).toEqual("abcdefghijklmn…nmlkjihgfedcba");

            // small scroll
            expect(
                getShortenedTitle(
                    "abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba",
                    createElement(200, 210),
                ),
            ).toEqual("abcdefghijklmnopqrstu…utsrqponmlkjihgfedcba");
        });

        it("should shorten from the end when ellipsisPosition is 'end'", () => {
            expect(
                getShortenedTitle(
                    "abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba",
                    createElement(200, 600),
                    "end",
                ),
            ).toEqual("abcdefghijklmn…");
        });

        it("should shorten to just an ellipsis, not overflow with a long prefix, when the available width fits fewer than three characters", () => {
            expect(
                getShortenedTitle(
                    "abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba",
                    createElement(1, 600),
                    "end",
                ),
            ).toEqual("…");
        });

        it("should return original title when the text is not overflowing the wrapper", () => {
            // no scroll
            expect(
                getShortenedTitle(
                    "abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba",
                    createElement(200, 200),
                ),
            ).toEqual("abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba");
            expect(
                getShortenedTitle(
                    "abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba",
                    createElement(200, 10),
                ),
            ).toEqual("abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba");
        });
    });
});
