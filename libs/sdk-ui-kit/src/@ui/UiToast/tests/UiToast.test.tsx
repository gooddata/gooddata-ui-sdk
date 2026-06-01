// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { act, fireEvent, render, renderHook, screen, within } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { UiToastProvider, useUiToast } from "../UiToastProvider.js";
import { UiToastsContainer } from "../UiToastsContainer.js";

// Use the real en-US bundle so messages the component depends on
// (e.g. the localized "Close" aria-label on the dismiss button) resolve
// without throwing intl MISSING_TRANSLATION errors that CI promotes to
// test failures.
const withProviders = (ui: ReactNode) => (
    <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
        <UiToastProvider>
            {ui}
            <UiToastsContainer dataTestId="toasts" />
        </UiToastProvider>
    </IntlProvider>
);

const wrapper = ({ children }: { children: ReactNode }) => withProviders(children);

// The toast container emits `data-testid={`gd-ui-kit-toast-<kind>-<id>`}`
// per visible toast, so several concurrent toasts of the same kind don't
// collide. Tests usually only show one toast of a kind — these helpers
// stay terse and assert that exactly one matches.
const kindRegex = (kind: "success" | "info" | "warning" | "error") => new RegExp(`^gd-ui-kit-toast-${kind}-`);
const getToastByKind = (kind: "success" | "info" | "warning" | "error") => {
    const matches = screen.queryAllByTestId(kindRegex(kind));
    if (matches.length !== 1) {
        throw new Error(`Expected exactly one toast of kind "${kind}", got ${matches.length}`);
    }
    return matches[0];
};
const queryToastsByKind = (kind: "success" | "info" | "warning" | "error") =>
    screen.queryAllByTestId(kindRegex(kind));

