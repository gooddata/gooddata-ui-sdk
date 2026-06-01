// (C) 2026 GoodData Corporation

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import {
    type IUiToast,
    UiButton,
    UiToastItem,
    UiToastProvider,
    UiToastsContainer,
    useUiToast,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

// ─── interactive story ─────────────────────────────────────────────────────
// Buttons trigger ephemeral toasts via the real provider/container. Useful for
// click-through QA in Storybook, but not the primary visual-regression target:
// auto-dismiss timing makes a screenshot of "what just appeared" unreliable.

function Triggers() {
    const toast = useUiToast();
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 16 }}>
            <UiButton
                label="Success"
                variant="popout"
                size="small"
                onClick={() => toast.addSuccess("General access updated.")}
            />
            <UiButton
                label="Info"
                variant="popout"
                size="small"
                onClick={() => toast.addInfo("Working on it…")}
            />
            <UiButton
                label="Warning"
                variant="popout"
                size="small"
                onClick={() => toast.addWarning("Some labels were hidden from this grantee.")}
            />
            <UiButton
                label="Error"
                variant="popout"
                size="small"
                onClick={() => toast.addError("Could not update access — try again.")}
            />
            <UiButton
                label="Sticky"
                variant="popout"
                size="small"
                onClick={() => toast.addInfo("Pinned. Close me manually.", { sticky: true })}
            />
            <UiButton
                label="With action"
                variant="popout"
                size="small"
                onClick={() =>
                    toast.addSuccess("Item deleted.", {
                        sticky: true,
                        action: { label: "Undo", onClick: action("Undo clicked") },
                    })
                }
            />
            <UiButton
                label="Dismiss all"
                variant="secondary"
                size="small"
                onClick={() => toast.removeAll()}
            />
        </div>
    );
}

function DefaultExample() {
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <UiToastProvider>
                <div className="screenshot-target" style={{ minHeight: 200, position: "relative" }}>
                    <Triggers />
                    <UiToastsContainer dataTestId="toasts" />
                </div>
            </UiToastProvider>
        </IntlProvider>
    );
}

// ─── visual-regression: inline combinations ────────────────────────────────
// Renders every variant via the presentational `<UiToastItem>` so every kind +
// option (action / no action) is in the same screenshot. No timers, no async
// — deterministic for neobackstop.

const COMBINATIONS: IUiToast[] = [
    {
        id: "demo-success",
        kind: "success",
        text: "General access updated.",
        sticky: true,
        durationMs: 0,
    },
    {
        id: "demo-info",
        kind: "info",
        text: "Working on it…",
        sticky: true,
        durationMs: 0,
    },
    {
        id: "demo-warning",
        kind: "warning",
        text: "Some labels were hidden from this grantee.",
        sticky: true,
        durationMs: 0,
    },
    {
        id: "demo-error",
        kind: "error",
        text: "Could not update access — try again.",
        sticky: true,
        durationMs: 0,
    },
    {
        id: "demo-action",
        kind: "success",
        text: "Item deleted.",
        sticky: true,
        durationMs: 0,
        action: { label: "Undo", onClick: () => {} },
    },
];

function CombinationsExample() {
    // Render the items in their own flow (not the fixed-positioned container)
    // so the screenshot crops them all into the visible area cleanly.
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div
                className="screenshot-target"
                style={{
                    padding: 24,
                    background: "var(--gd-palette-complementary-2)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    alignItems: "flex-start",
                }}
            >
                {COMBINATIONS.map((toast) => (
                    <UiToastItem key={toast.id} toast={toast} onClose={() => {}} />
                ))}
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiToast",
};

export function Default() {
    return <DefaultExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Combinations() {
    return <CombinationsExample />;
}
Combinations.parameters = {
    kind: "combinations",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<CombinationsExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
