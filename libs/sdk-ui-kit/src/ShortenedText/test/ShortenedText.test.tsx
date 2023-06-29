// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { defaultImport } from "default-import";

import { ShortenedText, getShortenedTitle, IShortenedTextProps } from "../ShortenedText.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

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

        await userEvent.hover(screen.getByText("…", { exact: false }));
        expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it("should not render bubble if displayTooltip is false", async () => {
        renderShortenedText({
            children: longText,
            tagName: "div",
            getElement: () => createElement(100, 200),
            displayTooltip: false,
        });

        await userEvent.hover(screen.getByText("…", { exact: false }));
        expect(screen.queryByText(longText)).not.toBeInTheDocument();
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
