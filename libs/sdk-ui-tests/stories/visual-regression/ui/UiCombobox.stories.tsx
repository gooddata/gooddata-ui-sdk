// (C) 2025 GoodData Corporation

import { type ReactNode, useState } from "react";

import {
    type IUiComboboxOption,
    UiCombobox,
    UiComboboxInput,
    UiComboboxList,
    UiComboboxPopup,
} from "@gooddata/sdk-ui-kit";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import { type IStoryParameters } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

// Mock options for the combobox

const fruits = [
    "Apple",
    "Banana",
    "Orange",
    "Pineapple",
    "Grape",
    "Mango",
    "Strawberry",
    "Blueberry",
    "Raspberry",
    "Blackberry",
    "Cherry",
    "Peach",
    "Pear",
    "Plum",
    "Kiwi",
    "Watermelon",
    "Cantaloupe",
    "Honeydew",
    "Papaya",
    "Guava",
    "Lychee",
    "Pomegranate",
    "Apricot",
    "Grapefruit",
];

const basicOptions: IUiComboboxOption[] = fruits.map((fruit, index) => ({
    id: `${index + 1}`,
    label: fruit,
}));

function UiComboboxExamples() {
    return (
        <div className="library-component">
            <Example title="Uncontrolled combobox">
                <UiCombobox options={basicOptions} creatable>
                    <UiComboboxInput placeholder="Search options..." />
                    <UiComboboxPopup>
                        <UiComboboxList />
                    </UiComboboxPopup>
                </UiCombobox>
            </Example>
            <Example title="Controlled combobox">
                <ControlledCombobox />
            </Example>
        </div>
    );
}

function Example({ title, children }: { title: string; children: ReactNode }) {
    return (
        <>
            <h4>{title}</h4>
            <div style={{ width: 300, marginBottom: 20 }}>{children}</div>
        </>
    );
}

function ControlledCombobox() {
    const [value, setValue] = useState("");

    return (
        <UiCombobox options={basicOptions} value={value} onValueChange={setValue} creatable>
            <UiComboboxInput name="controlled-combobox" placeholder="Search options..." />
            <UiComboboxPopup>
                <UiComboboxList />
            </UiComboboxPopup>
        </UiCombobox>
    );
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "15 Ui/UiCombobox",
};

export function Default() {
    return <UiComboboxExamples />;
}
Default.parameters = { kind: "default" } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiComboboxExamples />);
Themed.parameters = { kind: "themed" } satisfies IStoryParameters;
