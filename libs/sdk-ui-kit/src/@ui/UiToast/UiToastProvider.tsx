// (C) 2026 GoodData Corporation

import {
    type ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";

import { type IntlShape, useIntl } from "react-intl";

import {
    type IUiToast,
    type IUiToastOptions,
    type IUseUiToastResult,
    type UiToastKind,
    type UiToastMessage,
} from "./types.js";

const DEFAULT_DURATION_MS = 4000;

/**
 * Resolve a `UiToastMessage` to a flat string using the supplied `intl`.
 * `UiToastIntlValues` only accepts `PrimitiveType` interpolation values, so
 * `formatMessage` always returns `string` — no `ReactNode[]` coercion needed.
 *
 * Called from `useUiToast` so resolution uses the **consumer's** `useIntl()`
 * (the locale of the calling subtree) rather than the provider's — a
 * provider mounted at the app root would otherwise format with the root
 * locale even when the caller sits under a nested `IntlProvider`.
 */
const resolveText = (intl: IntlShape, message: UiToastMessage, options?: IUiToastOptions): string => {
    if (typeof message === "string") {
        return options?.values
            ? intl.formatMessage({ id: message, defaultMessage: message }, options.values)
            : message;
    }
    return intl.formatMessage(message.descriptor, message.values);
};

interface IUiToastContextValue {
    /** Currently shown toasts, oldest first. */
    toasts: IUiToast[];
    /**
     * Push a toast onto the queue and return its id. `text` is already
     * resolved by the consumer — see [[useUiToast]] for the wrapper that
     * runs `resolveText` against the consumer's `useIntl()`.
     */
    push: (kind: UiToastKind, text: string, options?: IUiToastOptions) => string;
    /** Dismiss one toast by id. */
    remove: (id: string) => void;
    /** Dismiss all toasts. */
    removeAll: () => void;
    /**
     * Whether this provider is nested inside another `UiToastProvider`. The
     * outermost provider renders the visible container; nested providers
     * forward through context so the topmost-only behaviour is preserved.
     */
    isNested: boolean;
}

const UiToastContext = createContext<IUiToastContextValue | null>(null);

/**
 * Mount once near the root of your app. Provides the toast queue + dismiss
 * timers consumed by `useUiToast` and `UiToastsContainer`. Nesting is safe
 * — only the outermost `<UiToastsContainer>` renders any visible toasts.
 *
 * Known limitation: if a root provider with in-flight toasts is **re-parented**
 * under a new outer provider mid-flight (e.g. the app rearranges its tree),
 * the inner instance's queue and timers don't migrate to the parent. Mount
 * the provider once at the stable app root to avoid this.
 *
 * @internal
 */
export function UiToastProvider({ children }: { children: ReactNode }) {
    const parent = useContext(UiToastContext);
    const [toasts, setToasts] = useState<IUiToast[]>([]);
    // `toastsRef` is the synchronous source of truth for the queue —
    // mutators (`push` / `remove` / `removeAll`) update it FIRST and only
    // then schedule the `setToasts` render. That way a same-tick
    // `add → remove` sequence sees the just-added toast in the ref, and
    // side effects (timers, `onDismiss`) run consistently without depending
    // on React's commit timing. React state mirrors the ref on every render.
    const toastsRef = useRef<IUiToast[]>(toasts);
    const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    const dismissedRef = useRef<Set<string>>(new Set());
    const idPrefix = useId();
    const counterRef = useRef(0);

    const clearTimer = useCallback((id: string) => {
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
    }, []);

    // Single mutation point — update the ref synchronously, then sync the
    // React state via the same value. Other mutators call this so the ref
    // and the state stay in lockstep without depending on commit timing.
    const commit = useCallback((next: IUiToast[]) => {
        toastsRef.current = next;
        setToasts(next);
    }, []);

    const remove = useCallback(
        (id: string) => {
            // Bail if this id has already been dismissed (auto-dismiss +
            // manual race, or StrictMode's double-invocation). Otherwise
            // tear down synchronously: ref + state in the same tick, side
            // effects (timer cleanup, `onDismiss`) right after.
            if (dismissedRef.current.has(id)) return;
            const t = toastsRef.current.find((x) => x.id === id);
            if (!t) return;
            dismissedRef.current.add(id);
            clearTimer(id);
            commit(toastsRef.current.filter((x) => x.id !== id));
            t.onDismiss?.();
        },
        [clearTimer, commit],
    );

    const removeAll = useCallback(() => {
        // Snapshot first so the loop sees a stable list even if `onDismiss`
        // turns around and calls `add` / `remove` synchronously. Ref +
        // state are cleared together; side effects run after the commit
        // call, so a throwing `onDismiss` can't corrupt the queue.
        const snapshot = toastsRef.current;
        const onDismisses: Array<() => void> = [];
        for (const t of snapshot) {
            if (!dismissedRef.current.has(t.id)) {
                dismissedRef.current.add(t.id);
                if (t.onDismiss) onDismisses.push(t.onDismiss);
            }
            clearTimer(t.id);
        }
        commit([]);
        for (const cb of onDismisses) cb();
    }, [clearTimer, commit]);

    const push = useCallback(
        (kind: UiToastKind, text: string, options?: IUiToastOptions): string => {
            const id = options?.id ?? `${idPrefix}-${counterRef.current++}`;
            const sticky = options?.sticky ?? false;
            const durationMs = options?.durationMs ?? DEFAULT_DURATION_MS;

            const toast: IUiToast = {
                id,
                kind,
                text,
                sticky,
                durationMs,
                action: options?.action,
                accessibilityConfig: options?.accessibilityConfig,
                onDismiss: options?.onDismiss,
            };

            // Reusing an existing id replaces the toast in place and resets
            // its dismiss timer.
            clearTimer(id);
            dismissedRef.current.delete(id);
            const prev = toastsRef.current;
            const existing = prev.findIndex((t) => t.id === id);
            const next = existing >= 0 ? prev.map((t, i) => (i === existing ? toast : t)) : [...prev, toast];
            commit(next);

            if (!sticky) {
                const timer = setTimeout(() => remove(id), durationMs);
                timersRef.current.set(id, timer);
            }

            return id;
        },
        [idPrefix, remove, clearTimer, commit],
    );

    // Cancel pending dismiss timers on unmount.
    useEffect(() => {
        const timers = timersRef.current;
        return () => {
            for (const timer of timers.values()) clearTimeout(timer);
            timers.clear();
        };
    }, []);

    // Trim `dismissedRef` to ids still in `toasts` once React commits a
    // removal. The ref's only job is to dedupe within a single dispatch
    // (StrictMode double-invocation, auto-dismiss + manual race) — once
    // the toast has left state, no future call can race on the same id,
    // so the ref entry is dead weight. Without this trim the Set would
    // grow monotonically for every auto-generated id in a long-running
    // SPA. Runs after commit, so StrictMode's pre-commit second pass
    // still sees the id during the dispatch that removed it.
    useEffect(() => {
        const liveIds = new Set(toasts.map((t) => t.id));
        for (const id of dismissedRef.current) {
            if (!liveIds.has(id)) dismissedRef.current.delete(id);
        }
    }, [toasts]);

    const value = useMemo<IUiToastContextValue>(() => {
        if (parent) {
            // Nested provider: forward to the parent so a single queue is the
            // source of truth. `isNested` flips so any nested
            // `UiToastsContainer` knows to render nothing.
            return { ...parent, isNested: true };
        }
        return { toasts, push, remove, removeAll, isNested: false };
    }, [parent, toasts, push, remove, removeAll]);

    return <UiToastContext.Provider value={value}>{children}</UiToastContext.Provider>;
}

/**
 * Consumer hook. Resolves the toast message via the **caller's**
 * `useIntl()` so a consumer rendered under a nested `IntlProvider` formats
 * `MessageDescriptor` content with that subtree's locale, not the
 * provider's. Throws when called outside a `UiToastProvider`.
 *
 * @internal
 */
export function useUiToast(): IUseUiToastResult {
    const ctx = useContext(UiToastContext);
    if (!ctx) {
        throw new Error("useUiToast must be used inside <UiToastProvider>");
    }
    const intl = useIntl();
    const { push, remove, removeAll } = ctx;

    return useMemo<IUseUiToastResult>(() => {
        const add = (kind: UiToastKind, message: UiToastMessage, options?: IUiToastOptions) =>
            push(kind, resolveText(intl, message, options), options);
        return {
            addSuccess: (message, options) => add("success", message, options),
            addInfo: (message, options) => add("info", message, options),
            addWarning: (message, options) => add("warning", message, options),
            addError: (message, options) => add("error", message, options),
            add,
            remove,
            removeAll,
        };
    }, [intl, push, remove, removeAll]);
}

/**
 * @internal
 */
export const UiToastContextInternal = UiToastContext;
