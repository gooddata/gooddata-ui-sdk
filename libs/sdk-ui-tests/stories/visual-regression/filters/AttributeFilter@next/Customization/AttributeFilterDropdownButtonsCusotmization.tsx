// (C) 2022 GoodData Corporation
import React from "react";
import { AttributeFilterBase } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/AttributeFilterBase";
import { AttributeFilterDefaultComponents } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Context/AttributeFilterDefaultComponents";
import {
    IAttributeFilterDropdownButtonsProps,
    IAttributeFilterDeleteButtonProps,
} from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/types";
import { AttributeFilterDeleteButton } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/AttributeFilterDeleteButton";

import { storiesOf } from "../../../../_infra/storyRepository";
import { action } from "@storybook/addon-actions";
import { FilterStories } from "../../../../_infra/storyGroups";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { ReferenceWorkspaceId, StorybookBackend } from "../../../../_infra/backend";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const backend = StorybookBackend();

const CustomComponent = (props: IAttributeFilterDropdownButtonsProps) => {
    const { onApplyButtonClicked, onCloseButtonClicked, isApplyDisabled } = props;
    return (
        <>
            <button onClick={onApplyButtonClicked} disabled={isApplyDisabled}>
                Apply
            </button>
            <button onClick={onCloseButtonClicked}>Close</button>
        </>
    );
};

function WithDeleteButton(deleteProps: IAttributeFilterDeleteButtonProps) {
    return function Component(props: IAttributeFilterDropdownButtonsProps) {
        return (
            <>
                <AttributeFilterDeleteButton onDelete={deleteProps.onDelete} />
                <AttributeFilterDefaultComponents.AttributeFilterDropdownButtons {...props} />
            </>
        );
    };
}

storiesOf(`${FilterStories}@next/AttributeFilterBase/Customization/FilterDropdownButtons`)
    .add("Custom component", () => {
        return (
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilterBase
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                    onApply={action("onApply")}
                    FilterDropdownButtons={CustomComponent}
                />
            </div>
        );
    })
    .add("Delete button", () => {
        const AttributeFilterDropdownButtons = WithDeleteButton({ onDelete: action("onDelete") });
        return (
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilterBase
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                    onApply={action("onApply")}
                    FilterDropdownButtons={AttributeFilterDropdownButtons}
                />
            </div>
        );
    });
