// (C) 2020-2021 GoodData Corporation

export default function tryFocus(handler: () => HTMLElement | null): number {
    return createInterval(
        () => isVisible(handler()),
        () => handler().focus(),
    );
}

function createInterval(check: () => boolean, done: () => void) {
    const timer = window.setInterval(() => {
        if (check()) {
            done();
            window.clearInterval(timer);
        }
    }, 25);

    return timer;
}

function isVisible(element: HTMLElement | null): boolean {
    if (element) {
        const style = window.getComputedStyle(element);
        const notHidden = style.visibility !== "hidden";
        const notNone = style.display !== "none";
        const hasSize = element.offsetHeight > 0;

        return notHidden && notNone && hasSize;
    }
    return false;
}
