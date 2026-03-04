// (C) 2019-2026 GoodData Corporation

/**
 * Merge two bounding boxes into a single covering bounding box.
 *
 * @internal
 */
export function mergeBbox(a?: number[], b?: number[]): number[] | undefined {
    if (!a) {
        return b ? [...b] : undefined;
    }

    if (!b) {
        return [...a];
    }

    const length = Math.min(a.length, b.length);
    const merged = a.slice(0, length);

    for (let i = 0; i < length; i++) {
        merged[i] = i < length / 2 ? Math.min(a[i], b[i]) : Math.max(a[i], b[i]);
    }

    return merged;
}
