// (C) 2007-2019 GoodData Corporation
import { AttributeFilter } from "@gooddata/sdk-ui";
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { withMultipleScreenshots } from "../../_infra/backstopWrapper";
import { FilterStories } from "../../_infra/storyGroups";

import "@gooddata/sdk-ui/styles/css/attributeFilter.css";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceLdm, ReferenceRecordings } from "@gooddata/reference-workspace";
import { newPositiveAttributeFilter } from "@gooddata/sdk-model";

const wrapperStyle = { width: 400, height: 600, padding: "1em 1em" };
const backend = recordedBackend(ReferenceRecordings.Recordings);
const workspace = "testWorkspace";

storiesOf(`${FilterStories}/AttributeFilter`, module)
    .add("empty default selection", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilter
                    backend={backend}
                    workspace={workspace}
                    filter={newPositiveAttributeFilter(ReferenceLdm.Product.Name, [])}
                    onApply={action("on-apply")}
                />
            </div>,
            {
                closed: {},
                opened: { clickSelector: ".s-product_name", postInteractionWait: 200 },
                "select-all": {
                    clickSelectors: [".s-product_name", ".s-select_all"],
                    postInteractionWait: 200,
                },
            },
        );
    })
    .add("empty default selection - localized", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilter
                    backend={backend}
                    workspace={workspace}
                    locale="de-DE"
                    filter={newPositiveAttributeFilter(ReferenceLdm.Product.Name, [])}
                    onApply={action("on-apply")}
                />
            </div>,
            {
                closed: {},
                opened: { clickSelector: ".s-product_name", postInteractionWait: 200 },
                "select-all": {
                    clickSelectors: [".s-product_name", ".s-alle_ausw_hlen"],
                    postInteractionWait: 200,
                },
            },
        );
    })
    .add("pre-selected elements", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <AttributeFilter
                    backend={backend}
                    workspace={workspace}
                    filter={newPositiveAttributeFilter(ReferenceLdm.Product.Name, ["WonderKid", "Explorer"])}
                    onApply={action("on-apply")}
                />
            </div>,
            {
                opened: { clickSelector: ".s-product_name", postInteractionWait: 200 },
                "select-all": {
                    clickSelectors: [".s-product_name", ".s-select_all"],
                    postInteractionWait: 200,
                },
                clear: {
                    clickSelectors: [".s-product_name", ".s-clear"],
                    postInteractionWait: 200,
                },
            },
        );
    });
