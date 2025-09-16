// (C) 2022-2025 GoodData Corporation

import { action } from "storybook/actions";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilter, IAttributeFilterDropdownActionsProps } from "@gooddata/sdk-ui-filters";
import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

import { ReferenceWorkspaceId, StorybookBackend } from "../../../../_infra/backend.js";
import { LongPostInteractionTimeout } from "../../../../_infra/backstopWrapper.js";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const backend = StorybookBackend();

function CustomDropdownActions(props: IAttributeFilterDropdownActionsProps) {
    const { onApplyButtonClick, onCancelButtonClick } = props;

    return (
        <div
            style={{
                borderTop: "1px solid black",
                display: "flex",
                padding: 10,
                margin: 0,
                justifyContent: "right",
                background: "cyan",
            }}
        >
            <button style={{ border: "1px solid black" }} onClick={onCancelButtonClick}>
                Close
            </button>
            <button style={{ border: "1px solid black" }} onClick={onApplyButtonClick}>
                Apply
            </button>
        </div>
    );
}

export default {
    title: "10 Filters@next/Customization/DropdownActionsComponent",
};

export function CustomComponent() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilter
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                onApply={action("onApply")}
                DropdownActionsComponent={CustomDropdownActions}
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
};
