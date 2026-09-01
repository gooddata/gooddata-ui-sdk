// (C) 2026 GoodData Corporation

import { type ReactNode, useState } from "react";

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { type IUiColorPickerRgba, UiColorPicker } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

// Held apart from anything the picker reports, which is what IUiColorPickerBaseProps.initialRgbColor
// asks of a caller: a color read back in has lost the hue a gray, black or white cannot carry, and
// seeding the picker with it moves the handle mid-drag.
const SEED = { r: 20, g: 178, b: 226 };

function Example({ title, children }: { title: string; children: ReactNode }) {
    return (
        <>
            <h4>{title}</h4>
            <div>{children}</div>
        </>
    );
}

function Frame({ children }: { children: ReactNode }) {
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {/* Aligned to the top: the opacity control makes one picker taller than the other, and a
                stretched picker is not a size it is ever given. */}
            <div
                className="screenshot-target"
                style={{ display: "flex", alignItems: "flex-start", gap: 24, padding: 16 }}
            >
                {children}
            </div>
        </IntlProvider>
    );
}

// Confirmed rather than applied, so the picker carries the buttons. OK stays disabled until the color
// differs from the one it started at, which is the state it mounts in.
function UiColorPickerExamples() {
    return (
        <Frame>
            <Example title="Commit">
                <UiColorPicker
                    initialRgbColor={SEED}
                    onSubmit={action("submit")}
                    onCancel={action("cancel")}
                />
            </Example>
            <Example title="Commit, with opacity">
                <UiColorPicker
                    initialRgbColor={{ ...SEED, a: 0.6 }}
                    supportsAlpha
                    onSubmit={action("submit")}
                    onCancel={action("cancel")}
                />
            </Example>
        </Frame>
    );
}

function UiColorPickerLiveExample() {
    const [reported, setReported] = useState<IUiColorPickerRgba>();

    return (
        <Frame>
            <Example title="Live">
                <UiColorPicker
                    initialRgbColor={SEED}
                    supportsAlpha
                    onChange={(color) => {
                        action("change")(color);
                        setReported(color);
                    }}
                />
                <div style={{ marginTop: 16, color: "#454a56" }}>
                    {reported === undefined
                        ? "Reported: (nothing yet)"
                        : `Reported: rgba(${reported.r}, ${reported.g}, ${reported.b}, ${reported.a})`}
                </div>
            </Example>
        </Frame>
    );
}

export default {
    title: "15 Ui/UiColorPicker",
};

const screenshotParams = {
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} as const;

export function Default() {
    return <UiColorPickerExamples />;
}
Default.parameters = { kind: "default", ...screenshotParams } satisfies IStoryParameters;

// Interactive-only (no `screenshot`): it reports every change, so the readout below it makes the
// region depend on whether anyone has touched the wheel. Kept for exercising live mode by hand.
export function Live() {
    return <UiColorPickerLiveExample />;
}
Live.parameters = { kind: "live" } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiColorPickerExamples />);
Themed.parameters = { kind: "themed", ...screenshotParams } satisfies IStoryParameters;
