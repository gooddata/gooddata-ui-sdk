// (C) 2022 GoodData Corporation
import React from "react";
import { AttributeFilterBase } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/AttributeFilterBase";
import {
    isNonEmptyListItem,
    IAttributeFilterListItemProps,
} from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/types";
import { AttributeFilterDefaultComponents } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Context/AttributeFilterDefaultComponents";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { storiesOf } from "../../../../_infra/storyRepository";
import { action } from "@storybook/addon-actions";
import { FilterStories } from "../../../../_infra/storyGroups";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { ReferenceWorkspaceId, StorybookBackend } from "../../../../_infra/backend";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const backend = StorybookBackend();

const CustomComponent = (props: IAttributeFilterListItemProps) => {
    const { item, isSelected, onSelect } = props;
    const selectLabel = isSelected ? "[x]" : "[ ]";

    if (isNonEmptyListItem(item)) {
        return (
            <div
                style={{ paddingLeft: 20, cursor: "pointer" }}
                onClick={() => onSelect(item)}
            >{`${selectLabel} ${item.title}`}</div>
        );
    } else {
        return <div style={{ paddingLeft: 20 }}>{"loading ... "}</div>;
    }
};

const WithDefaultComponent = (props: IAttributeFilterListItemProps) => {
    return (
        <div>
            <div style={{ float: "left" }}>😅</div>
            <AttributeFilterDefaultComponents.AttributeFilterListItem {...props} />
        </div>
    );
};

storiesOf(`${FilterStories}@next/AttributeFilterBase/Customization/FilterListItem`)
    .add("Default component", () => {
        return (
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilterBase
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                    onApply={action("on-apply")}
                    FilterListItem={WithDefaultComponent}
                />
            </div>
        );
    })
    .add("Custom component", () => {
        return (
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilterBase
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                    onApply={action("on-apply")}
                    FilterListItem={CustomComponent}
                />
            </div>
        );
    });
