// (C) 2026 GoodData Corporation

import { useState } from "react";

import { action } from "storybook/actions";

import { type ITimezoneSelectSpecialItem, TimezoneSelect, UiIcon } from "@gooddata/sdk-ui-kit";

import { type INeobackstopConfig, type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import "@gooddata/sdk-ui-kit/styles/css/main.css";

const headerStyle = { marginBottom: "6px" };

const labels = {
    searchPlaceholder: "Search ...",
    ariaLabel: "Time zone",
    noMatchLabel: "No matching time zone.",
};

const specialItems: ITimezoneSelectSpecialItem[] = [
    { id: undefined, label: "Default (UTC)" },
    { id: "Europe/Prague", label: "From browser (Europe/Prague)" },
];

function ControlledTimezoneSelect(props: {
    value?: string;
    specialItems?: ITimezoneSelectSpecialItem[];
    isDisabled?: boolean;
    placeholder?: string;
}) {
    const [value, setValue] = useState<string | undefined>(props.value);

    return (
        <TimezoneSelect
            {...labels}
            value={value}
            onChange={(id) => {
                setValue(id);
                action("onChange")(id);
            }}
            specialItems={props.specialItems}
            isDisabled={props.isDisabled}
            placeholder={props.placeholder}
        />
    );
}

function TimezoneSelectClosedStates() {
    return (
        <div className="library-component screenshot-target" style={{ height: 500 }}>
            <div>
                <h3 style={headerStyle}>Nothing selected (placeholder)</h3>
                <ControlledTimezoneSelect placeholder="Select time zone" />
            </div>
            <div>
                <h3 style={headerStyle}>Timezone selected</h3>
                <ControlledTimezoneSelect value="America/New_York" />
            </div>
            <div>
                <h3 style={headerStyle}>Special item selected</h3>
                <ControlledTimezoneSelect specialItems={specialItems} />
            </div>
            <div>
                <h3 style={headerStyle}>Disabled</h3>
                <ControlledTimezoneSelect value="America/New_York" isDisabled />
            </div>
        </div>
    );
}

/**
 * Menu-item-like trigger (icon + label + current selection + submenu chevron) demonstrating
 * the renderButton prop, e.g. for embedding the select in an options menu.
 */
function TimezoneSelectCustomTrigger() {
    const [value, setValue] = useState<string | undefined>("America/New_York");

    return (
        <div className="library-component screenshot-target" style={{ height: 500 }}>
            <TimezoneSelect
                {...labels}
                value={value}
                onChange={(id) => {
                    setValue(id);
                    action("onChange")(id);
                }}
                specialItems={specialItems}
                renderButton={({ buttonLabel, isOpen, toggleDropdown, buttonRef, ariaAttributes }) => (
                    <button
                        type="button"
                        className="s-timezone-select-custom-trigger"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            width: 300,
                            height: 28,
                            padding: "0 10px",
                            border: "none",
                            background: isOpen ? "#f2f2f2" : "transparent",
                            cursor: "pointer",
                            font: "inherit",
                            textAlign: "left",
                        }}
                        ref={(element) => {
                            buttonRef.current = element;
                        }}
                        onClick={() => toggleDropdown()}
                        {...ariaAttributes}
                    >
                        <UiIcon type="clock" size={14} color="complementary-7" />
                        <span>Default time zone</span>
                        <span style={{ marginLeft: "auto", color: "#94a1ad" }}>{buttonLabel}</span>
                        <UiIcon type="navigateRight" size={12} color="complementary-7" />
                    </button>
                )}
            />
        </div>
    );
}

/**
 * The opened state is captured by clicking the (first) trigger button of the closed-states
 * story. A search-filtered screenshot is not expressible in a single neobackstop scenario,
 * because keyPressSelector executes before clickSelector, so a "click to open, then type"
 * flow cannot be modelled; the search remains testable interactively in storybook.
 */
const screenshotProps: INeobackstopConfig = {
    closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
    opened: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelector: ".s-timezone-select-button",
        postInteractionWait: { selector: '[data-testid="s-timezone-select-list"]', delay: 200 },
    },
};

export default {
    title: "12 UI Kit/TimezoneSelect",
};

export function FullFeatured() {
    return <TimezoneSelectClosedStates />;
}
FullFeatured.parameters = {
    kind: "full-featured",
    screenshots: screenshotProps,
} satisfies IStoryParameters;

export function CustomTrigger() {
    return <TimezoneSelectCustomTrigger />;
}
CustomTrigger.parameters = {
    kind: "custom-trigger",
    screenshots: {
        closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".s-timezone-select-custom-trigger",
            delay: {
                postOperation: 200,
            },
        },
    },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<TimezoneSelectClosedStates />);
Themed.parameters = { kind: "themed", screenshots: screenshotProps } satisfies IStoryParameters;
