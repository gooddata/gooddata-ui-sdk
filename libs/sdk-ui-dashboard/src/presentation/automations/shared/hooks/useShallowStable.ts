// (C) 2026 GoodData Corporation

import { useRef } from "react";

import { shallowEqualObjects } from "@gooddata/util";

/**
 * Returns the previous object while every member keeps its identity, so a caller can hold a whole
 * model stable without naming its members. Preferred over `useMemo` here because the roster is the
 * hook's return shape: a dependency array would have to restate all of it, and a missed entry would
 * serve a stale member rather than fail loudly.
 *
 * @internal
 */
export function useShallowStable<T extends object>(value: T): T {
    const previous = useRef(value);

    if (!shallowEqualObjects(previous.current, value)) {
        previous.current = value;
    }

    return previous.current;
}
