// (C) 2025 GoodData Corporation

import { UiButton, UiButtonSegmentedControl, UiIconButton } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../themeWrapper.js";

export default {
    title: "15 Ui/UiButtonSegmentedControl",
};

export function Buttons() {
    return (
        <div className="screenshot-target" style={{ display: "grid", gap: 10 }}>
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
        </div>
    );
}
Buttons.parameters = { kind: "buttons", screenshot: true };

export function IconButtons() {
    return (
        <div className="screenshot-target" style={{ display: "grid", gap: 10 }}>
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
        </div>
    );
}
IconButtons.parameters = { kind: "icon-buttons", screenshot: true };

export function ThemedButtons() {
    return wrapWithTheme(<Buttons />);
}
ThemedButtons.parameters = { kind: "themed-buttons" };

export function ThemedIconButtons() {
    return wrapWithTheme(<IconButtons />);
}
ThemedIconButtons.parameters = { kind: "themed-icon-buttons" };
