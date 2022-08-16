// (C) 2022 GoodData Corporation
import React from "react";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilterV2, IAttributeFilterElementsSearchBarProps } from "@gooddata/sdk-ui-filters";
import { action } from "@storybook/addon-actions";

import { storiesOf } from "../../../../_infra/storyRepository";
import { FilterStories } from "../../../../_infra/storyGroups";
import { ReferenceWorkspaceId, StorybookBackend } from "../../../../_infra/backend";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const backend = StorybookBackend();

const CustomElementsSearchBar = (props: IAttributeFilterElementsSearchBarProps) => {
    const { onSearch, searchString } = props;

    return (
        <div
            style={{
                borderBottom: "1px solid black",
                padding: 10,
                margin: "0 0 5px",
                background: "cyan",
            }}
        >
            Search attribute values:{" "}
            <input
                style={{ width: "100%" }}
                onChange={(e) => onSearch(e.target.value)}
                value={searchString}
            />
        </div>
    );
};

storiesOf(`${FilterStories}@next/Customization/ElementsSearchBarComponent`).add("Custom component", () => {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <AttributeFilterV2
                backend={backend}
                workspace={ReferenceWorkspaceId}
                filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                onApply={action("on-apply")}
                ElementsSearchBarComponent={CustomElementsSearchBar}
            />
        </div>
    );
});
