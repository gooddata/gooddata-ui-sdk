// (C) 2022 GoodData Corporation
import React from "react";
import { AttributeFilterBase } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/AttributeFilterBase";
import { storiesOf } from "../../../_infra/storyRepository";
import { action } from "@storybook/addon-actions";
//import { LongPostInteractionTimeout } from "../../../_infra/backstopWrapper";
import { FilterStories } from "../../../_infra/storyGroups";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { ReferenceWorkspaceId, StorybookBackend } from "../../../_infra/backend";
import { wrapWithTheme } from "../../themeWrapper";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const backend = StorybookBackend();

storiesOf(`${FilterStories}@next/AttributeFilterBase`)
    .add("full-featured", () => {
        return (
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilterBase
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                    onApply={action("on-apply")}
                />
            </div>
        );
    })
    .add("error", () => {
        return (
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilterBase
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter("NOT_EXIST", [])}
                    onApply={action("on-apply")}
                />
            </div>
        );
    })
    .add("themed", () => {
        return wrapWithTheme(
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilterBase
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                    onApply={action("on-apply")}
                />
            </div>,
        );
    });
