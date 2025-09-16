// (C) 2025 GoodData Corporation

import { useEffect, useState } from "react";

import { UiTooltip } from "../UiTooltip/UiTooltip.js";

const SECOND = 1000;
const MINUTE = SECOND * 60;
const DAY = SECOND * 60 * 60 * 24;

/**
 * @internal
 */
export const DEFAULT_ABSOLUTE_OPTIONS: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
};

/**
 * @internal
 */
export interface UiDateProps {
    date: Date | string | number;
    locale?: string;
    relativeThresholdMs?: number;
    absoluteOptions?: Intl.DateTimeFormatOptions;
    allowRelative?: boolean;
}

/**
 * @internal
 */
export function UiDate({
    date,
    locale = navigator.language,
    relativeThresholdMs = DAY,
    absoluteOptions = DEFAULT_ABSOLUTE_OPTIONS,
    allowRelative = true,
}: UiDateProps) {
    const targetDate = new Date(date);
    const [now, setNow] = useState<Date>(new Date());

    const diffMs = now.getTime() - targetDate.getTime();
    const isRelative = Math.abs(diffMs) < relativeThresholdMs && allowRelative;

    useEffect(() => {
        // Disable interval if date is not relative
        if (!isRelative) {
            return undefined;
        }

        const interval = getDynamicInterval(diffMs);
        const timer = setInterval(() => {
            setNow(new Date());
        }, interval);

        return () => {
            clearInterval(timer);
        };
    }, [isRelative, diffMs]);

    // Display text
    const displayText = isRelative
        ? getRelativeTime(diffMs, locale)
        : targetDate.toLocaleString(locale, absoluteOptions);

    return (
        <UiTooltip
            anchor={<time dateTime={targetDate.toISOString()}>{displayText}</time>}
            content={getTooltipFullDay(targetDate, locale)}
            triggerBy={["hover"]}
            optimalPlacement
        />
    );
}

function getRelativeTime(diffMs: number, locale: string) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (Math.abs(seconds) < 60) return rtf.format(-seconds, "second");
    if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");
    if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");
    return rtf.format(-days, "day");
}

function getDynamicInterval(diffMs: number) {
    const absDiff = Math.abs(diffMs);
    if (absDiff < MINUTE) {
        return SECOND;
    }
    return MINUTE;
}

function getTooltipFullDay(targetDate: Date, locale?: string) {
    return targetDate.toLocaleString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}
