// (C) 2007-2019 GoodData Corporation
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { withMultipleScreenshots, LongPostInteractionTimeout } from "../../_infra/backstopWrapper";
import { FilterStories } from "../../_infra/storyGroups";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilter.css";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceLdm, ReferenceRecordings } from "@gooddata/reference-workspace";
import { newPositiveAttributeFilter } from "@gooddata/sdk-model";

const wrapperStyle = { width: 400, height: 600, padding: "1em 1em" };
const backend = recordedBackend(ReferenceRecordings.Recordings);
const workspace = "testWorkspace";

/*
 * TODO: fix these scenarios, use postInteractionWait selector (string) instead of fixed timeout. this
 *  will highly likely require changes in the attr filter though (tried existing styles, no luck - possibly
 *  because of the fixedDataTable / goodstrap => i believe divs are rendered with zero height first => still
 *  not visible)
 */

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
                opened: { clickSelector: ".s-product_name", postInteractionWait: LongPostInteractionTimeout },
                "select-all": {
                    clickSelectors: [".s-product_name", ".s-select_all"],
                    postInteractionWait: LongPostInteractionTimeout,
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
                opened: { clickSelector: ".s-product_name", postInteractionWait: LongPostInteractionTimeout },
                "select-all": {
                    clickSelectors: [".s-product_name", ".s-alle_ausw_hlen"],
                    postInteractionWait: LongPostInteractionTimeout,
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
                opened: { clickSelector: ".s-product_name", postInteractionWait: LongPostInteractionTimeout },
                "select-all": {
                    clickSelectors: [".s-product_name", ".s-select_all"],
                    postInteractionWait: LongPostInteractionTimeout,
                },
                clear: {
                    clickSelectors: [".s-product_name", ".s-clear"],
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        );
    });
