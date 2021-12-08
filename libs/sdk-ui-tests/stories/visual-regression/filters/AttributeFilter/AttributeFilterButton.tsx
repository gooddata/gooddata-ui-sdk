import React from "react";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { LongPostInteractionTimeout, withMultipleScreenshots } from "../../../_infra/backstopWrapper";
import { FilterStories } from "../../../_infra/storyGroups";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilter.css";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { ReferenceWorkspaceId, StorybookBackend } from "../../../_infra/backend";
import { wrapWithTheme } from "../../themeWrapper";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const backend = StorybookBackend();

storiesOf(`${FilterStories}/AttributeFilterButton`, module)
    .add("full-featured", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilterButton
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                    onApply={action("on-apply")}
                />
            </div>,
            {
                closed: {},
                opened: {
                    clickSelector: ".s-attribute-filter",
                    postInteractionWait: LongPostInteractionTimeout,
                },
                "select-all": {
                    clickSelectors: [".s-attribute-filter", ".s-select_all"],
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        );
    })
    .add("themed", () => {
        return withMultipleScreenshots(
            wrapWithTheme(
                <div style={wrapperStyle} className="screenshot-target">
                    <AttributeFilterButton
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, [])}
                        onApply={action("on-apply")}
                    />
                </div>,
            ),
            {
                closed: {},
                opened: {
                    clickSelector: ".s-attribute-filter",
                    postInteractionWait: LongPostInteractionTimeout,
                },
                "select-all": {
                    clickSelectors: [".s-attribute-filter", ".s-select_all"],
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        );
    });
