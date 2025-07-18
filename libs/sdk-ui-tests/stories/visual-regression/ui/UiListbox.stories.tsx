// (C) 2025 GoodData Corporation

import React from "react";
import noop from "lodash/noop.js";
import { UiListbox, separatorStaticItem, IUiListboxItem } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../themeWrapper.js";

// Mock items for the listbox
const interactiveItems: IUiListboxItem<string>[] = [
    { type: "interactive", id: "item1", stringTitle: "Item 1", data: "data1" },
    { type: "interactive", id: "item2", stringTitle: "Item 2", data: "data2" },
    { type: "interactive", id: "item3", stringTitle: "Item 3", isDisabled: true, data: "data3" },
    { type: "interactive", id: "item4", stringTitle: "Item 4", data: "data4" },
];

const interactiveItemsWithIcons: IUiListboxItem<string>[] = [
    { type: "interactive", id: "item1", stringTitle: "Item 1", data: "data1", icon: "trash" },
    { type: "interactive", id: "item2", stringTitle: "Item 2", data: "data2", icon: "folder" },
    {
        type: "interactive",
        id: "item3",
        stringTitle: "Item 3",
        isDisabled: true,
        data: "data3",
        icon: "book",
    },
];

const mixedItems: IUiListboxItem<string, React.ReactNode>[] = [
    { type: "interactive", id: "item1", stringTitle: "Item 1", data: "data1" },
    { type: "static", data: "<<Static item>>" },
    { type: "interactive", id: "item2", stringTitle: "Item 2", data: "data2" },
    separatorStaticItem,
    { type: "interactive", id: "item3", stringTitle: "Item 3", data: "data3" },
];

const Example = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <>
        <h4>{title}</h4>
        <div style={{ width: 300 }}>{children}</div>
    </>
);

// Default aria attributes for the listbox
const defaultAriaAttributes = {
    id: "test-listbox",
    "aria-labelledby": "test-listbox-label",
    role: "listbox" as const,
};

const UiListboxExamples = () => (
    <div className="library-component screenshot-target">
        <Example title="Basic Listbox">
            <UiListbox items={interactiveItems} onSelect={noop} ariaAttributes={defaultAriaAttributes} />
        </Example>

        <Example title="Listbox with Selected Item">
            <UiListbox
                items={interactiveItems}
                selectedItemId="item2"
                onSelect={noop}
                ariaAttributes={defaultAriaAttributes}
            />
        </Example>

        <Example title="Listbox with Mixed Items">
            <UiListbox items={mixedItems} onSelect={noop} ariaAttributes={defaultAriaAttributes} />
        </Example>

        <Example title="Listbox with Disabled Items Focusable">
            <UiListbox
                items={interactiveItems}
                isDisabledFocusable={true}
                onSelect={noop}
                ariaAttributes={defaultAriaAttributes}
            />
        </Example>

        <Example title="Listbox with Max Width">
            <UiListbox
                items={interactiveItems}
                maxWidth={150}
                onSelect={noop}
                ariaAttributes={defaultAriaAttributes}
            />
        </Example>

        <Example title="Listbox with Icons">
            <UiListbox
                items={interactiveItemsWithIcons}
                onSelect={noop}
                ariaAttributes={defaultAriaAttributes}
            />
        </Example>

        <Example title="Compact Listbox">
            <UiListbox
                items={interactiveItemsWithIcons}
                onSelect={noop}
                isCompact={true}
                ariaAttributes={defaultAriaAttributes}
            />
        </Example>
    </div>
);

export default {
    title: "15 Ui/UiListbox",
};

export const Default = () => <UiListboxExamples />;
Default.parameters = { kind: "default", screenshot: true };

export const Themed = () => wrapWithTheme(<UiListboxExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
