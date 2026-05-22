// (C) 2007-2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { type IShortenedTextProps, ShortenedText, getShortenedTitle } from "../ShortenedText.js";

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
        expect(screen.getAllByText(longText)).toHaveLength(2);
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
