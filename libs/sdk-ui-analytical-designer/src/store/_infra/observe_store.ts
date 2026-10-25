// (C) 2026 GoodData Corporation

import { type Action, type Store, type Unsubscribe } from "redux";

/**
 * Replaces `redux-watch` (dropped at 7.3): subscribe to a selector's output and get called back
 * only when it CHANGES (reference equality, like redux-watch's default). The initial value is
 * captured at subscription time, so the first callback fires on the first actual change.
 */
export function observeStore<S, A extends Action, T>(
    store: Store<S, A>,
    select: (state: S) => T,
    onChange: (next: T) => void,
): Unsubscribe {
    let current = select(store.getState());
    return store.subscribe(() => {
        const next = select(store.getState());
        if (next !== current) {
            current = next;
            onChange(next);
        }
    });
}
