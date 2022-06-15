// (C) 2022 GoodData Corporation
import React from "react";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/AttributeFilterButton";
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

storiesOf(`${FilterStories}@next/AttributeFilterButton`)
    .add("full-featured", () => {
        return (
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilterButton
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                    onApply={action("on-apply")}
                />
            </div>
        );
    })
    .add("All item filtered", () => {
        //TODO there is bug, when all item is filtered than title is "All except CompuSci, Educationly, Explorer, Grammar Plus, PhoenixSoft, PhoenixSoft, TouchAll, WonderKid"
        // but  I guess should be NONE
        // should discuss with UX
        return (
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilterButton
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [
                        "CompuSci",
                        "Educationly",
                        "Explorer",
                        "Grammar Plus",
                        "PhoenixSoft",
                        "PhoenixSoft",
                        "TouchAll",
                        "WonderKid",
                    ])}
                    onApply={action("on-apply")}
                />
            </div>
        );
    })
    .add("not fit into content", () => {
        return (
            <div style={wrapperStyle} className="screenshot-target">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, 60px)",
                        height: 200,
                        width: 120,
                    }}
                >
                    <AttributeFilterButton
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                        onApply={action("on-apply")}
                    />
                    <div style={{ padding: 4 }}>Second</div>
                </div>
            </div>
        );
    })
    .add("themed", () => {
        return wrapWithTheme(
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilterButton
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                    onApply={action("on-apply")}
                />
            </div>,
        );
    });
