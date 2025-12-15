// (C) 2025 GoodData Corporation

import { useCallback, useEffect, useRef } from "react";

import { type Message } from "../../model.js";

const STABLE_SCROLL_TICKS = 3;

/**
 * Provides the ability to scroll to the bottom for assistant chat messages.
 *
 * Some assistant responses (semantic search tree, charts) render asynchronously and keep
 * increasing the container height even after Suspense resolves. If we scroll immediately
 * when a new message arrives, we often land a few pixels above the true bottom because
 * `scrollHeight` is still growing.
 *
 * To mitigate that, we wait for `STABLE_SCROLL_TICKS` consecutive animation frames with
 * identical `scrollHeight` before performing the scroll. This preserves the smooth UX
 * while guaranteeing the viewport ends at the actual bottom once the async content settles.
 */
export function useMessageScroller(messages: Message[]) {
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const pendingAnimationFrame = useRef<number | null>(null);

    const cancelScheduledScroll = useCallback(() => {
        if (pendingAnimationFrame.current !== null) {
            cancelAnimationFrame(pendingAnimationFrame.current);
            pendingAnimationFrame.current = null;
        }
    }, []);

    const scrollToBottom = useCallback(
        (options: ScrollToOptions = { behavior: "smooth" }) => {
            const element = scrollerRef.current;
            if (!element) {
                return;
            }

            cancelScheduledScroll();

            let lastHeight = element.scrollHeight;
            let stableTicks = 0;

            const schedule = () => {
                const currentHeight = element.scrollHeight;

                if (currentHeight === lastHeight) {
                    stableTicks += 1;
                } else {
                    stableTicks = 0;
                    lastHeight = currentHeight;
                }

                if (stableTicks >= STABLE_SCROLL_TICKS) {
                    element.scrollTo({ top: element.scrollHeight, ...options });
                    pendingAnimationFrame.current = null;
                    return;
                }

                pendingAnimationFrame.current = requestAnimationFrame(schedule);
            };

            pendingAnimationFrame.current = requestAnimationFrame(schedule);
        },
        [cancelScheduledScroll],
    );

    const lastMessage = messages[messages.length - 1];

    // Last message will also change when it's loading state is updated
    useEffect(() => {
        if (lastMessage) {
            scrollToBottom();
        }
    }, [lastMessage, scrollToBottom]);

    // Cancel scheduled scroll when component unmounts
    useEffect(() => cancelScheduledScroll, [cancelScheduledScroll]);

    return {
        scrollerRef,
        scrollToBottom,
    };
}
