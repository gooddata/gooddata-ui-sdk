// (C) 2025-2026 GoodData Corporation

import { UiButton, UiButtonSegmentedControl, UiIconButton } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

export default {
    title: "15 Ui/UiButtonSegmentedControl",
};

export function Buttons() {
    return (
        <div className="screenshot-target" style={{ display: "grid", gap: 10, width: 500 }}>
            <UiButtonSegmentedControl>
                <UiButton label="Left" size="medium" variant="primary" />
                <UiButton label="Center" size="medium" variant="primary" />
                <UiButton label="Right" size="medium" variant="primary" />
            </UiButtonSegmentedControl>
            <UiButtonSegmentedControl>
                <UiButton label="Left" size="medium" variant="secondary" />
                <UiButton label="Center" size="medium" variant="secondary" />
                <UiButton label="Right" size="medium" variant="secondary" />
            </UiButtonSegmentedControl>
            <UiButtonSegmentedControl layout="fill">
                <UiButton label="Left" size="medium" variant="primary" />
                <UiButton label="Center" size="medium" variant="primary" />
                <UiButton label="Right" size="medium" variant="primary" />
            </UiButtonSegmentedControl>
            <UiButtonSegmentedControl layout="fill">
                <UiButton label="Left" size="medium" variant="secondary" />
                <UiButton label="Center" size="medium" variant="secondary" />
                <UiButton label="Right" size="medium" variant="secondary" />
            </UiButtonSegmentedControl>
        </div>
    );
}
Buttons.parameters = {
    kind: "buttons",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function IconButtons() {
    return (
        <div className="screenshot-target" style={{ display: "grid", gap: 10, width: 500 }}>
            <UiButtonSegmentedControl>
                <UiIconButton icon="chevronLeft" size="medium" variant="primary" />
                <UiIconButton icon="ai" size="medium" variant="primary" />
                <UiIconButton icon="chevronRight" size="medium" variant="primary" />
            </UiButtonSegmentedControl>
            <UiButtonSegmentedControl>
                <UiIconButton icon="chevronLeft" size="medium" variant="secondary" />
                <UiIconButton icon="ai" size="medium" variant="secondary" />
                <UiIconButton icon="chevronRight" size="medium" variant="secondary" />
            </UiButtonSegmentedControl>
            <UiButtonSegmentedControl layout="fill">
                <UiIconButton icon="chevronLeft" size="medium" variant="primary" />
                <UiIconButton icon="ai" size="medium" variant="primary" />
                <UiIconButton icon="chevronRight" size="medium" variant="primary" />
            </UiButtonSegmentedControl>
            <UiButtonSegmentedControl layout="fill">
                <UiIconButton icon="chevronLeft" size="medium" variant="secondary" />
                <UiIconButton icon="ai" size="medium" variant="secondary" />
                <UiIconButton icon="chevronRight" size="medium" variant="secondary" />
            </UiButtonSegmentedControl>
        </div>
    );
}
IconButtons.parameters = {
    kind: "icon-buttons",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function ThemedButtons() {
    return wrapWithTheme(<Buttons />);
}
ThemedButtons.parameters = { kind: "themed-buttons" } satisfies IStoryParameters;

export function ThemedIconButtons() {
    return wrapWithTheme(<IconButtons />);
}
ThemedIconButtons.parameters = { kind: "themed-icon-buttons" } satisfies IStoryParameters;
