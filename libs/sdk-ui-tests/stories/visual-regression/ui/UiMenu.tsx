// (C) 2025 GoodData Corporation

import React from "react";

import { UiMenu, IUiMenuItem, separatorStaticItem } from "@gooddata/sdk-ui-kit";

import { storiesOf } from "../../_infra/storyRepository.js";
import { UiStories } from "../../_infra/storyGroups.js";
import { wrapWithTheme } from "../themeWrapper.js";
import noop from "lodash/noop.js";
import { IntlProvider } from "react-intl";

// Mock items for the menu
const interactiveItems: IUiMenuItem[] = [
    { type: "interactive", id: "item1", stringTitle: "Item 1", data: "data1" },
    { type: "interactive", id: "item2", stringTitle: "Item 2", data: "data2" },
    { type: "interactive", id: "item3", stringTitle: "Item 3", isDisabled: true, data: "data3" },
    { type: "interactive", id: "item4", stringTitle: "Item 4", data: "data4" },
];

const staticItem: IUiMenuItem = {
    type: "static",
    data: "<<Static item>>",
};

const mixedItems: IUiMenuItem[] = [
    { type: "interactive", id: "item1", stringTitle: "Item 1", data: "data1" },
    staticItem,
    { type: "interactive", id: "item2", stringTitle: "Item 2", data: "data2" },
    separatorStaticItem,
    { type: "interactive", id: "item3", stringTitle: "Item 3", data: "data3" },
];

const itemsWithSubMenu: IUiMenuItem[] = [
    { type: "interactive", id: "item1", stringTitle: "Item 1", data: "data1" },
    {
        type: "interactive",
        id: "item2",
        stringTitle: "Item with submenu",
        data: "data2",
        subItems: [
            { type: "interactive", id: "subitem1", stringTitle: "Submenu Item 1", data: "subdata1" },
            { type: "interactive", id: "subitem2", stringTitle: "Submenu Item 2", data: "subdata2" },
        ],
    },
    { type: "interactive", id: "item3", stringTitle: "Item 3", data: "data3" },
];

const itemsWithGroup: IUiMenuItem[] = [
    { type: "interactive", id: "item1", stringTitle: "Item 1", data: "data1" },
    {
        type: "group",
        id: "group1",
        stringTitle: "Group 1",
        data: "Group title",
        subItems: [
            { type: "interactive", id: "groupitem1", stringTitle: "Group Item 1", data: "groupdata1" },
            { type: "interactive", id: "groupitem2", stringTitle: "Group Item 2", data: "groupdata2" },
        ],
    },
    { type: "interactive", id: "item3", stringTitle: "Item 3", data: "data3" },
];

const Example = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <>
        <h4>{title}</h4>
        <div style={{ width: 300 }}>{children}</div>
    </>
);

// Default aria attributes for the menu
const defaultAriaAttributes = {
    id: "test-menu",
    "aria-labelledby": "test-menu-label",
    role: "menu" as const,
};

const UiMenuExamples = () => (
    <IntlProvider
        locale="en-US"
        messages={{
            "menu.back": "Back to the parent menu",
            "menu.close": "Close menu",
        }}
    >
        <div className="library-component screenshot-target">
            <Example title="Basic Menu">
                <UiMenu items={interactiveItems} onSelect={noop} ariaAttributes={defaultAriaAttributes} />
            </Example>

            <Example title="Menu with Mixed Items">
                <UiMenu items={mixedItems} onSelect={noop} ariaAttributes={defaultAriaAttributes} />
            </Example>

            <Example title="Menu with Submenu">
                <UiMenu items={itemsWithSubMenu} onSelect={noop} ariaAttributes={defaultAriaAttributes} />
            </Example>

            <Example title="Menu with Disabled Items Focusable">
                <UiMenu
                    items={interactiveItems}
                    isDisabledFocusable={true}
                    onSelect={noop}
                    ariaAttributes={defaultAriaAttributes}
                />
            </Example>

            <Example title="Menu with Max Width">
                <UiMenu
                    items={interactiveItems}
                    maxWidth={150}
                    onSelect={noop}
                    ariaAttributes={defaultAriaAttributes}
                />
            </Example>

            <Example title="Menu with Group Items">
                <UiMenu items={itemsWithGroup} onSelect={noop} ariaAttributes={defaultAriaAttributes} />
            </Example>
        </div>
    </IntlProvider>
);

storiesOf(`${UiStories}/UiMenu`)
    .add("default", () => <UiMenuExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<UiMenuExamples />), { screenshot: true });
