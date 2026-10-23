// (C) 2021-2026 GoodData Corporation

export function isIntersect(
    rectangle: DOMRect | null | undefined,
    point: [number, number],
    overflow = 0,
): boolean {
    const [x, y] = point;

    if (rectangle) {
        return (
            rectangle.left - overflow <= x &&
            x <= rectangle.left + rectangle.width + overflow &&
            rectangle.top - overflow <= y &&
            y <= rectangle.top + rectangle.height + overflow
        );
    }
    return false;
}

export function isInside(e: MouseEvent, className: string | null): boolean {
    const target = e.target as HTMLElement;

    return Boolean(className && target.closest(`.${className}`) !== null);
}

export function isKeyCancel(e: KeyboardEvent): boolean {
    return !(e.ctrlKey || e.metaKey || e.altKey);
}
