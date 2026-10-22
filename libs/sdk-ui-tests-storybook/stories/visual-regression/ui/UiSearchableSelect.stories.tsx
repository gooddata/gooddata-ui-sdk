// (C) 2026 GoodData Corporation

import { type CSSProperties } from "react";

import { type Decorator } from "@storybook/react-vite";
import { action } from "storybook/actions";
import { expect, screen, userEvent, waitFor } from "storybook/test";

import { IntlWrapper } from "@gooddata/sdk-ui";
import {
    type IUiSearchableSelectProps,
    UiSearchableSelect,
    UiSearchableSelectDivider,
    UiSearchableSelectItem,
    UiSearchableSelectList,
    UiSearchableSelectSearch,
} from "@gooddata/sdk-ui-kit";

import {
    type INeobackstopScenarioConfig,
    type IStoryParameters,
    State,
} from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

interface IItem {
    id: string;
    title: string;
}

const wrapperStyle: CSSProperties = { width: 300, padding: 40 };

// NeoBackstop skips stories with an empty screenshot config, so the closed ones wait for the button
const closedScreenshot = {
    readySelector: { selector: '[aria-haspopup="listbox"]', state: State.Attached },
} satisfies INeobackstopScenarioConfig;

// The open popup focuses its search a frame after it is placed, so the screenshot waits for the focus
const openedScreenshot = {
    readySelector: { selector: '[role="combobox"]:focus', state: State.Attached },
} satisfies INeobackstopScenarioConfig;

const requiredProps = {
    accessibilityConfig: { ariaLabel: "Select label" },
    items: [...Array(20).keys()].map((index) => ({
        id: `item-${index + 1}`,
        title: `Item ${index + 1}`,
    })) satisfies IItem[],
    onChange: action("onChange"),
    placeholder: "Select placeholder",
    value: null,
    children: (
        <>
            <UiSearchableSelectSearch />
            <UiSearchableSelectList<IItem>>
                {({ id, title }) => <UiSearchableSelectItem id={id}>{title}</UiSearchableSelectItem>}
            </UiSearchableSelectList>
        </>
    ),
} satisfies IUiSearchableSelectProps<IItem>;

export default {
    title: "15 Ui/UiSearchableSelect",
    decorators: [
        (Story) => (
            <IntlWrapper>
                <Story />
            </IntlWrapper>
        ),
    ] satisfies Decorator[],
};

export function Default() {
    return (
        <div style={wrapperStyle}>
            <UiSearchableSelect {...requiredProps} />
        </div>
    );
}
Default.parameters = { kind: "default", screenshot: closedScreenshot } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<Default />);
Themed.parameters = { kind: "themed", screenshot: closedScreenshot } satisfies IStoryParameters;

export function Opened() {
    return (
        <div style={wrapperStyle}>
            <UiSearchableSelect {...requiredProps} defaultOpen />
        </div>
    );
}
Opened.parameters = { kind: "opened", screenshot: openedScreenshot } satisfies IStoryParameters;

export const OpenedThemed = () => wrapWithTheme(<Opened />);
OpenedThemed.parameters = { kind: "opened themed", screenshot: openedScreenshot } satisfies IStoryParameters;

export function Selected() {
    return (
        <div style={wrapperStyle}>
            <UiSearchableSelect {...requiredProps} defaultOpen value="item-12" />
        </div>
    );
}
Selected.parameters = { kind: "selected", screenshot: openedScreenshot } satisfies IStoryParameters;

export const SelectedThemed = () => wrapWithTheme(<Selected />);
SelectedThemed.parameters = {
    kind: "selected themed",
    screenshot: openedScreenshot,
} satisfies IStoryParameters;

export function SelectedWithHighlighted() {
    return <Selected />;
}
SelectedWithHighlighted.parameters = {
    kind: "selected with highlighted",
    screenshot: {
        readySelector: {
            /**
             * NeoBackstop doesn't support `getByRole()` and similar selectors. Therefore a kinda-matching CSS selector was used.
             * The selected item 12 is highlighted right away, so this waits for item 14, two arrow downs later
             */
            selector: '[role="combobox"][aria-activedescendant$="-item-14"]',
            state: State.Attached,
        },
    },
} satisfies IStoryParameters;
// NeoBackstop loads the story in the Storybook iframe, which runs the play function too: the readySelector above
// waits for its two arrow downs.
SelectedWithHighlighted.play = async () => {
    await waitFor(() => expect(screen.getByRole("combobox")).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
};

export function WithDivider() {
    return (
        <div style={wrapperStyle}>
            <UiSearchableSelect {...requiredProps} defaultOpen>
                <UiSearchableSelectSearch />
                <UiSearchableSelectList<IItem>>
                    {({ id, title }) =>
                        id === "item-1" ? (
                            <>
                                <UiSearchableSelectItem id={id}>{title}</UiSearchableSelectItem>
                                <UiSearchableSelectDivider />
                            </>
                        ) : (
                            <UiSearchableSelectItem id={id}>{title}</UiSearchableSelectItem>
                        )
                    }
                </UiSearchableSelectList>
            </UiSearchableSelect>
        </div>
    );
}
WithDivider.parameters = { kind: "with divider", screenshot: openedScreenshot } satisfies IStoryParameters;

export function NoItems() {
    return (
        <div style={wrapperStyle}>
            <UiSearchableSelect {...requiredProps} defaultOpen items={[]} />
        </div>
    );
}
NoItems.parameters = { kind: "no items", screenshot: openedScreenshot } satisfies IStoryParameters;

export function LongValues() {
    const items = [
        { id: "item-long", title: "Item with a very long title that fits neither the button nor the list" },
    ];

    return (
        <div style={wrapperStyle}>
            <UiSearchableSelect {...requiredProps} items={items} defaultOpen value="item-long" />
        </div>
    );
}
LongValues.parameters = { kind: "long values", screenshot: openedScreenshot } satisfies IStoryParameters;
