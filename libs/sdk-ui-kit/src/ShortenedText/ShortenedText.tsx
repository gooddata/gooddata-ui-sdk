// (C) 2007-2026 GoodData Corporation

import { type ElementType, forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";

import cx from "classnames";

import { Bubble } from "../Bubble/Bubble.js";
import { BubbleHoverTrigger } from "../Bubble/BubbleHoverTrigger.js";
import { type IAlignPoint } from "../typings/positioning.js";

// ShortenText adds ellipsis (…) in the middle of the string.
// SIDE_SCALE_RATIO is a constant which tells the percentage of
// of the string characters to be taken from both sides to produce
// final shortened string
function getElementWidth(element: Pick<HTMLElement, "scrollWidth" | "getBoundingClientRect">): number {
    return Math.ceil(element.getBoundingClientRect().width);
}

export function getShortenedTitle(
    title: string,
    element: Pick<HTMLElement, "scrollWidth" | "getBoundingClientRect">,
    ellipsisPosition = "middle",
): string {
    const elementWidth = getElementWidth(element);
    const { scrollWidth } = element;

    if (elementWidth >= scrollWidth) {
        return title;
    }

    const titleLength = title.length;
    const numChars = titleLength * (elementWidth / scrollWidth);
    if (ellipsisPosition === "middle") {
        const SIDE_SCALE_RATIO = 0.42;

        const numCharsSideStrip = Math.floor(numChars * SIDE_SCALE_RATIO);

        const pre = title.substr(0, numCharsSideStrip);
        const post = title.substr(titleLength - numCharsSideStrip, titleLength);

        return `${pre}…${post}`;
    } else {
        const SIDE_SCALE_RATIO = 1;
        const numCharsSideStrip = Math.floor(numChars * SIDE_SCALE_RATIO);
        const pre = title.substr(0, Math.max(0, numCharsSideStrip - 3)); // -3 for ellipsis
        return `${pre}…`;
    }
}

/**
 * @internal
 */
export interface IShortenedTextProps {
    children: string;
    className?: string;
    tagName?: ElementType;
    tooltipAlignPoints?: IAlignPoint[];
    tooltipVisibleOnMouseOver?: boolean;
    getElement?: (context: any) => Pick<HTMLElement, "scrollWidth" | "getBoundingClientRect">;
    displayTooltip?: boolean;
    ellipsisPosition?: "middle" | "end";
    id?: string;
}

/**
 * @internal
 */
export interface IShortenedTextState {
    title: string;
    customTitle: boolean;
}

/**
 * To make this component work, parent container needs this:
 *      max-width: Xpx;
 *      white-space: nowrap;
 *
 * and the component itself needs:
 *      display: inline-block;
 *      width: 100%;
 *      white-space: nowrap;
 */

/**
 * Imperative API exposed through a ref, used by consumers that need to re-measure the text
 * after a layout change that React cannot observe on its own (e.g. a container resize).
 *
 * @internal
 */
export interface IShortenedTextHandle {
    recomputeShortening: () => void;
}

/**
 * @internal
 */
export const ShortenedText = forwardRef<IShortenedTextHandle, IShortenedTextProps>(function ShortenedText(
    {
        children,
        className = "",
        tagName = "span",
        tooltipAlignPoints = [{ align: "cr cl" }],
        tooltipVisibleOnMouseOver = false,
        getElement = (context) => {
            // Necessary for testing width in JSDOM env.
            return context.textRef.current;
        },
        displayTooltip = true,
        ellipsisPosition = "middle",
        id,
    }: IShortenedTextProps,
    ref,
) {
    const textRef = useRef<HTMLElement>(null);
    const naturalScrollWidth = useRef<number | null>(null);
    const isFirstCommit = useRef(true);

    const [title, setTitle] = useState(children);
    const [customTitle, setCustomTitle] = useState(false);

    const checkTitle = () => {
        const element = getElement({ textRef });
        const elementWidth = getElementWidth(element);

        if (!customTitle || naturalScrollWidth.current === null) {
            naturalScrollWidth.current = element.scrollWidth;
        }
        const scrollWidth = naturalScrollWidth.current;
        const measuredElement = {
            getBoundingClientRect: () => element.getBoundingClientRect(),
            scrollWidth,
        };

        if (elementWidth > 0 && elementWidth < scrollWidth) {
            setTitle(getShortenedTitle(children, measuredElement, ellipsisPosition));
            setCustomTitle(true);
        } else {
            setTitle(children);
            setCustomTitle(false);
        }
    };

    // New children invalidate the cached natural width and drop back to the full text, so that the
    // measuring effect below re-runs against the new content instead of the stale shortened one.
    // The reset lands in the state, so it only reaches the DOM in the *next* commit - until then
    // `title !== children` marks the rendered text as outdated for the measuring effect below.
    useLayoutEffect(() => {
        naturalScrollWidth.current = null;
        setTitle(children);
        setCustomTitle(false);
    }, [children]);

    useLayoutEffect(() => {
        checkTitle();
        // measure once on mount; later commits are handled by the effect below
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Runs after every commit but only measures while the text is not shortened yet. Shortening
    // changes the layout, so without this guard the measurement would trigger itself forever.
    useLayoutEffect(() => {
        if (isFirstCommit.current) {
            isFirstCommit.current = false;
            return;
        }

        if (customTitle) {
            return;
        }

        // The reset queued by the effect above is not on screen yet - the DOM still holds the
        // previous text, whose scrollWidth would be cached as the natural width of the new one.
        // With a container resize in the same render that mismeasurement would shorten the new
        // text and set `customTitle`, and the guard above would then keep it wrong forever.
        // Measure on the next commit, once the full new text is actually rendered.
        if (title !== children) {
            return;
        }

        checkTitle();
    });

    const recomputeShortening = () => {
        if (customTitle) {
            // Reset to the full text; the effect above then measures it again on the next commit.
            naturalScrollWidth.current = null;
            setTitle(children);
            setCustomTitle(false);
            return;
        }

        // Same outdated-DOM case as in the effect above: a caller reaching for the ref before the
        // reset of new children was committed would measure the previous text. The effect above
        // measures the new one on the next commit anyway, so there is nothing to do here.
        if (title !== children) {
            return;
        }

        checkTitle();
    };

    useImperativeHandle(ref, () => ({ recomputeShortening }));

    const renderText = () => {
        const TagName = tagName as ElementType;
        const isShortened = customTitle;
        return (
            <TagName
                ref={textRef}
                className={cx(className, "shortened", {
                    "is-shortened": isShortened,
                    "is-whole": !isShortened,
                })}
                id={id}
            >
                {isShortened ? (
                    <>
                        <span aria-hidden="true">{title}</span>
                        <span className="sr-only">{children}</span>
                    </>
                ) : (
                    title
                )}
            </TagName>
        );
    };

    const renderTextWithBubble = () => {
        return (
            <BubbleHoverTrigger showDelay={0} hideDelay={0} eventsOnBubble={tooltipVisibleOnMouseOver}>
                <Bubble alignPoints={tooltipAlignPoints}>{customTitle ? children : ""}</Bubble>
                {renderText()}
            </BubbleHoverTrigger>
        );
    };

    if (customTitle && displayTooltip) {
        return renderTextWithBubble();
    }

    return renderText();
});
