// (C) 2022 GoodData Corporation
import React from "react";
import { AttributeFilterBase } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/AttributeFilterBase";
import { IAttributeFilterErrorProps } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/types";
import { AttributeFilterDefaultComponents } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Context/AttributeFilterDefaultComponents";

import { storiesOf } from "../../../../_infra/storyRepository";
import { action } from "@storybook/addon-actions";
import { FilterStories } from "../../../../_infra/storyGroups";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { ReferenceWorkspaceId, StorybookBackend } from "../../../../_infra/backend";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const backend = StorybookBackend();

const CustomErrorComponent = (props: IAttributeFilterErrorProps) => {
    const { message } = props;
    return (
        <div style={{ border: "1px solid black" }}>
            Custom error component
            <br />
            {message}
        </div>
    );
};

const DefaultError = (_props: IAttributeFilterErrorProps) => {
    return (
        <div style={{ border: "1px solid black" }}>
            <AttributeFilterDefaultComponents.AttributeFilterError message={"Custom error"} />
        </div>
    );
};

storiesOf(`${FilterStories}@next/AttributeFilterBase/Customization/FilterError`)
    .add("Custom component", () => {
        return (
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilterBase
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter("NOT_EXIST", [])}
                    onApply={action("on-apply")}
                    ErrorComponent={CustomErrorComponent}
                />
            </div>
        );
    })
    .add("With default component", () => {
        return (
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilterBase
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter("NOT_EXIST", [])}
                    onApply={action("on-apply")}
                    ErrorComponent={DefaultError}
                />
            </div>
        );
    });
