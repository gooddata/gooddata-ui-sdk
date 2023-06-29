// (C) 2022 GoodData Corporation
import React from "react";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilter, IAttributeFilterElementsSelectItemProps } from "@gooddata/sdk-ui-filters";
import { action } from "@storybook/addon-actions";

import { storiesOf } from "../../../../_infra/storyRepository.js";
import { FilterStories } from "../../../../_infra/storyGroups.js";
import { ReferenceWorkspaceId, StorybookBackend } from "../../../../_infra/backend.js";
import { LongPostInteractionTimeout } from "../../../../_infra/backstopWrapper.js";
import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const backend = StorybookBackend();

const CustomElementsSelectItem = (props: IAttributeFilterElementsSelectItemProps) => {
    const { isSelected, item, onDeselect, onSelect } = props;

    return (
        <div
            style={{
                borderBottom: "3px solid #fff",
                padding: "0 10px",
                background: "cyan",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                height: "28px",
                margin: "0px 10px",
                cursor: "pointer",
            }}
            onClick={() => {
                if (isSelected) {
                    onDeselect();
                } else {
                    onSelect();
                }
            }}
        >
            <div>{item.title}</div>
            <div>{isSelected ? "✔" : ""}</div>
        </div>
    );
};

storiesOf(`${FilterStories}@next/Customization/ElementsSelectItemComponent`).add(
    "Custom component",
    () => {
        return (
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilter
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                    onApply={action("on-apply")}
                    ElementsSelectItemComponent={CustomElementsSelectItem}
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
