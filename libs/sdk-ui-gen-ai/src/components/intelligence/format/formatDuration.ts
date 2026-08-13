// (C) 2026 GoodData Corporation

import { type IntlShape, defineMessages } from "react-intl";

/**
 * A duration broken into displayable parts. Kept as plain numbers so the translated string can
 * be assembled separately, in whichever locale is active.
 * @internal
 */
export interface IDurationParts {
    minutes: number;
    /** Seconds remainder, rounded to one decimal place when there are no whole minutes. */
    seconds: number;
}

/**
 * Splits a millisecond duration into minutes/seconds, keeping one decimal place of precision
 * below a minute (0.2, 13.6), so a short step doesn't collapse to "0".
 * @internal
 */
export function computeDurationParts(ms: number): IDurationParts {
    const totalSeconds = Math.max(ms, 0) / 1000;

    if (totalSeconds < 60) {
        const seconds = Math.round(totalSeconds * 10) / 10;
        // Rounding can reach a full minute (59.95s -> 60.0), which must not render as "60s".
        return seconds < 60 ? { minutes: 0, seconds } : { minutes: 1, seconds: 0 };
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);

    // Same carry one level up: 119.5s rounds to 60 within the minute, so it becomes "2m".
    return seconds < 60 ? { minutes, seconds } : { minutes: minutes + 1, seconds: 0 };
}

const messages = defineMessages({
    seconds: { id: "gd.gen-ai.interactionIntelligence.duration.seconds" },
    minutesAndSeconds: { id: "gd.gen-ai.interactionIntelligence.duration.minutesAndSeconds" },
    minutes: { id: "gd.gen-ai.interactionIntelligence.duration.minutes" },
});

/**
 * Formats a millisecond duration as a translated string, e.g. "0.2s", "13.6s", "1m 5s", "1m".
 * @internal
 */
export function formatDuration(intl: IntlShape, ms: number): string {
    const { minutes, seconds } = computeDurationParts(ms);

    if (minutes === 0) {
        return intl.formatMessage(messages.seconds, { seconds });
    }
    if (seconds === 0) {
        return intl.formatMessage(messages.minutes, { minutes });
    }
    return intl.formatMessage(messages.minutesAndSeconds, { minutes, seconds });
}
