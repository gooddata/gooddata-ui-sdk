// (C) 2022-2025 GoodData Corporation
import React from "react";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilter, IAttributeFilterStatusBarProps } from "@gooddata/sdk-ui-filters";
import { action } from "storybook/actions";

import { ReferenceWorkspaceId, StorybookBackend } from "../../../../_infra/backend.js";
import { LongPostInteractionTimeout } from "../../../../_infra/backstopWrapper.js";
import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const backend = StorybookBackend();

const CustomStatusBar = (props: IAttributeFilterStatusBarProps) => {
    const { selectedItems, isInverted } = props;
    return (
        <div
            style={{
                border: "2px solid black",
                display: "flex",
                margin: 0,
                justifyContent: "left",
                background: "cyan",
                alignItems: "center",
                padding: 10,
                width: "100%",
            }}
        >
            <div>
                {isInverted && selectedItems.length === 0 ? "All" : ""}
                {!isInverted && selectedItems.length === 0 ? "None" : ""}
                {isInverted && selectedItems.length > 0 ? "All except:" : ""}{" "}
                <b>{selectedItems.map((item) => item.title).join(", ")}</b>
            </div>
        </div>
    );
};

export default {
    title: "10 Filters@next/Customization/StatusBarComponent",
};

export const CustomComponent = () => (
    <div style={wrapperStyle} className="screenshot-target">
        <AttributeFilter
            backend={backend}
            workspace={ReferenceWorkspaceId}
            filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
            onApply={action("on-apply")}
            StatusBarComponent={CustomStatusBar}
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