describe("UiToast", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it("addSuccess renders a polite status toast with the message body", () => {
        const { result } = renderHook(() => useUiToast(), { wrapper });
        act(() => {
            result.current.addSuccess("General access updated.");
        });
        const toast = getToastByKind("success");
        expect(toast).toHaveTextContent("General access updated.");
        expect(toast).toHaveAttribute("aria-live", "polite");
        expect(toast).toHaveAttribute("role", "status");
    });

    it("addError uses assertive aria-live and role=alert by default", () => {
        const { result } = renderHook(() => useUiToast(), { wrapper });
        act(() => {
            result.current.addError("Something went wrong.");
        });
        const toast = getToastByKind("error");
        expect(toast).toHaveAttribute("aria-live", "assertive");
        expect(toast).toHaveAttribute("role", "alert");
    });

    it("auto-dismisses after the default duration (4000 ms)", () => {
        const { result } = renderHook(() => useUiToast(), { wrapper });
        act(() => {
            result.current.addSuccess("Saved");
        });
        expect(getToastByKind("success")).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(3999);
        });
        expect(queryToastsByKind("success")).toHaveLength(1);

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(queryToastsByKind("success")).toHaveLength(0);
    });

    it("sticky toasts stay until removed", () => {
        const { result } = renderHook(() => useUiToast(), { wrapper });
        let id = "";
        act(() => {
            id = result.current.addInfo("Sticky", { sticky: true });
        });
        act(() => {
            vi.advanceTimersByTime(60_000);
        });
        expect(getToastByKind("info")).toBeInTheDocument();

        act(() => {
            result.current.remove(id);
        });
        expect(queryToastsByKind("info")).toHaveLength(0);
    });

    it("resolves MessageDescriptor with the consumer's IntlProvider locale", () => {
        // Regression: text resolution must happen at the consumer site,
        // not at the provider — otherwise a hook called from a subtree
        // under a nested <IntlProvider> formats descriptors with the
        // root locale instead.
        let api: ReturnType<typeof useUiToast> = null!;
        function Probe() {
            api = useUiToast();
            return null;
        }
        // The outer provider must include the real bundle so `UiToastItem`'s
        // localized close-button label resolves — CI treats intl
        // MISSING_TRANSLATION console errors as test failures. We only add
        // the `greeting` key on top.
        const outerMessages = { ...DEFAULT_MESSAGES[DEFAULT_LANGUAGE], greeting: "Hello {who}" };
        render(
            <IntlProvider locale={DEFAULT_LANGUAGE} messages={outerMessages}>
                <UiToastProvider>
                    <UiToastsContainer dataTestId="toasts" />
                    {/* Inner provider overrides the message text. */}
                    <IntlProvider
                        locale={DEFAULT_LANGUAGE}
                        messages={{ ...outerMessages, greeting: "Ahoj {who}" }}
                    >
                        <Probe />
                    </IntlProvider>
                </UiToastProvider>
            </IntlProvider>,
        );
        act(() => {
            api.addSuccess({
                descriptor: { id: "greeting", defaultMessage: "Hello {who}" },
                values: { who: "Matyas" },
            });
        });
        // Inner provider's message wins → "Ahoj Matyas", not "Hello Matyas".
        expect(getToastByKind("success")).toHaveTextContent("Ahoj Matyas");
    });

    it("renders newest toast first — matches legacy ToastsCenter stack order", () => {
        // Regression: multiple visible toasts should stack newest-on-top.
        // Legacy `ToastsCenter` sorts by createdAt DESC; the queue itself
        // stays insertion-order but the rendered list is reversed.
        const { result } = renderHook(() => useUiToast(), { wrapper });
        act(() => {
            result.current.addInfo("First", { sticky: true });
            result.current.addInfo("Second", { sticky: true });
            result.current.addInfo("Third", { sticky: true });
        });
        const toasts = queryToastsByKind("info");
        expect(toasts).toHaveLength(3);
        // Newest at the top.
        expect(toasts[0]).toHaveTextContent("Third");
        expect(toasts[1]).toHaveTextContent("Second");
        expect(toasts[2]).toHaveTextContent("First");
    });

    it("same-tick add then remove dismisses the toast and fires onDismiss", () => {
        // Regression: the queue ref must reflect the just-added toast
        // synchronously so a `remove(id)` called in the same act() turn
        // can find it. If it falls through to the stale state snapshot,
        // the toast stays visible and onDismiss never fires.
        const onDismiss = vi.fn();
        const { result } = renderHook(() => useUiToast(), { wrapper });
        act(() => {
            const id = result.current.addSuccess("Transient", {
                sticky: true,
                onDismiss,
            });
            result.current.remove(id);
        });
        expect(queryToastsByKind("success")).toHaveLength(0);
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("removeAll dismisses every toast and fires each onDismiss exactly once", () => {
        const onDismissA = vi.fn();
        const onDismissB = vi.fn();
        const { result } = renderHook(() => useUiToast(), { wrapper });
        act(() => {
            result.current.addSuccess("A", { sticky: true, onDismiss: onDismissA });
            result.current.addError("B", { sticky: true, onDismiss: onDismissB });
        });
        expect(screen.getAllByText(/A|B/).length).toBeGreaterThanOrEqual(2);

        act(() => {
            result.current.removeAll();
        });
        expect(queryToastsByKind("success")).toHaveLength(0);
        expect(queryToastsByKind("error")).toHaveLength(0);
        expect(onDismissA).toHaveBeenCalledTimes(1);
        expect(onDismissB).toHaveBeenCalledTimes(1);
    });

    it("close button uses a localized aria-label and accepts a per-toast override", () => {
        const { result } = renderHook(() => useUiToast(), { wrapper });
        act(() => {
            result.current.addSuccess("Default close", { sticky: true });
            result.current.addError("Custom close", {
                sticky: true,
                accessibilityConfig: { closeButtonLabel: "Dismiss notification" },
            });
        });
        const defaultToast = getToastByKind("success");
        // Empty IntlProvider messages → react-intl falls back to id "close".
        // What matters here is the label flows through formatMessage rather
        // than being a hardcoded English string.
        expect(within(defaultToast).getByRole("button", { name: /close/i })).toBeInTheDocument();
        const customToast = getToastByKind("error");
        expect(within(customToast).getByRole("button", { name: "Dismiss notification" })).toBeInTheDocument();
    });

    it("renders an inline action button that fires onClick and closes the toast", () => {
        const onAction = vi.fn();
        const { result } = renderHook(() => useUiToast(), { wrapper });
        act(() => {
            result.current.addInfo("Item deleted.", {
                sticky: true,
                action: { label: "Undo", onClick: onAction },
            });
        });
        const toast = getToastByKind("info");
        const undo = within(toast).getByRole("button", { name: "Undo" });
        fireEvent.click(undo);
        expect(onAction).toHaveBeenCalledOnce();
        expect(queryToastsByKind("info")).toHaveLength(0);
    });

    it("reusing the same id replaces the existing toast in place and resets the timer", () => {
        // Use a real component instead of renderHook so we can inspect the DOM
        // unambiguously across multiple act() boundaries.
        let api: ReturnType<typeof useUiToast> = null!;
        function Probe() {
            api = useUiToast();
            return null;
        }
        render(withProviders(<Probe />));

        act(() => {
            api.addInfo("First", { id: "shared", durationMs: 1000 });
        });
        expect(getToastByKind("info")).toHaveTextContent("First");

        act(() => {
            vi.advanceTimersByTime(500);
        });
        act(() => {
            api.addInfo("Second", { id: "shared", durationMs: 1000 });
        });
        // Old timer was cancelled — at 500ms past the SECOND add, the toast is
        // still visible with the new text.
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(getToastByKind("info")).toHaveTextContent("Second");
        // And dismisses after the full new duration elapses.
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(queryToastsByKind("info")).toHaveLength(0);
    });

    it("nested providers do NOT double-render: only the outermost container is visible", () => {
        // The outer provider's container should render the queue; an inner
        // <UiToastsContainer> inside a nested provider must render nothing.
        let innerAdd: () => void;
        function Inner() {
            const toast = useUiToast();
            innerAdd = () => toast.addSuccess("Hello");
            return <UiToastsContainer dataTestId="inner" />;
        }
        render(
            <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
                <UiToastProvider>
                    <UiToastsContainer dataTestId="outer" />
                    <UiToastProvider>
                        <Inner />
                    </UiToastProvider>
                </UiToastProvider>
            </IntlProvider>,
        );
        act(() => {
            innerAdd();
        });
        expect(screen.getByTestId("outer")).toBeInTheDocument();
        expect(screen.queryByTestId("inner")).not.toBeInTheDocument();
        // The outer container holds the queued toast — verify exactly one copy.
        expect(queryToastsByKind("success")).toHaveLength(1);
    });

    it("throws when useUiToast is called outside a UiToastProvider", () => {
        // Silence the expected React error log during this rendering.
        const spy = vi.spyOn(console, "error").mockImplementation(() => {});
        expect(() =>
            renderHook(() => useUiToast(), {
                wrapper: ({ children }) => (
                    <IntlProvider locale="en-US" messages={{}}>
                        {children}
                    </IntlProvider>
                ),
            }),
        ).toThrow(/UiToastProvider/);
        spy.mockRestore();
    });
});
