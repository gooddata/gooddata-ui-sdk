// (C) 2025 GoodData Corporation

import React from "react";

import noop from "lodash/noop.js";
import { IntlProvider } from "react-intl";

import { IUiMenuItem, UiMenu, separatorStaticItem } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../themeWrapper.js";

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

// Define the custom menu item data type
type CustomMenuData = {
    interactive: string;
    static: string;
    group: string;
    content: { formTitle: string };
};

// Example custom content component
function CustomForm({
    onBack,
    onClose,
    menuCtxData,
}: {
    onBack: () => void;
    onClose: () => void;
    menuCtxData?: CustomMenuData["content"];
}) {
    const [value, setValue] = React.useState("");

    return (
        <div style={{ padding: "1rem" }}>
            <h3>{menuCtxData?.formTitle || "Custom Form"}</h3>
            <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="example-input" style={{ display: "block", marginBottom: "0.5rem" }}>
                    Example Input
                </label>
                <input
                    id="example-input"
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    style={{ width: "100%", padding: "0.5rem" }}
                />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <button onClick={onBack} style={{ padding: "0.5rem 1rem" }}>
                    Back
                </button>
                <button onClick={onClose} style={{ padding: "0.5rem 1rem" }}>
                    Close
                </button>
            </div>
        </div>
    );
}

const itemsWithContent: IUiMenuItem<CustomMenuData>[] = [
    { type: "interactive", id: "item1", stringTitle: "Regular Item", data: "data1" },
    {
        type: "content",
        id: "custom-form",
        stringTitle: "Open Form",
        data: { formTitle: "Example Form" },
        Component: CustomForm,
    },
    { type: "interactive", id: "item3", stringTitle: "Another Item", data: "data3" },
];

function Example({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <>
            <h4>{title}</h4>
            <div style={{ width: 300 }}>{children}</div>
        </>
    );
}

// Default aria attributes for the menu
const defaultAriaAttributes = {
    id: "test-menu",
    "aria-labelledby": "test-menu-label",
    role: "menu" as const,
};

function UiMenuExamples() {
    return (
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

                <Example title="Menu with Custom Content">
                    <UiMenu
                        items={itemsWithContent}
                        onSelect={noop}
                        ariaAttributes={defaultAriaAttributes}
                        menuCtxData={{ formTitle: "Custom Form Title" }}
                    />
                </Example>
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiMenu",
};

export function Default() {
    return <UiMenuExamples />;
}
Default.parameters = { kind: "default", screenshot: true };

export const Themed = () => wrapWithTheme(<UiMenuExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
