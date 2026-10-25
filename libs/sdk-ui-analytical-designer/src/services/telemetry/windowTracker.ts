// (C) 2022-2026 GoodData Corporation

export interface IWindowTracker {
    wasWindowAlwaysActive: () => boolean;
}

const INTERSECTION_OBSERVER_OPTIONS: IntersectionObserverInit = {
    root: null, // set null for whole viewport
    threshold: 0, // if at least one px is visible, call callback
};

/**
 * Function registers listeners on document that tracks if document is visible (not in hidden window or
 * in browser tab that is not active).
 *
 * @param document - Document for which the function tracks the visibility changes
 *
 * @returns function that returns the result (true if document was visible the whole time since the parent
 * function was called, i.e., from the time the listener was registered, false if document was hidden for
 * at least a moment in that time) and remove the listeners from the document.
 */
export const registerWindowTracker = (document: Document): IWindowTracker => {
    let wasWindowActive = true;

    // register intersection observer to detect if page body is in invisible iframe
    const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        wasWindowActive = entry.isIntersecting;
    }, INTERSECTION_OBSERVER_OPTIONS);

    const body = document.querySelector("body");
    observer.observe(body);

    // register visibility handler to detect if user switched to a different browser tab
    const handleVisibilityChange = () => {
        if (document["hidden"]) {
            wasWindowActive = false;
        }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange, false);

    // oxlint-disable-next-line eslint-js/no-console
    console.debug("window-tracker: Visibilitychange and intersection observers registered");

    return {
        wasWindowAlwaysActive: () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            observer.unobserve(body);

            // oxlint-disable-next-line eslint-js/no-console
            console.debug("window-tracker: Visibilitychange and intersection observers unregistered");

            return wasWindowActive;
        },
    };
};
