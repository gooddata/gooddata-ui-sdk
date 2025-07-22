// (C) 2022-2025 GoodData Corporation
import React from "react";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilter, IAttributeFilterElementsSearchBarProps } from "@gooddata/sdk-ui-filters";
import { action } from "storybook/actions";

import { ReferenceWorkspaceId, StorybookBackend } from "../../../../_infra/backend.js";
import { LongPostInteractionTimeout } from "../../../../_infra/backstopWrapper.js";
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

function EmptyElementsSearchBar() {
    return <div style={{ paddingBottom: 10 }} />;
}

export default {
    title: "10 Filters@next/Customization/ElementsSearchBarComponent",
};

export const CustomComponent = () => (
    <div style={wrapperStyle} className="screenshot-target">
        <AttributeFilter
            backend={backend}
            workspace={ReferenceWorkspaceId}
            filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
            onApply={action("on-apply")}
            ElementsSearchBarComponent={CustomElementsSearchBar}
        />
    </div>
);
CustomComponent.parameters = {
    kind: "Custom component",
    screenshots: {
        opened: {
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
};

export const EmptyComponent = () => (
    <div style={wrapperStyle} className="screenshot-target">
        <AttributeFilter
            backend={backend}
            workspace={ReferenceWorkspaceId}
            filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
            onApply={action("on-apply")}
            ElementsSearchBarComponent={EmptyElementsSearchBar}
        />
    </div>
);
EmptyComponent.parameters = {
    kind: "Empty component",
    screenshots: {
        opened: {
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
};
