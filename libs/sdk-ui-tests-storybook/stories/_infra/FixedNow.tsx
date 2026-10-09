// (C) 2026 GoodData Corporation

import { type ReactNode, useEffect, useState } from "react";

const RealDate = globalThis.Date;

// The clock keeps running from the given time rather than standing still, so timers that measure
// elapsed time with Date.now() still fire.
function startClockAt(time: number): void {
    const offset = time - RealDate.now();
    const currentTime = () => RealDate.now() + offset;
    globalThis.Date = new Proxy(RealDate, {
        construct: (target, args, newTarget) =>
            Reflect.construct(target, args.length === 0 ? [currentTime()] : args, newTarget),
        get: (target, property, receiver) =>
            property === "now" ? currentTime : Reflect.get(target, property, receiver),
    });
}

function restoreClock(): void {
    globalThis.Date = RealDate;
}

export interface IFixedNowProps {
    now: Date;
    children: ReactNode;
}

/**
 * Sets the current time for everything rendered inside, so a story whose content depends on today's
 * date renders the same on every run. Dates created from explicit values are unaffected, and the real
 * clock returns once the wrapper unmounts.
 */
export function FixedNow({ now, children }: IFixedNowProps) {
    // Installed during the first render, so that the children's first render already sees it.
    useState(() => startClockAt(now.getTime()));
    useEffect(() => restoreClock, []);
    return children;
}
