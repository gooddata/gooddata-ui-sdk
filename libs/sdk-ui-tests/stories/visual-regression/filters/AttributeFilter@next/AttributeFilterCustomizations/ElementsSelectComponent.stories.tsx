// (C) 2022-2025 GoodData Corporation

import { action } from "storybook/actions";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilter, type IAttributeFilterElementsSelectProps } from "@gooddata/sdk-ui-filters";

import { ReferenceWorkspaceId, StorybookBackend } from "../../../../_infra/backend.js";
import { type IStoryParameters, State } from "../../../../_infra/backstopScenario.js";
import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const backend = StorybookBackend();

function CustomElementsSelect(_props: IAttributeFilterElementsSelectProps) {
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
            Custom elements select content
        </div>
    );
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "10 Filters@next/Customization/ElementsSelectComponent",
};

export function CustomComponent() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                onApply={action("on-apply")}
                ElementsSelectComponent={CustomElementsSelect}
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
                postOperation: 250, // cancel button has .25s transition
            },
        },
    },
} satisfies IStoryParameters;
