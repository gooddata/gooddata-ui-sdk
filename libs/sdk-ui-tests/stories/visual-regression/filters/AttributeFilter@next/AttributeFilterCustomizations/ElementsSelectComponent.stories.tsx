// (C) 2022-2025 GoodData Corporation
import React from "react";

import { action } from "storybook/actions";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilter, IAttributeFilterElementsSelectProps } from "@gooddata/sdk-ui-filters";

import { ReferenceWorkspaceId, StorybookBackend } from "../../../../_infra/backend.js";
import { LongPostInteractionTimeout } from "../../../../_infra/backstopWrapper.js";
const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const backend = StorybookBackend();

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

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
            clickSelector: ".gd-attribute-filter__next",
            postInteractionWait: LongPostInteractionTimeout,
        },
    },
};
