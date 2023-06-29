// (C) 2022 GoodData Corporation
import React from "react";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilter, IAttributeFilterDropdownActionsProps } from "@gooddata/sdk-ui-filters";
import { action } from "@storybook/addon-actions";

import { storiesOf } from "../../../../_infra/storyRepository.js";
import { FilterStories } from "../../../../_infra/storyGroups.js";
import { ReferenceWorkspaceId, StorybookBackend } from "../../../../_infra/backend.js";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";
import { LongPostInteractionTimeout } from "../../../../_infra/backstopWrapper.js";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const backend = StorybookBackend();

const CustomDropdownActions = (props: IAttributeFilterDropdownActionsProps) => {
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
};

storiesOf(`${FilterStories}@next/Customization/DropdownActionsComponent`).add(
    "Custom component",
    () => {
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
    },
    {
        screenshots: {
            opened: {
                clickSelector: ".gd-attribute-filter__next",
                postInteractionWait: LongPostInteractionTimeout,
            },
        },
    },
);
