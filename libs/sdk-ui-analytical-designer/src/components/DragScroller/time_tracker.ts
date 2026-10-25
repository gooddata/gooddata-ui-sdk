// (C) 2021-2026 GoodData Corporation

export function getTimeTracker(nowProvider = Date) {
    let before = nowProvider.now();

    return function tick() {
        const now = nowProvider.now();
        const delta = now - before;

        before = now;

        return delta;
    };
}
