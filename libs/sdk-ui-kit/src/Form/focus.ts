// (C) 2021-2022 GoodData Corporation

import { invariant } from "ts-invariant";

type AutofocusData = {
    frame: number | null;
    start: number;
    element: HTMLElement | null;
};

export function runAutofocus(element: HTMLElement | null, autofocus: boolean): () => void {
    const data: AutofocusData = { frame: null, element, start: new Date().getTime() };

    if (autofocus) {
        startAutofocus(data);
    }

    return () => cancelAutofocus(data);
}

function isVisible(element: HTMLElement | null) {
    if (element) {
        const style = window.getComputedStyle(element);
        const notHidden = style.visibility !== "hidden";
        const notNone = style.display !== "none";
        const hasSize = element.offsetHeight > 0;

        return notHidden && notNone && hasSize;
    }
    return false;
}

function startAutofocus(data: AutofocusData) {
    if (reportWarning(data)) {
        return;
    }
    cancelAutofocus(data);
    data.frame = window.requestAnimationFrame(() => {
        if (isVisible(data.element)) {
            data.element.focus();
        } else {
            startAutofocus(data);
        }
    });
}

function cancelAutofocus(data: AutofocusData) {
    if (data.frame !== null) {
        window.cancelAnimationFrame(data.frame);
    }
    data.frame = null;
}

function reportWarning(data: AutofocusData) {
    const current = new Date().getTime();
    const long = current - data.start > 10000;

    if (long) {
        invariant.warn(`Can not autofocus provided dom element: `, data.element);
        return true;
    }
    return false;
}
