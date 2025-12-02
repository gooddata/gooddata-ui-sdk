// (C) 2022-2025 GoodData Corporation

import { action } from "storybook/actions";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilter, IAttributeFilterDropdownButtonProps } from "@gooddata/sdk-ui-filters";

import { ReferenceWorkspaceId, StorybookBackend } from "../../../../_infra/backend.js";
import { IStoryParameters } from "../../../../_infra/backstopScenario.js";
import { LongPostInteractionTimeout } from "../../../../_infra/backstopWrapper.js";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const backend = StorybookBackend();

function CustomDropdownButton({ title, onClick }: IAttributeFilterDropdownButtonProps) {
    return (
        <button style={{ border: "1px solid black" }} onClick={onClick}>
            {title}
        </button>
    );
}

export default {
    title: "10 Filters@next/Customization/DropdownButtonComponent",
};

export function CustomComponent() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                onApply={action("on-apply")}
                DropdownButtonComponent={CustomDropdownButton}
            />
        </div>
    );
}
CustomComponent.parameters = {
    kind: "Custom component",
    screenshots: {
        opened: {
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
} satisfies IStoryParameters;
