// (C) 2022-2026 GoodData Corporation

import { action } from "storybook/actions";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilter, type IAttributeFilterDropdownBodyProps } from "@gooddata/sdk-ui-filters";

import { ReferenceWorkspaceId, StorybookBackend } from "../../../../_infra/backend.js";
import { type IStoryParameters, State } from "../../../../_infra/backstopScenario.js";
import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const backend = StorybookBackend();

function CustomDropdownBody(_props: IAttributeFilterDropdownBodyProps) {
    return (
        <div
            style={{
                border: "2px solid black",
                display: "flex",
                margin: 0,
                justifyContent: "center",
                background: "cyan",
                alignItems: "center",
                padding: 10,
            }}
        >
            Custom dropdown body content
        </div>
    );
}

function CustomDropdownBodyDefinedWidth(_props: IAttributeFilterDropdownBodyProps) {
    return (
        <div
            style={{
                border: "2px solid black",
                display: "flex",
                margin: 0,
                justifyContent: "center",
                background: "pink",
                alignItems: "center",
                padding: 10,
                width: 400,
            }}
        >
            Custom dropdown body content
        </div>
    );
}

export default {
    title: "10 Filters@next/Customization/DropdownBodyComponent",
};

export function CustomComponent() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                onApply={action("onApply")}
                DropdownBodyComponent={CustomDropdownBody}
            />
        </div>
    );
}
CustomComponent.parameters = {
    kind: "Custom component",
    screenshots: {
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            delay: {
                postOperation: 250, // search icon has .25s transition
            },
        },
    },
} satisfies IStoryParameters;

export function CustomComponentWithDefinedWidth() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                onApply={action("onApply")}
                DropdownBodyComponent={CustomDropdownBodyDefinedWidth}
            />
        </div>
    );
}
CustomComponentWithDefinedWidth.parameters = {
    kind: "Custom component with defined width",
    screenshots: {
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-attribute-filter__next",
            delay: {
                postOperation: 200, // element has .2s transition
            },
        },
    },
} satisfies IStoryParameters;
