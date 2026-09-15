// (C) 2026 GoodData Corporation

import {
    UiToolbar,
    UiToolbarButton,
    UiToolbarColorSwatch,
    UiToolbarDivider,
    UiToolbarIconButton,
    UiToolbarIconSelect,
    UiToolbarSelect,
    UiToolbarStepper,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

import {
    FocusOnMount,
    InsightFormattingToolbar,
    MoreMenu,
    ReferenceToolbar,
    ScopeControl,
    ToolbarStoryFrame,
    ZoomStepper,
} from "./_helpers/toolbarStories.js";

const READY = { readySelector: { selector: ".screenshot-target", state: State.Attached } };

export default {
    title: "15 Ui/UiToolbar",
};

export function Presets() {
    return (
        <ToolbarStoryFrame style={{ justifyItems: "start" }}>
            <ReferenceToolbar />
            <InsightFormattingToolbar />
            <UiToolbar accessibilityConfig={{ ariaLabel: "Single item" }}>
                <UiToolbarIconButton icon="bold" label="Bold" />
            </UiToolbar>
        </ToolbarStoryFrame>
    );
}
Presets.parameters = { kind: "presets", screenshot: READY } satisfies IStoryParameters;

export function HeightCheck() {
    return (
        <ToolbarStoryFrame style={{ justifyItems: "start" }}>
            <div
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#d4f0e0",
                    height: 28,
                }}
            >
                <UiToolbarSelect label="Inter" />
                <UiToolbarButton label="Label" />
                <UiToolbarIconButton icon="bold" label="Bold" />
                <UiToolbarDivider />
                <UiToolbarIconSelect label="Fill colour" />
                <ScopeControl />
                <UiToolbarStepper
                    variant="value"
                    value="100%"
                    onStep={() => {}}
                    onCommit={() => {}}
                    accessibilityConfig={{
                        ariaLabel: "Zoom",
                        incrementLabel: "Zoom in",
                        decrementLabel: "Zoom out",
                    }}
                />
            </div>
        </ToolbarStoryFrame>
    );
}
HeightCheck.parameters = { kind: "height-check", screenshot: READY } satisfies IStoryParameters;

export function Tooltips() {
    return (
        <ToolbarStoryFrame style={{ justifyItems: "start", paddingBlock: 80 }}>
            <ReferenceToolbar />
            <ReferenceToolbar tooltipPlacement="above" />
        </ToolbarStoryFrame>
    );
}
Tooltips.parameters = {
    kind: "tooltips",
    screenshots: {
        "hover-opens-below": {
            ...READY,
            hoverSelector: '.screenshot-target > [role="toolbar"]:first-of-type [data-testid="s-bold"]',
            postInteractionWait: { selector: ".gd-ui-kit-tooltip", delay: 400 },
        },
        "hover-opens-above": {
            ...READY,
            hoverSelector: '.screenshot-target > [role="toolbar"]:last-of-type [data-testid="s-bold"]',
            postInteractionWait: { selector: ".gd-ui-kit-tooltip", delay: 400 },
        },
        "warm-toolbar-moves-tooltip": {
            ...READY,
            hoverSelectors: [
                {
                    selector: '.screenshot-target > [role="toolbar"]:first-of-type [data-testid="s-bold"]',
                    waitAfter: 400,
                },
                {
                    selector:
                        '.screenshot-target > [role="toolbar"]:first-of-type [data-testid="s-fill-colour"]',
                    waitAfter: 400,
                },
            ],
            misMatchThreshold: 0.01,
        },
    },
} satisfies IStoryParameters;

export function KeyboardFocus() {
    return (
        <ToolbarStoryFrame style={{ justifyItems: "start", paddingTop: 80 }}>
            <FocusOnMount selector='[data-testid="s-fill-colour"]'>
                <ReferenceToolbar />
            </FocusOnMount>
        </ToolbarStoryFrame>
    );
}
KeyboardFocus.parameters = {
    kind: "keyboard-focus",
    screenshots: {
        "focused-item-shows-tooltip": {
            ...READY,
            postInteractionWait: { selector: ".gd-ui-kit-tooltip" },
        },
        // The focus ring and the tooltip animate (--gd-transition-all); wait them out before capturing.
        "arrow-right-moves-focus": {
            ...READY,
            keyPressSelector: { selector: '[data-testid="s-fill-colour"]', keyPress: "ArrowRight" },
            postInteractionWait: { selector: ".gd-ui-kit-tooltip", delay: 500 },
            misMatchThreshold: 0.1,
        },
        "end-jumps-to-last-item": {
            ...READY,
            keyPressSelector: { selector: '[data-testid="s-fill-colour"]', keyPress: "End" },
            postInteractionWait: { selector: ".gd-ui-kit-tooltip", delay: 500 },
            misMatchThreshold: 0.1,
        },
    },
} satisfies IStoryParameters;

export function OpenPopups() {
    return (
        <ToolbarStoryFrame style={{ justifyItems: "start", minHeight: 320 }}>
            <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                <UiToolbarIconSelect
                    icon={<UiToolbarColorSwatch variant="fill" color="#e54d42" />}
                    label="Fill colour"
                    isOpen
                />
                <UiToolbarDivider />
                <ZoomStepper openOnInit />
                <UiToolbarDivider />
                <MoreMenu />
            </UiToolbar>
        </ToolbarStoryFrame>
    );
}
OpenPopups.parameters = {
    kind: "open-popups",
    screenshots: {
        "preset-list-open": {
            ...READY,
            postInteractionWait: { selector: '[role="listbox"]', delay: 200 },
        },
        "more-menu-open": {
            ...READY,
            clickSelectors: [{ selector: '[data-testid="s-more-button"]', waitAfter: 300 }],
            postInteractionWait: { selector: '[role="menu"]', delay: 200 },
        },
    },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<Presets />);
Themed.parameters = { kind: "themed", screenshot: READY } satisfies IStoryParameters;
